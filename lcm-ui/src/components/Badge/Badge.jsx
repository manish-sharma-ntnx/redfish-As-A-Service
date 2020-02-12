import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import _isNumber from 'lodash/isNumber'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'

import './Badge.less'
import FlexLayout from '../Layouts/FlexLayout'

import { isFiniteNumber } from '../../utils/number-utils'

const Badge = props => {
  const {
    className,
    count,
    color,
    text,
    type,
    textType,
    overflowCount,
    ...rest
  } = props

  const renderBadgeText = (text, textType) => {
    // Define text style for dot form badge
    let textStyle
    if (textType) {
      textStyle = `text-${textType}`
      // Render text style as secondary if text is a number
    } else if (isFiniteNumber(text)) {
      textStyle = 'text-secondary'
    } else {
      textStyle = 'text-primary'
    }

    const badgeTextNode = !_isUndefined(text) ? (
      <div className={classnames('badge-text', textStyle)}>{text}</div>
    ) : null

    return badgeTextNode
  }

  let countOverflow
  if (_isNumber(count) && count > overflowCount) {
    countOverflow = `${Number.parseInt(overflowCount, 10)}+`
  }

  let badgeStyle
  // Display as tag style if set
  // TODO: In 2.0 User will need to explicitly call which style the want.
  if (type === 'tag') {
    badgeStyle = 'tag-style'
    // Use badge style if count is a number
  } else if (isFiniteNumber(count)) {
    badgeStyle = 'badge-style'
    // Use text tag style if count is not a number
  } else if (
    !_isUndefined(count) &&
    !_isEmpty(count) &&
    !isFiniteNumber(count)
  ) {
    badgeStyle = 'tag-style'
    // Use dot style if 'count' prop is not used (default)
  } else {
    badgeStyle = 'dot-style'
  }

  const badgeClassNames = classnames(
    className,
    'ntnx ntnx-badge item-align-self-center',
    color
  )

  return (
    <FlexLayout
      className={badgeClassNames}
      display="inline-flex"
      itemSpacing="10px"
      alignItems="center"
      {...rest}
    >
      <div
        className={classnames('badge-count', badgeStyle, {
          opaque: count === 0
        })}
      >
        {countOverflow || count}
      </div>
      {renderBadgeText(text, textType)}
    </FlexLayout>
  )
}

Badge.COLOR_TYPES = {
  RED: 'red',
  GREEN: 'green',
  YELLOW: 'yellow',
  BLUE: 'blue',
  GRAY: 'gray',
  DIAGRAM_PURPLE: 'diagram-purple',
  DIAGRAM_AQUA: 'diagram-aqua',
  DIAGRAM_ORANGE: 'diagram-orange',
  DIAGRAM_YELLOW: 'diagram-yellow'
}

Badge.defaultProps = {
  color: Badge.COLOR_TYPES.GRAY,
  overflowCount: 99,
  type: 'badge'
}

Badge.propTypes = {
  /** */
  className: PropTypes.string,
  /** */
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * Change display to badge or tag style.
   */
  type: PropTypes.oneOf(['badge', 'tag']),
  /** */
  color: PropTypes.oneOf([
    Badge.COLOR_TYPES.RED,
    Badge.COLOR_TYPES.GREEN,
    Badge.COLOR_TYPES.BLUE,
    Badge.COLOR_TYPES.YELLOW,
    Badge.COLOR_TYPES.GRAY,
    Badge.COLOR_TYPES.DIAGRAM_PURPLE,
    Badge.COLOR_TYPES.DIAGRAM_AQUA,
    Badge.COLOR_TYPES.DIAGRAM_ORANGE,
    Badge.COLOR_TYPES.DIAGRAM_YELLOW
  ]),
  /**
   * This is the text label formated on the right of the badge.
   */
  text: PropTypes.node,
  /**
   * Text type for dot style badge. Text type can be one of the following:
   *
   * 'primary' - Use for everything except numbers.
   * 'secondary' - Use for displaying numbers only when in dot form
   *   (Except when used in tables).
   */
  textType: PropTypes.string,
  /**
   * If count is larger then this value will be displayed with '+' appended
   * to the end.
   */
  overflowCount: PropTypes.number
}

export default Badge
