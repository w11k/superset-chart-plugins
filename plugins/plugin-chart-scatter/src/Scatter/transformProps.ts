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
  extractGroupbyLabel,
  getColtypesMapping,
  getLegendProps,
} from '@superset-ui/plugin-chart-echarts/lib/utils/series';
import { EChartsOption, ScatterSeriesOption } from 'echarts';
import { TopLevelFormatterParams } from 'echarts/types/dist/shared';
import { ScatterDataItemOption } from 'echarts/types/src/chart/scatter/ScatterSeries';
import {
  DEFAULT_FORM_DATA as DEFAULT_RADAR_FORM_DATA,
  EchartsScatterChartProps,
  EchartsScatterFormData,
  RadarChartTransformedProps,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA } from '../types';

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

  function transformData(datum: DataRecord) {
    const joinedName = extractGroupbyLabel({
      datum,
      groupby,
      coltypeMapping,
    });
    return {
      value: [datum[x], datum[y], datum[size]],
      name: joinedName,
      id: joinedName,
    } as ScatterDataItemOption;
  }

  // const regressionData = ecStat.regression('polynomial', transformedData, 3);

  function projectNumberToBubbleSize(
    value: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number,
  ) {
    return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }

  function buildSeries(
    seriesName: string,
    seriesData: ScatterDataItemOption[],
  ): ScatterSeriesOption {
    return {
      name: seriesName,
      type: 'scatter',
      animation: false,
      emphasis: {
        focus: 'series',
      },
      color: colorFn(seriesName),
      symbolSize: data => {
        const size = data[2];
        return projectNumberToBubbleSize(size, minValue, maxValue, minSize, maxSize);
      },
      data: seriesData,
    };
  }

  const seriesMap = rawData.reduce(
    (result: { [group: string]: ScatterDataItemOption[] }, datum) => {
      const transformed = transformData(datum);
      const key = datum[groupby[0]] as string;
      return {
        ...result,
        [key]: ([] as ScatterDataItemOption[]).concat(result[key] ?? [], transformed),
      };
    },
    {},
  );

  const series: ScatterSeriesOption[] = [];
  Object.entries(seriesMap).forEach(([seriesName, transformedData]) => {
    const s = buildSeries(seriesName, transformedData);
    series.push(s);
  });

  // const regressionSeries: LineSeriesOption[] = [
  //   {
  //     name: 'line',
  //     type: 'line',
  //     datasetIndex: 1,
  //     symbolSize: 0.1,
  //     symbol: 'circle',
  //     labelLayout: { dx: -20 },
  //     encode: { label: 2, tooltip: 1 },
  //   },
  // ];

  const echartOptions: EChartsOption = {
    grid: {
      ...defaultGrid,
    },
    legend: {
      ...getLegendProps(legendType, legendOrientation, showLegend),
    },
    xAxis: {},
    yAxis: {},
    series: [...series /* , ...regressionSeries */],
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
    // dataset: [
    //   {
    //     source: transformedData,
    //   },
    //   {
    //     source: regressionData.points,
    //   },
    // ],
  };

  console.log('echartOptions', echartOptions); // eslint-disable-line no-console

  return {
    formData,
    width,
    height,
    echartOptions,
  };
}
