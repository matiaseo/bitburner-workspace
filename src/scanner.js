
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
    maxRam
  } = ns.getServer(host)

  return {
    level,//: ns.getServerRequiredHackingLevel(host),
    minDifficulty,
    hackDifficulty,
    moneyAvailable,
    moneyMax,//: ns.getServerMaxMoney(host),
    maxRam,
    ent: moneyMax / minDifficulty,
    status: hasRoot ? 'root' : sshPortOpen || !numOpenPortsRequired ? 'nukable' : numOpenPortsRequired - openPortCount,
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
