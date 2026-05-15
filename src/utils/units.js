export const UNITS = {
  metric:   { label: 'cm', short: 'cm', factor: 1,        inFactor: 1,       decimals: 0, step: 1 },
  imperial: { label: 'in', short: '"',  factor: 0.393701, inFactor: 2.54001, decimals: 1, step: 0.5 },
}

export function toCm(value, units) {
  return units === 'imperial' ? value * UNITS.imperial.inFactor : value
}

export function fromCm(valueCm, units) {
  const cfg = UNITS[units] ?? UNITS.metric
  return valueCm * cfg.factor
}

export function fmt(valueCm, units = 'metric', includeUnit = true) {
  const cfg = UNITS[units] ?? UNITS.metric
  const v = (valueCm * cfg.factor).toFixed(cfg.decimals)
  return includeUnit ? `${v} ${cfg.short}` : v
}

export function fmtRange(minCm, maxCm, units = 'metric') {
  return `${fmt(minCm, units)} – ${fmt(maxCm, units)}`
}
