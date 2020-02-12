import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Select from '../Select/Select'
import Input from '../Input/Input'
import StatusIcon from '../Badge/status-icon'

import TableConstants from './TableConstants'
import TableCellLayout from './TableCellLayout'

export const CELL_EDIT_TYPES = {
  INPUT: 'input',
  SELECT: 'select'
}

class TableCell extends React.Component {
  render() {
    const {
      column,
      columnKey,
      customProps,
      editDirect,
      editRow,
      rowData,
      rowKey,
      rowIndex
    } = this.props

    const isEditDirect =
      editDirect &&
      editDirect.columnConfigs &&
      editDirect.columnConfigs[column[columnKey]]

    const isEditRow =
      editRow &&
      editRow.row === rowData[rowKey] &&
      editRow.columnConfigs &&
      editRow.columnConfigs[column[columnKey]]

    const cellAlert = this.getCellAlert()

    const hasCellWarning =
      cellAlert && cellAlert.type === TableConstants.TABLE_ALERT.WARNING
    const hasCellError =
      cellAlert && cellAlert.type === TableConstants.TABLE_ALERT.ERROR

    let cell
    if (isEditDirect) {
      cell = this.renderEditableCell(
        editDirect.columnConfigs[column[columnKey]],
        cellAlert
      )
    } else if (isEditRow) {
      cell = this.renderEditableCell(
        editRow.columnConfigs[column[columnKey]],
        cellAlert
      )
    } else {
      cell = this.renderCell(cellAlert)
    }

    let tdProps = {}

    if (column.renderProps) {
      const cellContent = rowData[column[columnKey]]
      const cellProps = column.renderProps(cellContent, rowData, rowIndex)
      if (cellProps) {
        tdProps = cellProps
      }
    }

    if (customProps && customProps.cellProps) {
      const cellProps = customProps.cellProps(column, rowData, rowIndex)
      if (cellProps) {
        tdProps = cellProps
      }
    }

    if (tdProps.colSpan === -1 || tdProps.rowSpan === -1) {
      return null
    }

    return (
      <td
        className={classnames(
          column.className,
          hasCellWarning ? 'has-cell-warning' : '',
          hasCellError ? 'has-cell-error' : '',
          isEditDirect || isEditRow ? '-editable' : ''
        )}
        data-text-align={column.textAlign}
        {...tdProps}
      >
        {cell}
      </td>
    )
  }

  renderCell(cellAlert) {
    const { column, columnKey, rowAlert, rowData, rowIndex } = this.props

    let cellContent = rowData[column[columnKey]]
    if (column.render) {
      cellContent = column.render(cellContent, rowData, rowIndex)
    }

    let beforeContent, afterContent
    if (cellAlert) {
      afterContent = this.renderCellAlert(cellAlert)
    }

    if (rowAlert) {
      beforeContent = this.renderRowAlert(rowAlert)
    }

    return (
      <TableCellLayout
        content={cellContent}
        before={beforeContent}
        after={afterContent}
      />
    )
  }

  renderEditableCell(columnConfig, cellAlert) {
    const { column, columnKey, eventHandlers, rowData, rowIndex } = this.props

    const cellValue = rowData[column[columnKey]]

    const cellAlertContent = this.renderCellAlert(cellAlert)

    let editableCell = null

    switch (columnConfig.type) {
      case CELL_EDIT_TYPES.SELECT:
        const selectProps = columnConfig.selectProps
          ? columnConfig.selectProps(cellValue, rowData, rowIndex)
          : {}
        editableCell = (
          <Select
            defaultValue={cellValue}
            onChange={value => {
              eventHandlers.handleEditDataChange(value, rowData, column)
            }}
            selectOptions={columnConfig.selectData}
            {...selectProps}
          />
        )
        break
      case CELL_EDIT_TYPES.INPUT:
      default:
        const inputProps = columnConfig.inputProps
          ? columnConfig.inputProps(cellValue, rowData, rowIndex)
          : {}
        editableCell = (
          <Input
            defaultValue={cellValue}
            onBlur={e => {
              const value = e.target.value
              if (value !== cellValue) {
                eventHandlers.handleEditDataChange(value, rowData, column)
              }
            }}
            onFocus={e => {
              e.target.select()
            }}
            suffix={cellAlertContent}
            {...inputProps}
          />
        )
        break
    }

    return editableCell
  }

  renderCellAlert(cellAlert) {
    if (cellAlert) {
      let type
      switch (cellAlert.type) {
        case TableConstants.TABLE_ALERT.ERROR:
          type = StatusIcon.STATUS_ICON_TYPES.ALERT
          break
        case TableConstants.TABLE_ALERT.WARNING:
          type = StatusIcon.STATUS_ICON_TYPES.WARNING
          break
        default:
          break
      }
      if (type) {
        return (
          <StatusIcon
            className="cell-alert-icon"
            type={type}
            tooltipProps={{ title: cellAlert.message }}
          />
        )
      }
    }
    return null
  }

  renderRowAlert(rowAlert) {
    if (rowAlert) {
      let type
      switch (rowAlert.type) {
        case TableConstants.TABLE_ALERT.ERROR:
          type = StatusIcon.STATUS_ICON_TYPES.ALERT
          break
        case TableConstants.TABLE_ALERT.WARNING:
          type = StatusIcon.STATUS_ICON_TYPES.WARNING
          break
        default:
          break
      }
      if (type) {
        return (
          <StatusIcon
            className="row-alert-icon"
            type={type}
            tooltipProps={{ title: rowAlert.message }}
          />
        )
      }
    }
    return null
  }

  getCellAlert() {
    const { column, columnKey, rowData, rowKey } = this.props

    const cellAlerts = this.props.cellAlerts || []

    let cellAlert = null
    for (let i = 0; i < cellAlerts.length; i++) {
      if (
        cellAlerts[i].row === rowData[rowKey] &&
        cellAlerts[i].column === column[columnKey]
      ) {
        cellAlert = cellAlerts[i]
        break
      }
    }
    return cellAlert
  }
}

TableCell.propTypes = {
  /**
   * Array of cell alert configs
   */
  cellAlerts: PropTypes.arrayOf(PropTypes.object),
  /**
   * Unique key for a row.
   */
  columnKey: PropTypes.string,
  /**
   * Data source for column the cell belongs to
   */
  column: PropTypes.object,
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
  /**
   * Row alert config
   */
  rowAlert: PropTypes.object,
  /**
   * Data source for row the cell belongs to
   */
  rowData: PropTypes.object,
  /**
   * Index of row from data source
   */
  rowIndex: PropTypes.number,
  /**
   * Unique key for a row.
   */
  rowKey: PropTypes.string
}

export default TableCell
