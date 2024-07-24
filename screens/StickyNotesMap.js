import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { LocalTile } from 'react-native-maps';
import Toast from 'react-native-toast-message';
import ImageResizer from 'react-native-image-resizer';
import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, setDoc, deleteDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { firebaseapp, firebaseauth } from '../FirebaseConfig';
import { ref, uploadBytes, getDownloadURL, getStorage, deleteObject } from 'firebase/storage';
import customMapStyle from '../assets/customMapStyle.json';
import MarkerComponent from '../components/MarkerComponent';
import NoteModal from '../components/NoteModal';
import SearchBar from '../components/SearchBar';

const firestore = getFirestore(firebaseapp);
const storage = getStorage(firebaseapp);

const StickyNotesMap = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [tagText, setTagText] = useState('');
  const [tags, setTags] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [newCoordinate, setNewCoordinate] = useState(null);

  const [imageUris, setImageUris] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [color, setColor] = useState('');
  const [textColor, setTextColor] = useState('');

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

  const getAllMarkers = async () => {
    setLoading(true);
    try {
      const markersCollection = collection(firestore, 'stickyNoteMarkers');
      const markersSnapshot = await getDocs(markersCollection);
      const markersList = markersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMarkers(markersList);
      setFilteredMarkers(markersList);
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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'stickyNoteMarkers'), (snapshot) => {
      const markersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMarkers(markersList);
      setFilteredMarkers(markersList);
    });

    return () => unsubscribe();
  }, []);

  const addMarker = async (e) => {
    try {
      const newMarkerRef = doc(collection(firestore, 'stickyNoteMarkers'));

      const currentTimestamp = serverTimestamp();
      const newMarker = {
        id: newMarkerRef.id,
        user: userId,
        coordinate: e.nativeEvent.coordinate,
        text: 'New Sticky Note',
        tags: [],
        likes: 0,
        comments: [],
        createdAt: currentTimestamp,
        lastUpdatedAt: currentTimestamp,
        color: '#FFEB3B',
        textColor: '#000000',
        imageUris: [],
      }
      
      setSelectedMarker(newMarker);
      setNoteText('');
      setTagText('');
      setTags([]);
      setImageUris([]);

      setModalVisible(true);
      setEditVisible(true);

      setDoc(newMarkerRef, newMarker).then(() => {
        setMarkers([...markers, newMarker]);
        setFilteredMarkers([...markers, newMarker]);
      });

    } catch (error) {
      console.error('Error adding document: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add marker',
      });
    }
  };

  const updateMarker = async (updatedMarker) => {
    try {
      const markerRef = doc(firestore, 'stickyNoteMarkers', updatedMarker.id);
      if (updatedMarker.tags) {
        updatedMarker.tags = updatedMarker.tags.filter(tag => tag.trim() !== '');
      } else {
        updatedMarker.tags = [];
      }
      await updateDoc(markerRef, {
        text: updatedMarker.text,
        tags: updatedMarker.tags,
        comments: updatedMarker.comments,
        likes: updatedMarker.likes,
        coordinate: updatedMarker.coordinate,
        color: updatedMarker.color,
        textColor: updatedMarker.textColor,
        lastUpdatedAt: serverTimestamp(),
        imageUris: updatedMarker.imageUris,
      });

      for (let tag of updatedMarker.tags) {
        if (!await findExistingTag(tag)) {
          addTag(tag);
        }
      }
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
      // Remove images from storage
      const marker = markers.find(marker => marker.id === markerId);
      if (marker.imageUris) {
        removeImage(marker.imageUris);
      }
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

  const findExistingTag = async (tag) => {
    if (!tag) {
      console.log('Tag is empty');
      return;
    }
    tag = tag.trim().toLowerCase();
    try {
      const tagDoc = doc(firestore, 'tags', tag);
      const tagSnapshot = await getDoc(tagDoc);
      if (tagSnapshot.exists()) {
        const tagData = tagSnapshot.data();
        await updateDoc(tagDoc, {
          accessCount: tagData.accessCount + 1,
        });
      }
      return tagSnapshot.exists();
    } catch (error) {
      console.error("Error checking tag: ", error);
      return false;
    }
  };

  const addTag = async (tag) => {
    if (!tag) {
      console.log('Tag is empty');
      return;
    }
    if (tag.length > 20) {
      console.log('Tag is too long');
      return;
    }
    tag = tag.trim();
    try {
      const tagDoc = doc(firestore, 'tags', tag);
      await setDoc(tagDoc, {
        tag: tag,
        createdAt: serverTimestamp(),
        accessCount: 1,
      });
      console.log('Tag added successfully!');
    } catch (error) {
      console.error("Error adding tag: ", error);
    }
  };

  const searchTags = async (tag) => {
    if (tag.trim() === '') {
      setSuggestions([]);
      return;
    }
    try {
      const tagsCollection = collection(firestore, 'tags');
      const q = query(
        tagsCollection,
        where('tag', '>=', tag.toLowerCase()),
        where('tag', '<=', tag.toLowerCase() + '\uf8ff'),
        orderBy('accessCount', 'desc'),
        limit(15)
      );
      const tagsSnapshot = await getDocs(q);
      const tagsList = tagsSnapshot.docs.map(doc => (doc.data().tag));
      console.log('Tags: ', tagsList);
      setSuggestions(tagsList);
    } catch (error) {
      console.error("Error fetching tags: ", error);
      setSuggestions([]);
    }
  };

  const handleLongPress = (e) => {
    setNewCoordinate(e.nativeEvent.coordinate);
    addMarker(e);
  };

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    if (marker.text) { setNoteText(marker.text); }
    if (marker.tags) { setTags(marker.tags); }
    if (marker.color) { setColor(marker.color); } else { setColor('#FFEB3B'); }
    if (marker.textColor) { setTextColor(marker.textColor); } else { setTextColor('#000000'); }
    if (marker.imageUris) { setImageUris(marker.imageUris); } else { setImageUris([]); }

    setEditVisible(false);
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

    const updatedMarker = { ...selectedMarker, text: noteText, tags, color, textColor, lastUpdatedAt: serverTimestamp(), imageUris };
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) =>
        marker.id === selectedMarker.id ? updatedMarker : marker
      )
    );
    setFilteredMarkers((prevMarkers) =>
      prevMarkers.map((marker) =>
        marker.id === selectedMarker.id ? updatedMarker : marker
      )
    );
    updateMarker(updatedMarker);
    setEditVisible(false);
    setModalVisible(false);
    setSelectedMarker(null);
    setNoteText('');
    setTags([]);
    setImageUris([]);
  };

  const handleDelete = () => {
    setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== selectedMarker.id));
    setFilteredMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== selectedMarker.id));
    deleteMarker(selectedMarker.id);
    setEditVisible(false);
    setModalVisible(false);
    setSelectedMarker(null);
    setNoteText('');
    setTags([]);
    setImageUris([]);
  };

  const handleLike = async (markerId) => {
    try {
      const userLikesRef = doc(firestore, 'userLikes', `${userId}_${markerId}`);
      const userLikesDoc = await getDoc(userLikesRef);

      if (userLikesDoc.exists()) {
        //unlike the marker
        await deleteDoc(userLikesRef);
        setMarkers((prevMarkers) =>
          prevMarkers.map((marker) =>
            marker.id === markerId ? { ...marker, likes: marker.likes - 1 } : marker
          )
        );
        setFilteredMarkers((prevMarkers) =>
          prevMarkers.map((marker) =>
            marker.id === markerId ? { ...marker, likes: marker.likes - 1 } : marker
          )
        );
        if (selectedMarker && selectedMarker.id === markerId) {
          setSelectedMarker(prevMarker => ({
            ...prevMarker,
            likes: prevMarker.likes - 1
          }));
        }
        const updatedMarker = markers.find((marker) => marker.id === markerId);
        updateMarker(updatedMarker);
        return;
      }

      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) =>
          marker.id === markerId ? { ...marker, likes: marker.likes + 1 } : marker
        )
      );
      setFilteredMarkers((prevMarkers) =>
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

      await setDoc(userLikesRef, {
        userId,
        markerId,
        likedAt: serverTimestamp(),
      });

    } catch (error) {
      console.error('Error updating likes:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update likes',
      });
    }
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
    setFilteredMarkers((prevMarkers) =>
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
    const newCoordinate = e.nativeEvent.coordinate;
    const updatedMarker = markers.find(marker => marker.id === markerId);

    if (updatedMarker) {
      updatedMarker.coordinate = newCoordinate;

      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) =>
          marker.id === markerId ? updatedMarker : marker
        )
      );
      setFilteredMarkers((prevMarkers) =>
        prevMarkers.map((marker) =>
          marker.id === markerId ? updatedMarker : marker
        )
      );

      updateMarker(updatedMarker);
      console.log('Updated marker: ', updatedMarker);
    } else {
      console.log('No marker found');
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredMarkers(markers);
    } else {
      const filtered = markers.filter(marker =>
        marker.text.toLowerCase().includes(text.toLowerCase()) ||
        (marker.tags && marker.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase())))
      );
      setFilteredMarkers(filtered);
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      const filename = imageUri.split('/').pop();
      console.log('Uploading Image, Filename:', filename);
      if (!imageUri.startsWith('file://')) {
        throw new Error('Invalid image URI');
      }
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error('Failed to fetch image, status: ' + response.status);
      }
      const blob = await response.blob();
      console.log('Blob:', blob);
      const storageRef = ref(storage, `images/${selectedMarker.id}/${filename}`);
      console.log('Storage Ref:', storageRef);
      const snapshot = await uploadBytes(storageRef, blob);
      console.log('Uploaded image:', snapshot);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const removeImage = async (imageUris) => {
    try {
      for (let uri of imageUris) {
        const storageRef = ref(storage, uri);
        await deleteObject(storageRef);
      }
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };


  const handleAddTag = () => {
    if (tags.length >= 10) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Too many tags',
      });
      return;
    }
    if (tagText.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Tag cannot be empty',
      });
      return
    }
    if (tagText.length > 20) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Tag is too long',
      });
      return;
    }
    if (tags.includes(tagText.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Tag already exists',
      });
      return;
    }
    if (tagText.trim() !== '' && !tags.includes(tagText.trim())) {
      setTags([...tags, tagText.trim()]);
      setTagText('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleProfilePress = () => {
    navigation.navigate('UserProfile');
  };

  return (
    <View style={styles.container}>
      <SearchBar searchText={searchText} handleSearch={handleSearch} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          customMapStyle={customMapStyle}
          onLongPress={handleLongPress}
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
          {filteredMarkers.map((marker) => (
            <MarkerComponent
              key={marker.id}
              marker={marker}
              onPress={handleMarkerPress}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              userId={userId}
            />
          ))}
        </MapView>
      )}
      <NoteModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedMarker={selectedMarker}
        noteText={noteText}
        setNoteText={setNoteText}
        tags={tags}
        setTags={setTags}
        tagText={tagText}
        setTagText={setTagText}
        handleSave={handleSave}
        handleDelete={handleDelete}
        handleLike={handleLike}
        handleAddComment={handleAddComment}
        commentText={commentText}
        setCommentText={setCommentText}
        userId={userId}
        handleAddTag={handleAddTag}
        handleDeleteTag={handleDeleteTag}
        searchTags={searchTags}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
        editVisible={editVisible}
        setEditVisible={setEditVisible}
        color={color}
        setColor={setColor}
        textColor={textColor}
        setTextColor={setTextColor}
        imageUris={imageUris}
        setImageUris={setImageUris}
        uploadImage={uploadImage}
        removeImage={removeImage}
        style={styles.modal}
      />
      <Toast style={styles.toast} />
      <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
        <Text style={styles.profileButtonText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toast:{
    zIndex: 99,
    position: 'absolute',
  },
  modal: {
    zIndex:1,
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
  profileButton: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    backgroundColor: 'grey',
    padding: 10,
    borderRadius: 5,
  },
  profileButtonText: {
    color: 'white',
  },
});

export default StickyNotesMap;
