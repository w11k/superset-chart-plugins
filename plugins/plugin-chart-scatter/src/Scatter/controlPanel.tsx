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
import { ensureIsArray, QueryFormColumn, QueryMode, t } from '@superset-ui/core';
import {
  ControlConfig,
  ControlPanelConfig,
  ControlPanelsContainerProps,
  ControlPanelState,
  ControlState,
  ControlStateMapping,
  formatSelectOptions,
  QueryModeLabel,
  sections,
  sharedControls,
} from '@superset-ui/chart-controls';
import { highlightingSection, labelsSection, legendSection, regressionSection } from '../controls';
import { DEFAULT_FORM_DATA } from './types';

export function getQueryMode(controls: ControlStateMapping): QueryMode {
  const mode = controls?.query_mode?.value;
  if (mode === QueryMode.aggregate || mode === QueryMode.raw) {
    return mode as QueryMode;
  }
  const rawColumns = controls?.all_columns?.value as QueryFormColumn[] | undefined;
  const hasRawColumns = rawColumns && rawColumns.length > 0;
  return hasRawColumns ? QueryMode.raw : QueryMode.aggregate;
}

const { useMetricForBubbleSize } = DEFAULT_FORM_DATA;

const requiredEntity = {
  ...sharedControls.entity,
  clearable: false,
};
const optionalEntity = {
  ...sharedControls.entity,
  clearable: true,
  validators: [],
};

const queryMode: ControlConfig<'RadioButtonControl'> = {
  type: 'RadioButtonControl',
  label: t('Query mode'),
  default: null,
  options: [
    [QueryMode.aggregate, QueryModeLabel[QueryMode.aggregate]],
    [QueryMode.raw, QueryModeLabel[QueryMode.raw]],
  ],
  mapStateToProps: ({ controls }) => ({ value: getQueryMode(controls) }),
  rerender: ['x', 'y', 'x_raw', 'y_raw', 'size', 'size_raw'],
};

function isQueryMode(mode: QueryMode) {
  return ({ controls }: Pick<ControlPanelsContainerProps, 'controls'>) =>
    getQueryMode(controls) === mode;
}

const isAggMode = isQueryMode(QueryMode.aggregate);
const isRawMode = isQueryMode(QueryMode.raw);

const validateAggControlValues = (controls: ControlStateMapping, values: any[]) => {
  const areControlsEmpty = values.every(val => ensureIsArray(val).length === 0);
  return areControlsEmpty && isAggMode({ controls })
    ? [t('X and Y Metrics must have a value')]
    : [];
};

const validateRawControlValues = (controls: ControlStateMapping, values: any[]) => {
  const areControlsEmpty = values.every(val => ensureIsArray(val).length === 0);
  return areControlsEmpty && isRawMode({ controls })
    ? [t('X and Y Metrics must have a value')]
    : [];
};

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
        rerender: ['size', 'size_raw', 'min_bubble_size', 'max_bubble_size'],
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
          Boolean(controls?.use_metric_for_bubble_size?.value) && isAggMode({ controls }),
      },
    },
    {
      name: 'size_raw',
      config: {
        ...optionalEntity,
        label: t('Bubble Size'),
        description: t('Size Column for the Bubble'),
        visibility: ({ controls }: ControlPanelsContainerProps) =>
          Boolean(controls?.use_metric_for_bubble_size?.value) && isRawMode({ controls }),
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
        [
          {
            name: 'query_mode',
            config: queryMode,
          },
        ],
        [
          {
            name: 'x_raw',
            config: {
              ...requiredEntity,
              label: t('X Axis'),
              description: t('X Axis Column'),
              visibility: isRawMode,
              validators: [],
              mapStateToProps: (state: ControlPanelState, controlState: ControlState) => {
                const { controls } = state;
                const originalMapStateToProps = sharedControls?.entity?.mapStateToProps;
                // @ts-ignore
                const newState = originalMapStateToProps?.(state, controlState) ?? {};
                newState.externalValidationErrors = validateRawControlValues(controls, [
                  controls.x_raw.value,
                ]);

                return newState;
              },
            },
          },
          {
            name: 'x',
            config: {
              ...sharedControls.x,
              visibility: isAggMode,
              validators: [],
              mapStateToProps: (state: ControlPanelState, controlState: ControlState) => {
                const { controls } = state;
                const originalMapStateToProps = sharedControls?.x?.mapStateToProps;
                // @ts-ignore
                const newState = originalMapStateToProps?.(state, controlState) ?? {};
                newState.externalValidationErrors = validateAggControlValues(controls, [
                  controls.x.value,
                ]);

                return newState;
              },
            },
          },
        ],
        [
          {
            name: 'y_raw',
            config: {
              ...requiredEntity,
              label: t('Y Axis'),
              description: t('Y Axis Column'),
              visibility: isRawMode,
              validators: [],
              mapStateToProps: (state: ControlPanelState, controlState: ControlState) => {
                const { controls } = state;
                const originalMapStateToProps = sharedControls?.entity?.mapStateToProps;
                // @ts-ignore
                const newState = originalMapStateToProps?.(state, controlState) ?? {};
                newState.externalValidationErrors = validateRawControlValues(controls, [
                  controls.y_raw.value,
                ]);

                return newState;
              },
            },
          },
          {
            name: 'y',
            config: {
              ...sharedControls.y,
              visibility: isAggMode,
              validators: [],
              mapStateToProps: (state: ControlPanelState, controlState: ControlState) => {
                const { controls } = state;
                const originalMapStateToProps = sharedControls?.y?.mapStateToProps;
                // @ts-ignore
                const newState = originalMapStateToProps?.(state, controlState) ?? {};
                newState.externalValidationErrors = validateAggControlValues(controls, [
                  controls.y.value,
                ]);

                return newState;
              },
            },
          },
        ],
        [
          {
            name: 'groupby',
            config: {
              ...sharedControls.groupby,
              visibility: isAggMode,
            },
          },
        ],
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
