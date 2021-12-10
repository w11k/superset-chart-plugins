import { ChartProps, QueryMode } from '@superset-ui/core';
import { SeriesOption } from 'echarts';
import { DatasetOption } from 'echarts/types/dist/shared';
import transformProps from '../../src/Scatter/transformProps';
import { EchartsScatterChartProps } from '../../lib/Scatter/types';
import { EchartsScatterFormData } from '../../src/Scatter/types';
import { LegendOrientation, LegendType } from '../../lib/types';

describe('Scatter transformProps', () => {
  describe('should transform basic chart props', () => {
    const formData = {
      query_mode: 'raw',
      x_raw: 'DISTANCE',
      y_raw: 'DEPARTURE_DELAY',
      size_raw: 'AIR_TIME',
      x_axis_format: 'SMART_NUMBER',
      x_axis_title: 'X_DUMMY',
      y_axis_format: 'SMART_NUMBER',
      y_axis_title: 'Y_DUMMY',
      show_legend: true,
      legendType: 'scroll' as LegendType,
      legendOrientation: 'top' as LegendOrientation,
    } as unknown as EchartsScatterFormData;

    const rawChartProps = new ChartProps({
      formData,
      width: 800,
      height: 600,
      queriesData: [
        {
          data: [],
        },
      ],
    }) as unknown as EchartsScatterChartProps;
    // @ts-ignore
    const result = transformProps(rawChartProps);

    it('x axis', () => {
      expect(result.echartOptions.xAxis).toEqual({
        axisLabel: {
          formatter: expect.any(Function),
        },
        name: 'X_DUMMY',
      });
    });

    it('y axis', () => {
      expect(result.echartOptions.yAxis).toEqual({
        axisLabel: {
          formatter: expect.any(Function),
        },
        name: 'Y_DUMMY',
      });
    });

    it('tooltip', () => {
      expect(result.echartOptions.tooltip).toEqual({
        trigger: 'item',
        showDelay: 0,
        formatter: expect.any(Function),
      });
    });

    it('grid', () => {
      expect(result.echartOptions.grid).toEqual({
        containLabel: true,
      });
    });

    it('legend', () => {
      expect(result.echartOptions.legend).toEqual({
        orient: 'horizontal',
        right: 0,
        show: true,
        top: 0,
        type: 'scroll',
      });
    });
  });

  it('should transform chart props for raw data mode without regression', () => {
    const formData = {
      query_mode: 'raw',
      x_raw: 'DISTANCE',
      y_raw: 'DEPARTURE_DELAY',
      groupby: [],
      use_metric_for_bubble_size: true,
      size_raw: 'AIR_TIME',
      min_bubble_size: '10',
      max_bubble_size: '50',
      show_regression: false,
      show_regression_label: true,
      regression: 'linear',
      regressionOrder: '3',
      color_scheme: 'supersetColors',
    } as unknown as EchartsScatterFormData;

    const rawChartProps = new ChartProps({
      formData,
      width: 800,
      height: 600,
      queriesData: [
        {
          data: [
            {
              DISTANCE: 1448,
              DEPARTURE_DELAY: -11,
              AIR_TIME: 169,
            },
            {
              DISTANCE: 2330,
              DEPARTURE_DELAY: -8,
              AIR_TIME: 263,
            },
          ],
        },
      ],
    }) as unknown as EchartsScatterChartProps;

    // @ts-ignore
    const result = transformProps(rawChartProps);
    const series = result.echartOptions.series as SeriesOption[];
    expect(series.length).toBe(1);
    expect(series[0]).toEqual(
      expect.objectContaining({
        name: 'Data',
        type: 'scatter',
        datasetIndex: 1,
        animation: false,
        label: {
          show: false,
          formatter: '{a}',
          minMargin: 10,
          position: 'top',
        },
      }),
    );

    const dataset = result.echartOptions.dataset as DatasetOption[];
    expect(dataset.length).toBe(2);
    expect(dataset).toEqual([
      {
        source: [
          [1448, -11, 169, 'Data'],
          [2330, -8, 263, 'Data'],
        ],
      },
      {
        transform: {
          type: 'filter',
          config: {
            dimension: 3,
            eq: 'Data',
          },
        },
      },
    ]);
  });

  it('should transform chart props for raw data mode with clustering mode enabled', () => {
    const formData = {
      query_mode: 'raw',
      x_raw: 'DISTANCE',
      y_raw: 'DEPARTURE_DELAY',
      groupby: [],
      enable_clustering: true,
      cluster_type: 'Cluster by Entity',
      cluster_entity: 'AIRLINE',
      use_metric_for_bubble_size: true,
      size_raw: 'AIR_TIME',
      min_bubble_size: '10',
      max_bubble_size: '50',
      show_regression: false,
      show_regression_label: true,
      regression: 'linear',
      regressionOrder: '3',
      color_scheme: 'supersetColors',
    } as unknown as EchartsScatterFormData;

    const rawChartProps = new ChartProps({
      formData,
      width: 800,
      height: 600,
      queriesData: [
        {
          data: [
            {
              DISTANCE: 1448,
              DEPARTURE_DELAY: -11,
              AIR_TIME: 169,
              AIRLINE: 'LH',
            },
            {
              DISTANCE: 2330,
              DEPARTURE_DELAY: -8,
              AIR_TIME: 263,
              AIRLINE: 'LH',
            },
            {
              DISTANCE: 2130,
              DEPARTURE_DELAY: -5,
              AIR_TIME: 273,
              AIRLINE: 'Air',
            },
          ],
        },
      ],
    }) as unknown as EchartsScatterChartProps;

    // @ts-ignore
    const result = transformProps(rawChartProps);
    const series = result.echartOptions.series as SeriesOption[];
    expect(series.length).toBe(2);
    expect(series[0]).toEqual(
      expect.objectContaining({
        name: 'LH',
        type: 'scatter',
        datasetIndex: 1,
        animation: false,
        label: {
          show: false,
          formatter: '{a}',
          minMargin: 10,
          position: 'top',
        },
      }),
    );
    expect(series[1]).toEqual(
      expect.objectContaining({
        name: 'Air',
        type: 'scatter',
        datasetIndex: 2,
        animation: false,
        label: {
          show: false,
          formatter: '{a}',
          minMargin: 10,
          position: 'top',
        },
      }),
    );

    const dataset = result.echartOptions.dataset as DatasetOption[];
    expect(dataset.length).toBe(3);
    expect(dataset).toEqual([
      {
        source: [
          [1448, -11, 169, 'LH'],
          [2330, -8, 263, 'LH'],
          [2130, -5, 273, 'Air'],
        ],
      },
      {
        transform: {
          type: 'filter',
          config: {
            dimension: 3,
            eq: 'LH',
          },
        },
      },
      {
        transform: {
          type: 'filter',
          config: {
            dimension: 3,
            eq: 'Air',
          },
        },
      },
    ]);
  });

  it('should transform chart props for raw data in kmeans chlusters', () => {
    const formData = {
      query_mode: 'raw',
      x_raw: 'DISTANCE',
      y_raw: 'DEPARTURE_DELAY',
      groupby: [],
      enable_clustering: true,
      cluster_type: 'hierarchical kMeans',
      amount_of_kmeans_cluster: '2',
      use_metric_for_bubble_size: true,
      size_raw: 'AIR_TIME',
      min_bubble_size: '10',
      max_bubble_size: '50',
      show_regression: false,
      show_regression_label: true,
      regression: 'linear',
      regressionOrder: '3',
      color_scheme: 'supersetColors',
    } as unknown as EchartsScatterFormData;

    const rawChartProps = new ChartProps({
      formData,
      width: 800,
      height: 600,
      queriesData: [
        {
          data: [
            {
              DISTANCE: 1448,
              DEPARTURE_DELAY: -11,
              AIR_TIME: 169,
            },
            {
              DISTANCE: 2330,
              DEPARTURE_DELAY: -5,
              AIR_TIME: 263,
            },
            {
              DISTANCE: 2130,
              DEPARTURE_DELAY: -5,
              AIR_TIME: 273,
            },
            {
              DISTANCE: 2240,
              DEPARTURE_DELAY: -5,
              AIR_TIME: 273,
            },
            {
              DISTANCE: 2250,
              DEPARTURE_DELAY: -5,
              AIR_TIME: 273,
            },
            {
              DISTANCE: 2260,
              DEPARTURE_DELAY: -5,
              AIR_TIME: 273,
            },
            {
              DISTANCE: 1348,
              DEPARTURE_DELAY: -12,
              AIR_TIME: 273,
            },
          ],
        },
      ],
    }) as unknown as EchartsScatterChartProps;

    // @ts-ignore
    const result = transformProps(rawChartProps);
    const series = result.echartOptions.series as SeriesOption[];
    expect(series.length).toBe(1);
    expect(series[0]).toEqual(
      expect.objectContaining({
        name: 'Data',
        type: 'scatter',
        datasetIndex: 1,
        animation: false,
        label: {
          show: false,
          formatter: '{a}',
          minMargin: 10,
          position: 'top',
        },
      }),
    );

    const dataset = result.echartOptions.dataset as DatasetOption[];
    expect(dataset.length).toBe(2);
    expect(dataset).toEqual([
      {
        source: [
          [1448, -11, 169, 'Data'],
          [2330, -5, 263, 'Data'],
          [2130, -5, 273, 'Data'],
          [2240, -5, 273, 'Data'],
          [2250, -5, 273, 'Data'],
          [2260, -5, 273, 'Data'],
          [1348, -12, 273, 'Data'],
        ],
      },
      {
        transform: {
          type: 'ecStat:clustering',
          config: {
            clusterCount: 2,
            outputType: 'single',
            dimensions: [0, 1],
            outputClusterIndexDimension: 4,
          },
        },
      },
    ]);
  });

  it('should transform chart props for aggregated data mode without regression', () => {
    const formData = {
      query_mode: QueryMode.aggregate,
      x: {
        expressionType: 'SIMPLE',
        column: {
          column_name: 'DISTANCE',
          description: null,
          expression: '',
          filterable: true,
          groupby: true,
          id: 398,
          is_dttm: false,
          python_date_format: null,
          type: 'BIGINT',
          type_generic: 0,
          verbose_name: null,
        },
        aggregate: 'SUM',
        sqlExpression: null,
        isNew: false,
        hasCustomLabel: true,
        label: 'MY_Distance',
        optionName: 'metric_esscid3u5jc_985nqw1i2ul',
      },
      y: {
        aggregate: 'SUM',
        column: {
          column_name: 'DEPARTURE_DELAY',
          description: null,
          expression: '',
          filterable: true,
          groupby: true,
          id: 392,
          is_dttm: false,
          python_date_format: null,
          type: 'DOUBLE PRECISION',
          type_generic: 0,
          verbose_name: null,
        },
        expressionType: 'SIMPLE',
        hasCustomLabel: false,
        isNew: false,
        label: 'SUM(DEPARTURE_DELAY)',
        optionName: 'metric_j33ov1hvmp_uwnvdyyo4l',
        sqlExpression: null,
      },
      groupby: ['AIRLINE', 'FLIGHT_NUMBER'],
      row_limit: 50,
      adhoc_filters: [],
      use_metric_for_bubble_size: false,
      bubble_size: '5',
      size: {
        expressionType: 'SIMPLE',
        column: {
          id: 386,
          column_name: 'FLIGHT_NUMBER',
          verbose_name: null,
          description: null,
          expression: '',
          filterable: true,
          groupby: true,
          is_dttm: false,
          type: 'BIGINT',
          type_generic: 0,
          python_date_format: null,
        },
        aggregate: 'COUNT',
        sqlExpression: null,
        isNew: false,
        hasCustomLabel: false,
        label: 'COUNT(FLIGHT_NUMBER)',
        optionName: 'metric_pibu1gtxijm_2i9hiyupdu7',
      },
      min_bubble_size: '10',
      max_bubble_size: '50',
      show_regression: false,
      show_regression_label: true,
      regression: 'linear',
      regressionOrder: '3',
      color_scheme: 'supersetColors',
    } as unknown as EchartsScatterFormData;

    const aggregatedChartProps = new ChartProps({
      formData,
      width: 800,
      height: 600,
      queriesData: [
        {
          data: [
            {
              AIRLINE: 'WN',
              FLIGHT_NUMBER: 'Flight 1',
              MY_Distance: 10,
              'SUM(DEPARTURE_DELAY)': 2,
              'COUNT(FLIGHT_NUMBER)': 2,
            },
            {
              AIRLINE: 'WN',
              FLIGHT_NUMBER: 'Flight 1',
              MY_Distance: 10,
              'SUM(DEPARTURE_DELAY)': 2,
              'COUNT(FLIGHT_NUMBER)': 2,
            },
            {
              AIRLINE: 'F9',
              FLIGHT_NUMBER: 2,
              MY_Distance: 5,
              'SUM(DEPARTURE_DELAY)': 2,
              'COUNT(FLIGHT_NUMBER)': 2,
            },
          ],
        },
      ],
    }) as unknown as EchartsScatterChartProps;

    // @ts-ignore
    const result = transformProps(aggregatedChartProps);
    const series = result.echartOptions.series as SeriesOption[];
    expect(series.length).toBe(2);
    expect(series[0]).toEqual(
      expect.objectContaining({
        name: 'WN',
        type: 'scatter',
        datasetIndex: 1,
        animation: false,
        label: {
          show: false,
          formatter: '{a}',
          minMargin: 10,
          position: 'top',
        },
      }),
    );
    expect(series[1]).toEqual(
      expect.objectContaining({
        name: 'F9',
        type: 'scatter',
        datasetIndex: 2,
        animation: false,
        label: {
          show: false,
          formatter: '{a}',
          minMargin: 10,
          position: 'top',
        },
      }),
    );

    const dataset = result.echartOptions.dataset as DatasetOption[];
    expect(dataset.length).toBe(3);
    expect(dataset).toEqual([
      {
        source: [
          [10, 2, 2, 'WN', 'Flight 1'],
          [10, 2, 2, 'WN', 'Flight 1'],
          [5, 2, 2, 'F9', '2'],
        ],
      },
      {
        transform: {
          type: 'filter',
          config: {
            dimension: 3,
            eq: 'WN',
          },
        },
      },
      {
        transform: {
          type: 'filter',
          config: {
            dimension: 3,
            eq: 'F9',
          },
        },
      },
    ]);
  });

  it('should transform chart props with regression', () => {
    const formData = {
      query_mode: 'raw',
      x_raw: 'DISTANCE',
      y_raw: 'DEPARTURE_DELAY',
      groupby: [],
      use_metric_for_bubble_size: true,
      size_raw: 'AIR_TIME',
      min_bubble_size: '10',
      max_bubble_size: '50',
      show_regression: true,
      show_regression_label: true,
      regression: 'polynomial',
      regressionOrder: '3',
      color_scheme: 'supersetColors',
    } as unknown as EchartsScatterFormData;

    const rawChartProps = new ChartProps({
      formData,
      width: 800,
      height: 600,
      queriesData: [
        {
          data: [
            {
              DISTANCE: 10,
              DEPARTURE_DELAY: 10,
              AIR_TIME: 10,
            },
            {
              DISTANCE: 20,
              DEPARTURE_DELAY: 20,
              AIR_TIME: 20,
            },
          ],
        },
      ],
    }) as unknown as EchartsScatterChartProps;

    // @ts-ignore
    const result = transformProps(rawChartProps);
    const series = result.echartOptions.series as SeriesOption[];
    expect(series.length).toBe(2);
    expect(series[0]).toEqual(
      expect.objectContaining({
        name: 'Data',
        type: 'scatter',
        datasetIndex: 1,
        animation: false,
        label: {
          show: false,
          formatter: '{a}',
          minMargin: 10,
          position: 'top',
        },
      }),
    );
    expect(series[1]).toEqual(
      expect.objectContaining({
        name: 'Regression',
        type: 'line',
        datasetIndex: 2,
        symbolSize: 0.1,
        symbol: 'circle',
        smooth: true,
        label: {
          show: true,
        },
        labelLayout: { dx: -20 },
        encode: { label: 2, tooltip: 1 },
      }),
    );

    const dataset = result.echartOptions.dataset as DatasetOption[];
    expect(dataset.length).toBe(3);
    expect(dataset).toEqual([
      {
        source: [
          [10, 10, 10, 'Data'],
          [20, 20, 20, 'Data'],
        ],
      },
      {
        transform: {
          type: 'filter',
          config: {
            dimension: 3,
            eq: 'Data',
          },
        },
      },
      {
        transform: {
          type: 'ecStat:regression',
          config: {
            method: 'polynomial',
            order: 3,
          },
        },
      },
    ]);
  });
});
