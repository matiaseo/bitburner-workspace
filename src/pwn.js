import { flatten } from './helpers.js'

/** @param {NS} ns */
export function main(ns) {
  const fileName = ns.ls('home', 'targets').toSorted().slice(-1)[0]
  const hackingLevel = ns.getPlayer().skills.hacking
  ns.tprint('WARN reading: ' + fileName)
  const targets = flatten(JSON.parse(ns.read(fileName)))
    .filter(({status, level}) => status !== 'root' && level <= hackingLevel)

  ns.tprint(`INFO targetting ${targets.length} hosts`)

  targets.forEach(async host => {
    switch(host.status) {
      case 5: if(hackingLevel > 750) ns.tprint(`WARN squeald ${host.host}: ` + await ns.sqlinject(host.host))
      case 4: if(hackingLevel > 500) ns.tprint(`WARN wormed ${host.host}: ` + await ns.httpworm(host.host))
      case 3: if(hackingLevel > 250) ns.tprint(`WARN smptd ${host.host}: ` + await ns.relaysmtp(host.host))
      case 2: if(hackingLevel > 100) ns.tprint(`WARN ftpd ${host.host}: ` + await ns.ftpcrack(host.host))
      case 1: if(hackingLevel > 10) ns.tprint(`WARN brutd ${host.host}: ` + await ns.brutessh(host.host))
      case 'nukable':
        ns.tprint(`WARN nukin ${host.host}: ` + await ns.nuke(host.host))
        break
      default: ns.tprint('ERROR huh?')
    }
  })

  ns.tprint(`INFO done`)
}

