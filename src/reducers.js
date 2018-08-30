import { combineReducers } from 'redux';
import { ToggleMenu } from './reducers/Togglers';
import { Login } from './reducers/Auths';
import { Sectors } from './reducers/Sectors';
import { Confirmation } from './reducers/Confirmation';

export const reducers = combineReducers({
    ToggleMenu, Login, Sectors, Confirmation
});