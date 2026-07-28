import { formatNumber, deformat } from './helpers.js'

/** @param {NS} ns */
export const killPrevious = ns =>
  [].concat(ns.getRunningScript(ns.getScriptName()) ?? [])
    .map(s => s.pid)
    .filter(id => id !== ns.pid)
    .forEach(id => ns.kill(id))

export const respawn = (ns, threads=1, spawnDelay=0) =>
  ns.spawn(ns.getScriptName(), {threads, spawnDelay})

/** @param {NS} ns */
export const deploy = (ns, scripts, hosts) =>
  [].concat(hosts).forEach(({ host }) => ns.scp(scripts, host))

const allCores = [...(~0>>>0).toString(2)].map((_,i)=>i+1)
const allWeakSec = allCores.map(c=>[c, .05+.003125*(c-1)])

export const getWeakSecurity = coreCount => allWeakSec[coreCount-1]

const growSecurity = .004//ns.growthAnalyzeSecurity(1) // .004 * thread
const hackSecurity = .002//ns.hackAnalyzeSecurity(1) // .002*thread
const maxTargetPercent = .18
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

  //const hackChance = ns.hackAnalyzeChance(host)
  const hackAmount = ns.hackAnalyze(host)

  const hackPerThread = hackAmount// * hackChance
  const hackThreads = Math.max(Math.floor(targetPercent / hackPerThread), 1)

  const growTargetAmount = 1/(1-hackThreads*hackAmount)//hackPerThread)
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
    longest - 2*delta - hackTime,
    longest +         - weakTime,
    longest + 2*delta - growTime,
    longest + 3*delta - weakTime,
  ]

  const ratios = {
    weakToGrow: weakToGrow.filter(byCores(cores)),
    weakToHack: weakToHack.filter(byCores(cores))
  }
  //console.log(ratios, hackThreads, growThreads)
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
    duration: longest + 3 * delta,
    totalRam,
    $: formatNumber(batchMoney),
    '$/s': formatNumber(1000*batchMoney/(longest+3*delta)),
    '$/GB': formatNumber(batchMoney/totalRam)
  }
}

export const getRamListByCores = (botnet, cores=getCores(botnet)) =>
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
        allocatedActs.concat({...act, host, threads, ram: mem/threads})
      ]
  }
  //console.log('out of resources', resources, orderedThreads)
  return null
}

const setOffset = (delta, index, delay=delta*index) => ({offset, ...act}) =>
  Object.assign({offset: offset + delay}, act)

const allocateBatch = ({batch, delta, resources, maxConcurrency}, alloc=[]) => {
  const [leftovers, nextAlloc] = batch
    .map(setOffset(delta, alloc.length>>2))
    .reduce(([resources, alloActs], { orderedThreads, ...act }) =>
        resources &&
          deductCost(orderedThreads, resources, act, alloActs)
            || []
      , [resources, []])

  const newAlloc = alloc.concat(nextAlloc ?? [])

  return (!leftovers || (newAlloc.length>>2) >= maxConcurrency) ? newAlloc
    : allocateBatch({batch, delta, resources: leftovers, maxConcurrency}, newAlloc)
}

export const addAllocation = (ns, cores, resources, {actDelta,batchDelta}) =>
  target => {
  const { batch: rawB, '$/s':flow, duration } = getBatchData(ns, target, cores, actDelta)
  const maxConcurrency = duration/batchDelta
  const batch = rawB.map(({threads, optimalCores, ...act}) =>
    Object.assign({
      orderedThreads: getOrderedThreads(threads, optimalCores)
    }, act))
  const batchFit = [batch, batch.toReversed()]
    .map(batch => allocateBatch({batch, delta: batchDelta, resources, maxConcurrency}))
    .reduce((fw, rev) => rev.length > fw.length ? rev : fw)
  const concurrency = (batchFit.length-1)>>2
  const potential = deformat(flow) * concurrency
  console.log(potential, concurrency, batchFit)
  return {
    ...target,
    potential,
    concurrency,
    maxConcurrency,
    '$/s': formatNumber(potential),
    duration,
    getAllocation: () => batchFit
  }
}
