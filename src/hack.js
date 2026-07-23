import { flatten, selectTop, jisn, jssn,
  multiSort, deformat, formatNumber } from './helpers.js'
import { scan } from './scanner.js'
import { deploy, getBatchData, killPrevious } from "./utils.js"

const stealer = 'scripts/steal.js'
const actDelta = 50
const batchDelta = actDelta*4 + 100
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
    .map(setOffset(delta, alloc.length>>2))
    .reduce(([resources, alloActs], { orderedThreads, ...act }) =>
        resources &&
          deductCost(orderedThreads, resources, act, alloActs)
            || []
      , [resources, []])

  const newAlloc = alloc.concat(nextAlloc ?? [])

  return !leftovers? newAlloc : allocateBatch(batch, delta, leftovers, newAlloc)
}

const addAllocation = (ns, cores, botnetRes, delta=batchDelta) =>
  target => {
  const { batch: rawB, '$/s':flow, duration } = getBatchData(ns, target, cores, actDelta)
  const batch = rawB.map(({threads, optimalCores, ...act}) =>
    Object.assign({
      orderedThreads: getOrderedThreads(threads, optimalCores)
    }, act))
  const batchFit = [batch, batch.toReversed()]
    .map(batch => allocateBatch(batch, delta, botnetRes))
    .reduce((fw, rev) => rev.length > fw.length ? rev : fw)
    .concat({
      action: 'check',
      offset: duration + actDelta + batchDelta*(batch.length>>2)
    })
  const concurrency = (batchFit.length-1)>>2
  const potential = deformat(flow) * concurrency
  console.log(potential, concurrency, batchFit)
  return {
    ...target,
    potential,
    concurrency,
    '$/s': formatNumber(potential),
    duration,
    getAllocation: () => batchFit
  }
}

/** @param {NS} ns */
const traitor = async (ns, batches, {target,moneyMax,minDifficulty}, duration, port=1) => {
  const startTime = performance.now() + baseOrchDelay
  if(![target, batches, duration, startTime].every(Boolean))
    return ns.tprint(jssn`ERROR missing=${[target, batches, duration, startTime]}`)
  for(let act,i=0; act = batches[i];) {
    const delay = act.offset - (performance.now() - startTime)
    let skipHack
    if(delay <= 0) {
      if(act.action === 'check') {
        const check = (ns.getServerMoneyAvailable(target) < moneyMax ||
                       ns.getServerSecurityLevel(target) > minDifficulty)
        ns.tprint('checking', check)
        if(check) break
      } else if(!skipHack || act.action !== 'hack')
        ns.exec(stealer,act.host,act.threads,act.action,target,port,act.actIndex)
      i++
      if(delay < -actDelta) skipHack = console.error('drift='+delay)||true
      await ns.asleep(Math.floor(actDelta-delay))
    } else await ns.asleep(Math.max(1,Math.floor(delay)))
  }
  const ncbDelay = Math.max(1, Math.round(duration - (performance.now() - startTime)))
  ns.tprint('WARN sleeping before next concurrent batches '+ncbDelay/1000+'s')
  await ns.asleep(ncbDelay)
}

/** @param {NS} ns */
const orchids = async (ns, hitlist) => {
  const [{host:target, getAllocation, duration, moneyMax, minDifficulty}] = hitlist
  const batches = getAllocation().toSorted(multiSort(['offset']))
  while(2) {
    while(ns.getServerMoneyAvailable(target) < moneyMax
      || ns.getServerSecurityLevel(target) > minDifficulty) {
      ns.tprint(`ERROR needs to be topped:
        ${ns.getServerMoneyAvailable(target)} < ${moneyMax}
        ${ns.getServerSecurityLevel(target)} > ${minDifficulty}`)
      const remove = [].concat(ns.getServerMoneyAvailable(target) === moneyMax ? 'grow' : [])
      const modifiedBatches = getAllocation().slice(0,4)
        .toSorted(multiSort(['offset']))
        .map(b => b.action !== 'hack' ? b
          : Object.assign({}, b, { action: 'weak', offset: -baseOrchDelay })
      ).filter(({action})=>!remove.includes(action))
      await traitor(ns, modifiedBatches, {target,moneyMax,minDifficulty}, duration)
    }
    await traitor(ns, batches, {target,moneyMax,minDifficulty}, duration)
  }
}

/** @param {NS} ns */
export async function main(ns) {
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
  const cores = Array.from(new Set(botnet.map(({cpuCores})=>cpuCores)))
    .toSorted((a,b)=>a-b)
  ns.tprint(`INFO botnet cores=${cores}`)
  const botnetResources = getRamListBycores(botnet, cores)
  //ns.tprint(jssn`INFO botnet resources=${getResources(botnet)}\n${botnetResources}`)

  const eligibleHosts = hosts.filter(({ level }) => hackingLevel >= level)
    .map(addAllocation(ns, cores, botnetResources))

  const targets = selectTop(eligibleHosts, 1)

  ns.tprint(jisn`INFO targetting ${targets.length} hosts = ${targets} with botnet size=[${botnet.length}]`)//${botnet.map(({ host, maxRam, cpuCores }) => `${cpuCores.toString().padStart(2, ' ')} ${host} ${maxRam} ${cpuCores >= threshold ? 'wegw' : 'h'}`).toSorted().join(', ')} thr=${threshold}`)

  if(ns.args[0] === 'debug')
    return ns.tprint(jssn`INFO ${targets[0].getAllocation()}`)
  killPrevious(ns)
  return orchids(ns, targets)
}

