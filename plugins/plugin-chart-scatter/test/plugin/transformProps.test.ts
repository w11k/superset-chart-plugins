import { ChartProps } from '@superset-ui/core';
import transformProps from '../../src/Scatter/transformProps';

describe('Scatter tranformProps', () => {
  const formData = {
    vizType: 'scatter',
    datasource: '2__table',
    sliceId: 143,
    urlParams: {},
    timeRangeEndpoints: ['inclusive', 'exclusive'],
    x: 'sum__SP_RUR_TOTL_ZS',
    xRaw: 'sum__SP_DYN_LE00_IN',
    y: 'sum__SP_DYN_LE00_IN',
    yRaw: 'sum__SP_DYN_LE00_IN',
    groupby: ['region', 'country_name'],
    adhocFilters: [],
    size: 'sum__SP_POP_TOTL',
    sizeRaw: 'sum__SP_POP_TOTL',
    queryMode: 'aggregate',
    minBubbleSize: '15',
    maxBubbleSize: '50',
    showRegression: true,
    showRegressionLabel: false,
    regression: 'logarithmic',
    colorScheme: 'echarts5Colors',
    showLegend: true,
    legendType: 'scroll',
    legendOrientation: 'top',
    legendMargin: 0,
    xAxisFormat: 'SMART_NUMBER',
    xAxisTitle: 'People',
    yAxisFormat: 'SMART_NUMBER',
    yAxisTitle: 'People',
    showLabels: false,
    showHighlighting: false,
    extraFormData: {},
  };
  const chartProps = new ChartProps({
    formData,
    width: 800,
    height: 600,
    queriesData: [
      {
        data: [{ name: 'Hulk', sum__num: 1, __timestamp: 599616000000 }],
      },
    ],
  });

  it('should tranform chart props for viz', () => {
    expect(transformProps(chartProps)).toBeDefined();
  });
});
