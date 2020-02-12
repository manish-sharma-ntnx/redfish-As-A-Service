import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

class TableExpandedRow extends React.Component {
  render() {
    const { columns, rowData, rowExpand, rowIndex, rowKey } = this.props

    const numColumns = columns.length
    const cells = []

    let isNestedTable = false
    if (rowExpand && rowExpand.render) {
      isNestedTable = rowExpand.isNestedTable
      cells.push(
        <td
          key="rowExpandContent"
          className={classnames(isNestedTable ? 'nested-table' : '')}
          colSpan={numColumns}
        >
          {rowExpand.render(rowData, rowIndex)}
        </td>
      )

      cells.push(<td key="rowExpandIcon" />)
    }

    if (cells.length) {
      const isShown =
        rowExpand.rows && rowExpand.rows.indexOf(rowData[rowKey]) >= 0

      return (
        <tr
          className={classnames(
            'expanded-row',
            isNestedTable ? 'has-nested-table' : '',
            !isShown ? '-hide' : ''
          )}
        >
          {cells}
        </tr>
      )
    }
    return null
  }
}

TableExpandedRow.propTypes = {
  /**
   * Array of column objects
   */
  columns: PropTypes.arrayOf(PropTypes.object),
  /**
   * Object to use as the data source for the table row.
   */
  rowData: PropTypes.object.isRequired,
  /**
   * Object with row expand options
   */
  rowExpand: PropTypes.object,
  /**
   * Index of row from data source
   */
  rowIndex: PropTypes.number,
  /**
   * Unique key for a row.
   */
  rowKey: PropTypes.string
}

export default TableExpandedRow
