import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import _cloneDeep from 'lodash/cloneDeep'
import _every from 'lodash/every'
import _some from 'lodash/some'

import { ROW_SELECTION_TYPES } from './TableRowSelection'
import Checkbox from '../Checkbox/Checkbox'
import Sorter, { SORT_ORDER_CONST } from '../Sorter/Sorter'

class TableHeader extends React.Component {
  render() {
    return <thead>{this.renderHeaderRows()}</thead>
  }

  renderHeaderRows = () => {
    const columns = _cloneDeep(this.props.columns)

    const { customProps } = this.props
    const headerRows = []
    const headerRowsData = this.getHeaderRows(columns)

    for (let i = 0; i < headerRowsData.length; i++) {
      const rowColumns = headerRowsData[i]
      for (let j = 0; j < rowColumns.length; j++) {
        let rowSpan = headerRowsData.length - i
        let colSpan = 1
        if (rowColumns[j].group && rowColumns[j].group.length) {
          const rowsRemaining = headerRowsData.length - i - 1
          rowSpan -= rowsRemaining
          colSpan = this.getColSpan(rowColumns[j])
        }

        if (!rowColumns[j].headerProps) {
          if (customProps && customProps.headerProps) {
            rowColumns[j].headerProps = customProps.headerProps(rowColumns[j])
          } else {
            rowColumns[j].headerProps = {}
          }
        }
        if (rowSpan > 1) {
          rowColumns[j].headerProps.rowSpan = rowSpan
        }
        if (colSpan > 1) {
          rowColumns[j].headerProps.colSpan = colSpan
        }
      }
      headerRows.push(this.renderHeaderRow(headerRowsData, i))
    }

    return headerRows
  }

  renderHeaderRow(headerRows, index) {
    const {
      columnKey,
      editRow,
      rowAction,
      rowExpand,
      rowSelection,
      sort
    } = this.props

    const headerRow = headerRows[index]
    const headerCells = []
    this.thElements = []

    const isFirstHeaderRow = index === 0
    if (isFirstHeaderRow && rowSelection) {
      headerCells.push(
        <th
          key="colSelection"
          className="selection-column"
          rowSpan={headerRows.length}
        >
          {this.renderRowSelectionBox()}
        </th>
      )
    }

    for (let i = 0; i < headerRow.length; i++) {
      const column = headerRow[i]

      const hasSorter =
        sort && sort.sortable
          ? sort.sortable.indexOf(column[columnKey]) > -1
          : false

      const headerProps = column.headerProps || {}
      if (headerProps.colSpan !== -1) {
        headerCells.push(
          <th
            key={`col-${column[columnKey]}`}
            className={classnames(
              column.className,
              hasSorter ? 'has-sorter' : ''
            )}
            data-text-align={column.textAlign}
            ref={thElement => {
              this.thElements[i] = thElement
            }}
            onClick={() => {
              return this.handleHeaderClick(column)
            }}
            {...headerProps}
          >
            <span>{column.title}</span>
            {hasSorter ? this.renderSorter(column) : null}
          </th>
        )
      }
    }

    if (rowAction) {
      headerCells.push(<th key="rowAction" className="row-action" />)
    }

    if (isFirstHeaderRow && rowExpand) {
      headerCells.push(
        <th
          key="rowExpand"
          className="row-expand"
          rowSpan={headerRows.length}
        />
      )
    }

    if (isFirstHeaderRow && editRow) {
      headerCells.push(
        <th key="editRow" className="edit-row" rowSpan={headerRows.length} />
      )
    }

    return <tr key={index}>{headerCells}</tr>
  }

  getHeaderRows(columns, rowIndex = 0, rows) {
    rows = rows || []
    rows[rowIndex] = rows[rowIndex] || []

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]
      if (column.group) {
        this.getHeaderRows(column.group, rowIndex + 1, rows)
      }
      rows[rowIndex].push(column)
    }

    return rows
  }

  renderSorter(column) {
    const { columnKey, eventHandlers, sort } = this.props

    const hasSortOrder =
      sort.order && sort.column && sort.column === column[columnKey]

    const sortOrder = hasSortOrder ? sort.order : SORT_ORDER_CONST.NONE
    return (
      <Sorter
        type={sort.type}
        sortOrder={sortOrder}
        onSortOrderChanged={newSortOrder => {
          eventHandlers.handleSortOrderChange(
            newSortOrder === SORT_ORDER_CONST.NONE ? '' : newSortOrder,
            column[columnKey]
          )
        }}
        ref={sorter => {
          column.sorterElement = sorter
        }}
      />
    )
  }

  getColSpan(column) {
    let colSpan = 0
    if (column.group && column.group.length) {
      for (let i = 0; i < column.group.length; i++) {
        colSpan += this.getColSpan(column.group[i])
      }
    } else {
      colSpan = 1
    }
    return colSpan
  }

  renderRowSelectionBox() {
    const { dataSource, eventHandlers, rowKey, rowSelection } = this.props

    const selected = rowSelection.selected
    const rowSelectionType = rowSelection.type
    let selectionBox = null
    // If rowSelectionType is not defined, it should default to checkbox
    if (
      !rowSelectionType ||
      rowSelectionType === ROW_SELECTION_TYPES.CHECKBOX
    ) {
      const rowKeys = dataSource.map(row => {
        return row[rowKey]
      })
      // If the rowKeys in dataSource are all in selected, then all
      // currently displayed rows are selected
      if (_every(rowKeys, key => selected.indexOf(key) >= 0)) {
        selectionBox = (
          <Checkbox
            id="unselect-all"
            checked={true}
            onChange={() => {
              return eventHandlers.handleRowUnselectAll(rowKeys)
            }}
          />
        )
      } else if (_some(rowKeys, key => selected.indexOf(key) >= 0)) {
        // If only some of the rows are selected
        selectionBox = (
          <Checkbox
            id="partial-select"
            type="partial-check"
            checked={true}
            onChange={() => {
              return eventHandlers.handleRowSelectAll(rowKeys)
            }}
          />
        )
      } else {
        selectionBox = (
          <Checkbox
            id="select-all"
            checked={false}
            onChange={() => {
              return eventHandlers.handleRowSelectAll(rowKeys)
            }}
          />
        )
      }
    }
    return selectionBox
  }

  handleHeaderClick = column => {
    if (column.sorterElement) {
      column.sorterElement.toggleSortOrder()
    }
  }
}

TableHeader.MIN_COLUMN_WIDTH = 30

TableHeader.defaultProps = {}

TableHeader.propTypes = {
  /** */
  columnKey: PropTypes.string,
  /** */
  columns: PropTypes.arrayOf(PropTypes.object),
  /** */
  dataSource: PropTypes.arrayOf(PropTypes.object),
  /** */
  editRow: PropTypes.object,
  /** */
  eventHandlers: PropTypes.object,
  /** */
  rowAction: PropTypes.object,
  /** */
  rowExpand: PropTypes.object,
  /** */
  rowKey: PropTypes.string,
  /** */
  rowSelection: PropTypes.object,
  /** */
  sort: PropTypes.object,
  /** */
  structure: PropTypes.object
}

export default TableHeader
