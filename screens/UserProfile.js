import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseapp } from '../FirebaseConfig';

const UserProfile = ({ navigation }) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const firestore = getFirestore(firebaseapp);
  const storage = getStorage(firebaseapp);

  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [newPhotoURL, setNewPhotoURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const q = query(collection(firestore, 'stickyNotes'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const notesData = querySnapshot.docs.map(doc => doc.data());
      setNotes(notesData);
    };
    fetchNotes();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewPhotoURL(result.uri);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    let updatedPhotoURL = photoURL;

    if (newPhotoURL) {
      const response = await fetch(newPhotoURL);
      const blob = await response.blob();
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, blob);
      updatedPhotoURL = await getDownloadURL(storageRef);
    }

    await updateProfile(user, {
      displayName,
      photoURL: updatedPhotoURL,
    });

    setPhotoURL(updatedPhotoURL);
    setLoading(false);
    alert('Profile updated successfully');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <TouchableOpacity onPress={pickImage}>
        <Image source={photoURL ? { uri: photoURL } : require('../assets/default-avatar.png')} style={styles.avatar} />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#1e90ff" />
      ) : (
        <Button title="Save Changes" onPress={handleSave} />
      )}
      <Text style={styles.notesTitle}>Your Notes</Text>
      {notes.map((note, index) => (
        <View key={index} style={styles.note}>
          <Text>{note.note}</Text>
        </View>
      ))}
      <Button title="Back to Home" onPress={() => navigation.navigate('StickyNotesMap')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePhotoText: {
    color: '#1e90ff',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  notesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  note: {
    width: '100%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default UserProfile;
