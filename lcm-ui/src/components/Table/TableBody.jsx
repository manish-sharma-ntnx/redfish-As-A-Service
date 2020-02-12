import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import TableRow from './TableRow'
import TableExpandedRow from './TableExpandedRow'

class TableBody extends React.Component {
  render() {
    const {
      cellAlerts,
      columnKey,
      columns,
      customProps,
      dataSource,
      editDirect,
      editRow,
      eventHandlers,
      rowAction,
      rowAlerts,
      rowExpand,
      rowKey,
      rowSelection
    } = this.props

    const rows = []

    for (let i = 0; i < dataSource.length; i++) {
      rows.push(
        <TableRow
          key={`row-${dataSource[i][rowKey]}`}
          cellAlerts={cellAlerts}
          columnKey={columnKey}
          columns={columns}
          customProps={customProps}
          editDirect={editDirect}
          editRow={editRow}
          eventHandlers={eventHandlers}
          rowAction={rowAction}
          rowAlerts={rowAlerts}
          rowData={dataSource[i]}
          rowExpand={rowExpand}
          rowKey={rowKey}
          rowIndex={i}
          rowSelection={rowSelection}
        />
      )
      if (rowExpand) {
        rows.push(
          <TableExpandedRow
            key={`expandedRow-${dataSource[i][rowKey]}`}
            columns={columns}
            rowData={dataSource[i]}
            rowExpand={rowExpand}
            rowIndex={i}
            rowKey={rowKey}
            rowSelection={rowSelection}
          />
        )
      }
    }

    return (
      <tbody className={classnames(rowExpand ? 'has-row-expand' : '')}>
        {rows}
      </tbody>
    )
  }
}

TableBody.propTypes = {
  /** */
  cellAlerts: PropTypes.arrayOf(PropTypes.object),
  /** */
  columnKey: PropTypes.string,
  /** */
  columns: PropTypes.arrayOf(PropTypes.object),
  /** */
  customProps: PropTypes.object,
  /** */
  dataSource: PropTypes.arrayOf(PropTypes.object),
  /** */
  editDirect: PropTypes.object,
  /** */
  eventHandlers: PropTypes.object,
  /** */
  rowAction: PropTypes.object,
  /** */
  rowAlerts: PropTypes.arrayOf(PropTypes.object),
  /** */
  rowExpand: PropTypes.object,
  /** */
  rowKey: PropTypes.string,
  /** */
  rowSelection: PropTypes.object
}

export default TableBody
