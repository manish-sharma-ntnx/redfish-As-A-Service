import _isFinite from 'lodash/isFinite'

const NUMERIC_RE = /^[0-9]+$/

/**
 * Checks if the input value is a finite number. This function differs from the
 * lodash utilities _.isNumber and _.isFinite in that it will return true for
 * both string and number values.
 *
 * @param {*} value - Value to check.
 * @returns {boolean} - true if the value is a number
 */
export function isFiniteNumber(value) {
  return NUMERIC_RE.test(value) && _isFinite(parseInt(value, 10))
}
