import React from 'react';
import Enzyme, { mount, render, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router';
import Dashboard from '../src/components/pages/Dashboard';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { User } from '../__mocks__/userMock';
import moxios from 'moxios';
import { createStore, applyMiddleware } from 'redux';
import { reducers } from '../src/reducers';
import Checkout from '../src/components/includes/page/Checkout';
import axios from 'axios';
import { StripeProvider, Elements } from 'react-stripe-elements';

const store = createStore(reducers, applyMiddleware(thunk));
const user = {user: User, status: 'get session success'};

Enzyme.configure({adapter: new Adapter()});
jest.setTimeout(30000);

describe('Checkout test', () => {
    it('Renders', () => {
        window.Stripe = function() {}

        let wrapper = shallow(<StripeProvider apiKey='pk_test_KgwS8DEnH46HAFvrCaoXPY6R'><Elements><Checkout store={store} /></Elements></StripeProvider>).dive().dive();

        expect(wrapper.find('#choose-plan')).toBeDefined();
    });
});