import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import _cloneDeep from 'lodash/cloneDeep'
import _values from 'lodash/values'
import _each from 'lodash/each'
import _union from 'lodash/union'
import _difference from 'lodash/difference'

import Link from '../Link/Link'
import Loader from '../Loader/Loader'
import Title from '../Typography/Title'
import FlexLayout from '../Layouts/FlexLayout'
import Sorter from '../Sorter/Sorter'
import InputSearch from '../Input/InputSearch'

import './Table.less'
import TableHeader from './TableHeader'
import TableColGroup from './TableColGroup'
import TableBody from './TableBody'
import TableConstants from './TableConstants'
import { CELL_EDIT_TYPES } from './TableCell'
import { ROW_SELECTION_TYPES } from './TableRowSelection'
import ValidationUtil from '../../utils/ValidationUtil'
import MenuItem from '../Navigation/MenuItem'

class Table extends React.Component {
  constructor(props) {
    super(props)

    this.eventHandlers = {
      handleEditDataChange: this.handleEditDataChange,
      handleEditRowCancelClick: this.handleEditRowCancelClick,
      handleEditRowSubmitClick: this.handleEditRowSubmitClick,
      handleRefreshData: this.handleRefreshData,
      handleRowExpandChange: this.handleRowExpandChange,
      handleRowSelectAll: this.handleRowSelectAll,
      handleRowSelectOne: this.handleRowSelectOne,
      handleRowSelect: this.handleRowSelect,
      handleRowUnselectAll: this.handleRowUnselectAll,
      handleRowUnselect: this.handleRowUnselect,
      handleSortOrderChange: this.handleSortOrderChange
    }
  }

  static TABLE_ALERT = TableConstants.TABLE_ALERT
  static ROW_SELECTION_TYPES = ROW_SELECTION_TYPES
  static CELL_EDIT_TYPES = CELL_EDIT_TYPES

  render() {
    const {
      className,
      border,
      columns,
      dataSource,
      loading,
      loadingError,
      search,
      structure
    } = this.props

    this.validateKeys()

    let mainSection = []
    const hasData = columns.length > 0 && dataSource.length > 0

    if ((search || hasData) && !(structure && structure.hideHeader)) {
      mainSection.push(this.renderTableHeader())
    }

    if (search) {
      mainSection.push(this.renderSearch())
    }

    let tableBody
    if (hasData) {
      tableBody = this.renderTableBody()
    } else {
      tableBody = this.renderNoData()
    }

    mainSection.push(tableBody)

    if (loadingError) {
      mainSection.push(this.renderErrorMessage())
    } else if (loading) {
      mainSection = [
        <Loader key="tableLoader" tip={'Fetching data...'}>
          {mainSection}
        </Loader>
      ]
    }

    const tableContent = []
    const topSection = this.renderTopSection()
    if (topSection) {
      tableContent.push(topSection)
    }

    tableContent.push(
      <div
        key="tableMainSection"
        className={classnames('table-main-section', !hasData ? 'no-data' : '')}
      >
        {mainSection}
      </div>
    )

    const bottomSection = this.renderBottomSection()
    if (bottomSection) {
      tableContent.push(bottomSection)
    }

    return (
      <div
        className={classnames(className, 'ntnx ntnx-table')}
        data-border={border}
        data-fixed-header={Boolean(structure && structure.bodyMaxHeight)}
      >
        {tableContent}
      </div>
    )
  }

  renderTableColGroup() {
    const {
      columnKey,
      columns,
      editRow,
      rowAction,
      rowExpand,
      rowSelection,
      structure
    } = this.props

    return (
      <TableColGroup
        columnKey={columnKey}
        columns={columns}
        editRow={editRow}
        rowAction={rowAction}
        rowExpand={rowExpand}
        rowSelection={rowSelection}
        structure={structure}
      />
    )
  }

