/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
    mode: 'production',
    target: 'node',
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js',
        libraryTarget: 'commonjs2',
        path: path.resolve(process.cwd(), 'dist'),
    },
    devtool: 'source-map',
    externals: {
        vscode: 'commonjs vscode',
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
};
