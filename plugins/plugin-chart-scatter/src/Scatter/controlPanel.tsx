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
import React from 'react';
import { t } from '@superset-ui/core';
import {
  ControlPanelConfig,
  ControlPanelsContainerProps,
  formatSelectOptions,
  sections,
  sharedControls,
} from '@superset-ui/chart-controls';
import { highlightingSection, labelsSection, legendSection, regressionSection } from '../controls';
import { DEFAULT_FORM_DATA } from './types';

const { useMetricForBubbleSize } = DEFAULT_FORM_DATA;

const xAxisControls = [
  [<h1 className="section-header">{t('X Axis')}</h1>],
  [
    {
      name: `x_axis_format`,
      config: {
        ...sharedControls.y_axis_format,
        label: t('x-axis format'),
      },
    },
  ],
  [
    {
      name: 'xAxisTitle',
      config: {
        type: 'TextControl',
        label: t('X Axis title'),
        renderTrigger: true,
        default: '',
        description: t('Title for X-axis'),
      },
    },
  ],
];

const yAxisControls = [
  [<h1 className="section-header">{t('Y Axis')}</h1>],
  [
    {
      name: `y_axis_format`,
      config: {
        ...sharedControls.y_axis_format,
        label: t('y-axis format'),
      },
    },
  ],
  [
    {
      name: 'yAxisTitle',
      config: {
        type: 'TextControl',
        label: t('Y Axis title'),
        renderTrigger: true,
        default: '',
        description: t('Title for y-axis'),
      },
    },
  ],
];

const bubbleSection = [
  [<h1 className="section-header">{t('Bubble')}</h1>],
  [
    {
      name: 'use_metric_for_bubble_size',
      config: {
        type: 'CheckboxControl',
        label: t('Use Metric for Bubble Size'),
        renderTrigger: true,
        default: useMetricForBubbleSize,
        description: t('Whether to choose a metric for Bubble Size'),
      },
    },
  ],
  [
    {
      name: `bubble_size`,
      config: {
        type: 'SelectControl',
        freeForm: true,
        label: t('Bubble Size'),
        default: '5',
        choices: formatSelectOptions(['1', '5', '10', '15', '25', '50', '75', '100']),
        visibility: ({ controls }: ControlPanelsContainerProps) =>
          !controls?.use_metric_for_bubble_size?.value,
      },
    },
  ],
  [
    {
      name: `size`,
      config: {
        ...sharedControls.size,
        label: t('Bubble Size'),
        validators: [],
        visibility: ({ controls }: ControlPanelsContainerProps) =>
          Boolean(controls?.use_metric_for_bubble_size?.value),
      },
    },
  ],
  [
    {
      name: 'min_bubble_size',
      config: {
        type: 'SelectControl',
        freeForm: true,
        label: t('Min Bubble Size'),
        default: '5',
        choices: formatSelectOptions(['1', '5', '10', '15', '25', '50', '75', '100']),
        visibility: ({ controls }: ControlPanelsContainerProps) =>
          Boolean(controls?.use_metric_for_bubble_size?.value),
      },
    },
  ],
  [
    {
      name: 'max_bubble_size',
      config: {
        type: 'SelectControl',
        freeForm: true,
        label: t('Max Bubble Size'),
        default: '25',
        choices: formatSelectOptions(['1', '5', '10', '15', '25', '50', '75', '100']),
        visibility: ({ controls }: ControlPanelsContainerProps) =>
          Boolean(controls?.use_metric_for_bubble_size?.value),
      },
    },
  ],
];

const config: ControlPanelConfig = {
  controlPanelSections: [
    sections.legacyRegularTime,
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['x'],
        ['y'],
        ['groupby'],
        ['adhoc_filters'],
        ...bubbleSection,
        ...regressionSection,
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        ['color_scheme'],
        ...legendSection,
        ...xAxisControls,
        ...yAxisControls,
        ...labelsSection,
        ...highlightingSection,
      ],
    },
  ],
};

export default config;
