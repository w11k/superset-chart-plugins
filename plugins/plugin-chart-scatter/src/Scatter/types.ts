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
} from '@superset-ui/core';
import {
  DEFAULT_LEGEND_FORM_DATA,
  EchartsLegendFormData,
  LegendOrientation,
  LegendType,
} from '../types';

type RadarColumnConfig = Record<string, { radarMetricMaxValue?: number }>;

export type EchartsScatterFormData = QueryFormData &
  EchartsLegendFormData & {
    colorScheme?: string;
    columnConfig?: RadarColumnConfig;
    currentOwnValue?: string[] | null;
    currentValue?: string[] | null;
    defaultValue?: string[] | null;
    groupby: string[];
    metrics: QueryFormMetric[];
    showLabels: boolean;
    isCircle: boolean;
    numberFormat: string;
    dateFormat: string;
    emitFilter: boolean;
    x: string;
    y: string;
    size: string;
    series: string;
    entity: string;
  };

export interface EchartsScatterChartProps extends ChartProps {
  formData: EchartsScatterFormData;
  queriesData: ChartDataResponseResult[];
}

// @ts-ignore
export const DEFAULT_FORM_DATA: EchartsScatterFormData = {
  ...DEFAULT_LEGEND_FORM_DATA,
  groupby: [],
  legendOrientation: LegendOrientation.Top,
  legendType: LegendType.Scroll,
  numberFormat: 'SMART_NUMBER',
  showLabels: true,
  emitFilter: false,
  dateFormat: 'smart_date',
  isCircle: false,
};

export interface RadarChartTransformedProps {
  formData: EchartsScatterFormData;
  height: number;
  width: number;
  echartOptions: EChartsOption;
}
