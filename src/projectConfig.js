const BASE_PATH = '../test_projects';
const ARCH_TYPES = ['fsd', 'microfronts', 'module', 'clean', 'ddd'];
const POSSIBLE_BUNDLERS = ['webpack', 'rollup', 'vite'];
const bundlerFileName = {
    webpack: 'webpack.config.js',
    rollup: 'rollup.config.js',
    vite: 'vite.config.js'
};

module.exports = { BASE_PATH, ARCH_TYPES, POSSIBLE_BUNDLERS, bundlerFileName };
