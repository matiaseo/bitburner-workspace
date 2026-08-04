import { caesar } from "./caesar.js";
import { totalWaysToSum } from "./eulerpentagon.js";
import { flatten, jisn, jssn } from './helpers.js'
import { findMaxSSum } from "./maxSubSum.js";
//import { scan } from "./scanner.js"

const getTool = type => ({
  "Subarray with Maximum Sum": findMaxSSum,
  "Total Ways to Sum": totalWaysToSum,
  "Encryption I: Caesar Cipher": caesar
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
          result,
          solve: result !== 'no tool' &&
            (() => ns.codingcontract.attempt(result, c, host))
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
    ).filter(({contracts}={})=>contracts?.length)

/** @param {NS} ns */
export function main(ns) {
  const hosts = flatten(scan(ns, 32))
  const contracts = hosts.flatMap(({contracts})=>contracts)
  const results = (ns.args[0] === 'solve') ?
    contracts.filter(({result})=>result!=='no tool')
      .map(({solve})=> solve()) : 'no solving'
  ns.tprint(jssn`WARN ${hosts} [${hosts.length}]`)
  ns.tprint(jssn`WARN ${contracts} [${contracts.length}]`)
  ns.tprint(jisn`ERROR solved: ${results}`)
}
