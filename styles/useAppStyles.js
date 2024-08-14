import { StyleSheet } from 'react-native';
import useAppColors from './useAppColors';

//const appColors = {
//   light: {
//     primary: '#fff',
//     secondary: '#222',
//     primaryText: '#000',
//     secondaryText: '#fff',
//     yellow: '#ffdf72',
//     pink: '#ffa5a4',
//     cyan: '#99dcd5',
//     mint: '#ecf1eb',
//     tomato: '#ff6347',
//   },
//   dark: {
//     primary: '#000',
//     secondary: '#666',
//     primaryText: '#bbb',
//     secondaryText: '#fff',
//     yellow: '#b58921',
//     pink: '#b25756',
//     cyan: '#007c79',
//     mint: '#3d5442',
//     tomato: '#a33124',
//   }
// };

const useAppStyles = () => {
  const colors = useAppColors();

  const generalStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary,
    },
    flexRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    flexColumn: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backgroundImage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },

    //buttons & switches
    buttonContainer80: {
      width: '80%',
      alignItems: 'center',
      marginBottom: 20,
    },
    buttonContainer50: {
      width: '50%',
      alignItems: 'center',
      marginBottom: 20,
    },

    borderedButton: {
      borderColor: colors.secondary,
      borderWidth: 2,
      elevation: 5,
      borderRadius: 25,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginVertical: 10,
      backgroundColor: colors.primary,
      width: '80%',
    },
    borderedButtonText: {
      color: colors.secondary,
      fontWeight: 'bold',
      fontSize: 18,
    },
    borderedSwitch: {
      borderWidth: 2,
      borderColor: colors.secondary,
      borderRadius: 16,
      width: 52,
      height: 32,
    },

    //texts
    h1Text: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.secondary,
    },
    h2Text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.secondary,
    },
    h3Text: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.secondary,
    },
    h4Text: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.secondary,
    },
    h5Text: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.secondary,
    },
    h6Text: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.secondary,
    },
    bodyText: {
      fontSize: 16,
      color: colors.secondary,
    },
    captionText: {
      fontSize: 12,
      color: colors.secondary,
    },

    //inputs
    borderedInput: {
      borderColor: colors.secondary,
      borderWidth: 2,
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.primary,
      color: colors.secondary,
      fontSize: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.secondary,
      margin: 10,
    },
    inputContainer: {
      width: '80%',
      marginVertical: 5,
    },


    //modal
    modalContent: {
      backgroundColor: colors.primary,
      padding: 20,
      margin: 20,
      borderRadius: 10,
    },
    modalContainer: {
      flex:1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    }

  });

  const typography = {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    h4: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    h5: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    h6: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 12,
    },
  };

  const spacing = {
    xs: 5, // 5
    sm: 10, // 10
    md: 15, // 15
    lg: 20, // 20
    xl: 30, // 30
  };

  const settingStyles = StyleSheet.create({
    settingOptions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 2,
      borderBottomColor: '#222',
      backgroundColor: colors.primary,
    },
    settingOptionsText: {
      fontSize: 20,
      fontWeight: 'bold',
      margin: 15,
      color: colors.secondary,
    },
    profileCard: {
      backgroundColor: colors.primary,
      shadowColor: colors.secondary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 10,
      margin: 10,
      borderWidth: 2,
      borderColor: colors.secondary,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginRight: 20,
      margin: 15,
    },
    displayName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.secondary,
    },
    modalAvatar: {
      width: 300,
      height: 300,
      borderRadius: 150,
      marginBottom: 30,
      marginTop: 20,
      borderWidth: 1,
      borderColor: '#999',
    },

  });

  const landingStyles = StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: 50,
    },
  });

  return { styles: generalStyles, typography, spacing,
    settingStyles,
    landingStyles,

  };
};

export default useAppStyles;
