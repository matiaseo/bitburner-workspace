import { formatNumber } from './helpers.js'

/** @param {NS} ns */
export const deploy = (ns, scripts, hosts) =>
  [].concat(hosts).forEach(({ host }) => ns.scp(scripts, host))

const allCores = [...(~0>>>0).toString(2)].map((_,i)=>i+1)
const allWeakSec = allCores.map(c=>[c, .05+.003125*(c-1)])

export const getWeakSecurity = coreCount => allWeakSec[coreCount-1]

const growSecurity = .004//ns.growthAnalyzeSecurity(1) // .004 * thread
const hackSecurity = .002//ns.hackAnalyzeSecurity(1) // .002*thread
const maxTargetPercent = .2 // 20%
const minTargetPercent = .02 // 5%
const calcPercent = level =>
  Math.max(Math.min(.2*(1-level/120), maxTargetPercent), minTargetPercent)
const weakToGrow = allWeakSec.map(([c,w]) => [c, w/growSecurity])
const weakToHack = allWeakSec.map(([c,w]) => [c, w/hackSecurity])
const byCores = cores => (_,i)=>cores.includes(i+1)
const scale = n => x => x * n
const dotProduct = v => (x, i) => x * v[i]
const addVector = scale => (x, i) => x + (scale[i] ?? scale)
const addOptimalCores = ({ threads, ...rest }) =>
  Object.assign({threads}, rest, {
    optimalCores: typeof threads !== 'object' ? '1' :
      Object.entries(threads)
        .reduce(([mK, m], [k, t]) => t < m? [k, t] : [mK, m], [0, Infinity])
        [0]
  })
const addCost = ({ threads, optimalCores, ...rest }) =>
  Object.assign({}, rest, {
    threads: typeof threads !== 'object' ? [threads, threads * 1.7] :
      Object.fromEntries(
        Object.entries(threads)
          .map(([cores, threads]) => [cores, [threads, threads * 1.75]])
      ),
    optimalCores,
    optimalCost: typeof threads !== 'object' ?
      threads * 1.7
      : threads[optimalCores] * 1.75
  })

/** @param {NS} ns */
export const getBatchData = (ns, { host, moneyMax, level }, cores=allCores, delta=5, targetPercent=calcPercent(level)) => {
  const hackTime = ns.getHackTime(host)^0
  const growTime = ns.getGrowTime(host)^0
  const weakTime = ns.getWeakenTime(host)^0

  const hackChance = ns.hackAnalyzeChance(host)
  const hackAmount = ns.hackAnalyze(host)

  const hackPerThread = hackAmount * hackChance
  const hackThreads = Math.max(Math.floor(targetPercent / hackPerThread), 1)

  const growTargetAmount = 1/(1-hackThreads*hackPerThread)
  //ns.tprint('ERROR cores = '+cores.join(','))
  //ns.tprint('ERROR grow target = '+ [growTargetAmount, hackAmount, hackChance, targetPercent])
  const growThreads = Object.fromEntries(cores.map(
      cs => [cs, Math.ceil(ns.growthAnalyze(host, growTargetAmount, cs))]
    ))

  // Get times
  const longest = Math.max(hackTime, growTime, weakTime)
  const startTimes = [
    longest - hackTime - delta,
    longest - weakTime,
    longest - growTime + delta,
    longest - weakTime + 2*delta
  ]

  const ratios = {
    weakToGrow: weakToGrow.filter(byCores(cores)),
    weakToHack: weakToHack.filter(byCores(cores))
  }
  const hWeakThreads = Object.fromEntries(ratios.weakToHack.map(
      ([c, weakEffect]) => [c, Math.ceil(hackThreads / weakEffect)]
    ))
  const gWeakThreads = Object.fromEntries(ratios.weakToGrow.map(
      ([c, weakEffect]) => [c, Math.ceil(growThreads[c] / weakEffect)]
    ))

  const batch = [
    { action: 'hack', offset: startTimes[0], threads: hackThreads },
    { action: 'weak', offset: startTimes[1], threads: hWeakThreads },
    { action: 'grow', offset: startTimes[2], threads: growThreads },
    { action: 'weak', offset: startTimes[3], threads: gWeakThreads }
  ].map(addOptimalCores)
    .map(addCost)

  const wegwThreads = Object.fromEntries(batch.slice(1).reduce((total, {threads}) =>
       total.map(([c,t])=>[c,t+threads[c]])
    , cores.slice().map(c=>[c,0])))

  const totalThreads = Object.fromEntries(Object.entries(wegwThreads)
    .map(([c, threads]) => [c, threads + hackThreads]))

  const batchMoney = hackThreads*hackPerThread*moneyMax
  const totalRam = batch.reduce((total, {optimalCost}) => total+optimalCost, 0)

  return {
    //startTimes,
    //ratios,
    //growThreads,
    batch,
    //hackThreads,
    //totalThreads,
    //wegwThreads
    length: (longest + 3 * delta) / 1000,
    totalRam,
    $: formatNumber(batchMoney),
    '$/s': formatNumber(1000*batchMoney/(longest+3*delta)),
    '$/GB': formatNumber(batchMoney/totalRam)
  }
}


