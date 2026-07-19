
export const flatten = hosts =>
  hosts?.flatMap(({ connected, ...host }) => [host].concat(flatten(connected))) ?? []

// minDifficulty, moneyMax
export const selectTop = (hosts, count = 10) =>
//  hosts.filter(({ status }) => status === 'root')
    //.toSorted((a, b) => b.moneyMax - a.moneyMax || a.minDifficulty - b.minDifficulty)
  hosts
    .toSorted((a, b) => b.potential - a.potential)
    .slice(0, count)

export const str = data => JSON.stringify(data, null, 2)

const zip = (aa, bb) => aa.flatMap((a, index) => [a, bb[index] ?? ''])

export const jisn = (tt, ...xx) =>
  zip(tt, xx.map(x => typeof x === 'string' ? x : JSON.stringify(x ?? null, null, 2)))
    .filter(Boolean)
    .join('')

export const toColumns = (list, whitespace = 20) => {
  const colWidth = (list.reduce((maxLength, text) => Math.max(maxLength, text.length), 0) + whitespace) & 0xfff
  return list.map(text => text.padEnd(colWidth, ' ')).join('')
}

const isCompactible = list => list.every(value => typeof value !== 'object')

export const compactArrays = obj =>
  typeof obj !== 'object' ? obj :
  Array.isArray(obj) ?
    isCompactible(obj) ? `[ ${obj.join(', ')} ]` : obj.map(compactArrays)
  : Object.fromEntries(Object.entries(obj)
      .map(([key, value]) => [key, compactArrays(value)])
    )

export const jssn = (tt, ...xx) =>
  zip(tt, xx.map(x =>
    typeof x !== 'object' ? x
      : JSON.stringify(compactArrays(x) ?? null, null, 2)
    )
  )
    .filter(Boolean)
    .join('')

const scaleSuffixes = ' k m b t Qd Qn Sx Sp O'.split(' ')
const getSuffix = scale => scaleSuffixes[scale] ?? 'cl'

export const formatNumber = (n, scale=0) =>
  n < 1000 ? n.toFixed(2) + getSuffix(scale)
    : formatNumber(n/1000, scale + 1)

export const deformat = text =>
  text.match(/^([0-9.]+)(\w{0,2})$/)
    ?.slice(1,3)
    .reduce((n, scale) =>
      +n * Math.pow(10, 3 * scaleSuffixes.indexOf(scale))
    )

export const multiSort = filters =>
  (a,b) => filters.reduce((output, [k,s=1]) => output || s*(a[k]-b[k]), 0)




