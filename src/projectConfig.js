const BASE_PATH = '../test_projects';
const ARCH_TYPES = ['fsd', 'microfronts', 'module', 'clean', 'ddd'];
const POSSIBLE_BUNDLERS = ['webpack', 'rollup', 'vite'];
const bundlerFileName = {
    webpack: 'webpack.config.js',
    rollup: 'rollup.config.js',
    vite: 'vite.config.js'
};

const BUILDER_CONFIG = {
    webpack: {
        command: 'webpack-dev-server --config webpack.config.js --mode development',
        devDeps: [ 'webpack-dev-server', 'webpack', 'html-webpack-plugin' ]
    },
    vite: {
        command: 'npx vite',
        devDeps: [ 'vite' ]
    },
    rollup: {
        command: 'npx rollup --config rollup.config.js --watch',
        devDeps: [ 'rollup-plugin-serve', 'rollup-plugin-livereload' ]
    },
    default: {
        command: 'nodemon -e js,css,html ./src/index.js',
        devDeps: [ 'nodemon' ]
    }
};

module.exports = { BASE_PATH, ARCH_TYPES, POSSIBLE_BUNDLERS, BUILDER_CONFIG, bundlerFileName };
