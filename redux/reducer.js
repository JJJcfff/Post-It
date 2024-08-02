import { TOGGLE_USER_LOCATION, TOGGLE_FAB } from './actionTypes';

const initialState = {
  showUserLocation: true,
  showFAB: true,
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_USER_LOCATION:
      return { ...state, showUserLocation: !state.showUserLocation };
    case TOGGLE_FAB:
      return { ...state, showFAB: !state.showFAB };
    default:
      return state;
  }
};

export default settingsReducer;
