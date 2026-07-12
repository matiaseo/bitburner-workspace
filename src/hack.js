import { flatten, selectTop, jisn } from './helpers.js'
import { scan } from './scanner.js'
import { deploy } from "./utils.js"

const stealer = 'steal.js'
const overlap = 14

/** @param {NS} ns */
const getThreads = (ns, host) =>
  ns.getServerMaxRam(host) / ns.getScriptRam('scripts/'+stealer)

const getExecParams = (ns, {host}) => [stealer, host, getThreads(ns, host)]

const categorizeBots = threshold => (categories, bot) => ({
    hack: categories.hack.concat(bot.cpuCores < threshold ? bot : []),
    wegw: categories.wegw.concat(bot.cpuCores >= threshold ? bot : [])
  })

const getCpuThreshold = bots =>
  bots.reduce((compute, { cpuCores, maxRam }) =>
      [compute[0] + cpuCores*maxRam, compute[1] + maxRam]
    , [0, 0]).reduce((cpuRam, maxRam) => cpuRam / maxRam)

const getResources = bots =>
  bots.reduce((total, { maxRam }) => ({hosts: total.hosts+1, RAM: total.RAM+maxRam})
    , {hosts:0, RAM:0})

/** @param {NS} ns */
export function main(ns) {
  const hostTree = scan(ns, 32)
  const hosts = flatten(hostTree)
  const hackingLevel = ns.getPlayer().skills.hacking
  const botnet = hosts.filter(({ status, maxRam }) => status === 'root' && maxRam)
  const targets = selectTop(hosts.filter(({ level }) => hackingLevel >= level), (botnet.length/overlap)|0)
  const threshold = getCpuThreshold(botnet)

  ns.tprint(jisn`INFO targetting ${targets.length} hosts = ${targets} with botnet=[${botnet.length}]${botnet.map(({ host, maxRam, cpuCores }) => `${cpuCores.toString().padStart(2, ' ')} ${host} ${maxRam} ${cpuCores >= threshold ? 'wegw' : 'h'}`).toSorted().join(', ')} thr=${threshold}`)

  const bots = botnet.reduce(categorizeBots(threshold), { hack: [], wegw: [] })
  ns.tprint(`INFO\nhack=${JSON.stringify(getResources(bots.hack))}\nwegw=${JSON.stringify(getResources(bots.wegw))}`)
  // start hacking scripts
  const botsPerTarget = botnet.length / targets.length
  targets.forEach((target, index) => {
    const bots = botnet.slice(index * botsPerTarget, (1+index) * botsPerTarget)
    ns.tprint(`ERROR ${target.host} ${bots.filter((bot, index, {length}) => !index || index === length-1).map(bot=>bot.host).join('...')} # ${bots.length}`)
    const { host, moneyMax, minDifficulty } = target
    // ns.tprint(jisn`ERROR execd ${bots.map(bot => `${bot.host}[${ns.exec(...getExecParams(ns, bot), host, moneyMax, minDifficulty)}]`)}`)
  })
}

