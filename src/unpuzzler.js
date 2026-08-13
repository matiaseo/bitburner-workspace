import { caesar } from "./caesar.js";
import { totalWaysToSum } from "./eulerpentagon.js";
import { flatten, jisn, jssn } from './helpers.js'
import { findMaxSSum } from "./maxSubSum.js";
//import { scan } from "./scanner.js"

const getTool = type => ({
  "Subarray with Maximum Sum": findMaxSSum,
  "Total Ways to Sum": totalWaysToSum,
  "Total Ways to Sum II": ([n, a]) => {
    const m = new Array(n+1)
    const coins = a.toSorted()
    for(let i=0; i < n+1; i+=coins[0]) m[i]=1
    for(let j=0, coin; coin=coins[++j];)
      for(let target=1; target < n+1; target++)
        m[target] = (m[target]??0) + (m[target-coin]??0)
    return m[n]
  },
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
  "Spiralize Matrix": m => {
    let x1=0,y1=0,x2=m[0].length,y2=m.length
    const output = new Array(x2*y2)
    for(let i=0,d=0; i < output.length; d = (d+1)%4)
      switch(d) {
        case 0: output.splice(i, x2-x1, ...m[y1++].slice(x1,x2))
          i += x2-x1
        break;case 1: --x2
          for(let y=y1; y<y2;) output[i++] = m[y++][x2]
        break;case 2: --y2
          for(let x=x2; x>x1;) output[i++] = m[y2][--x]
        break;case 3:
          for(let y=y2; y>y1;) output[i++] = m[--y][x1]
          x1++
      }
    return output
  },
  "Compression I: RLE Compression": input =>
    input.split('').reduce(([out, count, char], c) => {
      if(char === c) {
        const nextCount = (count+1)%10
        return [!nextCount ? out+count+char : out, nextCount||1, char]
      } else return [count ? out+count+char : out, 1, c]
    }, ['', 0, '']).join(''),
}[type])

const trying = func => {
  try{ return func() } catch(e) {}
}

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
        const result = trying(()=>getTool(type)?.(input))??'no tool'
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
  const hosts = flatten(scan(ns, 32))
    .concat(ns.args[1] === 'home' ? getInfo(ns, [])('home') : [])
    .filter(({contracts:{length}})=>length)
  const contracts = hosts.flatMap(({contracts})=>contracts)
  console.debug(contracts, hosts)
  const results = (ns.args[0] === 'solve') ?
    contracts.filter(({result})=>result!=='no tool')
      .map(({solve})=> solve()) : 'no solving'
  ns.tprint(jssn`WARN ${hosts} [${hosts.length}]`)
  //ns.tprint(jssn`WARN ${contracts} [${contracts.length}]`)
  ns.tprint(jisn`ERROR solved: ${results} [${
    typeof results=='string' ? 0 : results.length}/${contracts.length}]`)
  if(ns.args[0] === 'getNext')
    ns.codingcontract.getContractTypes().filter(t=>!getTool(t)).forEach(t=>ns.codingcontract.createDummyContract(t))
}
