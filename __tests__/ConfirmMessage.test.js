import React from 'react';
import Enzyme, { mount, render, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { User } from '../__mocks__/userMock';
import ConfirmMessage from '../src/components/includes/page/ConfirmMessage';
import toJson from 'enzyme-to-json';

const user = {user: User, status: 'get session success'};

Enzyme.configure({adapter: new Adapter()});
jest.setTimeout(30000);

describe('Confirm message in message details', () => {
    let jobProps = {};
    const wrapper = shallow(
        <ConfirmMessage
        prompt={true}
        user={user.user}
        message={{message_modified_date: new Date(), message_recipient: 'roger85', message_status: 'New'}}
        job={jobProps}
        decline={() => jest.fn()} />
    );

    describe('Snapshot', () => {
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('Contains the appropriate sent and resent text', () => {
        expect(wrapper.find('small').at(0).text()).toContain('Sent');
        expect(wrapper.find('small').at(0).text()).toContain('Resent');
    });

    it('Should show approved message', () => {
        const wrapper = shallow(
            <ConfirmMessage
            prompt={true}
            user={user.user}
            message={{message_modified_date: new Date()}}
            job={{job_user_complete: true, job_client_complete: true}}
            decline={() => jest.fn()} />
        );

        expect(wrapper.find('#confirm-message-approved-message').text()).toEqual('You approved the request.');
    });

    it('Should show declined message', () => {
        const wrapper = shallow(
            <ConfirmMessage
            prompt={true}
            user={user.user}
            message={{message_modified_date: new Date()}}
            job={{job_user_complete: false, job_client_complete: false}}
            decline={() => jest.fn()} />
        );

        expect(wrapper.find('#confirm-message-declined-message').text()).toEqual('You declined the request.');
    });

    it('Should prompt for a reason', () => {
        wrapper.find('#confirm-message-decline-button').simulate('click');

        expect(wrapper.find('#confirm-message-reason-input')).toHaveLength(1);
        expect(wrapper.find('#confirm-message-reason-input').find('button').at(0).text()).toEqual('Submit');
    });

    it('Should show "new" indicator', () => {
        expect(wrapper.find('h4').text()).toEqual('New');
    });
});