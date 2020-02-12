import _isNil from 'lodash/isNil'
import _isString from 'lodash/isString'
import _isFunction from 'lodash/isFunction'

export default {
  RULE: {
    CUSTOM: 'custom',
    MAX_LENGTH: 'maxLength',
    MAX_VALUE: 'maxValue',
    MIN_LENGTH: 'minLength',
    MIN_VALUE: 'minValue',
    REGEX: 'regex',
    REQUIRED: 'required',
    TYPE: 'type'
  },

  TYPE: {
    ALPHA_NUMERIC: 'alphaNumeric',
    EMAIL: 'email',
    FLOAT: 'float',
    INTEGER: 'integer',
    IP_ADDRESS: 'ipAdress',
    NUMBER: 'number',
    URL: 'url'
  },

  /**
   * Run validation rule
   * @param {string} value - Value to run validation against
   * @param {string} rule - Validation rule
   * @param {*} args - Arguments for validation rule
   * @returns {boolean} - Whether or not value passes validation
   */
  validate(value, rule, args, row) {
    let isValid = true
    if (_isString(value)) {
      value = value.trim()
    } else if (!_isNil(value)) {
      if (value.toString) {
        value = value.toString()
      }
    }

    switch (rule) {
      case this.RULE.CUSTOM:
        if (_isFunction(args)) {
          isValid = args(row, value)
        }
        break
      case this.RULE.MAX_LENGTH:
        isValid = this.maxLength(value, args)
        break
      case this.RULE.MAX_VALUE:
        isValid = this.maxValue(value, args)
        break
      case this.RULE.MIN_LENGTH:
        isValid = this.minLength(value, args)
        break
      case this.RULE.MIN_VALUE:
        isValid = this.minValue(value, args)
        break
      case this.RULE.REGEX:
        isValid = this.regexTest(value, args)
        break
      case this.RULE.REQUIRED:
        isValid = this.isRequired(value)
        break
      case this.RULE.TYPE:
        isValid = this.isType(value, args)
        break
      default:
        break
    }
    return isValid
  },

  /**
   * Check if value is empty or not
   * @param {string} value - Value to check for
   * @returns {boolean} - Whether or not value is empty or not
   */
  isRequired(value) {
    return Boolean(value)
  },

  /**
   * Check if value is a specific type
   * @param {string} value - Value to check for
   * @param {string} type - Type to check for
   * @returns {boolean} - Whether or not value is a specific type
   */
  isType(value, type) {
    let isValid = true
    // If null or undefined, just return false
    if (_isNil(value)) {
      return false
    }
    switch (type) {
      case this.TYPE.ALPHA_NUMERIC:
        isValid = this.isAlphaNumeric(value)
        break
      case this.TYPE.EMAIL:
        isValid = this.isEmail(value)
        break
      case this.TYPE.FLOAT:
        isValid = this.isFloat(value)
        break
      case this.TYPE.INTEGER:
        isValid = this.isInteger(value)
        break
      case this.TYPE.IP_ADDRESS:
        isValid = this.isIpAddress(value)
        break
      case this.TYPE.NUMBER:
        isValid = this.isNumber(value)
        break
      case this.TYPE.URL:
        isValid = this.isUrl(value)
        break
      default:
        break
    }
    return isValid
  },

  /**
   * Check if value is alpha numeric
   * @param {string} value - Value to check for
   * @returns {boolean} - Whether or not value is alpha numeric
   */
  isAlphaNumeric(value) {
    const regex = /^[a-zA-Z0-9]*$/
    return regex.test(value)
  },

  /**
   * Check if value is a valid email
   * @param {string} value - Value to check for
   * @returns {boolean} - Whether or not value is a valid email
   */
  isEmail(value) {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return regex.test(value)
  },

  /**
   * Check if value is a float
   * @param {string} value - Value to check for
   * @returns {boolean} - Whether or not value is a float
   */
  isFloat(value) {
    const testValue = parseFloat(value)
    return testValue.toString() === value
  },

  /**
   * Check if value is an integer
   * @param {string} value - Value to check for
   * @returns {boolean} - Whether or not value is an integer
   */
  isInteger(value) {
    const testValue = parseInt(value, 10)
    return testValue.toString() === value
  },

  /**
   * Check if value length is less than specified value
   * @param {string} value - Value to check for
   * @returns {boolean} - Whether or not value is a valid IP address
   */
  isIpAddress(value) {
    const regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
    return regex.test(value)
  },

  /**
   * Check if value is a number
   * @param {string} value - Value to check for
   * @returns {boolean} - Whether or not value is a number
   */
  isNumber(value) {
    return !isNaN(value)
  },

  /**
   * Check if value is a valid url
   * @param {string} value - Value to check for
   * @returns {boolean} - Whether or not value is a valid url
   */
  isUrl(value) {
    const regex = /^([a-z][a-z0-9*\-.]*):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/
    return regex.test(value)
  },

  /**
   * Check if value length is less than or equal to max
   * @param {string} value - Value to check for
   * @param {number} maxLength - Maximum length
   * @returns {boolean} - Whether or not value length is less than or equal to max
   */
  maxLength(value, maxLength) {
    // null or undefined doesn't have any length so it technically passes validation
    if (_isNil(value)) {
      return true
    }
    maxLength = parseInt(maxLength, 10)
    return value.length <= maxLength
  },

  /**
   * Check if value is less than or equal to max
   * @param {string} value - Value to check for
   * @param {number} max - Maximum length
   * @returns {boolean} - Whether or not value is less than or equal to max
   */
  maxValue(value, max) {
    if (!this.isNumber(value)) {
      return false
    }
    max = parseFloat(max, 10)
    return parseFloat(value, 10) <= max
  },

  /**
   * Check if value length is greater than or equal to min
   * @param {string} value - Value to check for
   * @param {number} minLength - Minimum length
   * @returns {boolean} - Whether or not value length is greater than or equal to min
   */
  minLength(value, minLength) {
    if (_isNil(value)) {
      return false
    }
    minLength = parseInt(minLength, 10)
    return value.length >= minLength
  },

  /**
   * Check if value is greater than or equal to min
   * @param {string} value - Value to check for
   * @param {number} min - Minimum length
   * @returns {boolean} - Whether or not value is greater than or equal to min
   */
  minValue(value, min) {
    if (!this.isNumber(value)) {
      return false
    }
    min = parseFloat(min, 10)
    return parseFloat(value, 10) >= min
  },

  /**
   * Check if value matches the specified regex
   * @param {string} value - Value to check for
   * @param {RegExp} regex - Regex to test against
   * @returns {boolean} - Whether or not value is a valid IP address
   */
  regexTest(value, regex) {
    return regex.test(value)
  }
}
