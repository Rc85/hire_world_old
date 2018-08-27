import { combineReducers } from 'redux';
import { ToggleMenu } from './reducers/Togglers';
import { Register, Login } from './reducers/Auths';
import { Upload } from './reducers/Upload';
import { Sectors } from './reducers/Sectors';
import { Services } from './reducers/Services';
import { Confirmation } from './reducers/Confirmation';

export const reducers = combineReducers({
    ToggleMenu, Register, Login, Upload, Sectors, Services, Confirmation
});