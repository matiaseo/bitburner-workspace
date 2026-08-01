
const moneyRatio = .3
const getPossibleUpgrade = (csRam, newRam, checkCost) =>
  newRam <= csRam ? 0
    : checkCost(newRam) ? newRam
      : getPossibleUpgrade(csRam, newRam>>1, checkCost)

/** @param {NS} ns */
export function main(ns) {
  const [count] = ns.args
  if(count)
    for(let i=ns.cloud.getServerNames().length; i < count; i++)
      ns.cloud.purchaseServer(`cs${i.toString(16).padStart(2,'0').reverse()}`, 8)
  const ramLimit = ns.cloud.getRamLimit()
  ns.cloud.getServerNames()
    .forEach(cs => {
      const uMoney = ns.getPlayer().money * moneyRatio
      const csRam = ns.getServerMaxRam(cs)
      const upgrade = csRam < ramLimit && getPossibleUpgrade(csRam, ramLimit,
        ram => ns.cloud.getServerUpgradeCost(cs, ram) < uMoney)
      if(upgrade)
        ns.tprint(cs, upgrade, ns.cloud.upgradeServer(cs, upgrade))
    })
}

