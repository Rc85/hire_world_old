import React from 'react';
import Enzyme, { mount, render, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router';
import Dashboard from '../src/components/pages/Dashboard';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { LoginUser } from '../src/actions/LoginActions';
import { User } from '../src/actions/__mocks__/LoginActions';
import moxios from 'moxios';
import { createStore, applyMiddleware } from 'redux';
import { reducers } from '../src/reducers';
import { GetSession } from '../src/actions/FetchActions';
import BusinessHoursSettings from '../src/components/includes/page/BusinessHoursSettings';
import ConfirmMessage from '../src/components/includes/page/ConfirmMessage';

const mockStore = configureStore([thunk]);
const store = createStore(reducers, applyMiddleware(thunk));
const user = {user: User, status: 'get session success'};

Enzyme.configure({adapter: new Adapter()});
jest.setTimeout(30000);

describe('Confirm message modal test', () => {
    it('renders', () => {
        const wrapper = shallow(<ConfirmMessage user={user.user} message={{}} job={{}} />);

        console.log(wrapper.contains('div'));
    });
});