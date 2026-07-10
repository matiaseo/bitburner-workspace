import { flatten, toColumns } from './helpers.js'
import { scan } from './scanner.js'

/** @param {NS} ns */
export function main(ns) {
  const hostTree = scan(ns, 32)
  const hosts = flatten(hostTree)

  ns.tprint(`WARN \n${toColumns(hosts.map(({ host }) => host))}`)

}

