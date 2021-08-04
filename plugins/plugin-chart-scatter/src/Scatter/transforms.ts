import { ScatterSeriesOption } from 'echarts';
import { CategoricalColorScale } from '@superset-ui/core';

export function buildScatterSeries(
  seriesName: string,
  datasetIndex: number,
  colorFn: CategoricalColorScale,
  showHighlighting: boolean,
  showLabels: boolean,
): ScatterSeriesOption {
  return {
    name: seriesName,
    type: 'scatter',
    datasetIndex,
    animation: false,
    emphasis: showHighlighting
      ? {
          focus: 'series',
        }
      : undefined,
    color: colorFn(seriesName),
    label: {
      show: showLabels,
      formatter: '{a}',
      minMargin: 10,
      position: 'top',
    },
  };
}
