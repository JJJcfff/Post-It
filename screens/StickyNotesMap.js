import React, { useState } from 'react';
import { View, Keyboard, Text, Modal, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Marker, UrlTile, LocalTile } from 'react-native-maps';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react/cjs/react.development';
import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, setDoc, deleteDoc, serverTimestamp, doc } from 'firebase/firestore';
import { firebaseapp, firebaseauth } from '../FirebaseConfig';

const firestore = getFirestore(firebaseapp);



const StickyNotesMap = () => {
  const MAX_NOTE_LENGTH = 200;

  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [commentText, setCommentText] = useState('');


  //firebase helper functions****************************************************
  //get current user's UID
  useEffect(() => {
    const setAuthUser = () => {
      const user = firebaseauth.currentUser;
      if (user) {
        setUserId(user.uid);
      }
    };

    const unsubscribe = firebaseauth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      }
    });
    setAuthUser();

    return () => unsubscribe();
  }, []);


  //get all markers from firestore
  const getAllMarkers = async () => {
    setLoading(true);
    try {
      const markersCollection = collection(firestore, 'stickyNoteMarkers');
      const markersSnapshot = await getDocs(markersCollection);
      const markersList = markersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMarkers(markersList);
    } catch (error) {
      console.error("Error fetching markers: ", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load markers',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllMarkers();
  }, []);

  //add a marker to firestore
  const addMarker = async (e) => {
    try {
      const newMarkerRef = doc(collection(firestore, 'stickyNoteMarkers')); // Create a reference to a new document

      await setDoc(newMarkerRef, {
        id: newMarkerRef.id,
        user: userId,
        coordinate: e.nativeEvent.coordinate,
        text: 'New Sticky Note',
        likes: 0,
        comments: [],
        createdAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
      });
      console.log('Document successfully written!', newMarkerRef.id, userId, serverTimestamp());

      const newMarkerSnapshot = await getDoc(newMarkerRef);
      const newMarker = newMarkerSnapshot.data();
      console.log('New marker: ', newMarker);

      setMarkers([...markers, newMarker]);
      setSelectedMarker(newMarker);
      setModalVisible(true);
      setEditVisible(true);
    } catch (error) {
      console.error('Error adding document: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add marker',
      });
    }
  };

  //update a marker in firestore
  const updateMarker = async (updatedMarker) => {
    try {
      const markerRef = doc(firestore, 'stickyNoteMarkers', updatedMarker.id);
      await updateDoc(markerRef, {
        text: updatedMarker.text,
        comments: updatedMarker.comments,
        likes: updatedMarker.likes,
        coordinate: updatedMarker.coordinate,
        lastUpdatedAt: serverTimestamp(),
      });
      console.log('Document successfully updated!', updatedMarker.id);
    } catch (error) {
      console.error('Error updating document: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update marker',
      });
    }
  };

  const deleteMarker = async (markerId) => {
    try {
      await deleteDoc(doc(firestore, 'stickyNoteMarkers', markerId));
      console.log('Document successfully deleted!');
    } catch (error) {
      console.error('Error deleting document: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete marker',
      });
    }
  };


  const handleLongPress = (e) => {
    addMarker(e);
  };

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    setNoteText(marker.text);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (noteText.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Note cannot be empty',
      });
      return;
    }

    const updatedMarker = { ...selectedMarker, text: noteText };
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) =>
        marker.id === selectedMarker.id ? updatedMarker : marker
      )
    );
    updateMarker(updatedMarker); // Update Firestore
    setEditVisible(false);
    setModalVisible(false);
    setSelectedMarker(null);
    setNoteText('');
  };

  const handleDelete = () => {
    setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== selectedMarker.id));
    deleteMarker(selectedMarker.id); // Delete from Firestore
    setEditVisible(false);
    setModalVisible(false);
    setSelectedMarker(null);
    setNoteText('');
  };

  const handleLike = (markerId) => {
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) =>
        marker.id === markerId ? { ...marker, likes: marker.likes + 1 } : marker
      )
    );
    if (selectedMarker && selectedMarker.id === markerId) {
      setSelectedMarker(prevMarker => ({
        ...prevMarker,
        likes: prevMarker.likes + 1
      }));
    }
    const updatedMarker = markers.find((marker) => marker.id === markerId);
    updateMarker(updatedMarker);
  };

  const handleAddComment = () => {
    if (commentText.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Comment cannot be empty',
      });
      return;
    }
    const updatedMarker = {
      ...selectedMarker,
      comments: [...selectedMarker.comments, commentText],
    };
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) =>
        marker.id === selectedMarker.id ? updatedMarker : marker
      )
    );
    updateMarker(updatedMarker);
    setSelectedMarker(updatedMarker);
    setCommentText('');
    Keyboard.dismiss();
  };

  const handleDragStart = (e) => {
    console.log('Drag started');
  };

  const handleDragEnd = (e, markerId) => {
    if (selectedMarker) { // Check if a marker is selected
      const newCoordinate = e.nativeEvent.coordinate;
      const updatedMarker = {
        ...selectedMarker,
        coordinate: newCoordinate
      };

      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) =>
          marker.id === markerId ? updatedMarker : marker
        )
      );
      updateMarker(updatedMarker);
    }
  };


  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          onLongPress={handleLongPress}
          mapType='mutedStandard'
          showsBuildings={false}
          showsIndoors={false}
          cameraZoomRange={{ min: 0, max: 20 }}
          minZoomLevel={0}
          maxZoomLevel={20}
        >
          <LocalTile
            pathTemplate={'../assets/tiles/white_tile.png'}
            tileSize={256}
          />          
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              onPress={() => handleMarkerPress(marker)}
              draggable={marker.user === userId}
              onDragStart={(e) => handleDragStart(e)}
              onDragEnd={(e) => handleDragEnd(e, marker.id)}
            >
              <View style={styles.stickyNote}>
                <Text style={styles.stickyNoteText} numberOfLines={5}>
                  {marker.text}
                </Text>
                <Text style={styles.counterText}>Likes: {marker.likes}</Text>
                <Text style={styles.counterText}>Comments: {marker.comments.length}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            {!editVisible ? (
              <>
                <ScrollView style={styles.noteScrollView}>

                  <Text style={styles.modalText}>{(selectedMarker?.text)}</Text>
                </ScrollView>
                <View style={styles.likeCommentRow}>
                  <TouchableOpacity style={styles.likeButton} onPress={() => handleLike(selectedMarker.id)}>
                    <Text style={styles.likeButtonText}>👍 Like ({selectedMarker?.likes})</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  style={styles.commentList}
                  data={selectedMarker?.comments}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => <Text style={styles.comment}>{item}</Text>}
                />
                <View style={styles.buttonRow}>
                  <TextInput
                    style={styles.commentInput}
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Add a comment"
                    multiline={true}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddComment}>
                    <Text style={styles.addButtonText}>Comment</Text>
                  </TouchableOpacity>
                </View>
                {selectedMarker?.user === userId && (
                  <TouchableOpacity style={styles.editButton} onPress={() => setEditVisible(true)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <Text style={styles.modalText}>Edit Note</Text>
                <TextInput
                  style={styles.input}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Edit your note"
                  multiline={true}
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => setEditVisible(false)}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  stickyNote: {
    backgroundColor: 'yellow',
    padding: 5,
    borderRadius: 5,
    maxHeight: 100,
    maxWidth: 100,
  },
  stickyNoteText: {
    fontSize: 12,
    flexWrap: 'wrap',
  },
  counterText: {
    fontSize: 10,
    color: 'gray',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6347',
    borderRadius: 20,
    padding: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  noteScrollView: {
    maxHeight: 200, // Adjust this value as needed
    width: '100%',
  },
  modalText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingTop: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '48%',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  likeCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    paddingTop: 10,
  },
  likeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  likeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flex: 1,
  },
  addButton: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentList: {
    width: '100%',
  },
  comment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  editButton: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#9E9E9E',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0000ff',
  },
});

export default StickyNotesMap;
