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
import { buildQueryContext, QueryMode } from '@superset-ui/core';
import { EchartsScatterFormData } from './types';

export default function buildQuery(formData: EchartsScatterFormData) {
  const queryMode = formData.query_mode as QueryMode;
  if (queryMode === QueryMode.aggregate) {
    return buildQueryContext(formData, baseQueryObject => [
      {
        ...baseQueryObject,
      },
    ]);
  }

  if (
    queryMode === QueryMode.raw &&
    formData.enable_clustering &&
    formData.cluster_type === 'cluster_by_entity'
  ) {
    return buildQueryContext(formData, {
      queryFields: {
        x_raw: 'columns',
        y_raw: 'columns',
        size_raw: 'columns',
        cluster_entity: 'columns',
      },
    });
  }

  return buildQueryContext(formData, {
    queryFields: {
      x_raw: 'columns',
      y_raw: 'columns',
      size_raw: 'columns',
    },
  });
}
