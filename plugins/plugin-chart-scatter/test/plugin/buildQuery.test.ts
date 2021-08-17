import buildQuery from '../../src/Scatter/buildQuery';
import {
  aggregatedformData,
  expectedAggregatedQuery,
  expectedRawQuery,
  rawFormData,
} from './testdata';

describe('Scatter buildQuery', () => {
  it('should build query in aggregate data mode', () => {
    const queryContext = buildQuery(aggregatedformData);
    const [query] = queryContext.queries;
    expect(query).toEqual(expectedAggregatedQuery);
  });

  it('should build query in raw data mode', () => {
    const queryContext = buildQuery(rawFormData);
    const [query] = queryContext.queries;
    expect(query).toEqual(expectedRawQuery);
  });
});
