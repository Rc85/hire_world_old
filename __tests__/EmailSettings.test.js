import React from 'react';
import Enzyme, { mount, render, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import thunk from 'redux-thunk';
import { UpdateUser } from '../src/actions/LoginActions';
import { User } from '../__mocks__/userMock';
import { createStore, applyMiddleware } from 'redux';
import { reducers } from '../src/reducers';
import EmailSettings from '../src/components/includes/page/EmailSettings';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([thunk]);
const store = createStore(reducers, applyMiddleware(thunk));
const user = {user: User, status: 'get session success'};

Enzyme.configure({adapter: new Adapter()});
jest.setTimeout(30000);

describe('Email settings test', () => {
    const wrapper = shallow(<EmailSettings store={store} />).dive();

    it('Matches snapshot', () => {
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('Renders', () => {
        expect(wrapper.find('label').at(0).text()).toEqual('Change Email:');
        expect(wrapper.find('label').at(1).text()).toEqual('New Email:');
        expect(wrapper.find('label').at(2).text()).toEqual('Confirm Email:');
    });

    it('Dispatches user update action', async(done) => {
        const expectedAction = {
            type: 'USER_UPDATE',
            user: User
        }

        const store = mockStore(user);

        await store.dispatch(UpdateUser(User))

        expect(store.getActions()[0]).toEqual(expectedAction);
        done();
    });
});