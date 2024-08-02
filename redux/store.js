import { createStore } from 'redux';
import settingsReducer from './reducer';

const store = createStore(settingsReducer);

export default store;