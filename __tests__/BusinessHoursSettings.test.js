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
import BusinessHoursSettings from '../src/components/includes/page/BusinessHoursSettings';
import axios from 'axios';

const store = createStore(reducers, applyMiddleware(thunk));
const user = {user: User, status: 'get session success'};

Enzyme.configure({adapter: new Adapter()});
jest.setTimeout(30000);

describe('Business hours setting component', () => {
    test('Snapshot', async() => {
        const wrapper = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[{pathname: '/dashboard/edit', key: 'response'}]}>
                    <Dashboard user={user}><BusinessHoursSettings /></Dashboard>
                </MemoryRouter>
            </Provider>
        );

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('Renders', () => {
        const wrapper = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[{pathname: '/dashboard/edit', key: 'response'}]}>
                    <Dashboard user={user}><BusinessHoursSettings /></Dashboard>
                </MemoryRouter>
            </Provider>
        );

        let button = wrapper.find('button');

        expect(button[0].children[0].attribs).toHaveProperty('data-icon');
        expect(button[0].children[0].attribs['data-icon']).toEqual('caret-down');
    });

    test('Clicking button should show settings', () => {
        const wrapper = shallow(<BusinessHoursSettings store={store} />).dive();
        
        wrapper.find('button').simulate('click');

        expect(wrapper.state()).toHaveProperty('showSettings', true);
        expect(wrapper.render()[0].children[0].next.children[0].attribs.id).toEqual('Monday');
    });

    describe('Handling data', () => {
        beforeEach(() => {
            moxios.install();
        });

        afterEach(() => {
            moxios.uninstall();
        });

        const wrapper = shallow(<BusinessHoursSettings store={store} />).dive();

        test('Fetching data when component mounts', (done) => {
            moxios.stubRequest('/api/get/business_hours', {
                status: 200,
                response: {
                    status: 'success',
                    hours: {
                        monday: '8:00 AM - 8:00 PM',
                        tuesday: '',
                        wednesday: '',
                        thursday: '',
                        friday: '',
                        saturday: '',
                        sunday: ''
                    }
                }
            });

            axios.get('/api/get/business_hours')
            .then(resp => {
                if (resp.data.status === 'success') {
                    let initialState = wrapper.instance().splitHours(resp.data.hours);

                    wrapper.setState(initialState);

                    expect(resp.data.hours['monday']).toEqual('8:00 AM - 8:00 PM');
                    expect(wrapper.state('monStartTime')).toEqual('8:00 AM');
                }
                
                done();
            });
        });
    });
});