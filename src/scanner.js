
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
  } = ns.getServer(host)

  return {
    level,//: ns.getServerRequiredHackingLevel(host),
    maxMoney,//: ns.getServerMaxMoney(host),
    status: hasRoot ? 'root' : sshPortOpen || !numOpenPortsRequired ? 'nukable' : 'sshClosed',
    //hasRoot,
    //...details
  }
}

/** @param {NS} ns */
const getInfo = ns => host => ({
  host,
  ...getUsefulValues(ns, host),
  //...filterServerData(ns.getServer(host))
})

const scan = (ns, depth, base) =>
  !depth ? [getInfo(ns)(base)] :
    [base].concat(
      ns.scan(base)
        .slice(+!!base)
        .map(getInfo(ns))
        .map(target => Object.assign({ target },
          depth > 1 && { connected: scan(ns, depth-1, target.host).slice(1) }
        ))
    ).filter(Boolean)

/** @param {NS} ns */
export function main(ns) {
  const depth = Math.max(+ns.args[0]|0, 1)
  const fileName = ns.args[1] || `targets${depth}.json`
  const targets = scan(ns, depth)
  //ns.tprint('INFO ' + JSON.stringify(targets, null, 2))
  ns.tprint('WARN search depth: ' + depth)
  ns.write(fileName, JSON.stringify(targets, null, 2))
  ns.tprint('WARN wrote file:\t' + ns.ls('home', fileName))
}
