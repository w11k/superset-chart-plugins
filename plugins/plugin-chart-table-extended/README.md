## @w11k/plugin-chart-table-extended

[![Version](https://img.shields.io/npm/v/@w11k/plugin-chart-table-extended.svg?style=flat-square)](https://www.npmjs.com/package/@w11k/plugin-chart-table-extended)

This plugin provides a Table Plugin that for Apache Superset.

### Installation

`npm install @w11k/plugin-chart-table-extended`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import TableChartExtendedPlugin from '@w11k/plugin-chart-table-extended';

new TableChartExtendedPlugin().configure({ key: 'table_extended' }).register();
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="table_extended"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

# Sponsor

This plugin is sponsored by [ZMG](https://www.zmg.de/)

![ZMG Logo](https://raw.githubusercontent.com/w11k/superset-chart-plugins/master/.github/assets/zmg-logo.png)

# Patron

### ❤️ [W11K - The Web Engineers](https://www.w11k.de/)

### ❤️ [theCodeCampus - Trainings for Angular and TypeScript](https://www.thecodecampus.de/)

# License

Apache-2.0
