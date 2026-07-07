
export const flatten = hosts =>
  hosts?.flatMap(({ connected, ...host }) => [host].concat(flatten(connected))) ?? []

