#!/bin/env node
/* eslint-disable no-console */
/**
 * Build packages/plugins filtered by globs
 */
process.env.PATH = `./node_modules/.bin:${process.env.PATH}`;

const rimraf = require('rimraf');
const { spawnSync } = require('child_process');
const fastGlob = require('fast-glob');
const { argv } = require('yargs')
  .option('lint', {
    describe: 'whether to run ESLint',
    type: 'boolean',
    // lint is slow, so not turning it on by default
    default: false,
  })
  .option('babel', {
    describe: 'Whether to run Babel',
    type: 'boolean',
    default: true,
  })
  .option('clean', {
    describe: 'Whether to clean cache',
    type: 'boolean',
    default: false,
  })
  .option('type', {
    describe: 'Whether to run tsc',
    type: 'boolean',
    default: true,
  });

const {
  _: globs,
  lint: shouldLint,
  babel: shouldRunBabel,
  clean: shouldCleanup,
  type: shouldRunTyping,
} = argv;
const glob = globs.length > 1 ? `{${globs.join(',')}}` : globs[0] || '*';

const BABEL_CONFIG = '--config-file=../../babel.config.js';

// packages that do not need tsc
const META_PACKAGES = new Set(['demo', 'generator-superset']);

function run(cmd, options) {
  console.log(`\n>> ${cmd}\n`);
  const [p, ...args] = cmd.split(' ');
  const runner = spawnSync;
  const { status } = runner(p, args, { stdio: 'inherit', ...options });
  if (status !== 0) {
    process.exit(status);
  }
}

function getPackages(packagePattern, tsOnly = false) {
  let pattern = packagePattern;
  if (pattern === '*' && !tsOnly) {
    return `@w11k/!(${[...META_PACKAGES].join('|')})`;
  }
  if (!pattern.includes('*')) {
    pattern = `*${pattern}`;
  }
  console.log('pattern', pattern);
  const packages = [
    ...new Set(
      fastGlob
        .sync([
          `./node_modules/@w11k/${pattern}/src/**/*.${tsOnly ? '{ts,tsx}' : '{ts,tsx,js,jsx}'}`,
        ])
        .map(x => x.split('/')[3])
        .filter(x => !META_PACKAGES.has(x)),
    ),
  ];

  return '@w11k/*';
}

let scope = getPackages(glob);

if (shouldLint) {
  run(`npm run lint --fix {packages,plugins}/${scope}/{src,test}`);
}

if (shouldCleanup) {
  // these modules will be installed by `npm link` but not useful for actual build
  const dirtyModules = 'node_modules/@types/react,node_modules/@w11k';
  const cachePath = `./node_modules/${scope}/{lib,esm,tsconfig.tsbuildinfo,${dirtyModules}}`;
  console.log(`\n>> Cleaning up ${cachePath}`);
  rimraf.sync(cachePath);
}

if (shouldRunBabel) {
  console.log('--- Run babel --------');
  const babelCommand = `lerna exec --stream --concurrency 10 --scope ${scope}
         -- babel ${BABEL_CONFIG} src --extensions ".ts,.tsx,.js,.jsx" --copy-files`;
  run(`${babelCommand} --out-dir lib`);

  console.log('--- Run babel esm ---');
  // run again with
  run(`${babelCommand} --out-dir esm`, { env: { ...process.env, BABEL_OUTPUT: 'esm' } });
}

if (shouldRunTyping) {
  // only run tsc for packages with ts files
  scope = getPackages(glob, true);
  run(`lerna exec --stream --concurrency 3 --scope ${scope} \
       -- ../../scripts/tsc.sh --build`);
}
