import { flatten, selectTop, str, jisn } from './helpers.js'
import { main as scanner } from './scanner.js'

/** @param {NS} ns */
export function main(ns) {
  scanner(ns, 32)
  const fileName = ns.ls('home', 'targets').toSorted().slice(-1)[0]
  ns.tprint('WARN reading: ' + fileName)
  const targets = selectTop(flatten(JSON.parse(ns.read(fileName))), 3)

  ns.tprint(jisn`INFO targetting ${targets.length} hosts = ${targets}`)

}

