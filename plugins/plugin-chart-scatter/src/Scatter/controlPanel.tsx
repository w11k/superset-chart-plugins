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
import { QueryFormColumn, QueryMode, t } from '@superset-ui/core';
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

const { useMetricForBubbleSize, useClustering } = DEFAULT_FORM_DATA;

const requiredEntity = {
  ...sharedControls.entity,
  clearable: false,
};
const optionalEntity = {
  ...sharedControls.entity,
  clearable: true,
  validators: [],
};

const scatterRerender = [
  'x',
  'y',
  'x_raw',
  'y_raw',
  'size',
  'size_raw',
  'cluster_entity',
  'cluster_type',
  'enable_clustering',
];

const queryMode: ControlConfig<'RadioButtonControl'> = {
  type: 'RadioButtonControl',
  label: t('Query mode'),
  default: null,
  options: [
    [QueryMode.aggregate, QueryModeLabel[QueryMode.aggregate]],
    [QueryMode.raw, QueryModeLabel[QueryMode.raw]],
  ],
  mapStateToProps: ({ controls }) => ({ value: getQueryMode(controls) }),
  rerender: scatterRerender,
};

function isQueryMode(mode: QueryMode) {
  return ({ controls }: Pick<ControlPanelsContainerProps, 'controls'>) =>
    getQueryMode(controls) === mode;
}

function ClusteringHeader() {
  return <h1 className="section-header">{t('Clustering')}</h1>;
}

const isAggMode = isQueryMode(QueryMode.aggregate);
const isRawMode = isQueryMode(QueryMode.raw);

const validateAggControlValues = (controls: ControlStateMapping, values: any[]) => {
  const areControlsEmpty = values.some(
    v => v === null || typeof v === 'undefined' || v === '' || (Array.isArray(v) && v.length === 0),
  );
  return areControlsEmpty && isAggMode({ controls })
    ? [t('X and Y Metrics must have a value')]
    : [];
};

const validateRawControlValues = (controls: ControlStateMapping, values: any[]) => {
  const areControlsEmpty = values.some(
    v => v === null || typeof v === 'undefined' || v === '' || (Array.isArray(v) && v.length === 0),
  );
  return areControlsEmpty && isRawMode({ controls })
    ? [t('X and Y Metrics must have a value')]
    : [];
};

const validateRawEntityControlValues = (controls: ControlStateMapping) =>
  controls.cluster_type?.value === 'cluster_by_entity' &&
  isRawMode({ controls }) &&
  controls.enable_clustering?.value === true &&
  (controls.cluster_entity?.value === null ||
    typeof controls.cluster_entity?.value === 'undefined' ||
    controls.cluster_entity?.value === '' ||
    (Array.isArray(controls.cluster_entity?.value) && controls.cluster_entity?.value.length === 0))
    ? [t('Entity must have a value')]
    : [];

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

