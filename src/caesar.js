const A = 'A'.charCodeAt(0)
const a = Array(26).fill(0).map((_,i)=>String.fromCharCode(A+i))
const sl = s => t =>
  /[A-Z]/.test(t) ? a[((t.charCodeAt(0)-A)+a.length-s)%a.length]
  : t
const c = (t, ls) => t.split('').map(sl(ls)).join('')

/** @param {NS} ns */
export const main = ns =>
  ns.tprint(ns.args[0] && c(...ns.args))