  renderTableHeader = () => {
    const {
      columnKey,
      columns,
      customProps,
      dataSource,
      editRow,
      rowAction,
      rowExpand,
      rowKey,
      rowSelection,
      sort,
      structure
    } = this.props

    return (
      <div key="tableHeader" className="table-header">
        <table>
          {this.renderTableColGroup()}
          <TableHeader
            columnKey={columnKey}
            columns={columns}
            customProps={customProps}
            dataSource={dataSource}
            editRow={editRow}
            eventHandlers={this.eventHandlers}
            rowAction={rowAction}
            rowExpand={rowExpand}
            rowKey={rowKey}
            rowSelection={rowSelection}
            sort={sort}
            structure={structure}
          />
        </table>
      </div>
    )
  }

  renderTableBody = () => {
    const {
      cellAlerts,
      columnKey,
      columns,
      customProps,
      dataSource,
      editDirect,
      editRow,
      rowAction,
      rowAlerts,
      rowExpand,
      rowKey,
      rowSelection,
      structure
    } = this.props

    const fixedHeader = Boolean(structure && structure.bodyMaxHeight)
    const hasRowFocus = Boolean(editRow && editRow.row)

    return (
      <div
        key="tableBody"
        className={classnames('table-body', hasRowFocus ? 'has-row-focus' : '')}
        style={{
          maxHeight: fixedHeader ? structure.bodyMaxHeight : 'none'
        }}
      >
        <table>
          {this.renderTableColGroup()}
          <TableBody
            cellAlerts={cellAlerts}
            columnKey={columnKey}
            columns={columns}
            customProps={customProps}
            dataSource={dataSource}
            editDirect={editDirect}
            editRow={editRow}
            eventHandlers={this.eventHandlers}
            rowAction={rowAction}
            rowAlerts={rowAlerts}
            rowExpand={rowExpand}
            rowKey={rowKey}
            rowSelection={rowSelection}
          />
        </table>
      </div>
    )
  }

  renderSearch() {
    const { search } = this.props
    let inputSearchProps = {}
    if (search.inputSearchProps) {
      inputSearchProps = search.inputSearchProps
    }

    return (
      <div key="tableSearch" className="table-search">
        <InputSearch key="tableSearchInput" {...inputSearchProps} />
      </div>
    )
  }

  renderNoData = () => {
    // TODO: custom message
    const noDataMessage = 'No data found'

    return (
      <div key="noDataMessage" className="no-data-message">
        {noDataMessage}
      </div>
    )
  }

  renderErrorMessage = () => {
    const errorMessage = 'Failed to fetch'
    const defaultErrorContent = [
      <div key="defaultErrorMsg">{errorMessage}</div>,
      <Link
        key="retryLink"
        className="retry-link"
        onClick={this.handleRefreshData}
      >
        Retry
      </Link>
    ]

    // TODO: custom error message
    const errorContent = defaultErrorContent

    return (
      <div key="errorMessage" className="error-message">
        {errorContent}
      </div>
    )
  }

  renderTopSection = () => {
    const { topSection } = this.props
    const leftContent = []
    const rightContent = []

    if (topSection) {
      if (topSection.title) {
        leftContent.push(
          <Title key="tableTitle" size="h3">
            {topSection.title}
          </Title>
        )
      }

      if (topSection.leftContent) {
        leftContent.push(
          <div key="topLeftTableContent">{topSection.leftContent}</div>
        )
      }

      if (topSection.rightContent) {
        rightContent.push(
          <div key="toprightTableContent">{topSection.rightContent}</div>
        )
      }
    }

    let content = null
    if (leftContent.length && rightContent.length) {
      content = (
        <FlexLayout justifyContent="space-between">
          <FlexLayout>{leftContent}</FlexLayout>
          <FlexLayout>{rightContent}</FlexLayout>
        </FlexLayout>
      )
    } else if (rightContent.length) {
      content = (
        <FlexLayout flexDirection="row-reverse">{rightContent}</FlexLayout>
      )
    } else if (leftContent.length) {
      content = <FlexLayout>{leftContent}</FlexLayout>
    }

    if (!content) {
      return null
    }

    return (
      <div key="tableTopSection" className="table-top-section">
        {content}
      </div>
    )
  }

