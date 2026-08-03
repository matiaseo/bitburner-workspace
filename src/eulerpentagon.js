let p=[1,1,2,3,5,7,11]
const cacheP = n => (p[n] = totalWaysToSum(n,0))
const ep = (n, k) =>
  [n-(k*(3*k-1)>>1), n-(k*(3*k+1)>>1)]
    .map(n=> n<0 ? 0 : p[n]??cacheP(n))
function totalWaysToSum(n,single=true) {
  let t=-single, ep1=1, ep2=1
  for(let k=1;ep1&&ep2;k++) {
    ;[ep1,ep2] = ep(n,k)
    t += ep1 + ep2
    ;[ep1,ep2] = ep(n,++k)
    t -= ep1 + ep2
  }
  return t
}

/** @param {NS} ns */
export const main = ns =>
  ns.tprint(ns.args[0] && totalWaysToSum(ns.args[0]))

