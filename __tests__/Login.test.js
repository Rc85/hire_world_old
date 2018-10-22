import React from 'react';
import Enzyme, { mount, render, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import App from '../src/App';
import { LoginUser } from '../src/actions/LoginActions';
import { User } from '../src/actions/__mocks__/LoginActions';
import moxios from 'moxios';
import { createStore, applyMiddleware } from 'redux';
import { reducers } from '../src/reducers';

const mockStore = configureStore([thunk]);
const store = createStore(reducers, applyMiddleware(thunk));

Enzyme.configure({adapter: new Adapter()});

describe('Login page', () => {
    test('snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}><MemoryRouter initialEntries={[{pathname: '/account/login', key: 'login'}]}><App /></MemoryRouter></Provider>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    describe('clicking on body', () => {
        test('browse menu should appear', () => {
            const wrapper = mount(
                <Provider store={store}><MemoryRouter initialEntries={[{pathname: '/account/login', key: 'login'}]}><App /></MemoryRouter></Provider>
            );
            wrapper.find('#browse-menu-button').simulate('click');
            expect(wrapper.exists('#browse-menu')).toEqual(true);
        });
    });

    describe('login', () => {
        beforeEach(() => {
            moxios.install();
        });

        afterEach(() => {
            moxios.uninstall();
        });

        test('login in with existing credentials', () => {
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                request.respondWith({
                    status: 200,
                    data: {
                        status: 'Login success',
                        user: User
                    }
                })
            })

            const expectedActions = [
                {
                    type: 'LOGIN_USER_UPDATE',
                    status: 'Logging in'
                },
                {
                    type: 'LOGIN_USER_UPDATE',
                    status: 'Login success',
                    user: User
                }
            ];

            const store = mockStore({status: '', user: null});

            store.dispatch(LoginUser({username: 'fakeuser', password: '111111'}))
            .then(() => {
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });
});