  renderBottomSection = () => {
    let content = null

    // TODO: Pagination

    if (!content) {
      return null
    }

    return (
      <div key="tableBottomSection" className="table-bottom-section">
        {content}
      </div>
    )
  }

  validateKeys = () => {
    const { columnKey, columns, dataSource, rowKey } = this.props

    columns.forEach(column => {
      if (typeof column[columnKey] === 'undefined') {
        throw new Error(
          `There is a column that is missing a key: ${JSON.stringify(column)}`
        )
      }
    })
    dataSource.forEach(data => {
      if (typeof data[rowKey] === 'undefined') {
        throw new Error(
          `There is a dataSource that is missing a key: ${JSON.stringify(data)}`
        )
      }
    })
  }

  handleRefreshData = () => {
    if (this.props.onRefreshData) {
      this.props.onRefreshData({
        loading: true,
        loadingError: false
      })
    }
  }

  handleRowExpandChange = rowKeyVal => {
    if (this.props.onChangeRowExpand) {
      const rowExpand = _cloneDeep(this.props.rowExpand)
      rowExpand.rows = rowExpand.rows || []

      const isExpanded = rowExpand && rowExpand.rows.indexOf(rowKeyVal) >= 0
      if (isExpanded) {
        rowExpand.rows.splice(rowExpand.rows.indexOf(rowKeyVal), 1)
        this.props.onChangeRowExpand(rowExpand, null, rowKeyVal)
      } else {
        rowExpand.rows.push(rowKeyVal)
        this.props.onChangeRowExpand(rowExpand, rowKeyVal, null)
      }
    }
  }

  handleRowSelect = (e, rowKeyVal, rowIndex) => {
    if (this.props.onChangeRowSelection) {
      const rowSelection = _cloneDeep(this.props.rowSelection)
      let newSelectedRows = [rowKeyVal]
      rowSelection.selected.push(rowKeyVal)
      // If shift key is being pressed while a row is selected, we will select
      // all the rows in between the current selected row and the last row
      // that had a selection action done (this.shiftClickRowIndex)
      if (e.nativeEvent && e.nativeEvent.shiftKey) {
        newSelectedRows = this._getShiftClickRows(rowIndex)
        rowSelection.selected = _union(rowSelection.selected, newSelectedRows)
      }
      this.shiftClickRowIndex = rowIndex
      this.props.onChangeRowSelection(rowSelection, newSelectedRows, [])
    }
  }

  handleRowUnselect = (e, rowKeyVal, rowIndex) => {
    if (this.props.onChangeRowSelection) {
      const rowSelection = _cloneDeep(this.props.rowSelection)
      let newUnselectedRows = [rowKeyVal]
      rowSelection.selected.splice(rowSelection.selected.indexOf(rowKeyVal), 1)
      // If shift key is being pressed while a row is unselected, we will
      // unselect all the rows in between the current unselected row and the
      // last row that had a selection action done (this.shiftClickRowIndex)
      if (e.nativeEvent && e.nativeEvent.shiftKey) {
        newUnselectedRows = this._getShiftClickRows(rowIndex)
        rowSelection.selected = _difference(
          rowSelection.selected,
          newUnselectedRows
        )
      }
      this.shiftClickRowIndex = rowIndex
      this.props.onChangeRowSelection(rowSelection, [], newUnselectedRows)
    }
  }

  handleRowSelectOne = rowKeyVal => {
    const { onChangeRowSelection } = this.props

    if (onChangeRowSelection) {
      const rowSelection = _cloneDeep(this.props.rowSelection)
      const selected = [rowKeyVal]
      let unselected = []
      if (rowSelection && rowSelection.selected) {
        unselected = rowSelection.selected.slice(0)
      }
      rowSelection.selected = selected
      onChangeRowSelection(rowSelection, selected, unselected)
    }
  }

