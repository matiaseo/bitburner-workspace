import { flatten, jisn, toColumns } from './helpers.js'
import { scan, getSummary } from './scanner.js'

/** @param {NS} ns */
export function main(ns) {
  const hostTree = scan(ns, 32)
  const hosts = flatten(hostTree)
  const hackingLevel = ns.getPlayer().skills.hacking

  ns.tprint(`WARN \n${
    toColumns(hosts.map(({ host, status, level }) =>
      `${status === 'root' ? 'X':'-'}${level <= hackingLevel ? 'H' : '-'} ${(''+level).padStart(4, ' ')}|${host.padStart(18, ' ')}${status|0 ? '|'+status : '  '}`
    ).toSorted(), 8)
  }`)
  const summary = getSummary(hosts, hackingLevel)
  ns.tprint(jisn`WARN ${summary}`)
}

