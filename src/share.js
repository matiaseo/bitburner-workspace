/** @param {NS} ns */
export const main = async ns => {
  while(ns.args[0]) {
    ns.run(ns.getScriptName(), { threads: ns.args[0], ramOverride: 4 })
    await ns.asleep(10000)
  }
  return ns.share()
}
