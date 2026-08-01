/** @param {NS} ns */
export const main = async ns => {
  while(ns.args[0]) {
    const threads = Math.min(
        Math.floor((ns.getServerMaxRam()-ns.getServerUsedRam())/4),
      ns.args[0])||1
    ns.run(ns.getScriptName(), { threads, ramOverride: 4 })
    await ns.share()
    if(ns.args[0] === threads) break
  }
  for(;Infinity;await ns.share()){}
}
