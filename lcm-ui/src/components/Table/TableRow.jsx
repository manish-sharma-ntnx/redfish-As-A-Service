import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import _isFunction from 'lodash/isFunction'

import TableCell from './TableCell'
import TableRowSelection from './TableRowSelection'
import ChevronDownIcon from '../Icons/ChevronDownIcon'
import ChevronUpIcon from '../Icons/ChevronUpIcon'
import TripleDotVerticalIcon from '../Icons/MoreVerticalIcon'
import CloseIcon from '../Icons/CloseIcon'
import FlexLayout from '../Layouts/FlexLayout'
import TableConstants from './TableConstants'
import Menu from '../Navigation/Menu'
import Dropdown from '../Dropdown/Dropdown'
import Button from '../Button/Button'
import CheckMarkIcon from '../Icons/CheckMarkIcon'

class TableRow extends React.Component {
  render() {
    const {
      columnKey,
      columns,
      customProps,
      editRow,
      rowData,
      rowAction,
      rowExpand,
      rowIndex,
      rowKey,
      rowSelection
    } = this.props

    const rowCells = []
    const rowAlert = this.getRowAlert()

    if (rowSelection) {
      const selectionColumn = {}
      selectionColumn.className = 'selection-column'
      selectionColumn[columnKey] = 'selectionColumn'
      selectionColumn.render = this.renderRowSelection

      rowCells.push(this.renderTableCell(selectionColumn))
    }

    // If there are column groups defined, we should flatten the columns prop
    // so we can process the column definitions inside group
    const flattenedColumns = this.flattenColumns(columns)
    for (let i = 0; i < flattenedColumns.length; i++) {
      const column = flattenedColumns[i]
      if (rowAlert && i === 0) {
        // The first data cell should render the row alert icon
        rowCells.push(this.renderTableCell(column, rowAlert))
      } else {
        rowCells.push(this.renderTableCell(column))
      }
    }

    if (rowAction) {
      const rowActionColumn = {}
      rowActionColumn.className = 'row-action'
      rowActionColumn[columnKey] = 'rowAction'
      rowActionColumn.render = this.renderRowAction
      rowCells.push(this.renderTableCell(rowActionColumn))
    }

    let hasExpandedRow = false
    if (rowExpand) {
      hasExpandedRow = rowExpand.render && rowExpand.render(rowData, rowIndex)

      const rowExpandColumn = {}
      rowExpandColumn.className = 'row-expand'
      rowExpandColumn[columnKey] = 'rowExpand'
      if (hasExpandedRow) {
        rowExpandColumn.render = this.renderRowExpand
      }
      rowCells.push(this.renderTableCell(rowExpandColumn))
    }

    let hasFocus = false
    if (editRow) {
      const editRowColumn = {}
      editRowColumn.className = 'edit-row'
      editRowColumn[columnKey] = 'editRow'
      if (editRow.row === rowData[rowKey]) {
        editRowColumn.render = this.renderEditRow
        hasFocus = true
      }

      // If row has focus, add the edit-row cell
      rowCells.push(this.renderTableCell(editRowColumn))
    }

    const focusClass = hasFocus ? '-focus' : ''
    const rowProps = customProps && customProps.rowProps
    const trProps = rowProps ? rowProps(rowData, rowIndex) : {}

    const hasRowWarning =
      rowAlert && rowAlert.type === TableConstants.TABLE_ALERT.WARNING
    const hasRowError =
      rowAlert && rowAlert.type === TableConstants.TABLE_ALERT.ERROR

    return (
      <tr
        className={classnames(
          focusClass,
          hasExpandedRow ? 'has-expanded-row' : '',
          this.isRowExpanded() ? 'row-expanded' : '',
          hasRowWarning ? 'has-row-warning' : '',
          hasRowError ? 'has-row-error' : ''
        )}
        {...trProps}
      >
        {rowCells}
      </tr>
    )
  }

  renderTableCell(column, rowAlert) {
    const {
      cellAlerts,
      columnKey,
      customProps,
      editDirect,
      editRow,
      eventHandlers,
      rowData,
      rowIndex,
      rowKey
    } = this.props

    return (
      <TableCell
        key={`cell-${rowData[rowKey]}-${column[columnKey]}`}
        cellAlerts={cellAlerts}
        columnKey={columnKey}
        column={column}
        customProps={customProps}
        editDirect={editDirect}
        editRow={editRow}
        eventHandlers={eventHandlers}
        rowAlert={rowAlert}
        rowData={rowData}
        rowIndex={rowIndex}
        rowKey={rowKey}
      />
    )
  }

