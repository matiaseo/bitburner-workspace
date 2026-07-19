import { flatten, selectTop, jisn, jssn, multiSort, deformat, formatNumber } from './helpers.js'
import { scan } from './scanner.js'
import { deploy, getBatchData } from "./utils.js"

const stealer = 'scripts/steal.js'
const overlap = 20

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
  botnet.reduce((totals, {cpuCores, maxRam}) =>
      Object.assign({}, totals, {
          [cpuCores]: totals[cpuCores].concat(maxRam)
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

const deductCost = (optimalCores, threads, resources) => {
  const resCount = Object.keys(resources).length
  const orderedThreads = getOrderedThreads(threads, optimalCores)
  for(let i=0; i < resCount; i++) {
    const [cores, [, mem]] = orderedThreads[i]
    const [leftovers, ok] = resources[cores].reduce(
        ([leftovers, ok], ram) =>
          ok ? [leftovers.concat(ram), true]
          : [leftovers.concat(ram>=mem ? ram-mem : ram), ram >= mem]
      , [[], false])

    if(ok) return Object.assign({}, resources, { [cores]: leftovers })
  }
  //console.log('out of resources', resources, orderedThreads)
  return null
}

const calFit = (batch, resources, result=0) => {
  const leftovers = batch.reduce(
    (resources, { optimalCores, threads }) =>
      resources && deductCost(optimalCores, threads, resources)
    , resources)
  //if(result>20) console.log({leftovers, resources, batch, result})
  return !leftovers ? result : calFit(batch, leftovers, result + 1)
}
const addPotentialIncome = (ns, cores, botnetRes) => target => {
  const { batch, '$/s':flow } = getBatchData(ns, target, cores)
  const batchOrders = [
    batch,
    batch.toReversed(),
    [batch[2],batch[0],batch[1],batch[3]],
    [batch[1],batch[3],batch[0],batch[2]],
    [batch[1],batch[3],batch[2],batch[0]]
  ]
  const potentials = batchOrders.map(batch => calFit(batch, botnetRes))
  const potential = deformat(flow) * Math.max(...potentials)//calFit(batch, botnetRes)
  if(Math.min(...potentials) == Math.max(...potentials))
    console.log(target.host, potential)
  return {
    ...target,
    potential,
    '$/s': formatNumber(potential),
    batch
  }
}


/** @param {NS} ns */
const pollStatus = (ns, port=1) => {
  const {time,host,action} = Object.assign({}, ns.readPort(port))
  ns.tprint(`${time?.toFixed(0)}\t${host}\t${action}\t${ns.getServerMoneyAvailable(host)}`)
}

/** @param {NS} ns */
const orchid = (ns, botnet, hitlist) => {
  hitlist.forEach((host, i) => {
    //const batchData = getBatchData(host)
    ns.tprint(jssn`WARN batch = ${host.batch}`)

    //ns.exec(...getExecParams(ns, bot), action, host, i)
    // monitoring
    ns.asleep(4)
    pollStatus(ns, i+1)
  })
}

/** @param {NS} ns */
export function main(ns) {
  const hostTree = scan(ns, 32)
  const hosts = flatten(hostTree)
  const hackingLevel = ns.getPlayer().skills.hacking
  const botnet = [
    {host:'home',maxRam:(ns.getServerMaxRam()*.75)|0,cpuCores:1,status:'root'}
  ].concat(hosts)
    .filter(({ status, maxRam }) => status === 'root' && maxRam)
    .toSorted(multiSort([['cpuCores'],['maxRam']]))

  const threshold = getCpuThreshold(botnet)+1
  const cbots = botnet.reduce(categorizeBots(threshold), {hack:[],wegw:[]})
  ns.tprint(`INFO\nhack=${JSON.stringify(getResources(cbots.hack))}\nwegw=${JSON.stringify(getResources(cbots.wegw))}`)
  //const botsPerTarget = botnet.length / targets.length
  //ns.tprint(`INFO botsPerTarget=${botsPerTarget}`)
  ns.tprint(`INFO hack threads=${Math.floor(getResources(cbots.hack).RAM/1.7)}`)
  ns.tprint(`INFO wegw threads=${Math.floor(getResources(cbots.wegw).RAM/1.75)}`)
  const cores = Array.from(new Set(botnet.map(({cpuCores})=>cpuCores))).toSorted((a,b)=>a-b)
  ns.tprint(`INFO botnet cores=${cores}`)
  const botnetResources = getRamListBycores(botnet, cores)
  ns.tprint(jssn`INFO botnet resources=${getResources(botnet)}\n${botnetResources}`)

  const eligibleHosts = hosts.filter(({ level }) => hackingLevel >= level)
    .map(addPotentialIncome(ns, cores, botnetResources))

  const targets = selectTop(eligibleHosts, 1)

  ns.tprint(jisn`INFO targetting ${targets.length} hosts = ${targets} with botnet=[${botnet.length}]${botnet.map(({ host, maxRam, cpuCores }) => `${cpuCores.toString().padStart(2, ' ')} ${host} ${maxRam} ${cpuCores >= threshold ? 'wegw' : 'h'}`).toSorted().join(', ')} thr=${threshold}`)

  orchid(ns, botnet, targets)
  return
  targets.forEach((target, index) => {
    const bots = botnet.slice(index * botsPerTarget, (1+index) * botsPerTarget)
    ns.tprint(`ERROR ${target.host} ${bots.filter((bot, index, {length}) => !index || index === length-1).map(bot=>bot.host).join('...')} # ${bots.length}`)
    const { host, moneyMax, minDifficulty } = target
    const batchData = getBatchData(ns, target, cores)
    ns.tprint(jssn`WARN batch = ${batchData}`)
    // ns.tprint(jisn`ERROR execd ${bots.map(bot => `${bot.host}[${ns.exec(...getExecParams(ns, bot), host, moneyMax, minDifficulty)}]`)}`)
  })
}

