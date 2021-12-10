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
import { EChartsOption } from 'echarts';
import {
  ChartDataResponseResult,
  ChartProps,
  QueryFormData,
  QueryFormMetric,
  QueryMode,
} from '@superset-ui/core';
import { DEFAULT_LEGEND_FORM_DATA, EchartsLegendFormData } from '../types';

export type EchartsScatterFormData = QueryFormData &
  EchartsLegendFormData & {
    colorScheme?: string;
    groupby: string[];
    showLabels: boolean;
    maxBubbleSize: string;
    minBubbleSize: string;
    x: QueryFormMetric;
    xRaw: QueryFormMetric;
    y: QueryFormMetric;
    yRaw: QueryFormMetric;
    size: QueryFormMetric;
    sizeRaw: QueryFormMetric;
    clusterEntity: QueryFormMetric;
    clusterType: string;
    series: string;

    showHighlighting: boolean;
    xAxisLabel: string;
    xAxisFormat: string;
    yAxisLabel: string;
    yAxisFormat: string;
    showRegression: boolean;
    showRegressionLabel: boolean;
    regressionOrder: string;
    regression: 'linear' | 'exponential' | 'logarithmic' | 'polynomial';

    bubbleSize: string;
    useMetricForBubbleSize: boolean;
    useClustering: boolean;
    enableClustering: boolean;
    queryMode: QueryMode;
  };

export interface EchartsScatterChartProps extends ChartProps {
  formData: EchartsScatterFormData;
  queriesData: ChartDataResponseResult[];
}

export const DEFAULT_FORM_DATA: Partial<EchartsScatterFormData> = {
  ...DEFAULT_LEGEND_FORM_DATA,
  groupby: [],
  showLabels: false,
  showHighlighting: false,
  xAxisLabel: '',
  xAxisFormat: '',
  yAxisLabel: '',
  yAxisFormat: '',
  showRegression: false,
  showRegressionLabel: false,
  regression: 'linear',
  useMetricForBubbleSize: false,
  useClustering: false,
};

export interface ScatterChartTransformedProps {
  formData: EchartsScatterFormData;
  height: number;
  width: number;
  echartOptions: EChartsOption;
}
