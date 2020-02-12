import React from 'react'
import MainPageLayout from './components/Layouts/MainPageLayout'
import Link from './components/Link/Link'
import Navbar from './components/Navigation/Navbar'
import NutanixLogoIcon from './components/Icons/nutanix-logo-icon'
import Nodes from './Nodes'

const Navigation = () => {
  const accountDetail = <Link type="secondary">manish.sharma@nutanix.com</Link>

  const navItems = [
    {
      key: 'home',
      label: <a href="#">Home</a>
    }
  ]

  return (
    <Navbar
      logoIcon={<NutanixLogoIcon />}
      accountDetail={accountDetail}
      navigationItems={navItems}
      title="LCM"
    />
  )
}

const LCMView: React.FC = props => {
  return <MainPageLayout header={<Navigation />} body={<Nodes />} />
}

export default LCMView
