
/** @param {NS} ns */
export async function main(ns) {
  ns.ramOverride(1.75)
  const [ action, host='' ] = ns.args
  switch (action) {
    case 'hack': { ns.hack(host) } break
    case 'grow': { ns.grow(host) } break
    case 'weaken': { ns.weaken(host) } break
    default: ns.tprint(`ERROR bad action [${ns.args}]`)
  }
}

