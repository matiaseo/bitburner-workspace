import { killPrevious } from './utils.js'
const ts = ()=>new Date().toISOString().slice(11,19)+'] '

/** @param {NS} ns */
export const main = async ns => {
  ns.ramOverride(3)
  killPrevious(ns)
  const pollPeriod = 1000
  const port = 1
  const rs = new Set()
  while(1) {
    await ns.asleep(pollPeriod)
    for(let message; message=ns.readPort(port), !message.startsWith('N');) {
      const isEnd = message.includes('end')
      const index = [4,13,10,3][+message.charAt(0)]
      const draw = [' \\ ','  |',' / ','|  '][isEnd ? index&3 : index>>2].repeat(2)
      ;(!isEnd ? console.debug : ns.tprint)(ts()+message.slice(1)+'\t'+draw)
    }
    const recent = ns.getRecentScripts()
      .filter(({ pid, filename }) =>
        !rs.has(pid) && filename !== ns.getScriptName())
    recent.forEach(({pid}) => rs.add(pid))
    recent.forEach(({logs, pid}) => console.log(ts()+`${pid}\n${logs.join('\n')}`))
  }
}
