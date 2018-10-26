import { combineReducers } from 'redux';
import { Login } from './reducers/Auths';
import { Sectors } from './reducers/Sectors';
import { Confirmation } from './reducers/Confirmation';
import { Alert } from './reducers/Alerts';
import { Prompt } from './reducers/Prompts';
import { Warning } from './reducers/Warnings';
import { Menu } from './reducers/Menus';

export const reducers = combineReducers({
    Login, Sectors, Confirmation, Alert, Prompt, Warning, Menu
});