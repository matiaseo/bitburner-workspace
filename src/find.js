import { flatten, selectTop, jisn } from './helpers.js'
import { scan } from './scanner.js'

/** @param {NS} ns */
export function main(ns, target) {
  const hostTree = scan(ns, 32)
  const hosts = flatten(hostTree)
  const foundHost = hosts.find(({ host }) => host === (target ?? ns.args[0]))

  ns.tprint(jisn`WARN target ${foundHost ? '' : 'not '}found = ${foundHost}`)

}