  handleRowSelectAll = rowKeys => {
    const { onChangeRowSelection } = this.props

    if (onChangeRowSelection) {
      const rowSelection = _cloneDeep(this.props.rowSelection)
      const selected = rowSelection.selected || []
      const newlySelected = []
      for (let i = 0; i < rowKeys.length; i++) {
        if (selected.indexOf(rowKeys[i]) === -1) {
          newlySelected.push(rowKeys[i])
        }
      }
      rowSelection.selected = selected.concat(newlySelected)
      this.shiftClickRowIndex = 0
      onChangeRowSelection(rowSelection, newlySelected, [])
    }
  }

  handleSortOrderChange = (order, column) => {
    if (this.props.onChangeSort) {
      const sort = _cloneDeep(this.props.sort)
      sort.order = order
      sort.column = column
      this.props.onChangeSort(sort, order, column)
    }
  }

  handleRowUnselectAll = rowKeys => {
    const { onChangeRowSelection } = this.props

    if (onChangeRowSelection) {
      const rowSelection = _cloneDeep(this.props.rowSelection)
      const selected = rowSelection.selected || []
      const unselected = rowKeys
      // Remove the rows from selected array that are in unselected array
      for (let i = selected.length - 1; i >= 0; i--) {
        if (unselected.indexOf(selected[i]) >= 0) {
          selected.splice(i, 1)
        }
      }
      rowSelection.selected = selected
      this.shiftClickRowIndex = 0
      onChangeRowSelection(rowSelection, [], unselected)
    }
  }

  handleEditDataChange = (value, rowData, column) => {
    const { columnKey, dataSource, editDirect, editRow } = this.props

    if (editRow) {
      if (!this.initialDataSource) {
        this.initialDataSource = _cloneDeep(dataSource)
      }
      // If edit row mode, store the row data until user submits the change
      this.editRowData = this.editRowData || _cloneDeep(rowData)
      this.editRowData[column[columnKey]] = value
    } else if (editDirect) {
      this._handleEditDirectDataChange(value, rowData, column)
    }
  }

  handleEditRowCancelClick = () => {
    const editRow = _cloneDeep(this.props.editRow)
    editRow.row = null

    // Cancelling should empty out the cell alerts
    const cellAlerts = []
    if (this.props.onClickEditRowCancel) {
      const dataSource = this.initialDataSource || this.props.dataSource
      this.props.onClickEditRowCancel(dataSource, editRow, cellAlerts)
    }

    this.editRowData = null
    this.initialDataSource = null
  }

  handleEditRowSubmitClick = () => {
    let isValidInput = true
    let cellAlerts = []
    let newRow
    const newData = _cloneDeep(this.props.dataSource)
    if (this.editRowData) {
      newRow = { ...this.editRowData }
      cellAlerts = this._getErrorAlertsForRow(newRow)

      if (cellAlerts.length) {
        isValidInput = false
      }

      // Update newData with newRow data after validation passes
      const { rowKey } = this.props
      for (let i = 0; i < newData.length; i++) {
        if (newData[i][rowKey] === newRow[rowKey]) {
          newData[i] = newRow
          break
        }
      }
    }

    const editRow = _cloneDeep(this.props.editRow)
    if (isValidInput) {
      editRow.row = null
      this.editRowData = null
      this.initialDataSource = null
    }

    if (this.props.onClickEditRowSubmit) {
      // Send new data source with updated row, editRow object for unfocusing the row,
      // cellAlerts object for updated alerts and update row data
      this.props.onClickEditRowSubmit(newData, editRow, cellAlerts, newRow)
    }
  }

