import React from 'react'
import PropTypes from 'prop-types'

import FlexLayout from '../Layouts/FlexLayout'

class TableCellLayout extends React.Component {
  render() {
    const { content, before, after } = this.props

    if (content !== undefined) {
      let contentNode = content
      // If content element is not a valid element like a string, wrap it
      // inside a span so it can be returned in this render function
      if (!React.isValidElement(content)) {
        contentNode = <span className="cell-content">{content}</span>
      }
      if (before && !after) {
        return (
          <FlexLayout alignItems="center" itemSpacing="10px">
            {before}
            {contentNode}
          </FlexLayout>
        )
      } else if (!before && after) {
        return (
          <FlexLayout
            alignItems="center"
            itemSpacing="10px"
            justifyContent="space-between"
          >
            {contentNode}
            {after}
          </FlexLayout>
        )
      } else if (before && after) {
        return (
          <FlexLayout
            className="cell-layout-before-after"
            alignItems="center"
            itemSpacing="10px"
          >
            {before}
            {contentNode}
            {after}
          </FlexLayout>
        )
      }
      return contentNode
    }

    return null
  }
}

TableCellLayout.propTypes = {
  /**
   * Main cell content to be rendered
   */
  content: PropTypes.node,
  /**
   * Content to be rendered before main content
   */
  before: PropTypes.node,
  /**
   * Content to be rendered after main content
   */
  after: PropTypes.node
}

export default TableCellLayout
