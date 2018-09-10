import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router';
import App from '../src/App';

Enzyme.configure({adapter: new Adapter()});

describe('Main page', () => {
    test('should be blank', () => {
        shallow(
            <MemoryRouter initialEntries={['/']}><App /></MemoryRouter>
        );
    });
});