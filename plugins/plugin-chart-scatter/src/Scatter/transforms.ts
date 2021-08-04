import { ScatterSeriesOption } from 'echarts';
import { CategoricalColorScale } from '@superset-ui/core';

export function buildScatterSeries(
  seriesName: string,
  datasetIndex: number,
  colorFn: CategoricalColorScale,
  showHighlighting: boolean,
  showLabels: boolean,
  symbolSizeFn: (params: number[]) => number,
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
    symbolSize: symbolSizeFn,
  };
}

export function scaleNumberToBubbleSize(
  value: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number,
) {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
