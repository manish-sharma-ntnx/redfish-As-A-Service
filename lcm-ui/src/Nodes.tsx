import React, { useState } from 'react'
import useAxios from 'axios-hooks'
import _castArray from 'lodash/castArray'
import _get from 'lodash/get'

import Table from './components/Table/Table'
import Link from './components/Link/Link'
import Modal from './components/Modal/Modal'
import NodeDetail from './NodeDetail'

const Nodes: React.FC = props => {
  const [selectedHost, setSelectedHost] = useState()
  const [{ data, loading, error }] = useAxios('http://10.2.161.46:8004/hosts')

  const onHostClick = host => {
    setSelectedHost(host)
  }

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (name, row) => {
        return <Link onClick={() => onHostClick(row)}>{name}</Link>
      }
    },
    {
      title: 'User',
      key: 'username'
    },
    {
      title: 'IP',
      key: 'ip'
    },
    {
      title: 'IPMI IP',
      key: 'ipmi_ip'
    },
    // {
    //   title: 'UUID',
    //   key: 'uuid'
    // }
  ]

  // const data = [
  //   {
  //     key: '1234',
  //     username: 'ADMIN',
  //     ip: '10.2.161.42',
  //     ipmi_ip: '10.2.129.68',
  //     name: 'Node-A',
  //     uuid: '1234'
  //   },
  //   {
  //     key: '2341',
  //     username: 'ADMIN',
  //     ip: '10.2.161.43',
  //     ipmi_ip: '10.2.129.69',
  //     name: 'Node-B',
  //     uuid: '2341'
  //   },
  //   {
  //     key: '3412',
  //     username: 'ADMIN',
  //     ip: '10.2.161.44',
  //     ipmi_ip: '10.2.129.70',
  //     name: 'Node-C',
  //     uuid: '3412'
  //   },
  //   {
  //     key: '4123',
  //     username: 'ADMIN',
  //     ip: '10.2.161.45',
  //     ipmi_ip: '10.2.129.71',
  //     name: 'Node-D',
  //     uuid: '4123'
  //   }
  // ]
  return (
    <div style={{ padding: '20px' }}>
      <Table
        error={!!error}
        loading={loading}
        dataSource={_get(data, 'hosts', []).map(d => ({
          key: d.uuid,
          ...d
        }))}
        // dataSource={data}
        columns={columns}
        topSection={{ title: 'Hosts' }}
        structure={{ bodyMinHeight: '400px' }}
      />
      {selectedHost && (
        <Modal
          width={1024}
          visible={!!selectedHost}
          onCancel={() => setSelectedHost(null)}
          title={selectedHost && selectedHost.name}
          footer={<span />}
        >
          <NodeDetail host={selectedHost} />
        </Modal>
      )}
    </div>
  )
}

export default Nodes
