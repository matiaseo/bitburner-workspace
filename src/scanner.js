
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
    cpuCores
  } = ns.getServer(host)
  const hackChance = ns.hackAnalyzeChance(host)
  const hackAmount = ns.hackAnalyze(host)
  const hackSecurity = ns.hackAnalyzeSecurity(1) // .002*thread
  const growAmount = [2,8,16].map(x=>ns.growthAnalyze(host, 1.25, x))
  const growSecurity = ns.growthAnalyzeSecurity(1) // .004 * thread
  const weakSecurity = ns.weakenAnalyze(1) //(.003125*(cpu-1)+.05) * thread

  return {
    level,
    minDifficulty,
    hackDifficulty,
    moneyAvailable,
    moneyMax,
    maxRam,
    ramUsed,
    hackChance,
    hackAmount,
    hackSecurity,
    growAmount,
    growSecurity,
    weakSecurity,
    ent: moneyMax * hackChance * hackAmount / minDifficulty / growAmount[2],
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
  const depth = Math.max(+ns.args[0]|0, 1, otherDepth|0)
  const fileName = `targets${depth}${new Date().toISOString().slice(0,10)}.json`
  const targets = scan(ns, depth)
  //ns.tprint('INFO ' + JSON.stringify(targets, null, 2))
  ns.tprint('WARN search depth: ' + depth)
  ns.write(fileName, JSON.stringify(targets, null, 2), 'w')
  ns.tprint('WARN wrote file:\t' + fileName)
}
