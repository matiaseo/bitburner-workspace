import { caesar } from "./caesar.js";
import { totalWaysToSum } from "./eulerpentagon.js";
import { flatten, jisn, jssn } from './helpers.js'
import { findMaxSSum } from "./maxSubSum.js";
//import { scan } from "./scanner.js"

const getTool = type => ({
  "Subarray with Maximum Sum": findMaxSSum,
  "Total Ways to Sum": totalWaysToSum,
  "Encryption I: Caesar Cipher": caesar,
  "Algorithmic Stock Trader I": a => Math.max(0,...a.map((p,d)=>Math.max(...a.slice(d))-p)),
  "Find Largest Prime Factor": n => {
    for(let d=2,c=n;d<n;) {
      if(!(c%d)) c/=d
      else d++
      if(d*d>c)
        return c
    }
  },

}[type])

/** @param {NS} ns */
const getInfo = (ns, path) => host => {
  const connects = path.concat(host).map(h=>'connect '+h)
  return {
    host, path: ''+path, connects: connects.join(';'),
    contracts: ns.ls(host).filter(x=>!x.startsWith('scripts/'))
      .filter(f=>/\.cct$/.test(f))
      .map(c => {
        const type = ns.codingcontract.getContractType(c,host)
        const input = ns.codingcontract.getData(c,host)
        const result = getTool(type)?.(input)??'no tool'
        return {
          contract: c,
          type,
          input,
          text: ns.codingcontract.getDescription(c,host),
          attempts: ns.codingcontract.getNumTriesRemaining(c,host),
          result,
          solve: result !== 'no tool' && (
            () => ns.codingcontract.attempt(result, c, host)
              || `FAILED ${type} ${input} -> ${result} ; tries=${
                ns.codingcontract.getNumTriesRemaining(c,host)}`
          )
        }
      })
  }
}

const scan = (ns, depth, base, path=['home']) =>
  !depth ? [getInfo(ns, path)(base)] :
    [base].concat(
      ns.scan(base)
        .slice(+!!base)
        .map(getInfo(ns, path))
        .map(target => {
          const connected = scan(ns, depth-1, target.host, path.concat(target.host)).slice(1)
          return Object.assign({}, target, !!connected.length && { connected })
        })
    ).filter(Boolean)

/** @param {NS} ns */
export function main(ns) {
  const hosts = flatten(scan(ns, 32)).filter(({contracts:{length}})=>length)

  const contracts = hosts.flatMap(({contracts})=>contracts)
  console.debug(contracts, hosts)
  const results = (ns.args[0] === 'solve') ?
    contracts.filter(({result})=>result!=='no tool')
      .map(({solve})=> solve()) : 'no solving'
  ns.tprint(jssn`WARN ${hosts} [${hosts.length}]`)
  ns.tprint(jssn`WARN ${contracts} [${contracts.length}]`)
  ns.tprint(jisn`ERROR solved: ${results} [${
    typeof results=='string' ? 0 : results.length}]`)
  if(ns.args[0] === 'getNext')
    ns.codingcontract.createDummyContract(ns.codingcontract.getContractTypes().find(t=>!getTool(t)))
}
