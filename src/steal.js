
/** @param {NS} ns */
export async function main(ns) {
  ns.ramOverride(1.75)
  const [ action, host='', port=1 ] = ns.args
  ns.atExit(() => ns.tprint(port, JSON.stringify({ action, host, time: performance.now() })))
  switch (action) {
    case 'hack': return ns.hack(host)
    case 'grow': return ns.grow(host)
    case 'weaken': return ns.weaken(host)
    default: ns.tprint(`ERROR bad action [${ns.args}]`)
  }
}

