import React from 'react';
import Enzyme, { render, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router';
import { reducers } from '../src/reducers';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import App from '../src/App';

const store = createStore(reducers, applyMiddleware(thunk));

Enzyme.configure({adapter: new Adapter()});

describe('Response page', () => {
    test('snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}><MemoryRouter initialEntries={[{pathname: '/some-unknown-route', key: 'response'}]}><App /></MemoryRouter></Provider>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});