import { flatten } from './helpers.js'
import { scan } from './scanner.js'

const moneyRatio = .05
const getPossibleUpgrade = (csRam, newRam, checkCost) =>
  newRam <= csRam ? 0
    : checkCost(newRam) ? newRam
      : getPossibleUpgrade(csRam, newRam>>1, checkCost)

/** @param {NS} ns */
export async function main(ns) {
  const ramLimit = ns.cloud.getRamLimit()
  flatten(scan(ns, 32)).filter(({host}) => /^cs\d{2}$/.test(host))
    .forEach(({host:cs}) => {
      const uMoney = ns.getPlayer().money * moneyRatio
      const csRam = ns.getServerMaxRam(cs)
      const upgrade = csRam < ramLimit && getPossibleUpgrade(csRam, ramLimit,
        ram => ns.cloud.getServerUpgradeCost(cs, ram) < uMoney)
      if(upgrade) ns.cloud.upgradeServer(cs, upgrade)
    })
}

