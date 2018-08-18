const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
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
                target: 'http://localhost:9999',
                secure: false
            }
        },
        historyApiFallback: {
            rewrites: [
                {from: /./, to: '/'}
            ]
        }
    },
    plugins: [
        new htmlWebpackPlugin({
            template: './public/index.html',
            favicon: './public/favicon.ico'
        })
    ]
}