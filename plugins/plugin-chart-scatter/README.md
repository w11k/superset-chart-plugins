## @w11k/plugin-chart-scatter

[![Version](https://img.shields.io/npm/v/@w11k/plugin-chart-scatter.svg?style=flat-square)](https://www.npmjs.com/package/@w11k/plugin-chart-scatter)

This plugin provides a Scatter Chart for Apache Superset.

### Installation

`npm install @w11k/plugin-chart-scatter`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import { EchartsScatterChartPlugin } from '@w11k/plugin-chart-scatter';

new EchartsScatterChartPlugin().configure({ key: 'scatter' }).register();
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="scatter"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

### File structure

```
├── package.json
├── README.md
├── tsconfig.json
├── src
│   ├── images
│   │   └── thumbnail.png
│   ├── plugin
│   │   ├── buildQuery.ts
│   │   ├── controlPanel.ts
│   │   ├── EchartsScatter.tsx
│   │   ├── index.ts
│   │   └── transformProps.ts
│   │   └── types.ts
│   ├── controls.ts
│   ├── defaults.ts
│   ├── index.ts
│   └── types.ts
├── test
│   └── index.test.ts
└── types
    └── external.d.ts
```

# Sponsor

This plugin is sponsored by [ZMG](https://www.zmg.de/)

![ZMG Logo](https://raw.githubusercontent.com/w11k/superset-chart-plugins/master/.github/assets/zmg-logo.png)

# Patron

### ❤️ [W11K - The Web Engineers](https://www.w11k.de/)

### ❤️ [theCodeCampus - Trainings for Angular and TypeScript](https://www.thecodecampus.de/)

# License

Apache-2.0
