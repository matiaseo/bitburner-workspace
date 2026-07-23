import { formatNumber } from './helpers.js'

/** @param {NS} ns */
export const killPrevious = ns =>
  [].concat(ns.getRunningScript(ns.getScriptName()) ?? [])
    .map(s => s.pid)
    .filter(id => id !== ns.pid)
    .forEach(id => ns.kill(id))

/** @param {NS} ns */
export const deploy = (ns, scripts, hosts) =>
  [].concat(hosts).forEach(({ host }) => ns.scp(scripts, host))

const allCores = [...(~0>>>0).toString(2)].map((_,i)=>i+1)
const allWeakSec = allCores.map(c=>[c, .05+.003125*(c-1)])

export const getWeakSecurity = coreCount => allWeakSec[coreCount-1]

const growSecurity = .004//ns.growthAnalyzeSecurity(1) // .004 * thread
const hackSecurity = .002//ns.hackAnalyzeSecurity(1) // .002*thread
const maxTargetPercent = .1
const minTargetPercent = .02
const calcPercent = (level, hackLevel) =>
  Math.max(Math.min(maxTargetPercent*(1-level/hackLevel), maxTargetPercent), minTargetPercent)
const weakToGrow = allWeakSec.map(([c,w]) => [c, w/growSecurity])
const weakToHack = allWeakSec.map(([c,w]) => [c, w/hackSecurity])
const byCores = cores => (_,i)=>cores.includes(i+1)
//const scale = n => x => x * n
//const dotProduct = v => (x, i) => x * v[i]
//const addVector = scale => (x, i) => x + (scale[i] ?? scale)

const normaliseThreads = cores => ({ threads, ...rest }) =>
  Object.assign({
      threads: typeof threads !== 'object' ?
        Object.fromEntries(cores.map(c => [c, threads]))
        : threads
    }, rest)
const addOptimalCores = ({ threads, ...rest }) =>
  Object.assign({threads}, rest, {
    optimalCores: Object.entries(threads).reduce(
        ([mKs, ms], [k, t]) =>
        t < ms[0] ? [[k].concat(mKs), [t].concat(ms)] : [mKs, ms]
      , [[], [Infinity]])
      [0]
  })
const addCost = ({ action, threads, optimalCores, ...rest }) =>
  Object.assign({ action }, rest, {
    threads: Object.fromEntries(Object.entries(threads).map(
        ([cores, threads]) =>
          [cores, [threads, threads * (action === 'hack' ? 1.7 : 1.75)]])
      ),
    optimalCores,
    optimalCost: threads[optimalCores[0]] * (action === 'hack' ? 1.7 : 1.75)
  })

/** @param {NS} ns */
export const getBatchData = (ns, { host, moneyMax, level }, cores=allCores, delta=5, targetPercent=calcPercent(level, ns.getPlayer().skills.hacking)) => {
  const hackTime = ns.getHackTime(host)^0
  const growTime = ns.getGrowTime(host)^0
  const weakTime = ns.getWeakenTime(host)^0

  const hackChance = ns.hackAnalyzeChance(host)
  const hackAmount = ns.hackAnalyze(host)

  const hackPerThread = hackAmount// * hackChance
  const hackThreads = Math.max(Math.floor(targetPercent / hackPerThread), 1)

  const growTargetAmount = 1.02/(1-hackThreads*hackAmount)//hackPerThread)
/*  console.log(hackThreads, ns.hackAnalyzeThreads(host, targetPercent*moneyMax),
    hackChance*hackAmount*moneyMax*hackThreads,
    targetPercent/hackAmount,
    //moneyMax/ns.hackAnalyzeThreads(host, targetPercent*moneyMax),
    growTargetAmount, targetPercent, 1/(1-targetPercent)
  )
*/
  //ns.tprint('ERROR cores = '+cores.join(','))
  //ns.tprint('ERROR grow target = '+ [growTargetAmount, hackAmount, hackChance, targetPercent])
  const growThreads = Object.fromEntries(cores.map(
      cs => [cs, Math.ceil(ns.growthAnalyze(host, growTargetAmount, cs))]
    ))

  // Get times
  const longest = Math.max(hackTime, growTime, weakTime)
  const startTimes = [
    longest -   delta - hackTime,
    longest           - weakTime,
    longest +   delta - growTime,
    longest + 2*delta - weakTime,
//    longest + 3*delta
  ]

  const ratios = {
    weakToGrow: weakToGrow.filter(byCores(cores)),
    weakToHack: weakToHack.filter(byCores(cores))
  }
  console.log(ratios, hackThreads, growThreads)
  const hWeakThreads = Object.fromEntries(ratios.weakToHack.map(
      ([c, weakEffect]) => [c, Math.ceil(hackThreads / weakEffect)]
    ))
  const gWeakThreads = Object.fromEntries(ratios.weakToGrow.map(
      ([c, weakEffect]) => [c, Math.ceil(growThreads[1] / weakEffect)]
    ))

  const batch = [
    { action: 'weak', offset: startTimes[1], actIndex: 1, threads: hWeakThreads },
    { action: 'weak', offset: startTimes[3], actIndex: 3, threads: gWeakThreads },
    { action: 'grow', offset: startTimes[2], actIndex: 2, threads: growThreads },
    { action: 'hack', offset: startTimes[0], actIndex: 0, threads: hackThreads }
  ].map(normaliseThreads(cores))
    .map(addOptimalCores)
    .map(addCost)

  const batchMoney = hackThreads*hackPerThread*moneyMax
  const totalRam = batch.reduce((total, {optimalCost}) => total+optimalCost, 0)

  return {
    batch,
    duration: longest + 2 * delta,
    totalRam,
    $: formatNumber(batchMoney),
    '$/s': formatNumber(1000*batchMoney/(longest+2*delta)),
    '$/GB': formatNumber(batchMoney/totalRam)
  }
}


