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
  QueryMode,
} from '@superset-ui/core';
import { EChartsOption, LineSeriesOption, registerTransform, ScatterSeriesOption } from 'echarts';
// @ts-ignore type information is missing. see: https://github.com/ecomfe/echarts-stat/issues/35
import { transform } from 'echarts-stat';
import {
  DatasetOption,
  PiecewiseVisualMapOption,
  TopLevelFormatterParams,
} from 'echarts/types/dist/shared';
import { DataRecordValue } from '@superset-ui/core/lib/query/types/QueryResponse';
import { OptionDataValue, OptionSourceDataArrayRows } from 'echarts/types/src/util/types';
import {
  buildScatterSeries,
  buildScatterTransforms,
  getLegendProps,
  getRegressionSeries,
  getRegressionTransform,
  scaleNumberToBubbleSize,
  getClusteringTransform,
} from './transforms';
import { defaultGrid } from '../defaults';
import {
  DEFAULT_FORM_DATA,
  EchartsScatterChartProps,
  EchartsScatterFormData,
  ScatterChartTransformedProps,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA } from '../types';

registerTransform(transform.regression);
registerTransform(transform.clustering);

const X_DIMENSION = 0;
const Y_DIMENSION = 1;
const BUBBLE_SIZE_DIMENSION = 2;
const NAME_DIMENSION = 3;
const FALLBACK_SERIES_NAME = 'Data';
const DEFAULT_BUBBLE_SIZE = null;

