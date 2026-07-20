import { flatten, selectTop, jisn, jssn,
  multiSort, deformat, formatNumber } from './helpers.js'
import { scan } from './scanner.js'
import { deploy, getBatchData } from "./utils.js"

const stealer = 'scripts/steal.js'
const batchDelta = 200
const actDelta = 100
const baseOrchDelay = 1000

/** @param {NS} ns */
const getThreads = (ns, host) =>
  ns.getServerMaxRam(host) / ns.getScriptRam(stealer)

const getExecParams = (ns, {host}) => [stealer, host, getThreads(ns, host)]

const categorizeBots = threshold => (categories, bot) => ({
    hack: categories.hack.concat(bot.cpuCores < threshold ? bot : []),
    wegw: categories.wegw.concat(bot.cpuCores >= threshold ? bot : [])
  })

const getCpuThreshold = bots =>
  bots.reduce((compute, { cpuCores, maxRam }) =>
      [compute[0] + cpuCores*maxRam, compute[1] + maxRam]
    , [0, 0]).reduce((cpuRam, maxRam) => cpuRam / maxRam)

const getResources = bots =>
  bots.reduce((total, { maxRam }) =>
      ({hosts: total.hosts+1, RAM: total.RAM+maxRam})
    , {hosts:0, RAM:0})

const getCores = botnet => Array.from(new Set(
    botnet.map(({cpuCores})=>cpuCores)
  )).toSorted((a,b)=>a-b)

const getRamListBycores = (botnet, cores=getCores(botnet)) =>
  botnet.reduce((totals, {cpuCores, maxRam, host}) =>
      Object.assign({}, totals, {
          [cpuCores]: totals[cpuCores].concat({host,ram:maxRam})
        })
    , Object.fromEntries(cores.map(c=>[c,[]])))

const getOptimalSlice = (threads, [start, ...optimal]) => {
  const startIndex = threads.findIndex(([k]) => k == start)
  return threads.slice(startIndex)
    .concat(startIndex > 0 && getOptimalSlice(threads.slice(0, startIndex), optimal) || [])
}
const getOrderedThreads = (threads, optimal) =>
  getOptimalSlice(Object.entries(threads).sort(([k1],[k2])=>k1-k2), optimal)
    .filter(Boolean)

const deductCost = (orderedThreads, resources, act, allocatedActs) => {
  const resCount = Object.keys(resources).length
  for(let i=0; i < resCount; i++) {
    const [cores, [threads, mem]] = orderedThreads[i]
    const [leftovers, host] = resources[cores].reduce(
        ([leftovers, h], { host, ram }) =>
          h ? [leftovers.concat({host,ram}), h]
          : [leftovers.concat({ host, ram: ram >= mem ? ram-mem : ram }),
            ram >= mem && host]
      , [[], false])

    if(host)
      return [
        Object.assign({}, resources, { [cores]: leftovers }),
        allocatedActs.concat({...act, host, threads})
      ]
  }
  //console.log('out of resources', resources, orderedThreads)
  return null
}

const setOffset = (delta, index, delay=delta*index) => ({offset, ...act}) =>
  Object.assign({offset: offset + delay}, act)

const allocateBatch = (batch, delta, resources, alloc=[]) => {
  const [leftovers, nextAlloc] = batch
    .map(setOffset(delta, alloc.length))
    .reduce(([resources, alloActs], { orderedThreads, ...act }) =>
        resources &&
          deductCost(orderedThreads, resources, act, alloActs)
            || []
      , [resources, []])

  const newAlloc = alloc.concat(nextAlloc ?? [])

  return !leftovers? newAlloc : allocateBatch(batch, delta, leftovers, newAlloc)
}

