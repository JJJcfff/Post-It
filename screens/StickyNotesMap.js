import React, {useEffect, useState} from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
  Modal,
  Platform
} from 'react-native';
import MapView from 'react-native-maps';
import Toast from 'react-native-toast-message';
import {collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp , setDoc, updateDoc, where} from 'firebase/firestore';
import {firebaseapp, firebaseauth} from '../FirebaseConfig';
import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from 'firebase/storage';
import customMapStyle from '../assets/customMapStyle.json';
import MarkerComponent from '../components/MarkerComponent';
import EmojiComponent from "../components/EmojiComponent";
import NoteModal from '../components/NoteModal';
import SearchBar from '../components/SearchBar';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import locationIcon from '../assets/location-icon.png';
import {useSelector} from "react-redux";
import {ActivityIndicator} from "react-native";
import useAppStyles from "../styles/useAppStyles";
import useAppColors from "../styles/useAppColors";
import Icon from "react-native-vector-icons/Ionicons";
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import {useRoute} from "@react-navigation/native";

const firestore = getFirestore(firebaseapp);
const storage = getStorage(firebaseapp);

const StickyNotesMap = () => {
  const route = useRoute();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [isNewMarker, setIsNewMarker] = useState(false);
  const [likeButtonPressable, setLikeButtonPressable] = useState(true);

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

  const [hasPermission, setHasPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const showUserLocation = useSelector(state => state.showUserLocation);
  const [followsUserLocation, setFollowsUserLocation] = useState(true);
  const showFAB = useSelector(state => state.showFAB);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  //states for emoji
  const [emoji, setEmoji] = useState('');
  const [userEmoji, setUserEmoji] = useState(null);
  const [emojiList, setEmojiList] = useState([]);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [isChangingEmoji, setIsChangingEmoji] = useState(false);



  const colors = useAppColors();
  const styles = useAppStyles().mapStyles;
  const otherStyles = useAppStyles();

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

  useEffect(() => {
    if (route.params) {
      console.log('Selected Note: ', route.params.marker);
      setSelectedMarker(route.params.marker);
      setRegion({
        latitude: route.params.marker.coordinate.latitude,
        longitude: route.params.marker.coordinate.longitude,
        latitudeDelta: 0.00422,
        longitudeDelta: 0.00421,
      })
      setNoteText(route.params.marker.text??'');
      setTags(route.params.marker.tags??[]);
      setColor(route.params.marker.color??'#FFEB3B');
      setTextColor(route.params.marker.textColor??'#000000');
      setImageUris(route.params.marker.imageUris??[]);
      setEditVisible(false);
      setModalVisible(true);
    }
  }, [route.params]);

  useEffect(() => {
    let subscription;

    const startWatchingLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          setCurrentLocation(location.coords);
        }
      );
    };

    startWatchingLocation();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
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

  const getAllEmojis = async () => {
    try {
      const emojisCollection = collection(firestore, 'emojiMarkers');
      const emojisSnapshot = await getDocs(emojisCollection);
      const emojisList = emojisSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmojiList(emojisList);
      await setUserEmoji(emojisList.find(emoji => emoji.userId === userId));
    } catch (error) {
      console.error("Error fetching emojis: ", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load emojis',
      });
    }
  }

  useEffect(() => {
    getAllMarkers();
    getAllEmojis();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'stickyNoteMarkers'), (snapshot) => {
      const markersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMarkers(markersList);
      setFilteredMarkers(markersList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'emojiMarkers'), (snapshot) => {
      const updatedEmojiList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmojiList(updatedEmojiList);
    });

    return () => unsubscribe();
  }, []);


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
        tag_lower: tag.toLowerCase(),
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
    tag = tag.toLowerCase().trim();
    try {
      const tagsCollection = collection(firestore, 'tags');
      const q = query(
        tagsCollection,
        where('tag_lower', '>=', tag),
        where('tag_lower', '<=', tag + '\uf8ff'),
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

  const addMarker = async () => {
    try {
      const newMarkerRef = doc(collection(firestore, 'stickyNoteMarkers'));

      const currentTimestamp = serverTimestamp();
      const newMarker = {
        id: newMarkerRef.id,
        user: userId,

        coordinate: newCoordinate,
        text: noteText,
        tags: tags,
        color: color,
        textColor: textColor,
        imageUris: imageUris,

        likes: 0,
        comments: [],

        createdAt: currentTimestamp,
        lastUpdatedAt: currentTimestamp,
      }

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

  const handleLongPress = (e) => {
    setNewCoordinate(e.nativeEvent.coordinate);
    setIsNewMarker(true);
    setNoteText('');
    setTagText('');
    setTags([]);
    setImageUris([]);

    setModalVisible(true);
    setEditVisible(true);
  };

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    setNoteText(marker.text??'');
    setTags(marker.tags??[]);
    setColor(marker.color??'#FFEB3B');
    setTextColor(marker.textColor??'#000000');
    setImageUris(marker.imageUris??[]);
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

    if (isNewMarker) {
      addMarker();
      setModalVisible(false);
      setIsNewMarker(false);
      setNoteText('');
      setTags([]);
      setImageUris([]);
      return;
    }

    const updatedMarker = {
      ...selectedMarker,
      text: noteText,
      tags,
      color,
      textColor,
      lastUpdatedAt: serverTimestamp(),
      imageUris
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
      setLikeButtonPressable(false);
      const userLikesRef = doc(firestore, 'userLikes', `${userId}_${markerId}`);
      const userLikesDoc = await getDoc(userLikesRef);

      if (userLikesDoc.exists()) {
        //unlike the marker
        await deleteDoc(userLikesRef);
        setMarkers((prevMarkers) =>
          prevMarkers.map((marker) =>
            marker.id === markerId ? {...marker, likes: marker.likes - 1} : marker
          )
        );
        setFilteredMarkers((prevMarkers) =>
          prevMarkers.map((marker) =>
            marker.id === markerId ? {...marker, likes: marker.likes - 1} : marker
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
        setLikeButtonPressable(true);
        return;
      }

      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) =>
          marker.id === markerId ? {...marker, likes: marker.likes + 1} : marker
        )
      );
      setFilteredMarkers((prevMarkers) =>
        prevMarkers.map((marker) =>
          marker.id === markerId ? {...marker, likes: marker.likes + 1} : marker
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

      setLikeButtonPressable(true);

    } catch (error) {
      console.error('Error updating likes:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update likes',
      });
      setLikeButtonPressable(true);
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

  const handleLocatePress = async () => {
    console.log("Current Location: ", currentLocation);
    if (hasPermission) {
      console.log('Locating user...');
      setIsLocating(true);
      try {
        let location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.00422,
          longitudeDelta: 0.00421,
        });
      } catch (error) {
        console.error('Failed to fetch location:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to locate',
        });
      } finally {
        setIsLocating(false);
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Location Permission',
        text2: 'Location permission is not granted',
      });
    }
  };

  const AddEmoji = async (emoji) => {
    console.log('Adding Emoji');
    if (!emoji) return;

    const coordinates = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    }

    const currentTimestamp = serverTimestamp();

    try {
      const emojiRef = doc(firestore, 'emojiMarkers', userId);
      const emojiData = {
        userId: userId,
        emoji: emoji,
        coordinate: coordinates,
        weight: 1,
        createdAt: userEmoji ? userEmoji.createdAt : currentTimestamp,
        lastUpdatedAt: currentTimestamp,
        expireAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
      };

      await setDoc(emojiRef, emojiData);

      // Add to emoji history
      const emojiHistoryRef = doc(collection(firestore, 'emojiHistory'));
      await setDoc(emojiHistoryRef, {
        ...emojiData,
        createdAt: currentTimestamp,
      });

      setUserEmoji(emojiData);
      setEmojiList((prevEmojis) => [...prevEmojis, emojiData]);
    } catch (error) {
      console.error('Error adding/updating emoji: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add/update emoji',
      });
    }
  };
  const updateEmoji = async (updatedEmoji) => {
    try {
      const emojiRef = doc(firestore, 'emojiMarkers', userId);
      await updateDoc(emojiRef, {
        emoji: updatedEmoji.emoji,
        coordinate: updatedEmoji.coordinate,
        weight: updatedEmoji.weight,
        lastUpdatedAt: serverTimestamp(),
      });

      // Add to emoji history
      const emojiHistoryRef = doc(collection(firestore, 'emojiHistory'));
      await setDoc(emojiHistoryRef, {
        ...updatedEmoji,
        createdAt: serverTimestamp(),
      });

    } catch (error) {
      console.error('Error updating emoji: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update emoji',
      });
    }
  };


  const handleEmojiPress = (emoji) => {
    const MAX_EMOJI_WEIGHT = 3;
    const updatedEmoji = {
      ...emoji,
      weight: emoji.weight < MAX_EMOJI_WEIGHT ? emoji.weight + 0.1 : MAX_EMOJI_WEIGHT,
    };
    if (updatedEmoji.weight === MAX_EMOJI_WEIGHT) {
      Toast.show({
        type: 'info',
        text1: 'Stoooooooooooooooop!',
        text2: 'I can\'t get bigger!',
      })
      return;
    }
    updateEmoji(updatedEmoji).then(() => {
      setUserEmoji(updatedEmoji);
      setEmojiList((prevEmojis) =>
        prevEmojis.map((e) =>
          e.userId === emoji.userId ? updatedEmoji : e
        )
      );
    }).catch((error) => {
      console.error('Error updating emoji: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update emoji',
      });
    });
  }

  const handleDeleteEmoji = async () => {
    try {
      const emojiRef = doc(firestore, 'emojiMarkers', userId);
      await deleteDoc(emojiRef);
      setEmojiList((prevEmojis) =>
        prevEmojis.filter((e) => e.userId !== userId)
      );
      setUserEmoji(null);
      setEmojiPickerVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Emoji Deleted',
        text2: 'Your emoji has been successfully deleted',
      });
      setEmoji('');
      setUserEmoji(null);
      setIsChangingEmoji(false);
    } catch (error) {
      console.error('Error deleting emoji: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete emoji',
      });
    }
  };

  const handleAddOrUpdateEmoji = async (selectedEmoji) => {
    console.log('Selected Emoji: ', selectedEmoji);
    console.log('Current Location: ', currentLocation);
    console.log('User Emoji: ', userEmoji);
    console.log('Emoji List: ', emojiList);
    console.log('Is Changing Emoji: ', isChangingEmoji);
    setEmoji(selectedEmoji);
    setEmojiPickerVisible(false);
    setRegion({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.00422,
      longitudeDelta: 0.00421,
    })

    if (isChangingEmoji) {
      console.log('Changing Emoji');
      console.log(userEmoji) ;
      const updatedEmoji = { ...userEmoji, emoji: selectedEmoji };
      setUserEmoji(updatedEmoji);
      updateEmoji(updatedEmoji);
      setEmojiList((prevEmojis) =>
        prevEmojis.map((e) => (e.userId === userId ? updatedEmoji : e))
      );
    } else {
      AddEmoji(selectedEmoji);
    }
  };

  function handleEmojiFabPress() {
    if (userEmoji) {
      setIsChangingEmoji(true);
      setEmojiPickerVisible(true);
    } else {
      setEmojiPickerVisible(true);
    }
  }


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <SearchBar searchText={searchText} handleSearch={handleSearch}/>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.container}>
              <MapView
                style={styles.map}
                customMapStyle={customMapStyle}
                onLongPress={handleLongPress}
                showsBuildings={false}
                showsIndoors={false}
                cameraZoomRange={{min: 0, max: 20}}
                minZoomLevel={0}
                maxZoomLevel={20}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation={showUserLocation}
                followsUserLocation={false}
              >
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
                {emojiList.map((emoji) => (
                  <EmojiComponent
                    key={emoji.id}
                    marker={emoji}
                    onPress={handleEmojiPress}
                    userId={userId}
                  />
                ))}

              </MapView>

              <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.fab} onPress={()=> {
                  handleEmojiFabPress()
                }} disabled={isLocating}>
                  <Icon name="happy-outline" size={25} color="#000"/>
                </TouchableOpacity>
                {showFAB && (
                  <TouchableOpacity style={styles.fab} onPress={handleLocatePress} disabled={isLocating}>
                    {isLocating ? (
                      <ActivityIndicator size="small" color="#0000ff" />
                    ) : (
                      <Icon name="navigate" size={25} color="#000"/>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <Modal
            animationType="slide"
            transparent={true}
            visible={emojiPickerVisible}
            onRequestClose={() => {
              setEmojiPickerVisible(false);
            }}
          >
            <View style={[otherStyles.styles.modalContainer]}>
              <View style={[otherStyles.styles.modalContent, { width: '80%', height: '60%' }]}>
                <TouchableOpacity
                  style={[otherStyles.noteModalStyles.closeButton, { top: 5, right: 5 }]}
                  onPress={() => setEmojiPickerVisible(false)}
                >
                  <Icon name="close-circle-outline" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={[otherStyles.styles.h2Text, { alignSelf: 'center' }]}>{!isChangingEmoji ?'Record Your Mood' : 'Update Your Mood'}</Text>
                <View style={{ flex: 1, marginBottom: 40, marginTop: 20 }}>
                  <EmojiSelector
                    category={Categories.emotion}
                    showTabs={false}
                    showSearchBar={false}
                    onEmojiSelected={(emoji) => handleAddOrUpdateEmoji(emoji)}
                  />
                </View>
                {isChangingEmoji && (
                  <TouchableOpacity
                    style={[otherStyles.styles.borderedButton, {marginBottom: 0, backgroundColor: colors.pink}]}
                    onPress={handleDeleteEmoji}
                  >
                    <Text style={otherStyles.styles.borderedButtonText}>Delete Mood</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>

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
            setLikeButtonPressable={setLikeButtonPressable}
            likeButtonPressable={likeButtonPressable}
            isNewMarker={isNewMarker}
            setIsNewMarker={setIsNewMarker}
          />
          <Toast style={otherStyles.styles.toast}/>
        </View>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
};

export default StickyNotesMap;
