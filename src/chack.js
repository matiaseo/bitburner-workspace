import { jssn, multiSort, ts } from './helpers.js'
import { killPrevious, respawn,
  getWeakSecurity, addAllocation, getRamListByCores } from "./utils.js"

const stealer = 'scripts/steal.js'
const actDelta = 256
const checkWindow = actDelta*2
const batchDelta = actDelta*4 + checkWindow
const baseOrchDelay = actDelta >> 1
const failThreshold = 8

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


const gAlign = (duration, startTime, strict=false) => {
  const now = (performance.now() - startTime)
  const endOfBatch = duration + actDelta - now
  return Math.round(endOfBatch>0 ? endOfBatch :
    strict ? Math.ceil(-endOfBatch/batchDelta) : 0)
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
          ramOverride: act.ram
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
  ns.exec(stealer,'',{threads,ramOverride:1.75},'grow',target,1,1)

const execWeak = (ns, threads, target, bots) =>
  !bots ?console.log(threads)||
    ns.exec(stealer,'',{threads,ramOverride:1.75},'weak',target,1,2)
  : bots.forEach(({ host, threads }) =>console.log(host, threads)||
    ns.exec(stealer,host,{threads,ramOverride:1.75},'weak',target,1,0)
  )

const [,weakSec1] = getWeakSecurity(1)

/** @param {NS} ns */
const prep = async (ns,{host,moneyMax,duration},bots,mm,es) => {
  const homeSlts = bots[0].cap
  const growTime = mm && ns.getGrowTime(host)^0
  const weakTime = mm && ns.getWeakenTime(host)^0
  const syncTime = mm && weakTime - growTime + actDelta
  const growTargetAmount = mm && moneyMax / (moneyMax - mm)
  const growThreads = mm && Math.min(
    Math.ceil(ns.growthAnalyze(host, growTargetAmount, 2)),
    homeSlts
  )
  const gwThreads = mm && Math.ceil(.004*growThreads / weakSec1)

  const homeLeft = homeSlts - (mm && growThreads + gwThreads)
  const esThreads = Math.ceil(es / weakSec1)
  const esBots = bots.slice(1)
    .filter(({cap}) => cap > 0)
    .reduce((bots, {host, cap}) => bots.concat({host,threads:cap}), [])

  console.log(homeLeft, esThreads, esBots, es)
  //const startTime = performance.now()
  if(es) {
    execWeak(ns, esThreads, host, esBots)
    if(mm) await ns.asleep(actDelta)
  }
  if(mm) {
    execWeak(ns, gwThreads, host)
    await ns.asleep(syncTime)
    execGrow(ns, growThreads, host)
  }
}

/** @param {NS} ns */
const orchids = async (ns, hitlist, botnet) => {
  const [{host:target, getAllocation, duration, moneyMax, minDifficulty}] = hitlist
  const batches = getAllocation().toSorted(multiSort(['offset']))
  const reserved = getAllocation()
    .reduce((reserved,{host,ram,threads}) =>
        Object.assign({},reserved,{
          [host]: (reserved[host]??0) + ram*threads
        })
      ,{})
  const fb = botnet.map(({ maxRam, host }) =>
      ({ host, cap: Math.floor((maxRam - reserved[host]) / 1.75) }))
    .filter(({ cap }) => cap > 0)
  console.log(fb)
  let mm, es, fails=0
  while(2) {
    ns.tprint(ts()+'checking')
    if((mm = moneyMax-ns.getServerMoneyAvailable(target)),
        (es = ns.getServerSecurityLevel(target) - minDifficulty) || mm) {
      ns.tprint(`ERROR ${ts()}needs to be topped:\n$${(100*mm/moneyMax).toFixed(2)}% +${es.toFixed(6)}`)
      if(mm && es && (mm/moneyMax > .4 || es/minDifficulty > .2))
        fails++
      if(fails > failThreshold) {
        ns.tprint(`ERROR ${ts()}respawing cause fails...`)
        await ns.asleep(batchDelta)
        respawn(ns)
      }
      await prep(ns, hitlist[0], fb, mm, es)
    } else fails >>= 1
    ns.tprint(ts()+'running')
    await traitor(ns, batches, {target,moneyMax,minDifficulty}, duration)
  }
}

const moneyRatio = .05
const getPossibleUpgrade = (csRam, newRam, checkCost) =>
  newRam <= csRam ? 0
    : checkCost(newRam) ? newRam
      : getPossibleUpgrade(csRam, newRam>>1, checkCost)

/** @param {NS} ns */
export async function main(ns) {
  const [cs, host, level, moneyMax, minDifficulty, debug] = ns.args
  const target = { host, level, moneyMax, minDifficulty }
  const uMoney = ns.getPlayer().money * moneyRatio
  const csRam = ns.getServerMaxRam()
  const ramLimit = ns.cloud.getRamLimit()
  const upgrade = csRam < ramLimit && getPossibleUpgrade(csRam, ramLimit,
    ram => ns.cloud.getServerUpgradeCost(cs, ram) < uMoney)
  if(upgrade) ns.cloud.upgradeServer(cs, upgrade)

  const botnet = [{
    host:cs,
    maxRam:ns.getServerMaxRam()-ns.getServerUsedRam(),
    cpuCores:1,
    status:'root'
  }]
  const cores = [1]
  const botnetResources = getRamListByCores(botnet, cores)

  const targets = [target]
    .map(addAllocation(ns, cores, botnetResources, {batchDelta,actDelta}))

  ns.tprint(jssn`INFO targetting ${targets} from ${cs}`)

  console.log(upgrade, ramLimit, csRam, uMoney, targets, cs, botnet)

  if(debug)
    return ns.tprint(jssn`INFO ${targets[0].getAllocation()}`)

  killPrevious(ns)
  return orchids(ns, targets, botnet)
}

