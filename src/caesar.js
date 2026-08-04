const A = 'A'.charCodeAt(0)
const a = Array(36).fill(0).map((_,i)=>i.toString(36).toUpperCase()).slice(10)

const sr = s => t =>
  /[A-Z]/.test(t) ? a[((t.charCodeAt(0)-A)+s)%a.length]
  : t
const sl = s => t =>
  /[A-Z]/.test(t) ? a[((t.charCodeAt(0)-A)+a.length-s)%a.length]
  : t
export const caesar = ([t, ls], left=true) => t.split('').map((left?sl:sr)(ls)).join('')

/** @param {NS} ns */
export const main = ns =>
  ns.tprint(ns.args[0] && caesar(ns.args))