export default function transformProps(
  chartProps: EchartsScatterChartProps,
): ScatterChartTransformedProps {
  const { formData, height, width, queriesData } = chartProps;

  const {
    colorScheme,
    groupby: _groupby,
    legendOrientation,
    legendType,
    showLegend,
    showLabels,
    x,
    xRaw,
    y,
    yRaw,
    size,
    sizeRaw,
    maxBubbleSize: _maxBubbleSize,
    minBubbleSize: _minBubbleSize,
    bubbleSize: _bubbleSize,
    regression,
    showRegression,
    showRegressionLabel,
    regressionOrder,
    showHighlighting,
    xAxisTitle,
    xAxisFormat,
    yAxisTitle,
    yAxisFormat,
    useMetricForBubbleSize,
    clusterEntity,
    enableClustering,
    clusterType,
    amountOfKmeansCluster,
    queryMode,
  }: EchartsScatterFormData = {
    ...DEFAULT_LEGEND_FORM_DATA,
    ...DEFAULT_FORM_DATA,
    ...formData,
  };

  const rawData = queriesData[0].data;

  const isAggMode = queryMode === QueryMode.aggregate;

  function getSeriesName(name?: DataRecordValue) {
    if (typeof name === 'number') {
      return `${name}`;
    }
    if (typeof name === 'string') {
      return name;
    }
    if (clusterType === 'hierarchical_kmeans' && enableClustering && !isAggMode) {
      return 'Cluster';
    }
    return FALLBACK_SERIES_NAME;
  }

  const xField = isAggMode ? getMetricLabel(x) : getMetricLabel(xRaw);
  const yField = isAggMode ? getMetricLabel(y) : getMetricLabel(yRaw);
  const sizeField = isAggMode ? getMetricLabel(size || '') : getMetricLabel(sizeRaw || '');
  const groupby = isAggMode && _groupby && _groupby.length > 0 ? _groupby : [getSeriesName()];
  const clusteringEntity = getMetricLabel(clusterEntity || '');
  const bubbleSize = parseInt(_bubbleSize, 10);
  const maxBubbleSize = parseInt(_maxBubbleSize, 10);
  const minBubbleSize = parseInt(_minBubbleSize, 10);
  const clusterGroups = parseInt(amountOfKmeansCluster, 10);
  const minBubbleValue = rawData.reduce(
    (result, datum) => Math.min(result, datum[sizeField] as number),
    0,
  );
  const maxBubbleValue = rawData.reduce(
    (result, datum) => Math.max(result, datum[sizeField] as number),
    0,
  );

  const showLegends =
    clusterType === 'hierarchical_kmeans' && enableClustering && !isAggMode ? false : showLegend;

  function symbolSizeFn(params: number[]) {
    if (!useMetricForBubbleSize) {
      return bubbleSize;
    }
    const size = params[BUBBLE_SIZE_DIMENSION];
    return scaleNumberToBubbleSize(
      size,
      minBubbleValue,
      maxBubbleValue,
      minBubbleSize,
      maxBubbleSize,
    );
  }

  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);

  const sourceDataSet: OptionSourceDataArrayRows = rawData.map((datum: DataRecord) => {
    const clustering =
      clusteringEntity != null && !isAggMode
        ? [getSeriesName(datum[clusteringEntity])]
        : groupby.map(group => getSeriesName(datum[group as string]));
    return [
      datum[xField],
      datum[yField],
      datum[sizeField] || DEFAULT_BUBBLE_SIZE,
      ...clustering,
    ] as OptionDataValue[];
  });

  const sourceDataSetDimension = sourceDataSet[0]?.length ? sourceDataSet[0].length : 0;

  const allGroups = rawData.map(datum => {
    if (clusterType === 'cluster_by_entity' && enableClustering && clusterEntity && !isAggMode) {
      return getSeriesName(datum[clusterEntity as string]);
    }
    return getSeriesName(datum[groupby[0]]);
  });

  const uniqueGroups = Array.from(new Set(allGroups).values());

  function getVisualMap(): PiecewiseVisualMapOption[] {
    if (clusterType === 'hierarchical_kmeans' && enableClustering && !isAggMode) {
      const pieces = [];
      for (let i = 0; i < clusterGroups; i += 1) {
        pieces.push({
          value: i,
          label: `${
            clusterType === 'hierarchical_kmeans' && enableClustering && !isAggMode
              ? 'Cluster'
              : FALLBACK_SERIES_NAME
          } - ${i + 1}`,
          color: colorFn(i),
        });
      }

      return [
        {
          type: 'piecewise',
          top: 'top',
          right: 0,
          orient: 'horizontal',
          min: 0,
          max: clusterGroups,
          dimension: sourceDataSetDimension,
          pieces,
          splitNumber: clusterGroups,
          seriesIndex: 0,
        },
      ];
    }
    return [];
  }

  const scatterSeries: ScatterSeriesOption[] = uniqueGroups.map((group, index) =>
    buildScatterSeries(group, index + 1, colorFn, showHighlighting, showLabels, symbolSizeFn),
  );

  const scatterTransforms: DatasetOption[] =
    clusterType === 'hierarchical_kmeans' && enableClustering && !isAggMode
      ? getClusteringTransform(clusterGroups, sourceDataSetDimension)
      : buildScatterTransforms(uniqueGroups, NAME_DIMENSION);

  const series = [
    ...scatterSeries,
    showRegression ? getRegressionSeries(scatterSeries.length + 1, showRegressionLabel) : null,
  ].filter(option => option != null) as (ScatterSeriesOption | LineSeriesOption)[];

  const transforms = [
    ...scatterTransforms,
    showRegression ? getRegressionTransform(regression, parseInt(regressionOrder, 10)) : null,
  ].filter(option => option != null) as DatasetOption[];

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
                    ${
                      useMetricForBubbleSize
                        ? `${sizeField}：${parsedValue[BUBBLE_SIZE_DIMENSION]}<br>`
                        : ''
                    }`;
    }
    return '';
  }

  const echartOptions: EChartsOption = {
    grid: {
      ...defaultGrid,
    },
    legend: {
      ...getLegendProps(legendType, legendOrientation, showLegends),
    },
    xAxis: {
      name: xAxisTitle,
      axisLabel: { formatter: xAxisFormatter },
    },
    yAxis: {
      name: yAxisTitle,
      axisLabel: { formatter: yAxisFormatter },
    },
    visualMap: getVisualMap(),
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

  return {
    formData,
    width,
    height,
    echartOptions,
  };
}
