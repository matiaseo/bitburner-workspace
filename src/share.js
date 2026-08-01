/** @param {NS} ns */
export const main = async ns => {
  while(ns.args[0]) {
    ns.run(ns.getScriptName(), {
      threads: Math.min(
        Math.round((ns.getServerMaxRam()-ns.getServerUsedRam())/4), ns.args[0]
      )||1, ramOverride: 4 })
    await ns.asleep(10000)
  }
  for(;Infinity;await ns.share()){}
}
