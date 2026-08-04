export const findMaxSSum = a =>
  (a.every(n=>n<0)) ? Math.max(...a)
    : a.reduce((ac,n) => {
      const sum = Math.max(0, ac[0]+n)
      return [sum, Math.max(ac[1], sum)]
    },[0,0])[1]

/** @param {NS} ns */
export const main = ns =>
  ns.tprint(ns.args[0] && findMaxSSum(JSON.parse(ns.args[0])))

