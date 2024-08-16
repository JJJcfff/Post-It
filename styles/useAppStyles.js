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
    searchBar: {
      height: 40,
      borderColor: colors.secondary,
      borderWidth: 2,
      borderRadius: 10,
      margin: 10,
      paddingHorizontal: 10,
      backgroundColor: colors.primary,
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
    },

    toast: {
      zIndex: 99,
      position: 'absolute',
    },

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

  const mapStyles = StyleSheet.create({
    toast: {
      zIndex: 99,
      position: 'absolute',
    },
    modal: {
      zIndex: 1,
    },
    container: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    fab: {
      position: 'absolute',
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      right: 20,
      bottom: 20,
      borderRadius: 25,
      backgroundColor: colors.primary,
      elevation: 8,
      borderWidth: 2,
      borderColor: colors.secondary,
    },
    fabIcon: {
      width: 24,
      height: 24
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    modalContent: {
      width: 300,
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 10,
      elevation: 10,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#0000ff',
    },
  });

  const noteModalStyles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
      width: '100%',
      maxHeight: '90%',
      backgroundColor: 'white',
      borderRadius: 20,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 30,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalViewLarge: {
      width: '100%',
      maxHeight: '80%',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      borderRadius: 15,
      padding: 5,
      zIndex: 1,
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18,
    },
    backButton: {
      position: 'absolute',
      top: 10,
      left: 10,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: colors.secondary,
      padding: 10,
      zIndex: 1,
    },
    backButtonText: {
      color: colors.secondary,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    noteScrollView: {
      width: '100%',
    },
    modalText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: colors.secondary,
    },
    likeCommentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 10,
    },
    likeButton: {
      backgroundColor: colors.cyan,
      borderRadius: 10,
      padding: 10,
      borderWidth: 2,
      borderColor: colors.secondary,
    },
    likeButtonText: {
      color: colors.secondaryText,
      fontWeight: 'bold',
    },
    commentList: {
      width: '100%',
    },
    comment: {
      fontSize: 14,
      color: colors.secondary,
      marginBottom: 10,
      padding: 15,
      backgroundColor: colors.mint,
      borderRadius: 10,
    },
    commentsHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
      marginBottom: 5,
      width: '100%',
      color: colors.secondary,
    },
    noCommentsText: {
      fontSize: 14,
      color: '#999',
      fontStyle: 'italic',
      marginBottom: 10,
    },
    commentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      width: '100%',
    },
    commentInput: {
      height: 40,
      borderColor: colors.secondary,
      borderWidth: 2,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 10,
      backgroundColor: colors.primary,
      flex: 1,
    },
    addButton: {
      backgroundColor: colors.tomato,
      borderRadius: 10,
      padding: 10,
      marginLeft: 10,
      borderWidth: 2,
      borderColor: colors.secondary,
    },
    addButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    editButton: {
      backgroundColor: colors.pink,
      borderRadius: 10,
      padding: 10,
      borderWidth: 2,
      borderColor: colors.secondary,
    },
    editButtonText: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 40,
    },
    button: {
      backgroundColor: colors.cyan,
      borderRadius: 10,
      padding: 10,
      elevation: 2,
      marginHorizontal: 10,
      borderWidth: 2,
      borderColor: colors.secondary,
    },
    deleteButton: {
      backgroundColor: colors.pink,
    },
    buttonText: {
      color: colors.primaryText,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: 5,
    },
    tagBox: {
      backgroundColor: colors.yellow,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.secondary,
      padding: 8,
      marginRight: 10,
      marginVertical: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    tagText: {
      color: colors.secondary,
      fontSize: 12,
      flexWrap: 'wrap',
      maxWidth: 90,
    },
    deleteTagText: {
      color: 'red',
      fontSize: 12,
      marginLeft: 5,
    },
    scrollContainer: {
      width: '100%',
      maxHeight: '95%',
      marginTop: 20,
    },
    scrollContent: {
      alignItems: 'center',
    },
    tagInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
      width: '100%',
      flex: 1,
      zIndex: 1,
    },
    addTagButton: {
      backgroundColor: colors.cyan,
      borderRadius: 10,
      padding: 10,
      marginLeft: 10,
      borderWidth: 2,
      borderColor: colors.secondary,
    },
    addTagButtonText: {
      color: colors.secondaryText,
      fontWeight: 'bold',
    },
    tagInput: {
      height: 40,
      paddingHorizontal: 10,
      flex: 1,
      zIndex: 1,
      borderWidth:0,
      borderRadius: 10,
    },
    autocompleteContainer: {
      flex: 1,
      zIndex: 1,
    },
    suggestionText: {
      padding: 10,
      backgroundColor: colors.mint,
      borderBottomColor: colors.secondary,
      borderBottomWidth: 1,
      width: '100%',
    },
    borderedInput: {
      borderColor: colors.secondary,
      borderWidth: 2,
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
      width: '100%',
      minHeight: 80,
    },
    colorPickerContainer: {
      flex:1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 50,
      borderRadius: 10,
      padding: 10,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.secondary,

    },
    colorPickerLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginVertical: 10,
    },
    colorPreview: {
      width: '80%',
      height: 40,
      marginBottom: 20,
      alignSelf: 'center',
      borderRadius: 5,
      borderWidth: 2,
      borderColor: colors.secondary,
    },
    colorSwatches: {
      marginTop:20,
    },

    noteImage: {
      width: 200,
      height: 200,
      margin: 10,
    },
    imageList: {
      maxHeight: 220,
    },
    imageListContent: {
      paddingHorizontal: 10,
    },
    imageContainer: {
      position: 'relative',
      marginHorizontal: 5,
    },
    squareImageContainer: {
      width: 180,
      height: 180,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      overflow: 'hidden',
      borderRadius: 10,
    },
    deleteImageButton: {
      position: 'absolute',
      top: 5,
      right: 5,
      backgroundColor: 'rgba(255, 0, 0, 0.7)',
      borderRadius: 15,
      padding: 5,
    },
    deleteImageButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12,
    },
    addImageButton: {
      backgroundColor: colors.tomato,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.secondary,
      padding: 10,
      width: '100%',
      alignItems: 'center',
      marginBottom: 15,
    },
    addImageButtonText: {
      color: colors.secondaryText,
      fontWeight: 'bold',
    },
    fullScreenModal: {
      margin: 0,
      justifyContent: 'center',
    },
    profileInfo: {
      flex: 1,
      //side by side
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      margin: 15,
    },
    displayName: {
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    userProfileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: 10,
      backgroundColor: '#f5f5f5',
      marginTop: 10,
      borderRadius: 10,
    },
    modalProfileActionButton: {
      padding: 10,
      marginHorizontal: 10,
    },
  });

  const markerStyles = StyleSheet.create({
    stickyNote: {
      padding: 5,
      borderRadius: 5,
      borderWidth: 1,
      maxHeight: 260,
      maxWidth: 160,
    },
    stickyNoteText: {
      fontSize: 12,
      flexWrap: 'wrap',
      paddingBottom: 5,
    },
    counterText: {
      fontSize: 10,
    },
  });


  return { styles: generalStyles, typography, spacing,
    settingStyles,
    landingStyles,
  mapStyles,
    noteModalStyles,
    markerStyles,
  };
};

export default useAppStyles;
