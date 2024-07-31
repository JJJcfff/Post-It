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
    Platform
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

const firestore = getFirestore(firebaseapp);
const storage = getStorage(firebaseapp);

const Settings = ({navigation}) => {
    const auth = getAuth();
    const user = auth.currentUser;

    const defaultAvatar = require('../assets/default-avatar.png');

    const [userId, setUserId] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [newPhotoURL, setNewPhotoURL] = useState('');
    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const unsubscribe = firebaseauth.onAuthStateChanged(user => {
            if (user) {
                setUserId(user.uid);
                setDisplayName(user.displayName || '');
                setPhotoURL(user.photoURL || defaultAvatar.uri);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const uploadImage = async (imageUri) => {
        // Existing image upload logic
    };

    const pickImage = async () => {
        // Existing image pick logic
    };

    const saveProfile = async () => {
        // Existing save profile logic
    };

    const handleEdit = () => {
        setNewPhotoURL(photoURL)
        setEditMode(true)
    }

    const viewFullImage = () => {
        console.log('TODO: View full image');
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.profileCard}>
                    <TouchableOpacity onPress={viewFullImage}>
                        <Image source={{uri: photoURL}} style={styles.avatar}/>
                    </TouchableOpacity>
                    <View style={styles.profileInfo}>
                        <Text style={styles.displayName}>{displayName}</Text>
                    </View>
                    <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
                        <MaterialIcons name="edit" size={16} color="black"/>
                    </TouchableOpacity>
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
    },
    displayName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    editIcon: {
        padding: 10,
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
