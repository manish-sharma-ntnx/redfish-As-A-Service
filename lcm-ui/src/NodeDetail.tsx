import React from 'react'
import useAxios from 'axios-hooks'
import _get from 'lodash/get'

import Collapse from './components/Collapse/Collapse'
import FlexLayout from './components/Layouts/FlexLayout'
import Badge from './components/Badge/Badge'
import Table from './components/Table/Table'
import Alert from './components/Alert/Alert'
import Loader from './components/Loader/Loader'

// const data = {
//   components: {
//     bmc: [{ version: '1.9', manufacturer: 'American Megatrends Inc.' }],
//     cpu: [
//       { name: 'CPU 1', temperature: '45', manufacturer: 'Intel' },
//       { name: 'CPU 2', temperature: '47', manufacturer: 'Intel' }
//     ],
//     bios: [{ version: '2.9', manufacturer: 'American Megatrends Inc.' }]
//   }
// }

const NodeDetail: React.FC<{ host: any }> = props => {
  const [{ data, loading, error }] = useAxios(
    `http://10.2.161.46:8004/components/${props.host.uuid}`
  )
  if (loading)
    return (
      <Loader loading>
        <div style={{ height: '300px' }} />
      </Loader>
    )
  if (error)
    return (
      <FlexLayout
        style={{ height: '300px' }}
        justifyContent="center"
        alignItems="flex-start"
      >
        <Alert
          style={{ flexShrink: '0', width: '100%' }}
          type={Alert.TYPE.ERROR}
          closable={false}
          message={'Unable to fetch node details'}
        />
      </FlexLayout>
    )

  return (
    <>
      <Collapse
        defaultActiveKey={[]}
        style={{ background: '#f2f4f6', padding: '40px' }}
      >
        {Object.keys(data.components).map(component => {
          return (
            <Collapse.Panel
              key={component}
              header={
                <FlexLayout>
                  <span>{component.toUpperCase()}</span>
                  <Badge count={data.components[component].length} />
                </FlexLayout>
              }
            >
              <ComponentDetail
                componentType={component.toUpperCase()}
                data={data.components[component].map(d => ({
                  key: d.name || d.version,
                  ...d
                }))}
              />
            </Collapse.Panel>
          )
        })}
      </Collapse>
    </>
  )
}

const ComponentDetail = props => {
  const getColumns = (componentType: 'BMC' | 'BIOS' | 'CPU' | 'FAN') => {
    const columns = []
    if (componentType === 'BMC') {
      return [
        {
          title: 'Version',
          key: 'version'
        },
        {
          title: 'Model',
          key: 'model'
        },
        {
          title: 'State',
          key: 'state'
        },
        {
          title: 'Health',
          key: 'health',
          render: health => {
            if (health === 'OK') return <Badge color="green" count={health} />
            return <Badge color="red" count={health} />
          }
        }
      ]
    }
    if (componentType === 'BIOS') {
      return [
        {
          title: 'Version',
          key: 'version'
        },
        {
          title: 'Model',
          key: 'model'
        },
        {
          title: 'Manufacturer',
          key: 'manufacturer'
        },
        {
          title: 'Serial',
          key: 'serial'
        }
      ]
    }
    if (componentType === 'CPU') {
      return [
        {
          title: 'Name',
          key: 'name'
        },
        {
          title: 'Model',
          key: 'model'
        },
        {
          title: 'Manufacturer',
          key: 'manufacturer'
        },
        {
          title: 'Cores',
          key: 'cores'
        },
        {
          title: 'Temperature',
          key: 'temperature'
        },
        {
          title: 'Threads',
          key: 'threads'
        },
        {
          title: 'State',
          key: 'state'
        },
        {
          title: 'Health',
          key: 'health',
          render: health => {
            if (health === 'OK') return <Badge color="green" count={health} />
            return <Badge color="red" count={health} />
          }
        }
      ]
    }
    if (componentType === 'FAN') {
      return [
        {
          title: 'Name',
          key: 'name'
        },
        {
          title: 'RPM',
          key: 'rpm'
        },
        {
          title: 'State',
          key: 'state'
        },
        {
          title: 'Health',
          key: 'health',
          render: health => {
            if (health === 'OK') return <Badge color="green" count={health} />
            return <Badge color="red" count={health} />
          }
        }
      ]
    }

    return columns
  }

  const columns = getColumns(props.componentType)
  const dataSource = props.data
  return <Table dataSource={dataSource} columns={columns} />
}

export default NodeDetail
