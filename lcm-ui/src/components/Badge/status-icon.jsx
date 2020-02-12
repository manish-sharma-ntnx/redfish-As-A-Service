import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import ExclamationIcon from '../Icons/AlertIcon'
import QuestionIcon from '../Icons/AlertIcon'
import CheckMarkIcon from '../Icons/CheckMarkIcon'
import FlexLayout from '../Layouts/FlexLayout'
import Tooltip from '../Tooltip/Tooltip'

import './status-icon.less'

const StatusIcon = props => {
  const { className, type, tooltipProps } = props

  const iconColor = 'white'
  const iconSize = 'small'

  const typeSelected = {
    alert: {
      icon: <ExclamationIcon color={iconColor} size={iconSize} />,
      color: 'red'
    },
    warning: {
      icon: <ExclamationIcon color={iconColor} size={iconSize} />,
      color: 'yellow'
    },
    question: {
      icon: <QuestionIcon color={iconColor} size={iconSize} />,
      color: 'gray'
    },
    valid: {
      icon: <CheckMarkIcon color={iconColor} size={iconSize} />,
      color: 'green'
    }
  }[type]

  const mergedClassName = classnames(
    className,
    'ntnx-status-icon',
    typeSelected.color
  )

  return (
    <Tooltip {...tooltipProps}>
      <FlexLayout
        className={mergedClassName}
        display="inline-flex"
        alignItems="center"
      >
        {typeSelected.icon}
      </FlexLayout>
    </Tooltip>
  )
}

StatusIcon.STATUS_ICON_TYPES = {
  ALERT: 'alert',
  WARNING: 'warning',
  QUESTION: 'question',
  VALID: 'valid'
}

StatusIcon.defaultProps = {
  type: StatusIcon.STATUS_ICON_TYPES.ALERT
}

StatusIcon.propTypes = {
  /**
   * Optional custom class name.
   */
  className: PropTypes.string,
  /**
   * Type (Use StatusIcon.STATUS\_ICON\_TYPES constants)
   */
  type: PropTypes.oneOf([
    StatusIcon.STATUS_ICON_TYPES.ALERT,
    StatusIcon.STATUS_ICON_TYPES.WARNING,
    StatusIcon.STATUS_ICON_TYPES.QUESTION,
    StatusIcon.STATUS_ICON_TYPES.VALID
  ]),
  /**
   * See Tooltip component for proper usage
   */
  tooltipProps: PropTypes.object.isRequired
}

export default StatusIcon
