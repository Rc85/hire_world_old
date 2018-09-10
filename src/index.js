import 'babel-polyfill';
import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './styles/vendor/bootstrap.css';
import './styles/vendor/bootstrap-grid.css';
import './styles/vendor/bootstrap-reboot.css';
import './styles/index.css';
import App from './App';
import { Provider } from 'react-redux';
import { reducers } from './reducers';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const store = createStore(reducers, applyMiddleware(thunk));
store.subscribe(() => { console.log(store.getState()) });

ReactDOM.render(
    <Provider store={store}>
        <Router basename='/'>
            <App />
        </Router>
    </Provider>,
    document.getElementById('root')
);