import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'

import React from 'react'
import ReactDOM from 'react-dom'

import './styles/index.less'

import LCMView from './LCMView'

const MOUNT_NODE = document.getElementById('app') as HTMLElement

ReactDOM.render(<LCMView />, MOUNT_NODE)
