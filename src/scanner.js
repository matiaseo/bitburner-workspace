
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
    moneyMax: maxMoney,
    numOpenPortsRequired,
    openPortCount
  } = ns.getServer(host)

  return {
    level,//: ns.getServerRequiredHackingLevel(host),
    maxMoney,//: ns.getServerMaxMoney(host),
    status: hasRoot ? 'root' : sshPortOpen || !numOpenPortsRequired ? 'nukable' : openPortCount,
    //hasRoot,
    //...details
  }
}

/** @param {NS} ns */
const getInfo = (ns, distance) => host => ({
  host, distance,
  ...getUsefulValues(ns, host),
  //...filterServerData(ns.getServer(host))
})

const scan = (ns, depth, base, distance=1) =>
  !depth ? [getInfo(ns, distance)(base)] :
    [base].concat(
      ns.scan(base)
        .slice(+!!base)
        .map(getInfo(ns, distance))
        .map(target => {
          const connected = scan(ns, depth-1, target.host, distance+1).slice(1)
          return Object.assign({}, target, !!connected.length && { connected })
        })
    ).filter(Boolean)

/** @param {NS} ns */
export function main(ns) {
  const depth = Math.max(+ns.args[0]|0, 1)
  const fileName = `targets${depth}${new Date().toISOString().slice(0,10)}.json`
  const targets = scan(ns, depth)
  //ns.tprint('INFO ' + JSON.stringify(targets, null, 2))
  ns.tprint('WARN search depth: ' + depth)
  ns.write(fileName, JSON.stringify(targets, null, 2), 'w')
  ns.tprint('WARN wrote file:\t' + fileName)
}
