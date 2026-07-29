import { flatten, multiSort, selectTop } from "./helpers.js"
import { scan } from './scanner.js'
import { addAllocation, getRamListByCores, killPrevious } from "./utils.js"

/** @param {NS} ns */
export async function main(ns) {
  killPrevious(ns)
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
    const eligibleHosts = hosts.filter(({ level, moneyMax }) => hackingLevel >= level && moneyMax)
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
    const pids = botnet.flatMap(({ host: botHost }) => {
      ns.scp('scripts/top.js', botHost)
      const freeRam = ns.getServerMaxRam(botHost) - ns.getServerUsedRam(botHost)
      const capacity = Math.floor(freeRam/ram)
      const threads = Math.max(1, Math.floor(capacity/targets.length))
      return targets.map(({ host, moneyMax, minDifficulty }) => {
        console.log(targets, capacity)
        console.log('starting top script', botHost, ram, threads, host)
        return ns.exec('scripts/top.js', botHost, { ramOverride: ram, threads },
          host, moneyMax, minDifficulty)
      })
    })
    for(let ppids, sleep=5000;
      ppids = pids.filter(pid=>ns.getRunningScript(pid));
      await ns.asleep(Math.max(30000,sleep++)))
        if(console.log('pending pids',ppids)||!ppids.length) {
          console.log('no more pids', pids)
          break
        }
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

