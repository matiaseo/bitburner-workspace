import { flatten, jssn } from './helpers.js'
import { scan } from './scanner.js'

const byName = text => ({ host }) => host.includes(text)
const byField = ([key, value], r=new RegExp(value)) => t => console.log(t[key],r)||r.test(''+t[key])

/** @param {NS} ns */
export function main(ns, target) {
  const hostTree = scan(ns, 32)
  const hosts = flatten(hostTree)
  const criteria = ns.args[1] ? byField(ns.args) : byName(target ?? ns.args[0])
  console.log(criteria)
  const foundHost = hosts.filter(criteria)

  ns.tprint(jssn`WARN target ${foundHost.length ? '' : 'not '}found = ${foundHost}`)

}

