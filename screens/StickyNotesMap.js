import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { firebaseapp } from '../FirebaseConfig';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

const firestore = getFirestore(firebaseapp);

const StickyNotesMap = ({ navigation }) => {
  const [markers, setMarkers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      const notesSnapshot = await getDocs(collection(firestore, 'stickyNotes'));
      const notesData = notesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMarkers(notesData);
    };
    fetchNotes();
  }, []);

  const handleLongPress = (event) => {
    setSelectedLocation(event.nativeEvent.coordinate);
    setModalVisible(true);
  };

  const handleAddNote = async () => {
    if (selectedLocation && newNote) {
      const newMarker = {
        coordinate: selectedLocation,
        note: newNote,
        userId: firebaseauth.currentUser.uid,
      };
      const docRef = await addDoc(collection(firestore, 'stickyNotes'), newMarker);
      setMarkers([...markers, { ...newMarker, id: docRef.id }]);
      setModalVisible(false);
      setNewNote('');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        onLongPress={handleLongPress}
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.note}
          />
        ))}
      </MapView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Add a Sticky Note</Text>
            <TextInput
              style={styles.input}
              placeholder="Your note"
              value={newNote}
              onChangeText={setNewNote}
            />
            <Button title="Add Note" onPress={handleAddNote} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('UserProfile')}>
        <Text style={styles.profileButtonText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  profileButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
  },
  profileButtonText: {
    color: 'white',
  },
});

export default StickyNotesMap;
