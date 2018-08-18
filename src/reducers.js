import { combineReducers } from 'redux';
import { ToggleMenu } from './reducers/Togglers';
import { Register, Login } from './reducers/Auths';
import { Status } from './reducers/Statuses';

export const reducers = combineReducers({
    ToggleMenu, Register, Login, Status
});