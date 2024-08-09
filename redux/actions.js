import { TOGGLE_USER_LOCATION, TOGGLE_FAB } from './actionTypes';

export const toggleUserLocation = () => ({
  type: TOGGLE_USER_LOCATION,
});

export const toggleFAB = () => ({
  type: TOGGLE_FAB,
});

export const SET_THEME = 'SET_THEME';
export const TOGGLE_SYSTEM_THEME = 'TOGGLE_SYSTEM_THEME';

export const setTheme = (theme) => ({
  type: SET_THEME,
  payload: theme,
});

export const toggleSystemTheme = (useSystemTheme) => ({
  type: TOGGLE_SYSTEM_THEME,
  payload: useSystemTheme,
});