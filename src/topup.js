import { flatten } from "./helpers.js"
import { scan } from './scanner.js'

/** @param {NS} ns */
export async function main(ns) {
  if(!ns.args[0]) {
    const hosts = flatten(scan(ns, 32))
    const hackingLevel = ns.getPlayer().skills.hacking
    const targets = hosts.filter(({ level, moneyMax }) => hackingLevel >= level && moneyMax)
    targets.forEach(({ host, moneyMax, minDifficulty:securityMin }) =>
      ns.tprint('INFO starting '+ns.run('scripts/topup.js', { ramOverride: 3, threads: 3 }, host, moneyMax, securityMin))
    )
  } else {
    let escaper=1e5
    const [host, moneyMax, securityMin] = ns.args
    while(escaper--) {
      if(ns.getServerSecurityLevel(host) > securityMin)
        await ns.weaken(host)
      if(ns.getServerMoneyAvailable(host) < moneyMax)
        await ns.grow(host)
      await ns.weaken(host)
      if(ns.getServerSecurityLevel(host) === securityMin
        && ns.getServerMoneyAvailable(host) === moneyMax)
        break
    }
  }
  ns.tprint('WARN done?')
}

