const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const express = require('express');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, '/dist'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|jpeg|gif|ttf)$/,
                use: ['url-loader']
            }
        ]
    },
    devServer: {
        port: 3000,
        open: true,
        host: 'localhost',
        proxy: {
            '/api': {
                target: 'http://localhost',
                secure: false
            }
        },
        historyApiFallback: {
            rewrites: [
                {from: /\/app\/*/, to: '/app.html'}
            ]
        },
        setup (app) {
            app.use('/styles', express.static(path.join(__dirname, '/dist/css')));
            app.use('/fonts', express.static(path.join(__dirname,  '/dist/fonts')));
            app.use('/styles', express.static(path.join(__dirname, '/dist/css')));
            app.use('/user_files', express.static(path.join(__dirname, `/user_files`)));
            app.use('/images', express.static(path.join(__dirname, '/dist/images')));
        }
    },
    plugins: [
        new htmlWebpackPlugin({
            template: './public/index.html',
            filename: 'app.html'
        })
    ]
}