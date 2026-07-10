import { flatten, selectTop, jisn } from './helpers.js'
import { main as scanner } from './scanner.js'

/** @param {NS} ns */
export function main(ns) {
  scanner(ns, 32)
  const fileName = ns.ls('home', 'targets').toSorted().slice(-1)[0]
  ns.tprint('WARN reading: ' + fileName)
  const hosts = flatten(JSON.parse(ns.read(fileName)))
  const botnet = hosts.filter(({ status }) => status === 'root')
  const targets = selectTop(hosts, 3)

  ns.tprint(jisn`INFO targetting ${targets.length} hosts = ${targets} with botnet=[${botnet.length}]${botnet.map(host => host.host)}`)

}

