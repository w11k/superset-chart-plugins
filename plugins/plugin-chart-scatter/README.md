## @superset-ui/plugin-chart-w11k

[![Version](https://img.shields.io/npm/v/@superset-ui/plugin-chart-w11k.svg?style=flat-square)](https://www.npmjs.com/package/@superset-ui/plugin-chart-w11k)

This plugin provides W11K Test for Superset.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import W11KChartPlugin from '@superset-ui/plugin-chart-w11k';

new W11KChartPlugin().configure({ key: 'w11k' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://apache-superset.github.io/superset-ui/?selectedKind=plugin-chart-w11k) for more
details.

```js
<SuperChart
  chartType="w11k"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

### File structure generated

```
├── package.json
├── README.md
├── tsconfig.json
├── src
│   ├── W11K.tsx
│   ├── images
│   │   └── thumbnail.png
│   ├── index.ts
│   ├── plugin
│   │   ├── buildQuery.ts
│   │   ├── controlPanel.ts
│   │   ├── index.ts
│   │   └── transformProps.ts
│   └── types.ts
├── test
│   └── index.test.ts
└── types
    └── external.d.ts
```
