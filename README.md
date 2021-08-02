# @w11k/plugin-chart-superset

Monorepo for apache superset chart plugins

# Plugins

- [Scatter Chart](./plugins/plugin-chart-scatter/README.md)

# Release a new version

- bump the version in the `package.json` in the plugins folder
- create a git tag with the same version number
- push the changes to the master branch
- manually run the
  [GitHub Action](https://github.com/w11k/superset-chart-plugins/actions/workflows/npm-publish.yml)
  for the master branch

# Development

To get started follow the instructions on
https://superset.apache.org/docs/installation/building-custom-viz-plugins to setup a locally running
version of superset

# Sponsor

This plugin is sponsored by [ZMG](https://www.zmg.de/)

# Patron

### ❤️ [W11K - The Web Engineers](https://www.w11k.de/)

### ❤️ [theCodeCampus - Trainings for Angular and TypeScript](https://www.thecodecampus.de/)

# License

Apache-2.0
