import { StyleSheet, Appearance } from 'react-native';
import { useSelector } from "react-redux";

const getColorScheme = () => Appearance.getColorScheme();

const appColors = {
  light: {
    primary: '#fff',
    secondary: '#222',
    primaryText: '#000',
    secondaryText: '#fff',
    yellow: '#ffdf72',
    pink: '#ffa5a4',
    cyan: '#99dcd5',
    mint: '#ecf1eb',
    tomato: '#ff6347',
  },
  dark: {
    primary: '#000',
    secondary: '#666',
    primaryText: '#bbb',
    secondaryText: '#fff',
    yellow: '#b58921',
    pink: '#854242',
    cyan: '#007c79',
    mint: '#3d5442',
    tomato: '#a33124',
  }
};

export {appColors };