const addAllocation = (ns, cores, botnetRes, delta=batchDelta) => target => {
  const { batch: rawB, '$/s':flow } = getBatchData(ns, target, cores, actDelta)
  const batch = rawB.map(({threads, optimalCores, ...act}) =>
    Object.assign({
      orderedThreads: getOrderedThreads(threads, optimalCores)
    }, act))
  const batchFit = [batch, batch.toReversed()]
    .map(batch => allocateBatch(batch, delta, botnetRes))
    .reduce((fw, rev) => rev.length > fw.length ? rev : fw)
  const potential = deformat(flow) * batchFit.length>>2
  return {
    ...target,
    potential,
    '$/s': formatNumber(potential),
    getAllocation: () => batchFit
  }
}


/** @param {NS} ns */
const pollStatus = async (ns, port=1) => {
  while(1) {
    await ns.asleep(1000)
    for(let portMessage; portMessage = ns.readPort(port), !portMessage.startsWith('N');)
      ns.tprint(portMessage)
  }
}

/** @param {NS} ns */
const orchid = async (ns, hitlist) => {
  const [{host:target, getAllocation}] = hitlist
  const port = 1
  const batches = getAllocation().toSorted(multiSort(['offset']))
  const startTime = performance.now() + baseOrchDelay
  console.log(startTime, batches, batches[0])
  while(1)
    for(let act,i=0; act = batches[i];) {
      //pollStatus(ns, port)
      const delay = act.offset - (performance.now() - startTime)
      //console.log(act, delay)
      if(delay <= 0) {
        ns.exec(stealer, act.host, act.threads, act.action, target, port)
        i++
        //if(delay < -10) console.error('drift='+delay)
      } else await ns.asleep(Math.max(10,Math.floor(delay)))
    }
}

/** @param {NS} ns */
export async function main(ns) {
  if(ns.args[0] === 'monitor') {
    return pollStatus(ns)
  }
  const hostTree = scan(ns, 32)
  const hosts = flatten(hostTree)
  const hackingLevel = ns.getPlayer().skills.hacking
  const botnet = [
    {host:'home',maxRam:(ns.getServerMaxRam()*.75)|0,cpuCores:1,status:'root'}
  ].concat(hosts)
    .filter(({ status, maxRam }) => status === 'root' && maxRam)
    .toSorted(multiSort(['cpuCores'],['maxRam']))

  deploy(ns, stealer, botnet)

  //const threshold = getCpuThreshold(botnet)+1
  //const cbots = botnet.reduce(categorizeBots(threshold), {hack:[],wegw:[]})
  //ns.tprint(`INFO\nhack=${JSON.stringify(getResources(cbots.hack))}\nwegw=${JSON.stringify(getResources(cbots.wegw))}`)
  //const botsPerTarget = botnet.length / targets.length
  //ns.tprint(`INFO botsPerTarget=${botsPerTarget}`)
  //ns.tprint(`INFO hack threads=${Math.floor(getResources(cbots.hack).RAM/1.7)}`)
  //ns.tprint(`INFO wegw threads=${Math.floor(getResources(cbots.wegw).RAM/1.75)}`)
  const cores = Array.from(new Set(botnet.map(({cpuCores})=>cpuCores))).toSorted((a,b)=>a-b)
  ns.tprint(`INFO botnet cores=${cores}`)
  const botnetResources = getRamListBycores(botnet, cores)
  //ns.tprint(jssn`INFO botnet resources=${getResources(botnet)}\n${botnetResources}`)

  const eligibleHosts = hosts.filter(({ level }) => hackingLevel >= level)
    .map(addAllocation(ns, cores, botnetResources))

  const targets = selectTop(eligibleHosts, 1)

  ns.tprint(jisn`INFO targetting ${targets.length} hosts = ${targets} with botnet size=[${botnet.length}]`)//${botnet.map(({ host, maxRam, cpuCores }) => `${cpuCores.toString().padStart(2, ' ')} ${host} ${maxRam} ${cpuCores >= threshold ? 'wegw' : 'h'}`).toSorted().join(', ')} thr=${threshold}`)

  return orchid(ns, targets)
}

