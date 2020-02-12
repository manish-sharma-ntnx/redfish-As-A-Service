import React from 'react'
import PropTypes from 'prop-types'

import Checkbox from '../Checkbox/Checkbox'
import { Radio } from 'antd'

export const ROW_SELECTION_TYPES = {
  CHECKBOX: 'checkbox',
  RADIO: 'radio'
}

class TableRowSelection extends React.Component {
  render() {
    const { type } = this.props

    if (type === ROW_SELECTION_TYPES.RADIO) {
      return this.renderRadio()
    }

    return this.renderCheckBox()
  }

  renderCheckBox() {
    const { isSelected, rowIndex, rowKeyVal } = this.props

    return (
      <Checkbox
        id={rowKeyVal}
        checked={isSelected}
        onChange={e => {
          return this.handleCheckboxChange(e, rowKeyVal, !isSelected, rowIndex)
        }}
      />
    )
  }

  renderRadio() {
    const { isSelected, rowKeyVal } = this.props
    return (
      <Radio
        checked={isSelected}
        onChange={() => {
          if (!isSelected) {
            return this.handleRadioChange(rowKeyVal)
          }
        }}
      />
    )
  }

  /**
   * Checkbox change event handler
   * @param {object} e - SyntheticEvent
   * @param {string} rowKeyVal - Unique key to identify row
   * @param {boolean} isSelected - Should checkbox be selected
   * @param {number} rowIndex - Index of row to be rendered
   */
  handleCheckboxChange = (e, rowKeyVal, isSelected, rowIndex) => {
    const eventHandlers = this.props.eventHandlers
    if (isSelected) {
      eventHandlers.handleRowSelect(e, rowKeyVal, rowIndex)
    } else {
      eventHandlers.handleRowUnselect(e, rowKeyVal, rowIndex)
    }
  }

  /**
   * Radio change event handler
   * @param {string} rowKeyVal - Unique key to identify row
   */
  handleRadioChange = rowKeyVal => {
    const eventHandlers = this.props.eventHandlers
    eventHandlers.handleRowSelectOne(rowKeyVal)
  }
}

TableRowSelection.propTypes = {
  /**
   * Table event handlers
   */
  eventHandlers: PropTypes.object,
  /**
   * Whether or not row is selected
   */
  isSelected: PropTypes.bool,
  /**
   * Index of row from data source
   */
  rowIndex: PropTypes.number,
  /**
   * Row key value to identify row
   */
  rowKeyVal: PropTypes.string,
  /**
   * Type of selection
   */
  type: PropTypes.string
}

export default TableRowSelection
