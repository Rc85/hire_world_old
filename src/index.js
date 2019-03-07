import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { Provider } from 'react-redux';
import { reducers } from './reducers';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const store = createStore(reducers, applyMiddleware(thunk));
store.subscribe(() => {
    if (process.env.REACT_ENV !== 'production') {
        console.log(store.getState());
    }
});

ReactDOM.render(
    <Provider store={store}>
        <Router exact>
            <App />
        </Router>
    </Provider>,
    document.getElementById('root')
);