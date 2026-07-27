import { flatten, selectTop, jisn, jssn,
  multiSort, deformat, formatNumber, ts } from './helpers.js'
import { scan } from './scanner.js'
import { deploy, getBatchData, killPrevious, respawn,
  getWeakSecurity, addAllocation, getRamListByCores } from "./utils.js"

const stealer = 'scripts/steal.js'
const actDelta = 256
const checkWindow = actDelta*8
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
    .concat({ host: 'home', cap: homeLeft })
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
//  const ncbDelay = gAlign(duration, startTime)
//  if(ncbDelay) {
//    ns.tprint('WARN'+ts()+'sleep before next batch '+ncbDelay/1000+'s')
//    await ns.asleep(ncbDelay)
//  }
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
  let mm, es, fails=0
  while(2) {
    ns.tprint(ts()+'checking')
    if((mm = moneyMax-ns.getServerMoneyAvailable(target)),
        (es = ns.getServerSecurityLevel(target) - minDifficulty) || mm) {
      ns.tprint(`ERROR ${ts()}needs to be topped:\n$-${mm} ${minDifficulty}+${es}`)
      if(++fails > failThreshold) {
        ns.tprint(`ERROR ${ts()}respawing cause fails...`)
        await ns.asleep(batchDelta)
        respawn(ns)
      }
      await prep(ns, hitlist[0], fb, mm, es)
    } else if(fails>0) fails--
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
    {host:'home',maxRam:ns.getServerMaxRam()-128,cpuCores:2,status:'root'}
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
  const botnetResources = getRamListByCores(botnet, cores)
  //ns.tprint(jssn`INFO botnet resources=${getResources(botnet)}\n${botnetResources}`)

  const eligibleHosts = hosts.filter(({ level }) => hackingLevel >= level)
    .map(addAllocation(ns, cores, botnetResources, {batchDelta,actDelta}))

  const targets = selectTop(eligibleHosts, 1)

  ns.tprint(jisn`INFO targetting ${targets.length} hosts = ${targets} with botnet size=[${botnet.length}]`)//${botnet.map(({ host, maxRam, cpuCores }) => `${cpuCores.toString().padStart(2, ' ')} ${host} ${maxRam} ${cpuCores >= threshold ? 'wegw' : 'h'}`).toSorted().join(', ')} thr=${threshold}`)

  if(ns.args[0] === 'debug')
    return ns.tprint(jssn`INFO ${targets[0].getAllocation()}`)
  killPrevious(ns)
  return orchids(ns, targets, botnet)
}

