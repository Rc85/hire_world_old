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
import InquiryRow from '../src/components/includes/page/InquiryRow';
import * as Messages from '../__mocks__/messageMocks';

const mockStore = configureStore([thunk]);
const store = createStore(reducers, applyMiddleware(thunk));

describe(`In reality, is a message row that consists of the title, pin button, etc.`, () => {
    it('Renders', () => {
        const wrapper = shallow(<InquiryRow stage='Inquiry' message={Messages.userMessage} user={User} />).dive();


    });
});