
/** @param {NS} ns */
export async function main(ns) {
  ns.ramOverride(1.75)
  const [ action, host='', port=1 ] = ns.args
  ns.atExit(() =>
    ns.writePort(port, `${action} ended`)
  )
  ns.writePort(port, `${action} starting`)
  switch (action) {
    case 'hack': return ns.hack(host)
    case 'grow': return ns.grow(host)
    case 'weak': return ns.weaken(host)
    default: ns.tprint(`ERROR bad action [${ns.args}]`)
  }
}

