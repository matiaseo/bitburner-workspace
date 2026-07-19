import { compactArrays, deformat } from "./helpers.js"
import { getBatchData } from "./utils.js";

const usefulInfo = [
  'requiredHackingSkill',
  'hasAdminRights',
  'sshPortOpen',
  'moneyMax',
  'moneyAvailable',
  'minDifficulty',
  'hackDifficulty',
  'ramUsed',
  'maxRam',
]

export const getSummary = (hosts, hackingLevel) => hosts.reduce((summary, host) => Object.assign({}, summary, {
  root: (summary.root ?? 0) + (host.status === 'root'),
  hackable: (summary.hackable ?? 0) + (host.level <= hackingLevel),
  total: summary.total + 1
}), { total: 0 })

const filterServerData = serverInfo =>
  Object.fromEntries(
    Object.entries(serverInfo)
      .filter(([key]) => usefulInfo.includes(key))
  )

/** @param {NS} ns */
const getUsefulValues = (ns, host) => {
//  const hasRoot = ns.hasRootAccess(host)
  const {
    sshPortOpen,
    requiredHackingSkill: level,
    hasAdminRights: hasRoot,
    moneyMax,
    numOpenPortsRequired,
    minDifficulty,
    hackDifficulty,
    moneyAvailable,
    openPortCount,
    maxRam,
    ramUsed,
    cpuCores,
    serverGrowth
  } = ns.getServer(host)
  //const hackChance = ns.hackAnalyzeChance(host)
  //const hackAmount = ns.hackAnalyze(host)
  //const hackSecurity = ns.hackAnalyzeSecurity(1) // .002*thread
  //const growAmount = [2,8,12].map(x=>ns.growthAnalyze(host, 1.25, x))
  //const growSecurity = ns.growthAnalyzeSecurity(1) // .004 * thread
  //const weakSecurity = ns.weakenAnalyze(1) //(.003125*(cpu-1)+.05) * thread

  //const { '$/s': perSecond, '$/GB': perGB, length: attackTime, totalRam } = moneyMax && hackAmount ? getBatchData(ns, { host, level, moneyMax }, [8]) : {}
  //const rate = perSecond && deformat(perSecond)
  //const efficiency = perGB && deformat(perGB)
  //if(perSecond) ns.tprint('ERROR '+[perSecond, perGB, attackTime, totalRam, host, level, moneyMax])

  return {
    level,
    minDifficulty,
    hackDifficulty,
    moneyAvailable,
    moneyMax,
    maxRam,
    ramUsed,
    //hackChance,
    //hackAmount,
    //hackSecurity,
    //growAmount,
    //grow8:growAmount[1],
    //serverGrowth,
    //growSecurity,
    //weakSecurity,
    //ent: moneyMax * hackChance * hackAmount * serverGrowth / growAmount[1],
    //ent: rate * efficiency / totalRam / attackTime,
    cpuCores,
    //info: ns.getServer(host),
    status: hasRoot ? 'root' : numOpenPortsRequired,
    //hasRoot,
    //...details
  }
}

/** @param {NS} ns */
const getInfo = (ns, path) => host => ({
  host, path: ''+path, distance: path.length,
  ...getUsefulValues(ns, host),
  //...filterServerData(ns.getServer(host))
})

export const scan = (ns, depth, base, path=['home']) =>
  !depth ? [getInfo(ns, path)(base)] :
    [base].concat(
      ns.scan(base)
        .slice(+!!base)
        .map(getInfo(ns, path))
        .map(target => {
          const connected = scan(ns, depth-1, target.host, path.concat(target.host)).slice(1)
          return Object.assign({}, target, !!connected.length && { connected })
        })
    ).filter(Boolean)

/** @param {NS} ns */
export function main(ns, otherDepth) {
  const depth = Math.max(+ns.args[0]|0 || 32, otherDepth|0)
  const fileName = `targets${depth}.json`

  const targets = scan(ns, depth)
  //ns.tprint('INFO ' + JSON.stringify(targets, null, 2))
  ns.tprint('WARN search depth: ' + depth)
  ns.write(fileName, JSON.stringify(compactArrays(targets), null, 2), 'w')
  ns.tprint('WARN wrote file:\t' + fileName)
}
