
/** @param {NS} ns */
export async function main(ns) {
  const [host, moneyMax, securityMin] = ns.args
  ns.tprint('WARN starting to top ' + host)
  while(ns.getServerSecurityLevel(host) > securityMin
      && ns.getServerMoneyAvailable(host) < moneyMax) {
    if(ns.getServerSecurityLevel(host) > securityMin)
      await ns.weaken(host)
    if(ns.getServerMoneyAvailable(host) < moneyMax)
      await ns.grow(host)
  }
  ns.tprint('WARN done with '+host)
}

