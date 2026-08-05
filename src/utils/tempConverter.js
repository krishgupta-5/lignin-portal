/**
 * Temperature Unit Conversion and Formatting Utilities
 * Supports Celsius (°C), Kelvin (K), and Fahrenheit (°F) across all UI views, charts, and exports.
 */

export function getUserTempUnit() {
  try {
    const prefs = JSON.parse(localStorage.getItem('user_research_prefs') || '{}');
    return prefs.tempUnit || 'celsius';
  } catch {
    return 'celsius';
  }
}

export function getTempSymbol(unit) {
  const u = (unit || getUserTempUnit()).toLowerCase();
  if (u === 'kelvin' || u === 'k') return 'K';
  if (u === 'fahrenheit' || u === 'f') return '°F';
  return '°C';
}

export function getTempUnitLabel(unit) {
  const u = (unit || getUserTempUnit()).toLowerCase();
  if (u === 'kelvin' || u === 'k') return 'Kelvin (K)';
  if (u === 'fahrenheit' || u === 'f') return 'Fahrenheit (°F)';
  return 'Celsius (°C)';
}

/**
 * Convert a temperature value in Celsius (°C) to the specified or active user unit.
 */
export function convertTempFromCelsius(celsiusVal, targetUnit) {
  if (celsiusVal == null || isNaN(Number(celsiusVal))) return '';
  const c = Number(celsiusVal);
  const u = (targetUnit || getUserTempUnit()).toLowerCase();
  if (u === 'kelvin' || u === 'k') {
    return Number((c + 273.15).toFixed(1));
  }
  if (u === 'fahrenheit' || u === 'f') {
    return Number((c * 1.8 + 32).toFixed(1));
  }
  return Number(c.toFixed(1));
}

/**
 * Convert a temperature value from the specified or active unit back to Celsius (°C) for backend ML models.
 */
export function convertTempToCelsius(val, fromUnit) {
  if (val == null || isNaN(Number(val))) return 100;
  const v = Number(val);
  const u = (fromUnit || getUserTempUnit()).toLowerCase();
  if (u === 'kelvin' || u === 'k') {
    return Number((v - 273.15).toFixed(2));
  }
  if (u === 'fahrenheit' || u === 'f') {
    return Number(((v - 32) / 1.8).toFixed(2));
  }
  return Number(v.toFixed(2));
}

/**
 * Format a Celsius temperature value as a clean localized string with active unit symbol.
 * Example: 100°C -> "100 °C" or "373.2 K"
 */
export function formatTemperature(celsiusVal, unit, showUnit = true) {
  if (celsiusVal == null || isNaN(Number(celsiusVal))) return '—';
  const u = (unit || getUserTempUnit()).toLowerCase();
  const converted = convertTempFromCelsius(celsiusVal, u);
  const symbol = getTempSymbol(u);
  return showUnit ? `${converted} ${symbol}` : `${converted}`;
}

/**
 * Return converted min and max range with symbol for form validation and hints.
 * Base 60 – 200 °C -> Kelvin 333.2 – 473.2 K
 */
export function getTempRange(minC = 60, maxC = 200, unit) {
  const u = (unit || getUserTempUnit()).toLowerCase();
  const minConverted = convertTempFromCelsius(minC, u);
  const maxConverted = convertTempFromCelsius(maxC, u);
  const symbol = getTempSymbol(u);
  return {
    min: minConverted,
    max: maxConverted,
    symbol,
    label: `${minConverted} – ${maxConverted} ${symbol}`,
  };
}
