import { LegendComponentOption, LineSeriesOption, ScatterSeriesOption } from 'echarts';
import { CategoricalColorScale } from '@superset-ui/core';
import { DatasetOption } from 'echarts/types/dist/shared';
import { TIMESERIES_CONSTANTS } from '../../node_modules/@superset-ui/plugin-chart-echarts/lib/constants';
import { EchartsScatterFormData } from './types';
import { LegendOrientation, LegendType } from '../types';

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

export function buildScatterTransforms(uniqueGroups: string[], dimension: number) {
  return uniqueGroups.map(group => ({
    transform: {
      type: 'filter',
      config: { dimension, eq: group },
    },
  }));
}

export function getRegressionSeries(
  datasetIndex: number,
  showRegressionLabel: boolean,
): LineSeriesOption {
  return {
    name: 'Regression',
    type: 'line',
    datasetIndex,
    symbolSize: 0.1,
    symbol: 'circle',
    smooth: true,
    label: {
      show: showRegressionLabel,
    },
    labelLayout: { dx: -20 },
    encode: { label: 2, tooltip: 1 },
  };
}

export function getRegressionTransform(
  regression: EchartsScatterFormData['regression'],
  regressionOrder: number,
): DatasetOption {
  return {
    transform: {
      type: 'ecStat:regression',
      config: {
        method: regression,
        order: regressionOrder,
      },
    },
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

export function getLegendProps(
  type: LegendType,
  orientation: LegendOrientation,
  show: boolean,
  zoomable = false,
): LegendComponentOption | LegendComponentOption[] {
  const legend: LegendComponentOption | LegendComponentOption[] = {
    orient: [LegendOrientation.Top, LegendOrientation.Bottom].includes(orientation)
      ? 'horizontal'
      : 'vertical',
    show,
    type,
  };
  switch (orientation) {
    case LegendOrientation.Left:
      legend.left = 0;
      break;
    case LegendOrientation.Right:
      legend.right = 0;
      legend.top = zoomable ? TIMESERIES_CONSTANTS.legendRightTopOffset : 0;
      break;
    case LegendOrientation.Bottom:
      legend.bottom = 0;
      break;
    case LegendOrientation.Top:
    default:
      legend.top = 0;
      legend.right = zoomable ? TIMESERIES_CONSTANTS.legendTopRightOffset : 0;
      break;
  }
  return legend;
}
