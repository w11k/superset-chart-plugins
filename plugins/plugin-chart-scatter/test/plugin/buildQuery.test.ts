import buildQuery from '../../src/Scatter/buildQuery';

describe('Scatter buildQuery', () => {
  const formData = {
    datasource: '5__table',
    granularity_sqla: 'ds',
    series: 'foo',
    viz_type: 'my_chart',
  };

  it('should build groupby with series in form data', () => {
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query).toBeDefined();
  });
});