const clusteringSection = [
  [
    {
      name: 'header',
      config: {
        type: ClusteringHeader,
        visibility: isRawMode,
      },
    },
  ],
  [
    {
      name: 'enable_clustering',
      config: {
        type: 'CheckboxControl',
        label: t('Enable Clustering'),
        renderTrigger: false,
        default: useClustering,
        description: t('Whether to enable clustering'),
        visibility: isRawMode,
        rerender: scatterRerender,
      },
    },
  ],
  [
    {
      name: `cluster_type`,
      config: {
        type: 'SelectControl',
        freeForm: false,
        label: t('Clustering Type'),
        choices: formatSelectOptions([
          ['hierarchical_kmeans', 'hierarchical kMeans'],
          ['cluster_by_entity', 'Cluster by Entity'],
        ]),
        visibility: ({ controls }: ControlPanelsContainerProps) =>
          Boolean(controls?.enable_clustering?.value) && isRawMode({ controls }),
        rerender: scatterRerender,
      },
    },
  ],
  [
    {
      name: `cluster_entity`,
      config: {
        ...optionalEntity,
        mapStateToProps: (
          state: ControlPanelState,
          controlState: ControlState,
          dic: Record<string, any> | undefined,
        ) => {
          const { controls } = state;
          const originalMapStateToProps = sharedControls?.entity?.mapStateToProps;
          // @ts-ignore
          const newState = originalMapStateToProps?.(state, controlState, dic) || {};
          newState.externalValidationErrors = validateRawEntityControlValues(controls);

          return newState;
        },
        rerender: scatterRerender,
        visibility: ({ controls }: ControlPanelsContainerProps) =>
          Boolean(controls?.enable_clustering?.value) &&
          Boolean(controls?.cluster_type?.value === 'cluster_by_entity') &&
          isRawMode({ controls }),
      },
    },
  ],
  [
    {
      name: `amount_of_kmeans_cluster`,
      config: {
        type: 'SelectControl',
        freeForm: true,
        label: t('Number of clusters'),
        default: '4',
        choices: formatSelectOptions(['1', '2', '3', '4', '5', '10']),
        visibility: ({ controls }: ControlPanelsContainerProps) =>
          Boolean(controls?.enable_clustering?.value) &&
          Boolean(controls?.cluster_type?.value === 'hierarchical_kmeans') &&
          isRawMode({ controls }),
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
              mapStateToProps: (
                state: ControlPanelState,
                controlState: ControlState,
                dic: Record<string, any> | undefined,
              ) => {
                const { controls } = state;
                const originalMapStateToProps = sharedControls?.entity?.mapStateToProps;
                // @ts-ignore
                const newState = originalMapStateToProps?.(state, controlState, dic) || {};
                newState.externalValidationErrors = validateRawControlValues(controls, [
                  controls.x_raw?.value,
                  controls.y_raw?.value,
                ]);

                return newState;
              },
              rerender: scatterRerender,
            },
          },
          {
            name: 'x',
            config: {
              ...sharedControls.x,
              visibility: isAggMode,
              validators: [],
              mapStateToProps: (
                state: ControlPanelState,
                controlState: ControlState,
                dic: Record<string, any> | undefined,
              ) => {
                const { controls } = state;
                const originalMapStateToProps = sharedControls?.x?.mapStateToProps;
                // @ts-ignore
                const newState = originalMapStateToProps?.(state, controlState, dic) || {};
                // newState.externalValidationErrors = validation;
                newState.externalValidationErrors = validateAggControlValues(controls, [
                  controls.x?.value,
                  controls.y?.value,
                ]);

                return newState;
              },
              rerender: scatterRerender,
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
              mapStateToProps: (
                state: ControlPanelState,
                controlState: ControlState,
                dic: Record<string, any> | undefined,
              ) => {
                const { controls } = state;
                const originalMapStateToProps = sharedControls?.entity?.mapStateToProps;
                // @ts-ignore
                const newState = originalMapStateToProps?.(state, controlState, dic) || {};
                newState.externalValidationErrors = validateRawControlValues(controls, [
                  controls.x_raw?.value,
                  controls.y_raw?.value,
                ]);

                return newState;
              },
              rerender: scatterRerender,
            },
          },
          {
            name: 'y',
            config: {
              ...sharedControls.y,
              visibility: isAggMode,
              validators: [],
              mapStateToProps: (
                state: ControlPanelState,
                controlState: ControlState,
                dic: Record<string, any> | undefined,
              ) => {
                const { controls } = state;
                const originalMapStateToProps = sharedControls?.y?.mapStateToProps;
                // @ts-ignore
                const newState = originalMapStateToProps?.(state, controlState, dic) || {};
                newState.externalValidationErrors = validateAggControlValues(controls, [
                  controls.y?.value,
                  controls.x?.value,
                ]);

                return newState;
              },
              rerender: scatterRerender,
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
        ['row_limit'],
        ['adhoc_filters'],
        ...bubbleSection,
        ...regressionSection,
        ...clusteringSection,
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
