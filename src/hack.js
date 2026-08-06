import { flatten, selectTop, jisn, jssn,
  multiSort, ts } from './helpers.js'
import { scan } from './scanner.js'
import { deploy, deployList, killPrevious, 
  getWeakSecurity, addAllocation, getRamListByCores } from "./utils.js"

const stealer = 'scripts/steal.js'
const actDelta = 200
const checkWindow = actDelta*3
const batchDelta = actDelta*4 + checkWindow
const baseOrchDelay = actDelta >> 1
const failThreshold = 8

const gAlign = (duration, startTime, strict=false) => {
  const now = (performance.now() - startTime)
  const endOfBatch = duration + actDelta - now
  return Math.round(endOfBatch>0 ? endOfBatch :
    strict ? Math.ceil(-endOfBatch/batchDelta) : 0)
}
//
///** @param {NS} ns */
//const traitor = async (ns, batches, {target}, duration, port=1) => {
//  const startTime = performance.now() + baseOrchDelay
//  //if(![target, batches, duration, startTime].every(Boolean))
//  //  return ns.tprint(jssn`ERROR missing=${[target, batches, duration, startTime]}`)
//  for(let act,i=0; act = batches[i];) {
//    const delay = act.offset - (performance.now() - startTime)
//    if(delay <= 0) {
//      ns.exec(stealer, act.host, {
//          threads: act.threads,
//          ramOverride: act.ram
//        }, act.action, target, port, act.actIndex)
//      i++
//      //if(delay < -actDelta) console.error('drift='+delay)
//      //await ns.asleep(Math.floor(actDelta+delay))
//    } else await ns.asleep(Math.max(1,Math.floor(delay)))
//  }
//  const ncbDelay = gAlign(duration, startTime)
//  if(ncbDelay) {
//    ns.tprint('WARN'+ts()+'sleep before check '+ncbDelay/1000+'s')
//    await ns.asleep(ncbDelay)
//  }
//}
//
//const execGrow = (ns, threads, target) =>
//  ns.exec(stealer,'home',{threads,ramOverride:1.75},'grow',target,1,1)
//
//const execWeak = (ns, threads, target, bots) =>
//  !bots ?
//    ns.exec(stealer,'home',{threads,ramOverride:1.75},'weak',target,1,2)
//  : bots.forEach(({ host, threads }) =>
//    ns.exec(stealer,host,{threads,ramOverride:1.75},'weak',target,1,0)
//  )
//
//const [,weakSec1] = getWeakSecurity(1)
//
///** @param {NS} ns */
//const prep = async (ns,{host,moneyMax,duration},bots,mm,es) => {
//  const homeSlts = bots[0].cap
//  const growTime = mm && ns.getGrowTime(host)^0
//  const weakTime = mm && ns.getWeakenTime(host)^0
//  const syncTime = mm && weakTime - growTime + actDelta
//  const growTargetAmount = mm && moneyMax / (moneyMax - mm)
//  const growThreads = mm && Math.min(
//    Math.ceil(ns.growthAnalyze(host, growTargetAmount, 2)),
//    homeSlts
//  )
//  const gwThreads = mm && Math.ceil(.004*growThreads / weakSec1)
//
//  const homeLeft = homeSlts - (mm && growThreads + gwThreads)
//  const esThreads = Math.ceil(es / weakSec1)
//  const esBots = bots.slice(1)
//    .concat({ host: 'home', cap: homeLeft })
//    .filter(({cap}) => cap > 0)
//    .reduce((bots, {host, cap}) => bots.concat({host,threads:cap}), [])
//
//  console.log(homeLeft, esThreads, esBots, es)
//  //const startTime = performance.now()
//  if(es) {
//    execWeak(ns, esThreads, host, esBots)
//    if(mm) await ns.asleep(actDelta)
//  }
//  if(mm) {
//    execWeak(ns, gwThreads, host)
//    await ns.asleep(syncTime)
//    execGrow(ns, growThreads, host)
//  }
////  const ncbDelay = gAlign(duration, startTime)
////  if(ncbDelay) {
////    ns.tprint('WARN'+ts()+'sleep before next batch '+ncbDelay/1000+'s')
////    await ns.asleep(ncbDelay)
////  }
//}
//
///** @param {NS} ns */
//const orchids = async (ns, hitlist, botnet) => {
//  const [{host:target, getAllocation, duration, moneyMax, minDifficulty}] = hitlist
//  const batches = getAllocation().toSorted(multiSort(['offset']))
//  const reserved = getAllocation()
//    .reduce((reserved,{host,ram,threads}) =>
//        Object.assign({},reserved,{
//          [host]: (reserved[host]??0) + ram*threads
//        })
//      ,{})
//  const fb = botnet.map(({ maxRam, host }) =>
//      ({ host, cap: Math.floor((maxRam - reserved[host]) / 1.75) }))
//    .filter(({ cap }) => cap > 0)
//  console.log(fb)
//  let mm, es, fails=0
//  while(2) {
//    ns.tprint(ts()+'checking '+target)
//    if((mm = moneyMax-ns.getServerMoneyAvailable(target)),
//        (es = ns.getServerSecurityLevel(target) - minDifficulty) || mm) {
//      ns.tprint(`ERROR ${ts()}needs to be topped:\n-$${(100*mm/moneyMax).toFixed(2)}% +${es.toFixed(6)}`)
//      if(mm && es && (mm/moneyMax > .4 || es/minDifficulty > .2))
//        fails++
//      if(fails > failThreshold) {
//        ns.tprint(`ERROR ${ts()}respawing cause fails...`)
//        await ns.asleep(batchDelta)
//        //respawn(ns)
//      }
//      await prep(ns, hitlist[0], fb, mm, es)
//    } else fails >>= 1
//    await traitor(ns, batches, {target,moneyMax,minDifficulty}, duration)
//  }
//}
//
/** @param {NS} ns */
export async function main(ns) {
  const hostTree = scan(ns, 32)
  const hosts = flatten(hostTree)
  const cloudHosts = hosts.filter(({cloud}) => cloud)
  const hackingLevel = ns.getPlayer().skills.hacking
  const botnet = [
    {host:'home',maxRam:ns.getServerMaxRam()-Math.max(1024, ns.getServerMaxRam()*.80),cpuCores:4,status:'root'}
  ].concat(hosts.slice(0, -cloudHosts.length||1))
    .filter(({ status, maxRam }) => status === 'root' && maxRam)
    .toSorted(multiSort(['cpuCores'],['maxRam']))

  deploy(ns, stealer, hosts)

  const cores = Array.from(new Set(botnet.map(({cpuCores})=>cpuCores)))
    .toSorted((a,b)=>a-b)
  ns.tprint(`INFO botnet cores=${cores}`)
  const botnetResources = getRamListByCores(botnet, cores)

  const eligibleHosts = hosts
    .filter(({ level, moneyMax, status }) => hackingLevel >= level && moneyMax&&status ==='root')
    .map(addAllocation(ns, cores, botnetResources, {batchDelta,actDelta}))

  const highLevel = hosts
    .filter(({ level, moneyMax }) => hackingLevel < level && moneyMax)
    .map(({host, level}) => ({host, level, toString:()=>`${host}[${level}]`}))

  const targets = eligibleHosts//selectTop(eligibleHosts, 1 + cloudHosts.length)
    .toSorted((a, b) => b.potential - a.potential)

  ns.tprint(jisn`INFO targetting ${targets.length} hosts = ${targets} with botnet size=[${botnet.length}; ${cloudHosts.length}]`)
  console.log(targets, cloudHosts)
  if(cloudHosts.length+1) {
    deployList(ns, 'chack,utils,helpers', cloudHosts)
    targets.reduce((bots, {host,level,moneyMax,minDifficulty,maxRam}) => {
      const usable = bots.find(({maxRam:botRam, freeRam=botRam-15}) => maxRam < freeRam)
      console.log(bots, usable, host, level, maxRam)
      return !usable ? bots : bots.map(b => b !== usable ? b : {
          ...b,
          freeRam: (b.freeRam??b.maxRam) - maxRam,
          queue: [].concat(b.queue??[])
            .concat({host,level,moneyMax,minDifficulty})
        })
    }, cloudHosts.concat(cloudHosts.length ? [] : botnet[0]))
      .filter(({queue}) => queue?.length)
      .forEach(({ host:botHost, queue, freeRam }) =>
        queue.forEach(({host,level,moneyMax,minDifficulty}) =>
          ns.exec('scripts/chack.js', botHost, 1,
            botHost, host, level, moneyMax, minDifficulty, freeRam/queue.length)
        )
      )
  }

  if(ns.args[0] === 'debug')
    return ns.tprint(jssn`INFO ${targets[0].getAllocation().length}`)
  killPrevious(ns)
  while(1) {
    await ns.asleep(3e4)
    const hackingLevel = ns.getPlayer().skills.hacking
    const newTargets = highLevel
      .filter(({ level, moneyMax }) => hackingLevel >= level)
      if(newTargets.length)
        ns.tprint('WARN '+ts()+newTargets)
  }
  //return orchids(ns, targets.slice(0, netTs), botnet)
}

