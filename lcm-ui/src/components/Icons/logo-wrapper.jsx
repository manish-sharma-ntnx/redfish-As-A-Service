import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

const LogoWrapper = props => {
  const { className, viewBox, ...rest } = props

  const styleClasses = classnames(
    className,
    'rtc rtc-icon ntnx-logo',
    'size-medium'
  )

  return (
    <svg
      className={styleClasses}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '22px', height: '16px' }}
      {...rest}
    />
  )
}

LogoWrapper.defaultProps = {
  color: 'inherit'
}

LogoWrapper.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  viewBox: PropTypes.string
}

export default LogoWrapper
