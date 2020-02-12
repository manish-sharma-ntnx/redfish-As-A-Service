import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import LogoWrapper from './logo-wrapper'

const NutanixLogoIcon = props => {
  const { color, className, ...rest } = props

  return (
    <LogoWrapper
      className={classnames(className, 'ntnx-logo-icon')}
      viewBox="0 0 22 16"
      {...rest}
    >
      <path
        fill={color}
        d="M4.993 15.902c-.064.06-.148.098-.24.098H.355C.16 16 0 15.832 0 15.625c0-.103.04-.196.104-.264L7.81 8.29c.078-.07.127-.17.127-.286 0-.11-.044-.206-.113-.274L.126.66C.05.59 0 .49 0 .374 0 .168.16 0 .355 0h4.398c.093 0 .177.037.24.1l8.298 7.617c.08.07.127.17.127.283 0 .113-.047.215-.123.283l-8.296 7.62zm11.725-.01l-4.267-3.918c-.073-.07-.122-.17-.122-.287 0-.096.035-.185.092-.25l2.196-2.018c.065-.08.158-.127.262-.127.098 0 .187.042.25.11l6.45 5.92c.085.07.14.177.14.298 0 .208-.16.376-.355.376H16.97c-.097 0-.185-.04-.25-.11zm0-15.785c.064-.066.152-.107.25-.107h4.392c.196 0 .354.168.354.374 0 .122-.054.23-.14.298l-6.448 5.922c-.064.067-.153.11-.25.11-.105 0-.198-.048-.263-.124l-2.197-2.016c-.057-.067-.092-.155-.092-.252 0-.115.05-.217.127-.286l4.27-3.92z"
      />
    </LogoWrapper>
  )
}

NutanixLogoIcon.defaultProps = {
  color: 'inherit'
}

NutanixLogoIcon.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string
}

export default NutanixLogoIcon
