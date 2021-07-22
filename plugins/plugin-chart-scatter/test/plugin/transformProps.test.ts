import { ChartProps } from '@superset-ui/core';
import transformProps from '../../src/Scatter/transformProps';
import { EchartsScatterChartProps } from '../../src/Scatter/types';

describe('Scatter tranformProps', () => {
  const formData = {
    colorScheme: 'bnbColors',
    datasource: '3__table',
    granularity_sqla: 'ds',
    metric: 'sum__num',
    series: 'name',
    boldText: true,
    headerFontSize: 'xs',
    headerText: 'my text',
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
