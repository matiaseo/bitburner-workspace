import { flatten, jisn } from './helpers.js'
import { scan } from './scanner.js'

const getMaxPorts = ns =>
  ns.ls('home', '.exe')
    .filter(file =>
      ['SQLInject','FTPCrack', 'HTTPWorm', 'BruteSSH', 'relaySMTP'].includes(...file.split('.'))
    ).length
const tools = ns => [
  ns.sqlinject,
  ns.httpworm,
  ns.relaysmtp,
  ns.ftpcrack,
  ns.brutessh
]

 /** @param {NS} ns */
export async function main(ns) {
  //const fileName = ns.ls('home', 'targets').toSorted().slice(-1)[0]
  const hackingLevel = ns.getPlayer().skills.hacking
  //ns.tprint('WARN reading: ' + fileName)
  const maxPorts = getMaxPorts(ns)
  ns.tprint('WARN maxPorts = ' + maxPorts)
  //const targets = flatten(JSON.parse(ns.read(fileName)))
  const targets = flatten(scan(ns, 32))
    .filter(({status}) => status !== 'root' && status <= maxPorts)

  ns.tprint(`INFO targetting ${targets.length} hosts`)
  //ns.tprint(jisn`INFO targetting ${targets}`)

  const availableTools = tools(ns).slice(-maxPorts).concat(ns.nuke)

  const results = await Promise.all(targets.map(async ({ host }) =>
    (await availableTools.reduce(async (results, tool) => (await results).concat(await tool(host)), [])).map(Number)
  ))

  ns.tprint(jisn`INFO done ${results}`)
}

