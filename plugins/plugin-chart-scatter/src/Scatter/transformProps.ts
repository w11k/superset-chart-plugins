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
import { DataRecordValue, getMetricLabel } from '@superset-ui/core';
import { defaultGrid } from '@superset-ui/plugin-chart-echarts/lib/defaults';
import {
  extractGroupbyLabel,
  getColtypesMapping,
  getLegendProps,
} from '@superset-ui/plugin-chart-echarts/lib/utils/series';
import { EChartsOption, LineSeriesOption, ScatterSeriesOption } from 'echarts';
import * as ecStat from 'echarts-stat';
import { TopLevelFormatterParams } from 'echarts/types/dist/shared';
import {
  DEFAULT_FORM_DATA as DEFAULT_RADAR_FORM_DATA,
  EchartsScatterChartProps,
  EchartsScatterFormData,
  RadarChartTransformedProps,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA } from '../types';
// import { getColtypesMapping, getLegendProps } from '../utils/series';
// import { defaultGrid } from '../defaults';

export default function transformProps(
  chartProps: EchartsScatterChartProps,
): RadarChartTransformedProps {
  const { formData, height, width, queriesData } = chartProps;
  const coltypeMapping = getColtypesMapping(queriesData[0]);

  const {
    groupby,
    legendOrientation,
    legendType,
    showLegend,
    x,
    y,
    size,
    entity,
    maxBubbleSize,
    minBubbleSize,
    // metrics = [],
    metric = '',
  }: EchartsScatterFormData = {
    ...DEFAULT_LEGEND_FORM_DATA,
    ...DEFAULT_RADAR_FORM_DATA,
    ...formData,
  };
  // const metricsLabel = metrics.map(metric => getMetricLabel(metric));
  const metricsLabel = getMetricLabel(metric);
  const rawData = queriesData[0].data;

  console.log('data', queriesData); // eslint-disable-line no-console
  console.log('coltypeMapping', coltypeMapping); // eslint-disable-line no-console
  console.log('groupby', groupby); // eslint-disable-line no-console
  console.log('metricsLabel', metricsLabel); // eslint-disable-line no-console
  console.log('formData', formData); // eslint-disable-line no-console
  console.log('xField', x); // eslint-disable-line no-console
  console.log('yField', y); // eslint-disable-line no-console
  console.log('sizeField', size); // eslint-disable-line no-console

  const columnsLabelMap = new Map<string, DataRecordValue[]>();

  // const transformedData = [
  //   [10.0, 8.04],
  //   [8.07, 6.95],
  //   [13.0, 7.58],
  //   [9.05, 8.81],
  //   [11.0, 8.33],
  //   [14.0, 7.66],
  //   [13.4, 6.81],
  //   [10.0, 6.33],
  //   [14.0, 8.96],
  //   [12.5, 6.82],
  //   [9.15, 7.2],
  //   [11.5, 7.2],
  //   [3.03, 4.23],
  //   [12.2, 7.83],
  //   [2.02, 4.47],
  //   [1.05, 3.33],
  //   [4.05, 4.96],
  //   [6.03, 7.24],
  //   [12.0, 6.26],
  //   [12.0, 8.84],
  //   [7.08, 5.82],
  //   [5.02, 5.68],
  // ];

  const transformedData: any[] = [];
  rawData.forEach(datum => {
    // generate transformedData
    const joinedName = extractGroupbyLabel({
      datum,
      groupby,
      coltypeMapping,
    });
    transformedData.push([datum[x], datum[y], datum[size], joinedName]);
    // transformedData.push({
    //   value: [datum[x], datum[y], datum[size], datum[entity]],
    //   name: datum[entity],
    // value: metricsLabel.map(metricLabel => datum[metricLabel]),
    // name: joinedName,
    // itemStyle: {
    //   color: colorFn(joinedName),
    //   opacity: isFiltered ? OpacityEnum.Transparent : OpacityEnum.NonTransparent,
    // },
    // lineStyle: {
    //   opacity: isFiltered ? OpacityEnum.SemiTransparent : OpacityEnum.NonTransparent,
    // },
    // label: {
    //   show: showLabels,
    //   position: labelPosition,
    //   formatter,
    // },
    // } as ScatterDataItemOption);
  });

  const regressionData = ecStat.regression('polynomial', transformedData, 3);

  const maxSize = parseInt(maxBubbleSize, 10);
  const minSize = parseInt(minBubbleSize, 10);
  const minValue = transformedData.reduce((result, datum) => Math.min(result, datum[2]), 0);
  const maxValue = transformedData.reduce((result, datum) => Math.max(result, datum[2]), 0);

  function projectNumberToBubbleSize(
    value: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number,
  ) {
    return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }

  const series: ScatterSeriesOption[] = [
    {
      type: 'scatter',
      animation: false,
      emphasis: {
        label: {
          show: true,
          fontWeight: 'bold',
          backgroundColor: 'white',
        },
      },
      symbolSize: data => {
        const size = data[2];
        return projectNumberToBubbleSize(size, minValue, maxValue, minSize, maxSize);
      },
    },
  ];

  const regressionSeries: LineSeriesOption[] = [
    {
      name: 'line',
      type: 'line',
      datasetIndex: 1,
      symbolSize: 0.1,
      symbol: 'circle',
      labelLayout: { dx: -20 },
      encode: { label: 2, tooltip: 1 },
    },
  ];

  const echartOptions: EChartsOption = {
    grid: {
      ...defaultGrid,
    },
    legend: {
      ...getLegendProps(legendType, legendOrientation, showLegend),
      data: Array.from(columnsLabelMap.keys()),
    },
    xAxis: {},
    yAxis: {},
    series: [...series, ...regressionSeries],
    tooltip: {
      trigger: 'item',
      showDelay: 0,
      formatter: (params: TopLevelFormatterParams) => {
        if (!Array.isArray(params)) {
          const dataItem = params.data as number[];
          return `${dataItem[3]}: ${dataItem[0]}`;
        }
        throw new Error('cannot format tooltip');
      },
    },
    dataset: [
      {
        source: transformedData,
      },
      {
        source: regressionData.points,
      },
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
