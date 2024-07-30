import { StyleSheet, Appearance } from 'react-native';

const getColorScheme = () => Appearance.getColorScheme();

const AppColors = {
    dark: {
        primary: '#000',
        secondary: '#fff',
        tertiary: '#333',
        light: '#555',
        dark: '#111',
        danger: '#ff6347',
        warning: '#ffd700',
        success: '#32cd32',
        info: '#87ceeb',
    },
    light: {
        primary: '#fff',
        secondary: '#000',
        tertiary: '#ddd',
        light: '#eee',
        dark: '#ccc',
        danger: '#ff6347',
        warning: '#ffd700',
        success: '#32cd32',
        info: '#87ceeb',
    },
};

const AppStyles = () => {
    const isDarkMode = getColorScheme() === 'dark';
    const colors = isDarkMode ? AppColors.dark : AppColors.light;

    return StyleSheet.create({
        container: { // container style for all screens
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.primary,
        },
        button: {
            backgroundColor: colors.secondary,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 1.5,
            elevation: 4,
        },
        buttonText: {
            color: colors.primary,
            fontSize: 16,
        },
        buttonDisabled: {
            backgroundColor: colors.tertiary,
            opacity: 0.5,
        },
        input: {
            width: '100%',
            height: 40,
            borderColor: colors.light,
            borderWidth: 1,
            marginBottom: 10,
            paddingHorizontal: 10,
            color: colors.primary,
        },
    });
};

export default AppStyles;
