import { combineReducers } from 'redux';
import { Login } from './reducers/Auths';
import { Sectors } from './reducers/Sectors';
import { Confirmation } from './reducers/Confirmation';

export const reducers = combineReducers({
    Login, Sectors, Confirmation
});