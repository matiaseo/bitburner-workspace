import { caesar } from "./caesar.js";
import { totalWaysToSum } from "./eulerpentagon.js";
import { flatten, jssn } from './helpers.js'
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
        console.debug(input)
        return {
          type,
          input,
          text: ns.codingcontract.getDescription(c,host),
          result: getTool(type)?.(input)??'no tool'
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
  ns.tprint(jssn`WARN ${hosts}`)
}
