import _ from 'lodash'
import colors from '!less-to-json-loader!../styles/colors.less'
import chartCategorialColors from '!less-to-json-loader!../styles/chart-categorial-colors.less'
import chartLinearColors from '!less-to-json-loader!../styles/chart-linear-colors.less'

export { colors, chartCategorialColors, chartLinearColors }

export function getChartCategorialColorsByIndex(index) {
  const colorKeys = Object.keys(chartCategorialColors)
  const totalPrimaryColors = colorKeys.length
  const colorIndex = (totalPrimaryColors + index) % totalPrimaryColors
  return chartCategorialColors[colorKeys[colorIndex]]
}

function generateLinearMatrix() {
  const colorMetrics = []
  _.each(chartLinearColors, (colorHash, colorVariable) => {
    const metricIndex = /linear-(\d)-.*/g.exec(colorVariable)[1]
    if (!colorMetrics[metricIndex]) {
      colorMetrics[metricIndex] = []
    }
    colorMetrics[metricIndex].push(colorHash)
  })

  return colorMetrics
}

const linearColorMatrix = generateLinearMatrix()

export function getChartLinearColorByIndex(index, metricLength) {
  return linearColorMatrix[metricLength][index]
}