  _handleEditDirectDataChange(value, rowData, column) {
    const { columnKey, editDirect, rowKey } = this.props

    const columnKeyVal = column[columnKey]
    const newData = _cloneDeep(this.props.dataSource)
    let newRowData
    for (let i = 0; i < newData.length; i++) {
      if (newData[i][rowKey] === rowData[rowKey]) {
        newRowData = newData[i]
        newRowData[columnKeyVal] = value
        break
      }
    }

    if (this.props.onChangeEditDirectData) {
      const cellAlert = this._getErrorAlertForCell(
        newRowData,
        columnKeyVal,
        editDirect.columnConfigs[columnKeyVal].validations
      )

      const newCellAlerts = this.props.cellAlerts
        ? _cloneDeep(this.props.cellAlerts)
        : []
      let isNewCellAlert = true
      for (let i = 0; i < newCellAlerts.length; i++) {
        const newCellAlert = newCellAlerts[i]
        if (
          newCellAlert.row === rowData[rowKey] &&
          newCellAlert.column === columnKeyVal
        ) {
          isNewCellAlert = false
          if (cellAlert) {
            newCellAlerts[i] = cellAlert
          } else {
            // If cellAlert is not defined, but there is a cell alert in cellAlerts array,
            // we need to remove it from the array because the alert has been resolved
            newCellAlerts.splice(i, 1)
          }

          break
        }
      }
      if (isNewCellAlert && cellAlert) {
        newCellAlerts.push(cellAlert)
      }
      // Reset the cell alerts
      this.props.onChangeEditDirectData(newData, newCellAlerts, newRowData)
    }
  }

  _getErrorAlertsForRow(row) {
    const { editRow } = this.props
    const cellAlerts = []
    if (editRow.columnConfigs) {
      _each(editRow.columnConfigs, (columnConfig, columnKeyVal) => {
        const cellAlert = this._getErrorAlertForCell(
          row,
          columnKeyVal,
          columnConfig.validations
        )
        if (cellAlert) {
          cellAlerts.push(cellAlert)
        }
      })
    }
    return cellAlerts
  }

  _getErrorAlertForCell(row, columnKeyVal, validations) {
    const { rowKey } = this.props
    const cellValue = row[columnKeyVal]
    let cellAlert

    if (validations) {
      _each(validations, (ruleArg, rule) => {
        const isValid = ValidationUtil.validate(cellValue, rule, ruleArg, row)
        if (!isValid) {
          cellAlert = {
            row: row[rowKey],
            column: columnKeyVal,
            type: TableConstants.TABLE_ALERT.ERROR,
            message: validations.message
          }
          return false
        }
      })
    }

    return cellAlert
  }
}

Table.defaultProps = {
  border: true,
  columnKey: 'key',
  rowKey: 'key',
  loading: false
}

