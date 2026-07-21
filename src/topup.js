import { flatten } from "./helpers.js"
import { scan } from './scanner.js'

/** @param {NS} ns */
export async function main(ns) {
  if(!ns.args[0]) {
    const ram = ns.getScriptRam('scripts/top.js')
    const freeRam = ns.getServerMaxRam() - ns.getServerUsedRam()
    const hosts = flatten(scan(ns, 32))
    const hackingLevel = ns.getPlayer().skills.hacking
    const targets = hosts.filter(
      ({ level, moneyMax, minDifficulty, host }) =>
      hackingLevel >= level && moneyMax
        && ns.getServerSecurityLevel(host) > minDifficulty
          && ns.getServerMoneyAvailable(host) < moneyMax
    ).filter(Boolean)
    if(!targets.length) return ns.tprint('ERROR no targets')
    const threads = Math.floor(freeRam / ram)
    if(threads)
      targets.forEach(({ host, moneyMax, minDifficulty:securityMin }) =>
        ns.tprint('INFO starting '+
          ns.run('scripts/topup.js', { ramOverride: ram, threads },
            host, moneyMax, securityMin))
      )
    const botnet = hosts.filter(({ status, maxRam }) => status === 'root' && maxRam>ram)
    botnet.forEach(({ host }) => ns.scp('scripts/top.js', host))
    botnet.forEach(({ host: botHost, maxRam }) => {
      let capacity = Math.floor(maxRam/ram)
      const threads = Math.max(Math.floor(capacity/targets.length), 1)
      while(capacity--) {
        console.log(targets, capacity)
        const { host, moneyMax, minDifficulty } = targets[capacity%targets.length]
        ns.exec('scripts/top.js', botHost, { ramOverride: ram, threads },
          host, moneyMax, minDifficulty)
      }
    })
  } else {
    let escaper=1e5
    const [host, moneyMax, securityMin] = ns.args
    while(escaper--) {
      ns.tprint('WARN checking ' + host)
      if(ns.getServerSecurityLevel(host) > securityMin)
        await ns.weaken(host)
      if(ns.getServerMoneyAvailable(host) < moneyMax)
        await ns.grow(host)
      //await ns.weaken(host)
      if(ns.getServerSecurityLevel(host) === securityMin
        && ns.getServerMoneyAvailable(host) === moneyMax)
        break
    }
    ns.tprint('WARN done with '+host)
  }
}

