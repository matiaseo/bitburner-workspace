import { flatten, selectTop, jisn, jssn,
  multiSort, deformat, formatNumber, ts } from './helpers.js'
import { scan } from './scanner.js'
import { deploy, getBatchData, killPrevious, getWeakSecurity } from "./utils.js"

const stealer = 'scripts/steal.js'
const actDelta = 128
const checkWindow = actDelta*8
const batchDelta = actDelta*4 + checkWindow
const baseOrchDelay = actDelta >> 1

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

const gAlign = (duration, startTime) => {
  const now = (performance.now() - startTime)
  const endOfBatch = duration + actDelta - now
  return Math.round(endOfBatch>0 ? endOfBatch : Math.ceil(-endOfBatch/batchDelta))
}

/** @param {NS} ns */
const traitor = async (ns, batches, {target}, duration, port=1) => {
  const startTime = performance.now() + baseOrchDelay
  //if(![target, batches, duration, startTime].every(Boolean))
  //  return ns.tprint(jssn`ERROR missing=${[target, batches, duration, startTime]}`)
  for(let act,i=0; act = batches[i];) {
    const delay = act.offset - (performance.now() - startTime)
    if(delay <= 0) {
      ns.exec(stealer, act.host, {
          threads: act.threads,
          ramOverride: (act.action === 'hack' ? 1.7 : 1.75)
        }, act.action, target, port, act.actIndex)
      i++
      //if(delay < -actDelta) console.error('drift='+delay)
      await ns.asleep(Math.floor(actDelta+delay))
    } else await ns.asleep(Math.max(1,Math.floor(delay)))
  }
  const ncbDelay = gAlign(duration, startTime)
  if(ncbDelay) {
    ns.tprint('WARN'+ts()+'sleep before check '+ncbDelay/1000+'s')
    await ns.asleep(ncbDelay)
  }
}

const execGrow = (ns, threads, target) =>
  ns.exec(stealer,'home',{threads,ramOverride:1.75},'grow',target,1,1)

const execWeak = (ns, threads, target, bots) =>
  !bots ?console.log(threads)||
    ns.exec(stealer,'home',{threads,ramOverride:1.75},'weak',target,1,2)
  : bots.forEach(({ host, threads }) =>console.log(host, threads)||
    ns.exec(stealer,host,{threads,ramOverride:1.75},'weak',target,1,0)
  )

const [,weakSec1] = getWeakSecurity(1)

/** @param {NS} ns */
const prep = async (ns,{host,moneyMax,duration},bots,mm,es) => {
  const homeSlts = Math.floor((ns.getServerMaxRam()-ns.getServerUsedRam())/1.75)
  const growTime = mm && ns.getGrowTime(host)^0
  const weakTime = mm && ns.getWeakenTime(host)^0
  const syncTime = mm && weakTime - growTime + actDelta
  const growTargetAmount = mm && moneyMax / (moneyMax - mm)
  const growThreads = mm && Math.min(
    Math.ceil(ns.growthAnalyze(host, growTargetAmount, 2)),
    homeSlts
  )
  const gwThreads = mm && Math.ceil(.004*growThreads / weakSec1)

  const homeLeft = es && homeSlts - (mm && growThreads + gwThreads)
  const esThreads = es && Math.ceil(es / weakSec1)
  const esBots = es && bots.slice(1).map(({host, maxRam}) => ({
        host,
        cap: Math.floor((maxRam - ns.getServerUsedRam(host)) / 1.75)
      })
    ).toSorted((a,b)=>b.cap-a.cap)
    .concat({ host: 'home', cap: homeLeft })
    .filter(({cap})=>cap)
    .reduce(([bots, pending], {host, cap}) =>
        pending > 0 ?
          [bots.concat({host,threads:cap}), pending - cap]
          : [bots, 0]
      , [[], esThreads])[0]

  console.log(homeLeft, esThreads, esBots, es)
  const startTime = performance.now()
  if(es) {
    execWeak(ns, esThreads, host, esBots)
    await ns.asleep(actDelta)
  }
  if(mm) {
    execWeak(ns, gwThreads, host)
    await ns.asleep(syncTime)
    execGrow(ns, growThreads, host)
  }
  const ncbDelay = gAlign(duration, startTime)
  if(ncbDelay) {
    ns.tprint('WARN'+ts()+'sleep before next batch '+ncbDelay/1000+'s')
    await ns.asleep(ncbDelay)
  }
}

/** @param {NS} ns */
const orchids = async (ns, hitlist, botnet) => {
  const [{host:target, getAllocation, duration, moneyMax, minDifficulty}] = hitlist
  const batches = getAllocation().toSorted(multiSort(['offset']))
  let mm, es
  while(2) {
    ns.tprint(ts()+'checking')
    if((mm = moneyMax-ns.getServerMoneyAvailable(target)),
        (es = ns.getServerSecurityLevel(target) - minDifficulty) || mm) {
      ns.tprint(`ERROR ${ts()}needs to be topped:\n$-${mm} ${minDifficulty}+${es}`)
      await prep(ns, hitlist[0], botnet, mm, es)
    }
    ns.tprint(ts()+'running')
    await traitor(ns, batches, {target,moneyMax,minDifficulty}, duration)
  }
}

/** @param {NS} ns */
export async function main(ns) {
  const hostTree = scan(ns, 32)
  const hosts = flatten(hostTree)
  const hackingLevel = ns.getPlayer().skills.hacking
  const botnet = [
    {host:'home',maxRam:(ns.getServerMaxRam()-128)|0,cpuCores:2,status:'root'}
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
  return orchids(ns, targets, botnet)
}

