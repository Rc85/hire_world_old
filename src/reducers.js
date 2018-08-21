import { combineReducers } from 'redux';
import { ToggleMenu } from './reducers/Togglers';
import { Register, Login } from './reducers/Auths';
import { Upload } from './reducers/Upload';
import { Categories } from './reducers/Categories';
import { Services } from './reducers/Services';

export const reducers = combineReducers({
    ToggleMenu, Register, Login, Upload, Categories, Services
});