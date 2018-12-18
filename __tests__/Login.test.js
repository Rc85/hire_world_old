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
import { User } from '../__mocks__/userMock';
import moxios from 'moxios';
import { createStore, applyMiddleware } from 'redux';
import { reducers } from '../src/reducers';
import { GetSession } from '../src/actions/FetchActions';

const mockStore = configureStore([thunk]);
const store = createStore(reducers, applyMiddleware(thunk));

Enzyme.configure({adapter: new Adapter()});
jest.setTimeout(30000);

describe('Login page', () => {
    it('Matches snapshot', (done) => {
        const wrapper = shallow(
            <Provider store={store}><MemoryRouter initialEntries={[{pathname: '/', key: 'login'}]}><App /></MemoryRouter></Provider>
        );
        expect(toJson(wrapper)).toMatchSnapshot();

        done();
    });

    describe('clicking on body', () => {
        test('Browse menu should appear', (done) => {
            const wrapper = mount(
                <Provider store={store}><MemoryRouter initialEntries={[{pathname: '/', key: 'login'}]}><App /></MemoryRouter></Provider>
            );
            wrapper.find('#browse-menu-button').simulate('click');
            expect(wrapper.exists('#browse-menu')).toEqual(true);

            done();
        });
    });

    describe('Login', () => {
        beforeEach(() => {
            moxios.install();
        });

        afterEach(() => {
            moxios.uninstall();
        });

        test('Login in with existing credentials', async(done) => {
            moxios.stubRequest('/api/auth/login', {
                status: 200,
                response: {
                    status: 'get session success',
                    user: User
                }
            });
            
            const expectedActions = [
                {
                    type: 'LOGIN_USER',
                    status: 'getting session'
                }
            ];
            
            const store = mockStore({status: '', user: null});
            
            await store.dispatch(LoginUser({username: 'fakeuser', password: '111111'}))
            .then(() => {
                expect(store.getActions()[0]).toEqual(expectedActions[0]);
                done();
            });
        });
    });

    describe('Get session', () => {
        beforeEach(() => {
            moxios.install();
        });

        afterEach(() => {
            moxios.uninstall();
        });

        test('Get session should be successful', async(done) => {
            moxios.stubRequest('/api/auth/login', {
                status: 200,
                response: {
                    status: 'get session success',
                    user: User
                }
            });

            const expectedActions = [
                {
                    type: 'LOGIN_USER',
                    status: 'getting session'
                },
                {
                    type: 'LOGIN_USER_UPDATE',
                    status: 'get session success',
                    user: User
                }
            ];

            const store = mockStore({status: '', user: null});

            await store.dispatch(GetSession())
            .then(() => {
                expect(store.getActions()[0]).toEqual(expectedActions[0]);
                done();
            });
        });
    });
});