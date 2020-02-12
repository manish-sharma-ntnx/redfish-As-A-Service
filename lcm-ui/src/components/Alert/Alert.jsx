import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { Alert as AntAlert } from 'antd'

import CloseIcon from '../Icons/CloseIcon.tsx'

import 'antd/lib/alert/style/index.less'
import './Alert.less'

const TYPE = {
  INFO: 'info',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  SUPPLEMENTARY: 'supplementary'
}

class Alert extends React.PureComponent {
  static TYPE = TYPE

  renderCloseButton(closable) {
    if (closable) {
      return <CloseIcon />
    }
  }

  render() {
    const { className, closable, inline, ...props } = this.props

    const inlineClass = inline ? 'ntnx-alert-inline' : ''

    return (
      <AntAlert
        className={classnames('ntnx ntnx-alert', inlineClass, className)}
        closeText={this.renderCloseButton(closable)}
        {...props}
      />
    )
  }
}

Alert.defaultProps = {
  closable: true,
  inline: false,
  type: 'info'
}

// TODO: Need handler for afterClosed.
// TODO: Alert close animation jumpy.
Alert.propTypes = {
  /**
   * className is used to add extra class for adding new style to override
   * default
   */
  className: PropTypes.string,
  /**
   * This is the message to display.  Can be a string or any render-able node.
   */
  message: PropTypes.node.isRequired,
  /**
   * Message type string.  default is info
   */
  type: PropTypes.oneOf([
    TYPE.INFO,
    TYPE.SUCCESS,
    TYPE.WARNING,
    TYPE.ERROR,
    TYPE.SUPPLEMENTARY
  ]),
  /**
   * Whether Alert can be closed manually with close icon.
   */
  closable: PropTypes.bool,
  /**
   * Callback when Alert close action is triggered.
   */
  onClose: PropTypes.func,
  /**
   * Whether Alert should be displayed as inline variation.
   */
  inline: PropTypes.bool
}

export default Alert
