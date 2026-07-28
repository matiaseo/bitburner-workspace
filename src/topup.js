import { flatten, multiSort, selectTop } from "./helpers.js"
import { scan } from './scanner.js'
import { addAllocation, getRamListByCores } from "./utils.js"

/** @param {NS} ns */
export async function main(ns) {
  if(!ns.args[0]) {
    const ram = ns.getScriptRam('scripts/top.js')
    const freeRam = ns.getServerMaxRam() - ns.getServerUsedRam()
    const hosts = flatten(scan(ns, 32))
    const cloudHosts = hosts.filter(({host}) => /^cs\d{2}$/.test(host))
    const hackingLevel = ns.getPlayer().skills.hacking

    const botnet = cloudHosts/*[
      {host:'home',maxRam:ns.getServerMaxRam()-128,cpuCores:2,status:'root'}
    ].concat(hosts)
      .filter(({ status, maxRam }) => status === 'root' && maxRam)
      .toSorted(multiSort(['cpuCores'],['maxRam']))
*/
    const cores = Array.from(new Set(botnet.map(({cpuCores})=>cpuCores)))
      .toSorted((a,b)=>a-b)
    ns.tprint(`INFO botnet cores=${cores}`)
    const botnetResources = getRamListByCores(botnet, cores)
    const eligibleHosts = hosts.filter(({ level }) => hackingLevel >= level)
      //.map(addAllocation(ns, cores, botnetResources, {actDelta:1,batchDelta:1}))
    console.log(eligibleHosts, botnet, botnetResources)
    const targets = eligibleHosts//selectTop(eligibleHosts, 1+cloudHosts.length)
      .filter(({ level, moneyMax, minDifficulty, host }) =>
        hackingLevel >= level && moneyMax
          && (ns.getServerSecurityLevel(host) > minDifficulty
            || ns.getServerMoneyAvailable(host) < moneyMax))
      .toSorted((a, b) => b.moneyMax - a.moneyMax)
      .filter(Boolean)
    if(!targets.length) return ns.tprint('ERROR no targets')
//    const threads = Math.floor(freeRam / ram)
//    if(threads)
//      targets.forEach(({ host, moneyMax, minDifficulty:securityMin }) =>
//        ns.tprint('INFO starting '+
//          ns.run('scripts/topup.js', { ramOverride: ram, threads },
//            host, moneyMax, securityMin))
//      )
    botnet.forEach(({ host }) => ns.scp('scripts/top.js', host))
    botnet.forEach(({ host: botHost, maxRam }) => {
      const capacity = Math.floor(maxRam/ram)
      const threads = Math.max(capacity, 1)
        console.log(targets, capacity)
        const [{ host, moneyMax, minDifficulty }] = targets
        ns.exec('scripts/top.js', botHost, { ramOverride: ram, threads },
          host, moneyMax, minDifficulty)
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

