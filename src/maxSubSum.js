export const findMaxSSum = a =>
  a.reduce(([s,m],n) => 
      [Math.max(0,s+n), Math.max(m, s+n)]
    ,[Math.min(0,a[0]),a[0]])[1]

/** @param {NS} ns */
export const main = ns =>
  ns.tprint(ns.args[0] && findMaxSSum(JSON.parse(ns.args[0])))

