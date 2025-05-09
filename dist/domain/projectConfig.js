"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILDER_CONFIG = exports.bundlerFileName = exports.POSSIBLE_BUNDLERS = exports.ARCH_TYPES = exports.BASE_PATH = void 0;
exports.BASE_PATH = '../test_projects';
exports.ARCH_TYPES = ['fsd', 'microfronts', 'module', 'clean', 'ddd'];
exports.POSSIBLE_BUNDLERS = ['webpack', 'rollup', 'vite'];
exports.bundlerFileName = {
    webpack: 'webpack.config.js',
    rollup: 'rollup.config.js',
    vite: 'vite.config.js'
};
exports.BUILDER_CONFIG = {
    webpack: {
        command: 'webpack-dev-server --config webpack.config.js --mode development',
        devDeps: ['webpack-dev-server', 'webpack', 'html-webpack-plugin']
    },
    vite: {
        command: 'npx vite',
        devDeps: ['vite']
    },
    rollup: {
        command: 'npx rollup --config rollup.config.js --watch',
        devDeps: ['rollup-plugin-serve', 'rollup-plugin-livereload']
    },
    default: {
        command: 'nodemon -e js,css,html ./src/index.ts',
        devDeps: ['nodemon']
    }
};
