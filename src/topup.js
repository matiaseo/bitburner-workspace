import { flatten, multiSort } from "./helpers.js"
import { scan } from './scanner.js'
import { killPrevious } from "./utils.js"

/** @param {NS} ns */
export async function main(ns) {
  killPrevious(ns)
  do {
    const ram = ns.getScriptRam('scripts/top.js')
    const hosts = flatten(scan(ns, 32))
    const cloudHosts = hosts.filter(({host}) => /^cs\d{2}$/.test(host))
    const hackingLevel = ns.getPlayer().skills.hacking

    const botnet = [
      {host:'home',maxRam:ns.getServerMaxRam()-128-ns.getServerUsedRam(),cpuCores:2,status:'root'}
    ].concat(hosts)
      .filter(({host}) => cloudHosts.every(cs=>cs.host !== host))
      .filter(({ status, maxRam }) => status === 'root' && maxRam)
//      .concat({host:'cs40',maxRam:ns.getServerMaxRam('cs40'),cpuCores:1,status:'root'})
      //.concat({host:'cs50',maxRam:ns.getServerMaxRam('cs50'),cpuCores:1,status:'root'})
      .concat(ns.args?.map(h=>({host:h,maxRam:ns.getServerMaxRam(h),cpuCores:1,status:'root'})))
      .toSorted(multiSort(['cpuCores'],['maxRam']))

    const cores = Array.from(new Set(botnet.map(({cpuCores})=>cpuCores)))
      .toSorted((a,b)=>a-b)
    //const botnetResources = getRamListByCores(botnet, cores)
    const eligibleHosts = hosts.filter(({ level, moneyMax }) => hackingLevel >= level && moneyMax)
      //.map(addAllocation(ns, cores, botnetResources, {actDelta:1,batchDelta:1}))
    //console.log(eligibleHosts, botnet, botnetResources)
    const targets = eligibleHosts//selectTop(eligibleHosts, 1+cloudHosts.length)
      .filter(({ level, moneyMax, minDifficulty, host }) =>
        hackingLevel >= level && moneyMax)
//          && (ns.getServerSecurityLevel(host) > minDifficulty
//            || ns.getServerMoneyAvailable(host) < moneyMax))
      .toSorted((a, b) => b.moneyMax - a.moneyMax)
      .filter(Boolean)
    if(!targets.length) return ns.tprint('ERROR no targets')
    const pids = botnet.flatMap(({ host: botHost }) => {
      ns.scp('scripts/top.js', botHost)
      const freeRam = ns.getServerMaxRam(botHost) - ns.getServerUsedRam(botHost)
      const capacity = Math.floor(freeRam/ram)
      const threads = Math.max(1, Math.floor(capacity/targets.length))
      return targets.map(({ host, moneyMax, minDifficulty }) => {
        //console.log(targets, capacity)
        //console.log('starting top script', botHost, ram, threads, host)
        return ns.exec('scripts/top.js', botHost, { ramOverride: ram, threads },
          host, moneyMax, minDifficulty)
      })
    }).filter(Boolean)
    for(let ppids, sleep=5000;
      ppids = pids.filter(pid=>ns.getRunningScript(pid));
      await ns.asleep(Math.max(30000,sleep++)))
        if(ppids.length<=pids.length>>1) {
          console.log('less pids', pids)
          break
        }
    await ns.asleep(10000)
  } while(Infinity)
}

