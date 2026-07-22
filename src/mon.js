import { killPrevious } from './utils.js'

/** @param {NS} ns */
export const main = async ns => {
  ns.ramOverride(3)
  killPrevious(ns)
  const pollPeriod = 1000
  const port = 1
  const rs = new Set()
  while(1) {
    await ns.asleep(pollPeriod)
    for(let portMessage; portMessage=ns.readPort(port), !portMessage.startsWith('N');) {
      const isEnd = portMessage.includes('end')
      const index = [4,13,10,3][+portMessage.charAt(0)]
      const draw = [' \\ ','  |',' / ','|  '][isEnd ? index&3 : index>>2].repeat(2)
      ;(!isEnd ? console.debug : ns.tprint)(portMessage.slice(1)+'\t'+draw)
    }
    const recent = ns.getRecentScripts()
      .filter(({ pid, filename }) =>
        !rs.has(pid) && filename !== ns.getScriptName())
    recent.forEach(({pid}) => rs.add(pid))
    recent.forEach(({logs, pid}) => console.log(`${pid}\n${logs.join('\n')}`))
  }
}
