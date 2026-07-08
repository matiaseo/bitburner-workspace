
export const flatten = hosts =>
  hosts?.flatMap(({ connected, ...host }) => [host].concat(flatten(connected))) ?? []

// minDifficulty, moneyMax
export const selectTop = (hosts, count = 10) =>
  hosts.filter(({ status }) => status === 'root')
    //.toSorted((a, b) => b.moneyMax - a.moneyMax || a.minDifficulty - b.minDifficulty)
    .toSorted((a, b) => b.ent - a.ent)
    .slice(0, count)

export const str = data => JSON.stringify(data, null, 2)

const zip = (aa, bb) => aa.flatMap((a, index) => [a, bb[index] ?? ''])

export const jisn = (tt, ...xx) =>
  zip(tt, xx.map(x => typeof x === 'string' ? x : JSON.stringify(x ?? null, null, 2)))
    .filter(Boolean)
    .join('')
