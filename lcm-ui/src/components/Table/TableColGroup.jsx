import React from 'react'
import PropTypes from 'prop-types'

class TableColGroup extends React.Component {
  renderCol(key, colWidth) {
    return (
      <col
        key={key}
        style={{
          width: colWidth,
          minWidth: colWidth
        }}
      />
    )
  }

  render() {
    const {
      columnKey,
      columns,
      editRow,
      rowAction,
      rowExpand,
      rowSelection,
      structure
    } = this.props

    const cols = []
    if (rowSelection) {
      cols.push(this.renderCol('rowSelection'))
    }

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]
      const columnWidth =
        structure && structure.columnWidths
          ? structure.columnWidths[column[columnKey]]
          : undefined

      cols.push(this.renderCol(`col-${i}`, columnWidth))
    }

    if (rowAction) {
      cols.push(this.renderCol('rowAction'))
    }

    if (rowExpand) {
      cols.push(this.renderCol('rowExpand'))
    }

    if (editRow) {
      cols.push(this.renderCol('colAction', 1))
    }

    return <colgroup>{cols}</colgroup>
  }
}

TableColGroup.propTypes = {
  /** */
  columnKey: PropTypes.string,
  /** */
  columns: PropTypes.arrayOf(PropTypes.object),
  /** */
  editRow: PropTypes.object,
  /** */
  rowAction: PropTypes.object,
  /** */
  rowExpand: PropTypes.object,
  /** */
  rowSelection: PropTypes.object,
  /** */
  structure: PropTypes.object
}

export default TableColGroup
