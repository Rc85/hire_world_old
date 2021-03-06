import { combineReducers } from 'redux';
import { Login } from './reducers/Auths';
import { Sectors } from './reducers/Sectors';
import { Confirmation } from './reducers/Confirmation';
import { Alert } from './reducers/Alerts';
import { Prompt } from './reducers/Prompts';
import { Warning } from './reducers/Warnings';
import { Menu } from './reducers/Menus';
import { Config } from './reducers/Configs';
import { Loading } from './reducers/Loadings';
import { Selection } from './reducers/Selections';

export const reducers = combineReducers({
    Login, Sectors, Confirmation, Alert, Prompt, Warning, Menu, Config, Loading, Selection
});