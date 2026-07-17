import { flatten, selectTop, jisn, jssn } from './helpers.js'
import { scan } from './scanner.js'
import { deploy, getBatchData } from "./utils.js"

const stealer = 'scripts/steal.js'
const overlap = 20

/** @param {NS} ns */
const getThreads = (ns, host) =>
  ns.getServerMaxRam(host) / ns.getScriptRam(stealer)

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
  bots.reduce((total, { maxRam }) =>
      ({hosts: total.hosts+1, RAM: total.RAM+maxRam})
    , {hosts:0, RAM:0})

/** @param {NS} ns */
const pollStatus = (ns, port=0) => {
  const {time,host,action} = Object.assign({}, ns.readPort(port))
  ns.tprint(`${time.toFixed(0)}\t${host}\t${action}\t${ns.getServerMoneyAvailable(host)}`)
}

/** @param {NS} ns */
const orchid = (ns, botnet, hitlist) => {
  hitlist.forEach((host, i) => {
    const batchData = getBatchData(host)
    ns.tprint(jssn`WARN batch = ${batchData}`)

    //ns.exec(...getExecParams(ns, bot), action, host, i)
    // monitoring
    ns.asleep(4)
    pollStatus(ns, i)
  })
}

/** @param {NS} ns */
export function main(ns) {
  const hostTree = scan(ns, 32)
  const hosts = flatten(hostTree)
  const hackingLevel = ns.getPlayer().skills.hacking
  const botnet = hosts.filter(({ status, maxRam }) => status === 'root' && maxRam)
  const targets = selectTop(hosts.filter(
      ({ level, grow8 }) =>
        hackingLevel >= level && grow8 < 150
    ), (botnet.length/overlap)|0)
  const threshold = getCpuThreshold(botnet)+1

  ns.tprint(jisn`INFO targetting ${targets.length} hosts = ${targets} with botnet=[${botnet.length}]${botnet.map(({ host, maxRam, cpuCores }) => `${cpuCores.toString().padStart(2, ' ')} ${host} ${maxRam} ${cpuCores >= threshold ? 'wegw' : 'h'}`).toSorted().join(', ')} thr=${threshold}`)

  const cbots = botnet.reduce(categorizeBots(threshold), { hack: [{host:'home',maxRam:384,cpuCores:1}], wegw: [] })
  ns.tprint(`INFO\nhack=${JSON.stringify(getResources(cbots.hack))}\nwegw=${JSON.stringify(getResources(cbots.wegw))}`)
  // start hacking scripts
  const botsPerTarget = botnet.length / targets.length
  ns.tprint(`INFO botsPerTarget=${botsPerTarget}`)
  ns.tprint(`INFO hack threads=${Math.floor(getResources(cbots.hack).RAM/1.7)}`)
  ns.tprint(`INFO wegw threads=${Math.floor(getResources(cbots.wegw).RAM/1.75)}`)
  const cores = Array.from(new Set(botnet.map(({cpuCores})=>cpuCores))).toSorted((a,b)=>a-b)
  ns.tprint(`INFO botnet cores=${cores}`)
  ns.tprint(jisn`INFO botnet resources=${getResources(botnet)}`)
  //orchid(ns, botnet, targets)
  //return
  targets.forEach((target, index) => {
    const bots = botnet.slice(index * botsPerTarget, (1+index) * botsPerTarget)
    ns.tprint(`ERROR ${target.host} ${bots.filter((bot, index, {length}) => !index || index === length-1).map(bot=>bot.host).join('...')} # ${bots.length}`)
    const { host, moneyMax, minDifficulty } = target
    const batchData = getBatchData(ns, target, cores)
    ns.tprint(jssn`WARN batch = ${batchData}`)
    // ns.tprint(jisn`ERROR execd ${bots.map(bot => `${bot.host}[${ns.exec(...getExecParams(ns, bot), host, moneyMax, minDifficulty)}]`)}`)
  })
}

