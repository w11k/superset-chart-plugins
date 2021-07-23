import { ExternalDataTransform } from 'echarts/types/src/data/helper/transform';

declare module 'echarts-stat' {
  namespace transform {
    declare const regression: ExternalDataTransform;
    declare const clustering: ExternalDataTransform;
    declare const histogram: ExternalDataTransform;
  }
}
