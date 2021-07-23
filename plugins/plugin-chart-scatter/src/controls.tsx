import React from 'react';
import { t } from '@superset-ui/core';
import { ControlPanelsContainerProps } from '@superset-ui/chart-controls';
import { DEFAULT_LEGEND_FORM_DATA } from './types';

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
const { legendMargin, legendOrientation, legendType, showLegend, showRegression, regression } =
  DEFAULT_LEGEND_FORM_DATA;

const showLegendControl = {
  name: 'show_legend',
  config: {
    type: 'CheckboxControl',
    label: t('Show legend'),
    renderTrigger: true,
    default: showLegend,
    description: t('Whether to display a legend for the chart'),
  },
};

const legendMarginControl = {
  name: 'legendMargin',
  config: {
    type: 'TextControl',
    label: t('Margin'),
    renderTrigger: true,
    isInt: true,
    default: legendMargin,
    description: t('Additional padding for legend.'),
    visibility: ({ controls }: ControlPanelsContainerProps) =>
      Boolean(controls?.show_legend?.value),
  },
};

const legendTypeControl = {
  name: 'legendType',
  config: {
    type: 'SelectControl',
    freeForm: false,
    label: 'Type',
    choices: [
      ['scroll', 'Scroll'],
      ['plain', 'Plain'],
    ],
    default: legendType,
    renderTrigger: true,
    description: t('Legend type'),
    visibility: ({ controls }: ControlPanelsContainerProps) =>
      Boolean(controls?.show_legend?.value),
  },
};

const legendOrientationControl = {
  name: 'legendOrientation',
  config: {
    type: 'SelectControl',
    freeForm: false,
    label: 'Orientation',
    choices: [
      ['top', 'Top'],
      ['bottom', 'Bottom'],
      ['left', 'Left'],
      ['right', 'Right'],
    ],
    default: legendOrientation,
    renderTrigger: true,
    description: t('Legend type'),
    visibility: ({ controls }: ControlPanelsContainerProps) =>
      Boolean(controls?.show_legend?.value),
  },
};

export const legendSection = [
  [<h1 className="section-header">{t('Legend')}</h1>],
  [showLegendControl],
  [legendTypeControl],
  [legendOrientationControl],
  [legendMarginControl],
];

const showRegressionControl = {
  name: 'show_regression',
  config: {
    type: 'CheckboxControl',
    label: t('Show regression'),
    renderTrigger: true,
    default: showRegression,
    description: t('Whether to display a regression for the chart'),
  },
};

const regressionSelectControl = {
  name: 'regression',
  config: {
    type: 'SelectControl',
    freeForm: false,
    label: 'Regression',
    choices: [
      ['linear', 'Linear'],
      ['exponential', 'Exponential'],
      ['logarithmic', 'Logarithmic'],
      ['polynomial', 'Polynomial'],
    ],
    default: regression,
    renderTrigger: true,
    description: t('Regression'),
    visibility: ({ controls }: ControlPanelsContainerProps) =>
      Boolean(controls?.show_regression?.value),
  },
};

export const regressionSection = [
  [<h1 className="section-header">{t('Regression')}</h1>],
  [showRegressionControl],
  [regressionSelectControl],
];
