
/** @param {NS} ns */
export const deploy = (ns, scripts, hosts) =>
  [].concat(hosts).forEach(({ host }) => ns.scp(scripts, host))

const allCores = [...(~0>>>0).toString(2)].map((_,i)=>i+1)
const allWeakSec = allCores.map(c=>.05+.003125*(c-1))

export const getWeakSecurity = coreCount => allWeakSec[coreCount-1]
const growSecurity = .004//ns.growthAnalyzeSecurity(1) // .004 * thread
const hackSecurity = .002//ns.hackAnalyzeSecurity(1) // .002*thread
const targetPercent = .1 // 10%

/** @param {NS} ns */
export const getBatchData = (ns, target, cores=allCores) => {
  const { host } = target
  const hackTime = ns.getHackTime(host)^0
  const growTime = ns.getGrowTime(host)^0
  const weakTime = ns.getWeakenTime(host)^0

  const hackChance = ns.hackAnalyzeChance(host)
  const hackAmount = ns.hackAnalyze(host)
  const hackPerThread = hackAmount * hackChance
  const hackThreads = Math.max(Math.floor(targetPercent / hackPerThread), 1)
  const growTargetAmount = 1/(hackThreads*hackPerThread)
  const growThreads = cores.map(
      cs => ns.growthAnalyze(host, growTargetAmount, cs)
    ).map(Math.ceil)
  const weakSecurity = allWeakSec.filter((_,i)=>cores.include(i+1))

  // Get times
  const longest = Math.max(hackTime, growTime, weakTime)
  const startTimes = [
    longest - hackTime,
    longest - weakTime + 5,
    longest - growTime + 10,
    longest - weakTime + 15
  ]
  const weakToGrow = weakSecurity.map(cs => cs/growSecurity)
  const weakToHack = weakSecurity.map(cs => cs/hackSecurity)

  return {
    startTimes,
    ratios: {
      weakToGrow,
      weakToHack
    },
    hackThreads,
    growThreads
  }
}


