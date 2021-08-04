/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  CategoricalColorNamespace,
  DataRecord,
  getMetricLabel,
  getNumberFormatter,
} from '@superset-ui/core';
import { defaultGrid } from '@superset-ui/plugin-chart-echarts/lib/defaults';
import { getLegendProps } from '@superset-ui/plugin-chart-echarts/lib/utils/series';
import { EChartsOption, LineSeriesOption, registerTransform, ScatterSeriesOption } from 'echarts';
import { transform } from 'echarts-stat';
import { DatasetOption, TopLevelFormatterParams } from 'echarts/types/dist/shared';
import { DataRecordValue } from '@superset-ui/core/lib/query/types/QueryResponse';
import { OptionDataValue, OptionSourceDataArrayRows } from 'echarts/types/src/util/types';
import {
  DEFAULT_FORM_DATA,
  EchartsScatterChartProps,
  EchartsScatterFormData,
  ScatterChartTransformedProps,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA } from '../types';
import { buildScatterSeries, scaleNumberToBubbleSize } from './transforms';

registerTransform(transform.regression);

const X_DIMENSION = 0;
const Y_DIMENSION = 1;
const BUBBLE_SIZE_DIMENSION = 2;
const NAME_DIMENSION = 3;

export default function transformProps(
  chartProps: EchartsScatterChartProps,
): ScatterChartTransformedProps {
  const { formData, height, width, queriesData } = chartProps;

  const {
    colorScheme,
    groupby,
    legendOrientation,
    legendType,
    showLegend,
    showLabels,
    x,
    y,
    size,
    maxBubbleSize,
    minBubbleSize,
    regression,
    showRegression,
    showRegressionLabel,
    showHighlighting,
    xAxisTitle,
    xAxisFormat,
    yAxisTitle,
    yAxisFormat,
  }: EchartsScatterFormData = {
    ...DEFAULT_LEGEND_FORM_DATA,
    ...DEFAULT_FORM_DATA,
    ...formData,
  };
  const rawData = queriesData[0].data;

  const xField = getMetricLabel(x);
  const yField = getMetricLabel(y);
  const sizeField = getMetricLabel(size);

  const maxBubbleSizeInt = parseInt(maxBubbleSize, 10);
  const minBubbleSizeInt = parseInt(minBubbleSize, 10);
  const minBubbleValue = rawData.reduce(
    (result, datum) => Math.min(result, datum[sizeField] as number),
    0,
  );
  const maxBubbleValue = rawData.reduce(
    (result, datum) => Math.max(result, datum[sizeField] as number),
    0,
  );

  function symbolSizeFn(params: number[]) {
    const size = params[BUBBLE_SIZE_DIMENSION];
    return scaleNumberToBubbleSize(
      size,
      minBubbleValue,
      maxBubbleValue,
      minBubbleSizeInt,
      maxBubbleSizeInt,
    );
  }

  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);

  const sourceDataSet: OptionSourceDataArrayRows = rawData.map(
    (datum: DataRecord) =>
      [
        datum[xField],
        datum[yField],
        datum[sizeField],
        ...groupby.map(group => datum[group]),
      ] as OptionDataValue[],
  );

  const allGroups = rawData.map(datum => datum[groupby[0]] as string);
  const uniqueGroups = Array.from(new Set(allGroups).values());

  const scatterSeries: ScatterSeriesOption[] = uniqueGroups.map((group, index) =>
    buildScatterSeries(group, index + 1, colorFn, showHighlighting, showLabels, symbolSizeFn),
  );

  const scatterTransforms: DatasetOption[] = uniqueGroups.map(group => ({
    transform: {
      type: 'filter',
      config: { dimension: NAME_DIMENSION, eq: group },
    },
  }));

  const series: (ScatterSeriesOption | LineSeriesOption)[] = [...scatterSeries];
  if (showRegression) {
    const regressionSeries: LineSeriesOption = {
      name: 'Regression',
      type: 'line',
      datasetIndex: series.length + 1,
      symbolSize: 0.1,
      symbol: 'circle',
      smooth: true,
      label: {
        show: showRegressionLabel,
      },
      labelLayout: { dx: -20 },
      encode: { label: 2, tooltip: 1 },
    };
    series.push(regressionSeries);
  }

  const transforms: DatasetOption[] = [...scatterTransforms];
  if (showRegression) {
    const regressionTransform = {
      transform: {
        type: 'ecStat:regression',
        config: {
          method: regression,
        },
      },
    };
    transforms.push(regressionTransform);
  }

  const xAxisFormatter = getNumberFormatter(xAxisFormat);
  const yAxisFormatter = getNumberFormatter(yAxisFormat);

  function tooltipFormatter(params: TopLevelFormatterParams) {
    if (!Array.isArray(params)) {
      const { value } = params;
      const parsedValue = value as DataRecordValue[];
      const seriesNames = parsedValue.slice(NAME_DIMENSION, parsedValue.length);
      return `${seriesNames.join(' - ')}<br>
                    ${xField}：${parsedValue[X_DIMENSION]}<br>
                    ${yField}：${parsedValue[Y_DIMENSION]}<br>
                    ${sizeField}：${parsedValue[BUBBLE_SIZE_DIMENSION]}<br>`;
    }
    throw new Error('cannot format tooltip');
  }

  const echartOptions: EChartsOption = {
    grid: {
      ...defaultGrid,
    },
    legend: {
      ...getLegendProps(legendType, legendOrientation, showLegend),
    },
    xAxis: {
      name: xAxisTitle,
      axisLabel: { formatter: xAxisFormatter },
    },
    yAxis: {
      name: yAxisTitle,
      axisLabel: { formatter: yAxisFormatter },
    },
    series,
    tooltip: {
      trigger: 'item',
      showDelay: 0,
      formatter: tooltipFormatter,
    },
    dataset: [
      {
        source: sourceDataSet,
      },
      ...transforms,
    ],
  };

  console.log('echartOptions', echartOptions); // eslint-disable-line no-console

  return {
    formData,
    width,
    height,
    echartOptions,
  };
}
