import { jssn, multiSort, ts } from './helpers.js'
import { killPrevious, respawn,
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

/** @param {NS} ns */
const traitor = async (ns, batches, {target}, duration, skipHack, port=1) => {
  const startTime = performance.now() + baseOrchDelay
  //if(![target, batches, duration, startTime].every(Boolean))
  //  return ns.tprint(jssn`ERROR missing=${[target, batches, duration, startTime]}`)
  for(let act,i=0; act = batches[i];) {
    const delay = act.offset - (performance.now() - startTime)
    if(delay <= 0) {
      if(!skipHack || act.action !== 'hack')
        ns.exec(stealer, act.host, {
            threads: act.threads,
            ramOverride: act.ram
          }, act.action, target, port, act.actIndex)
      i++
      //if(delay < -actDelta) console.error('drift='+delay)
      //await ns.asleep(Math.floor(actDelta+delay))
    } else await (delay>0 ? ns.asleep(Math.floor(delay)) : Promise.resolve())
  }
  const ncbDelay = gAlign(duration, startTime)
  if(ncbDelay) {
    //ns.tprint('WARN'+ts()+'sleep before check '+ncbDelay/1000+'s')
    await ns.asleep(ncbDelay)
  }
}

const execGrow = (ns, threads, target, bots) =>
  ns.exec(stealer,bots[0].host,{threads,ramOverride:1.75},'grow',target,1,1)

const execWeak = (ns, threads, target, bots) =>
  !bots ?
    ns.exec(stealer,bots[0].host,{threads,ramOverride:1.75},'weak',target,1,2)
  : bots.forEach(({ host, threads }) =>
    ns.exec(stealer,host,{threads,ramOverride:1.75},'weak',target,1,0)
  )

const [,weakSec1] = getWeakSecurity(1)

/** @param {NS} ns */
const prep = async (ns,{host,moneyMax,duration},bots,mm,es) => {
  const homeSlts = bots[0].cap
  const growTime = mm && ns.getGrowTime(host)^0
  const weakTime = mm && ns.getWeakenTime(host)^0
  const syncTime = mm && weakTime - growTime + actDelta
  const growTargetAmount = mm && Math.min(16, moneyMax / (moneyMax - mm))
  const growThreads = mm && Math.min(
    Math.ceil(ns.growthAnalyze(host, growTargetAmount, 2)),
    homeSlts
  )
  const gwThreads = mm && Math.ceil(.004*growThreads / weakSec1)

  const homeLeft = homeSlts - (mm && growThreads + gwThreads)
  const esThreads = Math.ceil(es / weakSec1)
  const esBots = bots.map(({host}) => ({host,threads:homeLeft}))
    .filter(({threads})=>threads>0)
  if(es && esBots.length) {
    execWeak(ns, esThreads, host, esBots)
    if(mm) await ns.asleep(actDelta)
  }
  if(mm) {
    execWeak(ns, gwThreads, host, bots)
    await ns.asleep(syncTime)
    execGrow(ns, growThreads, host, bots)
  }
}

/** @param {NS} ns */
const orchids = async (ns, hitlist, botnet, freeRam) => {
  const [{host:target, getAllocation, duration, moneyMax, minDifficulty}] = hitlist
  const batches = getAllocation().toSorted(multiSort(['offset']))
//  const reserved = getAllocation()
//    .reduce((reserved,{host,ram,threads}) =>
//        Object.assign({},reserved,{
//          [host]: (reserved[host]??0) + ram*threads
//        })
//      ,{})
  const fb = botnet.map(({ host }) => ({ host, cap: Math.floor(freeRam / 1.75) }))
    .filter(({ cap }) => cap > 0)
  console.log(fb)
  let mm, es, fails=0
  while(2) {
    console.log(ts()+'checking '+target)
    if((mm = moneyMax-ns.getServerMoneyAvailable(target)),
        (es = ns.getServerSecurityLevel(target) - minDifficulty) || mm) {
      if(mm && es && (mm/moneyMax > .4 || es/minDifficulty > .2)) {
        console.error(`ERROR ${ts()}${target} needs :$-${(100*mm/moneyMax).toFixed(2)}% +${es.toFixed(2)}`)
        fails++
      }
      if(fails > failThreshold) {
        console.error(`ERROR ${ts()}many fails...`, fails)
        await ns.asleep(batchDelta)
      }
      await prep(ns, hitlist[0], fb, mm, es)
    } else fails >>= 1
    await traitor(ns, batches, {target,moneyMax,minDifficulty}, duration, fails>failThreshold)
  }
}

const moneyRatio = .05
const getPossibleUpgrade = (csRam, newRam, checkCost) =>
  newRam <= csRam ? 0
    : checkCost(newRam) ? newRam
      : getPossibleUpgrade(csRam, newRam>>1, checkCost)

/** @param {NS} ns */
export async function main(ns) {
  const [cs, host, level, moneyMax, minDifficulty, freeRam] = ns.args
  const target = { host, level, moneyMax, minDifficulty }
  const botnet = [{
    host:cs,
    maxRam:ns.getServerMaxRam(cs)-ns.getServerUsedRam(cs),
    cpuCores:1,
    status:'root'
  }]
  const cores = [1]
  const botnetResources = getRamListByCores(botnet, cores)

  const targets = [target]
    .map(addAllocation(ns, cores, botnetResources, {batchDelta,actDelta}))

  ns.tprint(jssn`INFO targetting ${targets} from ${cs}`)

  console.log(targets, cs, botnet)

  killPrevious(ns)
  return orchids(ns, targets, botnet, freeRam)
}

