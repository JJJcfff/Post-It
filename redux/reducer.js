import {TOGGLE_USER_LOCATION, TOGGLE_FAB} from './actionTypes';
import {SET_THEME, TOGGLE_SYSTEM_THEME} from "./actions";
import {Appearance} from "react-native";

const initialState = {
  showUserLocation: true,
  showFAB: true,
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_USER_LOCATION:
      return {...state, showUserLocation: !state.showUserLocation};
    case TOGGLE_FAB:
      return {...state, showFAB: !state.showFAB};
    case SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    case TOGGLE_SYSTEM_THEME:
      return {
        ...state,
        useSystemTheme: action.payload,
        theme: action.payload ? Appearance.getColorScheme() : state.theme,
      };
    default:
      return state;
  }
};

export default settingsReducer;
