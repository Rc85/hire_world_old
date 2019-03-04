import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { Provider } from 'react-redux';
import { reducers } from './reducers';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { ToggleMenu } from './actions/MenuActions';

const store = createStore(reducers, applyMiddleware(thunk));
//store.subscribe(() => { console.log(store.getState()) });

ReactDOM.render(
    <Provider store={store}>
        <Router exact basename={process.env.REACT_ENV === 'production' || process.env.REACT_ENV === 'development' ? '/' : '/staging'}>
            <App />
        </Router>
    </Provider>,
    document.getElementById('root')
);