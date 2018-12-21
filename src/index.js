import 'babel-polyfill';
import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import '../dist/css/vendor/bootstrap.css';
import '../dist/css/vendor/bootstrap-grid.css';
import '../dist/css/vendor/bootstrap-reboot.css';
import '../dist/css/index.css';
import App from './App';
import { Provider } from 'react-redux';
import { reducers } from './reducers';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const store = createStore(reducers, applyMiddleware(thunk));
store.subscribe(() => { console.log(store.getState()) });

ReactDOM.render(
    <Provider store={store}>
        <Router exact basename='/app'>
            <App />
        </Router>
    </Provider>,
    document.getElementById('root')
);