
/** @param {NS} ns */
export const async function main(ns) {
  const targets = await ns.scan('home')
  ns.tprint('INFO' + JSON.stringify(targets))
}
