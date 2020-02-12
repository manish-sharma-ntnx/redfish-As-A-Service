import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import ChevronUpIcon from '../Icons/ChevronUpIcon'
import ChevronDownIcon from '../Icons/ChevronDownIcon'

import './Sorter.less'

export const SORT_ORDER_CONST = {
  ASCEND: 'ascend',
  DESCEND: 'descend',
  NONE: 'none'
}

export const TYPES_CONST = {
  THREE_STATES: '3states',
  TWO_STATES: '2states',
  FREE_FORM: 'freeform'
}

class Sorter extends React.Component {
  static SORT_ORDER_CONST = SORT_ORDER_CONST

  constructor(props) {
    super(props)
    this.state = {
      sortOrder: this.props.sortOrder
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ sortOrder: nextProps.sortOrder })
  }

  handleOnClick = sortOrder => {
    let newSortOrder = sortOrder
    if (sortOrder === this.state.sortOrder) {
      newSortOrder = SORT_ORDER_CONST.NONE
    }

    this.setSortOrderState(newSortOrder)
  }

  setSortOrderState(newSortOrder) {
    this.setState({ sortOrder: newSortOrder })
    if (typeof this.props.onSortOrderChanged === 'function') {
      this.props.onSortOrderChanged(newSortOrder)
    }
  }

  toggleSortOrder = () => {
    let nextSortOrder

    if (this.props.type === TYPES_CONST.TWO_STATES) {
      switch (this.state.sortOrder) {
        case SORT_ORDER_CONST.ASCEND:
          nextSortOrder = SORT_ORDER_CONST.DESCEND
          break
        case SORT_ORDER_CONST.DESCEND:
        default:
          nextSortOrder = SORT_ORDER_CONST.ASCEND
      }
    } else {
      switch (this.state.sortOrder) {
        case SORT_ORDER_CONST.ASCEND:
          nextSortOrder = SORT_ORDER_CONST.NONE
          break
        case SORT_ORDER_CONST.NONE:
          nextSortOrder = SORT_ORDER_CONST.DESCEND
          break
        case SORT_ORDER_CONST.DESCEND:
        default:
          nextSortOrder = SORT_ORDER_CONST.ASCEND
      }
    }

    this.setSortOrderState(nextSortOrder)
  }

  renderToggleStates(classNames, props) {
    const ascColor =
      this.state.sortOrder === SORT_ORDER_CONST.ASCEND
        ? 'gray-1'
        : 'light-gray-2'
    const descColor =
      this.state.sortOrder === SORT_ORDER_CONST.DESCEND
        ? 'gray-1'
        : 'light-gray-2'

    return (
      <div className={classNames} {...props} onClick={this.toggleSortOrder}>
        <span className="icon-container">
          <ChevronUpIcon color={ascColor} />
        </span>
        <span className="icon-container">
          <ChevronDownIcon color={descColor} />
        </span>
      </div>
    )
  }

  renderFreeForm = (classNames, props) => {
    const ascColor =
      this.state.sortOrder === SORT_ORDER_CONST.ASCEND
        ? 'gray-1'
        : 'light-gray-2'
    const descColor =
      this.state.sortOrder === SORT_ORDER_CONST.DESCEND
        ? 'gray-1'
        : 'light-gray-2'

    return (
      <div className={classNames} {...props}>
        <span
          className="icon-container"
          onClick={() => this.handleOnClick(SORT_ORDER_CONST.ASCEND)}
        >
          <ChevronUpIcon color={ascColor} />
        </span>
        <span
          className="icon-container"
          onClick={() => this.handleOnClick(SORT_ORDER_CONST.DESCEND)}
        >
          <ChevronDownIcon color={descColor} />
        </span>
      </div>
    )
  }

  render() {
    const {
      className,
      sortOrder,
      onSortOrderChanged,
      type,
      ...props
    } = this.props
    const classNames = classnames(
      'ntnx ntnx-sorter',
      `sort-order-${this.state.sortOrder}`,
      className
    )

    switch (type) {
      case TYPES_CONST.TWO_STATES:
      case TYPES_CONST.THREE_STATES:
        return this.renderToggleStates(classNames, props)
      case TYPES_CONST.FREE_FORM:
        return this.renderFreeForm(classNames, props)
      default:
        return this.renderToggleStates(classNames, props)
    }
  }
}

Sorter.defaultProps = {
  sortOrder: 'ascend',
  type: '2states'
}

Sorter.propTypes = {
  /**
   * Customize additional class name.
   */
  className: PropTypes.string,
  /**
   * Control the display of the Sorter format.
   */
  sortOrder: PropTypes.oneOf(['ascend', 'descend', 'none']),
  /**
   * Three style type for toggling the sorter
   * 2states: ascend -> descend, descend -> ascend
   * 3states: ascend -> none -> descend -> back to ascend.
   * freeform: One mush click on the up arrow or down arrow to trigger the
   * ascend and descend respectively.  Clicking on an already ascended or
   * descended arrow will result in setting the sortOrder back to 'none';
   */
  type: PropTypes.oneOf(['2states', '3states', 'freeform']),
  /**
   * Callback when sortOrder is changed.
   * onSortOrderChanged(sortOrder)
   */
  onSortOrderChanged: PropTypes.func
}

export default Sorter
