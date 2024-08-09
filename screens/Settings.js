import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Appearance,
  Button,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import {getAuth} from 'firebase/auth';
import {doc, getDoc, getFirestore, serverTimestamp, setDoc, updateDoc,} from 'firebase/firestore';
import {getDownloadURL, getStorage, ref, uploadBytes} from 'firebase/storage';
import {firebaseapp, firebaseauth} from '../FirebaseConfig';
import {Image as CachedImage} from 'react-native-expo-image-cache';
import {manipulateAsync, SaveFormat} from 'expo-image-manipulator';
import {setTheme, toggleSystemTheme, toggleUserLocation, toggleFAB} from '../redux/actions';
import HorizontalSeparator from '../components/HorizontalSeparator';
import useAppStyles from "../styles/useAppStyles";
import {appColors} from '../styles/AppColors';

const firestore = getFirestore(firebaseapp);
const storage = getStorage(firebaseapp);

const Settings = ({ navigation }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const dispatch = useDispatch();

    const [userId, setUserId] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [newPhotoURL, setNewPhotoURL] = useState('');
    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [notesCount, setNotesCount] = useState(0);
    const [likesCount, setLikesCount] = useState(0);
    const [friendsCount, setFriendsCount] = useState(0);

    // Redux states for theme
    const theme = useSelector((state) => state.theme);
    const useSystemTheme = useSelector((state) => state.useSystemTheme);

    // states for sticky notes map screen
    const showUserLocation = useSelector((state) => state.showUserLocation);
    const showFAB = useSelector((state) => state.showFAB);

    const appStyles = useAppStyles();
    const settingStyles = appStyles.settingStyles;
    const styles = appStyles.styles;
    const spacing = appStyles.spacing;
    const systemTheme = Appearance.getColorScheme();
    const currentTheme = useSystemTheme ? systemTheme : theme;
    const colors = appColors[currentTheme] || appColors.light;

    useEffect(() => {
        const unsubscribe = firebaseauth.onAuthStateChanged(async (user) => {
            if (user) {
                setUserId(user.uid);
                await fetchUserData(user.uid);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (useSystemTheme) {
            const systemTheme = Appearance.getColorScheme();
            dispatch(setTheme(systemTheme));
        }
    }, [useSystemTheme]);

    const fetchUserData = async (userId) => {
        try {
            const userRef = doc(firestore, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                setDisplayName(userData.displayName || '');
                setPhotoURL(
                  userData.photoURL === ''
                    ? defaultAvatarUri
                    : userData.photoURL || defaultAvatarUri
                );
                setNotesCount(userData.notes ? userData.notes.length : 0);
                setLikesCount(userData.likes ? userData.likes.length : 0);
                setFriendsCount(userData.friends ? userData.friends.length : 0);
                console.log('User data fetched:', userData);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const uploadImage = async (imageUri) => {
        try {
            if (!imageUri.startsWith('file://')) {
                throw new Error('Invalid image URI');
            }
            const response = await fetch(imageUri);
            if (!response.ok) {
                throw new Error(
                  'Failed to fetch image, status: ' + response.status
                );
            }
            const blob = await response.blob();
            const storageRef = ref(
              storage,
              `profilePictures/${userId}/profilePicture.jpg`
            );
            const snapshot = await uploadBytes(storageRef, blob);
          return await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const pickImage = async () => {
        try {
            const permissionResult =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert('Permission to access gallery is required!');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                allowsMultipleSelection: false,
            });

            if (!result.canceled) {
                setEditLoading(true);
                const manipResult = await manipulateAsync(
                  result.assets[0].uri,
                  [{ resize: { width: 500 } }],
                  { compress: 0.7, format: SaveFormat.JPEG }
                );
                const downloadUri = await uploadImage(manipResult.uri);
                setNewPhotoURL(downloadUri);
                setEditLoading(false);
            } else {
                setEditLoading(false);
            }
        } catch (error) {
            console.error('Error picking image: ', error);
        }
    };

    const saveProfile = async () => {
        setLoading(true);
        const updatedData = {
            displayName: displayName,
            photoURL: newPhotoURL || photoURL,
            modifiedAt: serverTimestamp(),
        };
        try {
            const userDocRef = doc(firestore, 'users', userId);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                await updateDoc(userDocRef, updatedData);
            } else {
                await setDoc(userDocRef, {
                    ...updatedData,
                    createdAt: serverTimestamp(), // Add createdAt field
                });
            }
            setPhotoURL(newPhotoURL || photoURL);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
        setLoading(false);
        setEditMode(false);
    };

    const handleEdit = () => {
        setNewPhotoURL(photoURL);
        setEditMode(true);
    };

    const handleThemeChange = (value) => {
        if (value === 'system') {
            dispatch(toggleSystemTheme(true));
        } else {
            dispatch(toggleSystemTheme(false));
            dispatch(setTheme(value));
        }
    };

    return (
      <View style={styles.container}>
          <ScrollView>
              <View style={settingStyles.profileCard}>
                  <TouchableOpacity
                    onPress={handleEdit}
                    style={[styles.flexColumn, {marginLeft: spacing.sm}]}
                  >
                      <CachedImage uri={photoURL} style={settingStyles.avatar} />
                      <Text style={styles.h3Text}>{displayName}</Text>
                  </TouchableOpacity>

                  <View style={[styles.container, {alignItems:'center'}]}>
                      <Text style={[styles.h4Text, {marginVertical:spacing.sm}]}>
                          Notes: {notesCount}
                      </Text>
                    <Text style={[styles.h4Text, {marginVertical:spacing.sm}]}>
                        Likes: {likesCount}
                      </Text>
                    <Text style={[styles.h4Text, {marginVertical:spacing.sm}]}>
                          Friends: {friendsCount}
                      </Text>
                  </View>
              </View>

              <Text style={[styles.h2Text, {marginLeft:spacing.sm, marginVertical: spacing.sm}]}>Options:</Text>
              <HorizontalSeparator />

              <View style={settingStyles.settingOptions}>
                  <Text style={styles.h4Text}>Show User Location:</Text>
                  <Switch
                    trackColor={{ false: colors.secondary, true: colors.cyan }}
                    thumbColor={colors.primary}
                    value={showUserLocation}
                    onValueChange={() => dispatch(toggleUserLocation())}
                    style={styles.borderedSwitch}
                  />
              </View>

            <View style={settingStyles.settingOptions}>
                  <Text style={styles.h4Text}>Show FAB:</Text>
                  <Switch
                    trackColor={{ false: colors.secondary, true: colors.cyan }}
                    thumbColor={colors.primary}
                    value={showFAB}
                    onValueChange={() => dispatch(toggleFAB())}
                    style={styles.borderedSwitch}
                  />
              </View>

              <View style={[settingStyles.settingOptions, useSystemTheme && { opacity: 0.5 }]}>
                  <Text style={styles.h4Text}>Dark Mode:</Text>
                  <Switch
                    trackColor={{ false: colors.secondary, true: colors.cyan }}
                    thumbColor={colors.primary}
                    value={theme === 'dark'}
                    onValueChange={(value) =>
                      !useSystemTheme && handleThemeChange(value ? 'dark' : 'light')
                    }
                    disabled={useSystemTheme}
                    style={styles.borderedSwitch}
                  />
              </View>

            <View style={settingStyles.settingOptions}>
                  <Text style={styles.h4Text}>Follow System Theme:</Text>
                  <Switch
                    trackColor={{ false: colors.secondary, true: colors.cyan }}
                    thumbColor={colors.primary}
                    value={useSystemTheme}
                    onValueChange={(isSystemTheme) => {
                        if (isSystemTheme) {
                            handleThemeChange('system');
                        } else {
                            dispatch(toggleSystemTheme(false));
                        }
                    }}
                    style={styles.borderedSwitch}
                  />
              </View>


              <TouchableOpacity onPress={handleLogout} style={[styles.borderedButton, {backgroundColor: colors.pink, marginTop: spacing.lg}]}>
                  <Text style={styles.borderedButtonText}>Log Out</Text>
              </TouchableOpacity>

              {loading && <ActivityIndicator size="large" color="#0000ff" />}
          </ScrollView>

          <Modal
            animationType="slide"
            transparent={true}
            visible={editMode}
            onRequestClose={() => setEditMode(false)}
          >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
              >
                  <View style={styles.modalContent}>
                      <TouchableOpacity onPress={pickImage}>
                          <Image
                            source={
                                newPhotoURL === ''
                                  ? { uri: photoURL }
                                  : { uri: newPhotoURL }
                            }
                            style={settingStyles.modalAvatar}
                          />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.borderedInput}
                        placeholder="Display Name"
                        value={displayName}
                        onChangeText={setDisplayName}
                        autoCapitalize="none"
                        placeholderTextColor="#999"
                      />
                      {editLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                      ) : (
                        <Button title="Save" onPress={saveProfile} />
                      )}
                      <Button
                        title="Cancel"
                        onPress={() => {
                            setEditMode(false);
                            setNewPhotoURL(photoURL);
                        }}
                      />
                  </View>
              </KeyboardAvoidingView>
          </Modal>
      </View>
    );
};

export default Settings;