Table.propTypes = {
  /** */
  className: PropTypes.string,
  /** */
  border: PropTypes.bool,
  /** */
  cellAlerts: PropTypes.arrayOf(
    PropTypes.shape({
      /** */
      row: PropTypes.string,
      /** */
      column: PropTypes.string,
      /** */
      type: PropTypes.oneOf([
        Table.TABLE_ALERT.ERROR,
        Table.TABLE_ALERT.WARNING
      ]),
      /** */
      message: PropTypes.string
    })
  ),
  /** */
  columnKey: PropTypes.string,
  /** */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      /** */
      title: PropTypes.string,
      /** */
      key: PropTypes.string,
      /** */
      textAlign: PropTypes.oneOf(['left', 'right', 'center']),
      /**
       * Render function used to render cells
       * @param {Object} cellData - Data of cell to be rendered
       * @param {Object} rowData - Data of row to be rendered
       * @param {number} rowIndex - Index of row to be rendered
       * @returns {ReactElement}
       */
      render: PropTypes.func,
      /** */
      group: PropTypes.arrayOf(PropTypes.object)
    })
  ).isRequired,
  /** */
  customProps: PropTypes.shape({
    /** */
    cellProps: PropTypes.func,
    /** */
    headerProps: PropTypes.func,
    /** */
    rowProps: PropTypes.func
  }),
  /** */
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  /** */
  editDirect: PropTypes.shape({
    /** */
    columnConfigs: PropTypes.objectOf(
      PropTypes.shape({
        /** */
        type: PropTypes.oneOf([
          Table.CELL_EDIT_TYPES.INPUT,
          Table.CELL_EDIT_TYPES.SELECT
        ]),
        /** */
        inputProps: PropTypes.func,
        /** */
        selectProps: PropTypes.func,
        /** */
        validations: PropTypes.shape({
          /** */
          required: PropTypes.bool,
          /** */
          type: PropTypes.oneOf(_values(ValidationUtil.TYPE)),
          /** */
          message: PropTypes.string
        })
      })
    )
  }),
  /** */
  loading: PropTypes.bool,
  /** */
  loadingError: PropTypes.bool,
  /** */
  onChangeEditDirectData: PropTypes.func,
  /** */
  onChangeRowExpand: PropTypes.func,
  /** */
  onChangeRowSelection: PropTypes.func,
  /** */
  onChangeSort: PropTypes.func,
  /** */
  rowAction: PropTypes.shape({
    /**
     * Array of actions or Function used to generate list of actions for a row.
     * @param {Object} rowData - Data of row to display actions on
     * @param {number} rowIndex - Index of row to display actions on
     * @returns {Array} - actions array of objects with key, value and menuItemProps properties
     */
    actions: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.shape({
          key: PropTypes.string,
          value: PropTypes.string,
          menuItemProps: MenuItem.propTypes
        })
      ),
      PropTypes.func
    ]),
    /**
     * Function to execute when action has been triggered
     * @param {string} key - The key that triggered the action
     * @param {Object} rowData - Data of row to perform action on
     * @param {number} rowIndex - Index of row to perform action on
     */
    onRowAction: PropTypes.func,
    getPopupContainer: PropTypes.func
  }),
  /** */
  rowExpand: PropTypes.shape({
    /** */
    isNestedTable: PropTypes.bool,
    /** */
    render: PropTypes.func,
    /** */
    rows: PropTypes.arrayOf(PropTypes.string)
  }),
  /** */
  rowKey: PropTypes.string,
  /** */
  rowSelection: PropTypes.shape({
    /**
     * List of rows that are selected
     */
    selected: PropTypes.arrayOf(PropTypes.string),
    /**
     * Type of row selection to be displayed (Use Table.ROW\_SELECTION\_TYPES constants)
     */
    type: PropTypes.oneOf([
      Table.ROW_SELECTION_TYPES.CHECKBOX,
      Table.ROW_SELECTION_TYPES.RADIO
    ])
  }),
  /** */
  search: PropTypes.shape({
    /**
     * See InputSearch props for more details
     */
    inputSearchProps: PropTypes.object
  }),
  /** */
  sort: PropTypes.shape({
    /**
     * Current sorted order (Use Sorter.SORT\_ORDER\_CONST constants)
     */
    order: PropTypes.oneOf([
      Sorter.SORT_ORDER_CONST.ASCEND,
      Sorter.SORT_ORDER_CONST.DESCEND,
      Sorter.SORT_ORDER_CONST.NONE
    ]),
    /**
     * Current sorted column
     */
    column: PropTypes.string,
    /**
     * List of column keys for sortable columns
     */
    sortable: PropTypes.arrayOf(PropTypes.string),
    /**
     * See Sorter component for more details
     */
    type: PropTypes.string
  }),
  /** */
  structure: PropTypes.shape({
    /** */
    bodyMaxHeight: PropTypes.string,
    /** */
    columnResize: PropTypes.bool,
    /** */
    columnWidths: PropTypes.objectOf(PropTypes.string),
    /** */
    hideHeader: PropTypes.bool
  }),
  /** */
  topSection: PropTypes.shape({
    /** */
    title: PropTypes.string,
    /** */
    leftContent: PropTypes.node,
    /** */
    rightContent: PropTypes.node
  })
}

export default Table
