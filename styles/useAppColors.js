import {useSelector} from "react-redux";
import {Appearance} from 'react-native';
import {appColors} from './AppColors';

const useAppColors = () => {
  const useSystemTheme = useSelector(state => state.useSystemTheme);
  const theme = useSelector(state => state.theme);

  const systemTheme = Appearance.getColorScheme();
  const currentTheme = useSystemTheme ? systemTheme : theme;
  return appColors[currentTheme] || appColors.light;
};

export default useAppColors;