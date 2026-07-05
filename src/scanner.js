
const scan = (ns, base = ns.args[0]) =>
  ns.scan(base)

/** @param {NS} ns */
export function main(ns) {
  const targets = scan(ns)
  ns.tprint('INFO' + JSON.stringify(
    targets.map(target => [target].concat(scan(ns, target).slice(1)))
  ))
  
}