  flattenColumns(columns) {
    let flattenedColumns = []
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]
      if (column.group && column.group.length) {
        flattenedColumns = flattenedColumns.concat(
          this.flattenColumns(column.group)
        )
      } else {
        flattenedColumns = flattenedColumns.concat(column)
      }
    }
    return flattenedColumns
  }

  renderRowSelection = () => {
    const {
      rowData,
      eventHandlers,
      rowIndex,
      rowKey,
      rowSelection
    } = this.props

    const selected = rowSelection.selected
    const isSelected = selected && selected.indexOf(rowData[rowKey]) > -1

    return (
      <TableRowSelection
        eventHandlers={eventHandlers}
        isSelected={isSelected}
        rowIndex={rowIndex}
        rowKeyVal={rowData[rowKey]}
        type={rowSelection.type}
      />
    )
  }

  renderRowAction = () => {
    const { editRow, rowAction, rowData, rowIndex } = this.props

    // If the row is in edit mode, don't allow user to do any other action
    if (editRow && editRow.row) {
      return null
    }

    const actionIcon = (
      <div className="row-action-icon">
        <TripleDotVerticalIcon />
      </div>
    )

    let actions
    if (_isFunction(rowAction.actions)) {
      actions = rowAction.actions(rowData, rowIndex)
    } else {
      actions = rowAction.actions || []
    }

    const menuItems = []
    for (let i = 0; i < actions.length; i++) {
      const { key, value, menuItemProps } = actions[i]
      menuItems.push(
        <Menu.Item key={key} {...menuItemProps}>
          {value}
        </Menu.Item>
      )
    }

    const menu = (
      <Menu className="ntnx-actions-menu" onClick={this.handleClickRowAction}>
        {menuItems}
      </Menu>
    )

    const dropDown = rowAction.getPopupContainer ? (
      <Dropdown
        getPopupContainer={rowAction.getPopupContainer}
        overlay={menu}
        title={actionIcon}
      />
    ) : (
      <Dropdown overlay={menu} title={actionIcon} />
    )

    return (
      <FlexLayout alignItems="center" justifyContent="center">
        {dropDown}
      </FlexLayout>
    )
  }

  /**
   * Handler for when user clicks on a row action
   * @param {Object} info - Info from Menu onClick
   */
  handleClickRowAction = info => {
    const { rowData, rowIndex } = this.props
    this.props.rowAction.onRowAction(info.key, rowData, rowIndex)
  }

  renderRowExpand = () => {
    let expandedIcon = <ChevronDownIcon />
    if (this.isRowExpanded()) {
      expandedIcon = <ChevronUpIcon />
    }
    return (
      <FlexLayout
        className="row-expand-icon"
        alignItems="center"
        justifyContent="center"
        onClick={this.handleClickRowExpand}
      >
        {expandedIcon}
      </FlexLayout>
    )
  }

  handleClickRowExpand = () => {
    const { rowData, eventHandlers, rowKey } = this.props
    eventHandlers.handleRowExpandChange(rowData[rowKey])
  }

  renderEditRow = () => {
    const { editRow, eventHandlers } = this.props

    return (
      <div
        className={classnames(
          'edit-row-btns',
          '-focus',
          editRow && editRow.overflow ? 'overflow' : ''
        )}
      >
        <Button
          appearance="mini"
          type="secondary"
          className="edit-row-btn"
          onClick={() => {
            return eventHandlers.handleEditRowCancelClick()
          }}
        >
          <CloseIcon size="small" />
        </Button>
        <Button
          appearance="mini"
          type="primary"
          className="edit-row-btn"
          onClick={() => {
            return eventHandlers.handleEditRowSubmitClick()
          }}
        >
          <CheckMarkIcon size="small" />
        </Button>
      </div>
    )
  }

  isRowExpanded() {
    const { rowData, rowExpand, rowKey } = this.props
    const rowKeyVal = rowData[rowKey]

    return rowExpand && rowExpand.rows && rowExpand.rows.indexOf(rowKeyVal) >= 0
  }

  getRowAlert() {
    const { rowData, rowKey } = this.props

    const rowAlerts = this.props.rowAlerts || []

    let rowAlert = null
    for (let i = 0; i < rowAlerts.length; i++) {
      if (rowAlerts[i].row === rowData[rowKey]) {
        rowAlert = rowAlerts[i]
        break
      }
    }
    return rowAlert
  }
}

TableRow.propTypes = {
  /**
   * Array of cell alert configs
   */
  cellAlerts: PropTypes.arrayOf(PropTypes.object),
  /**
   * Unique key for a row.
   */
  columnKey: PropTypes.string,
  /**
   * Array of column objects
   */
  columns: PropTypes.arrayOf(PropTypes.object),
  /**
   * Custom props to pass into table elements
   */
  customProps: PropTypes.object,
  /**
   * Object with direct edit config
   */
  editDirect: PropTypes.object,
  /**
   * Table event handlers
   */
  eventHandlers: PropTypes.object,
  /** */
  rowAction: PropTypes.object,
  /**
   * Object to use as the data source for the table row.
   */
  rowData: PropTypes.object.isRequired,
  /**
   * Array of row alert configs
   */
  rowAlerts: PropTypes.arrayOf(PropTypes.object),
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

export default TableRow
