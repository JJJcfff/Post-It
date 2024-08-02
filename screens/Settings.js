import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Modal,
    Image,
    KeyboardAvoidingView,
    Platform, Switch
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {getAuth, updateProfile} from 'firebase/auth';
import {getFirestore, collection, query, where, getDocs} from 'firebase/firestore';
import {getStorage, ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage';
import {firebaseapp, firebaseauth} from '../FirebaseConfig';
import {Image as CachedImage} from 'react-native-expo-image-cache';
import {MaterialIcons} from '@expo/vector-icons';
import {manipulateAsync, SaveFormat} from "expo-image-manipulator";
import defaultAvatar from "../assets/default-avatar.png";
import ImageViewer from 'react-native-image-zoom-viewer';
import RNModal from 'react-native-modal';
import { useDispatch, useSelector } from 'react-redux';
import { toggleUserLocation, toggleFAB } from '../redux/actions';


const firestore = getFirestore(firebaseapp);
const storage = getStorage(firebaseapp);

const Settings = ({navigation}) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const dispatch = useDispatch();

    const defaultAvatarUri = 'https://firebasestorage.googleapis.com/v0/b/post-it-1d453.appspot.com/o/profilePictures%2FjUEWlc8B6nRi6C1yXp2FzZvNTwQ2%2FprofilePicture.jpg?alt=media&token=027763e8-3797-440d-8773-94471d153e62'

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


    //states for sticky notes map screen
    const showUserLocation = useSelector(state => state.showUserLocation);
    const showFAB = useSelector(state => state.showFAB);

    useEffect(() => {
        const unsubscribe = firebaseauth.onAuthStateChanged(async user => {
            if (user) {
                setUserId(user.uid);
                setDisplayName(user.displayName || '');
                setPhotoURL((user.photoURL === '') ? defaultAvatarUri : user.photoURL);
                await fetchUserData(user.uid);
            }
        });

        return () => unsubscribe();
    }, []);


    const fetchUserData = async (userId) => {
        //TODO: Fetch user data from Firestore
        setNotesCount(0);
        setLikesCount(0);
        setFriendsCount(0);
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
                throw new Error('Failed to fetch image, status: ' + response.status);
            }
            const blob = await response.blob();
            const storageRef = ref(storage, `profilePictures/${userId}/profilePicture.jpg`);
            const snapshot = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert("Permission to access gallery is required!");
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
                  [{resize: {width: 500}}],
                  {compress: 0.7, format: SaveFormat.JPEG}
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
        try {
            await updateProfile(user, {displayName, photoURL: newPhotoURL || photoURL}).then(() => {
                setPhotoURL(newPhotoURL || photoURL);
                console.log('Profile updated successfully');
            }).catch((error) => {
                console.error('Error updating profile:', error);
            });
        } catch (error) {
            console.error('Error updating profile:', error);
        }
        setLoading(false);
        setEditMode(false);
    };

    const handleEdit = () => {
        setNewPhotoURL(photoURL)
        setEditMode(true)
    }

    return (
      <View style={styles.container}>
          <ScrollView>
              <View style={styles.profileCard}>
                  <TouchableOpacity onPress={handleEdit} style={styles.profileInfo}>
                      <CachedImage uri={photoURL} style={styles.avatar}/>
                      <Text style={styles.displayName}>{displayName}</Text>
                  </TouchableOpacity>

                  <View style={styles.statsInfo}>
                      <Text style={styles.statsText}>Notes: {notesCount}</Text>
                      <Text style={styles.statsText}>Likes: {likesCount}</Text>
                      <Text style={styles.statsText}>Friends: {friendsCount}</Text>
                  </View>
              </View>
              <View style={styles.setting}>
                  <Text>Show User Location:</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={"#f4f3f4"}
                    value={showUserLocation}
                    onValueChange={() => dispatch(toggleUserLocation())}
                  />
              </View>
              <View style={styles.setting}>
                  <Text>Show FAB:</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={"#f4f3f4"}
                    value={showFAB}
                    onValueChange={() => dispatch(toggleFAB())}
                  />
              </View>
              <Button title="Logout" onPress={handleLogout}/>
              {loading && <ActivityIndicator size="large" color="#0000ff"/>}
          </ScrollView>

          <Modal
            animationType="slide"
            transparent={true}
            visible={editMode}
            onRequestClose={() => setEditMode(false)}
          >
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
              >
                  <View style={styles.modalContent}>
                      <TouchableOpacity onPress={pickImage}>
                          <Image source={newPhotoURL === '' ? {uri: photoURL} : {uri: newPhotoURL}}
                                 style={styles.modalAvatar}/>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.input}
                        placeholder="Display Name"
                        value={displayName}
                        onChangeText={setDisplayName}
                        autoCapitalize="none"
                        placeholderTextColor="#999"
                      />
                      {editLoading ? <ActivityIndicator size="large" color="#0000ff"/> :
                        <Button title="Save" onPress={saveProfile}/>
                      }
                      <Button title="Cancel" onPress={() => {
                          setEditMode(false);
                          setNewPhotoURL(photoURL)
                      }}/>
                  </View>
              </KeyboardAvoidingView>
          </Modal>
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
    },
    setting: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        margin: 10,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginRight: 20,
        margin: 15,
    },
    profileInfo: {
        flex: 1,
        alignItems: 'center',
    },
    displayName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    statsText: {
        fontSize: 16,
        color: '#555',
        marginVertical: 10,
    },
    statsInfo: {
        flex: 1,
        alignItems: 'center',

    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
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


export default Settings;
