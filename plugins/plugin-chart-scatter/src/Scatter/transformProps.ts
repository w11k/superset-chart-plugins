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
import { CategoricalColorNamespace, DataRecord, getMetricLabel } from '@superset-ui/core';
import { defaultGrid } from '@superset-ui/plugin-chart-echarts/lib/defaults';
import {
  getColtypesMapping,
  getLegendProps,
} from '@superset-ui/plugin-chart-echarts/lib/utils/series';
import { EChartsOption, LineSeriesOption, registerTransform, ScatterSeriesOption } from 'echarts';
import { transform } from 'echarts-stat';
import { DatasetOption, TopLevelFormatterParams } from 'echarts/types/dist/shared';
import {
  DEFAULT_FORM_DATA as DEFAULT_RADAR_FORM_DATA,
  EchartsScatterChartProps,
  EchartsScatterFormData,
  RadarChartTransformedProps,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA } from '../types';

registerTransform(transform.regression);

export default function transformProps(
  chartProps: EchartsScatterChartProps,
): RadarChartTransformedProps {
  const { formData, height, width, queriesData } = chartProps;
  const coltypeMapping = getColtypesMapping(queriesData[0]);

  const {
    colorScheme,
    groupby,
    legendOrientation,
    legendType,
    showLegend,
    x,
    y,
    size,
    maxBubbleSize,
    minBubbleSize,
    metric = '',
    regression,
    showRegression,
    showHighlighting,
  }: EchartsScatterFormData = {
    ...DEFAULT_LEGEND_FORM_DATA,
    ...DEFAULT_RADAR_FORM_DATA,
    ...formData,
  };
  const metricsLabel = getMetricLabel(metric);
  const rawData = queriesData[0].data;

  const maxSize = parseInt(maxBubbleSize, 10);
  const minSize = parseInt(minBubbleSize, 10);
  const minValue = rawData.reduce((result, datum) => Math.min(result, datum[size] as number), 0);
  const maxValue = rawData.reduce((result, datum) => Math.max(result, datum[size] as number), 0);

  console.log('data', queriesData); // eslint-disable-line no-console
  console.log('coltypeMapping', coltypeMapping); // eslint-disable-line no-console
  console.log('groupby', groupby); // eslint-disable-line no-console
  console.log('metricsLabel', metricsLabel); // eslint-disable-line no-console
  console.log('formData', formData); // eslint-disable-line no-console
  console.log('xField', x); // eslint-disable-line no-console
  console.log('yField', y); // eslint-disable-line no-console
  console.log('sizeField', size); // eslint-disable-line no-console

  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);

  function buildSeries(seriesName: string, datasetIndex: number): ScatterSeriesOption {
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
    };
  }

  const sourceDataSet: any[] = rawData.map((datum: DataRecord) => [
    datum[x],
    datum[y],
    datum[size],
    ...groupby.map(group => datum[group]),
  ]);
  console.log('sourceDataSet', sourceDataSet);

  const allGroups = rawData.map(datum => datum[groupby[0]] as string);
  const uniqueGroups = Array.from(new Set(allGroups).values());
  console.log('uniqueGroups', uniqueGroups);

  const scatterTransforms: DatasetOption[] = [];
  const scatterSeries: ScatterSeriesOption[] = [];
  uniqueGroups.forEach((group, index) => {
    const s = buildSeries(group, index + 1);
    scatterSeries.push(s);

    const dataTransform: DatasetOption = {
      transform: {
        type: 'filter',
        config: { dimension: 3, eq: group },
      },
    };
    scatterTransforms.push(dataTransform);
  });

  const regressionSeries: LineSeriesOption = {
    name: 'Regression',
    type: 'line',
    datasetIndex: scatterSeries.length + 1,
    symbolSize: 0.1,
    symbol: 'circle',
    labelLayout: { dx: -20 },
    encode: { label: 2, tooltip: 1 },
  };

  const series: (ScatterSeriesOption | LineSeriesOption)[] = [...scatterSeries];
  if (showRegression) {
    series.push(regressionSeries);
  }

  const regressionTransform = {
    transform: {
      type: 'ecStat:regression',
      config: {
        method: regression,
      },
    },
  };

  const transforms: DatasetOption[] = [...scatterTransforms];
  if (showRegression) {
    transforms.push(regressionTransform);
  }

  const echartOptions: EChartsOption = {
    grid: {
      ...defaultGrid,
    },
    legend: {
      ...getLegendProps(legendType, legendOrientation, showLegend),
    },
    xAxis: {},
    yAxis: {},
    series,
    visualMap: {
      show: false,
      dimension: 2,
      min: minValue,
      max: maxValue,
      seriesIndex: [0, 1],
      inRange: {
        symbolSize: [minSize, maxSize],
      },
    },
    tooltip: {
      trigger: 'item',
      showDelay: 0,
      formatter: (params: TopLevelFormatterParams) => {
        if (!Array.isArray(params)) {
          const { value, name } = params;
          const parsedValue = value as number[];
          return `${name}<br>
                    ${x}：${parsedValue[1]}<br>
                    ${y}：${parsedValue[0]}<br>
                    ${size}：${parsedValue[2]}<br>`;
        }
        throw new Error('cannot format tooltip');
      },
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
