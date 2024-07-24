import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Modal, ActivityIndicator, findNodeHandle } from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
  LongPressGestureHandler,
} from 'react-native-gesture-handler';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, doc } from 'firebase/firestore';
import { firebaseapp, firebaseauth } from '../FirebaseConfig';
import Svg, { Rect, Defs, Pattern } from 'react-native-svg';
import StickyNote from './Canvas/StickyNote';
import Toast from 'react-native-toast-message';

const firestore = getFirestore(firebaseapp);

const addNote = async (x, y, text, userId) => {
  try {
    let currentTimestamp = serverTimestamp()
    const docRef = await addDoc(collection(firestore, 'stickyNotes'), {
      noteId: '',
      x: x,
      y: y,
      text: text,
      userId: userId,
      timeCreated: currentTimestamp,
      lastModified: currentTimestamp,
    });

    console.log('Document written with ID: ', docRef.id);

    await updateDoc(doc(firestore, 'stickyNotes', docRef.id), {
      noteId: docRef.id,
    });
    console.log('Document updated with ID: ', docRef.id);
    return {
      noteId: docRef.id,
      x: x,
      y: y,
      text: text,
      userId: userId,
      timeCreated: currentTimestamp,
      lastModified: currentTimestamp,
    }
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

const editNote = async (noteId, x, y, text) => {
  try {
    await updateDoc(doc(firestore, 'stickyNotes', noteId), {
      x: x,
      y: y,
      text: text,
      lastModified: serverTimestamp(),
    });
    console.log('Document updated with ID: ', noteId);
  } catch (error) {
    console.error('Error updating document: ', error);
  }
};

const deleteNote = async (noteId) => {
  try {
    await deleteDoc(doc(firestore, 'stickyNotes', noteId));
    console.log('Document deleted with ID: ', noteId);
  } catch (error) {
    console.error('Error deleting document: ', error);
  }
};

const getNoteById = async (noteId) => {
  try {
    const docSnap = await getDocs(doc(firestore, 'stickyNotes', noteId));
    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data());
      return docSnap.data();
    } else {
      console.log('No such document!');
    }
  } catch (error) {
    console.error('Error getting document: ', error);
  }
};

const convertCoordinates = (x, y, canvasWidth, canvasHeight, pinchScale, totalPan, pinchCenter) => {
  console.log('Convert coordinates:', x, y, canvasWidth, canvasHeight, pinchScale, totalPan);
  const viewportOffsetX = (totalPan.x - pinchCenter.x) / pinchScale + pinchCenter.x;
  const viewportOffsetY = (totalPan.y - pinchCenter.y) / pinchScale + pinchCenter.y;

  const svgX = (x / pinchScale) + viewportOffsetX;
  const svgY = (y / pinchScale) + viewportOffsetY;

  return { svgX, svgY };
};



const StickyNotesCanvas = () => {
  const [userId, setUserId] = useState('');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [pinchCenter, setPinchCenter] = useState({ x: 0, y: 0 });
  const [pinchScale, setPinchScale] = useState(1);
  const [totalPan, setTotalPan] = useState({ x: 0, y: 0 });
  const [currentPan, setCurrentPan] = useState({ x: 0, y: 0 }); 
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const svgRef = useRef(null);

  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(firestore, 'stickyNotes'));
      const notes = [];
      querySnapshot.forEach((doc) => {
        notes.push({ ...doc.data(), noteId: doc.id });
      });
      setNotes(notes);
      setLoading(false);
    };
    fetchNotes();
  }, []);

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

  const handlePanGestureEvent = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      console.log('Pan activated', nativeEvent);
      setCurrentPan({ x: nativeEvent.translationX, y: nativeEvent.translationY });
    }
  };

  const handlePanGestureEnd = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      console.log('Pan ended');
      setTotalPan(prev => ({
        x: prev.x - nativeEvent.translationX,
        y: prev.y - nativeEvent.translationY,
      }));
      console.log('Total pan:', totalPan);
      setCurrentPan({ x: 0, y: 0 });
    }
  };

  const handlePinchGestureEvent = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      console.log('Pinch activated');
      console.log(nativeEvent);
      setPinchScale(nativeEvent.scale);
      setPinchCenter({ x: nativeEvent.focalX, y: nativeEvent.focalY });
    }
  };

  const handlePinchGestureEnd = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      setPinchScale(nativeEvent.scale);
    }
  };

  const handleLongPress = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      console.log('This is a long press event');
      console.log(nativeEvent);
      const { x, y } = nativeEvent;
      const { svgX, svgY } = convertCoordinates(x,y, canvasWidth, canvasHeight, pinchScale, totalPan, pinchCenter);

      setSelectedPoint({ x: svgX, y: svgY });
      setModalVisible(true);
    }
  };

  const handleAddNote = async () => {
    console.log('handleAddNote');
    console.log(newNote, userId);
    let noteData;
    if (selectedPoint && newNote && userId) {
      noteData = await addNote(
        selectedPoint.x,
        selectedPoint.y,
        newNote,
        userId
      );

      setNotes([...notes, noteData]);

      setModalVisible(false);
      setNewNote('');
      setSelectedPoint(null);
    } else {
      console.error('Note data incomplete or user not authenticated');
      Toast.show({
        type: 'error',
        text1: 'Note data incomplete or user not authenticated',
      });
      setModalVisible(false);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={handlePanGestureEvent}
        onHandlerStateChange={handlePanGestureEnd}
      >
        <PinchGestureHandler
          onGestureEvent={handlePinchGestureEvent}
          onHandlerStateChange={handlePinchGestureEnd}
        >
          <LongPressGestureHandler
            onHandlerStateChange={handleLongPress}
            minDurationMs={800}
          >
            <Svg
              // ref={svgRef}
              // onLayout={(event) => {
              //   const { width, height } = event.nativeEvent.layout;
              //   setCanvasWidth(width);
              //   setCanvasHeight(height);
              // }}
              style={[styles.canvas]}
              viewBox={`${(totalPan.x - pinchCenter.x - currentPan.x) / pinchScale + pinchCenter.x} ${(totalPan.y - pinchCenter.y - currentPan.y) / pinchScale + pinchCenter.y} ${1000 / pinchScale} ${1000 / pinchScale}`}          >
              <Defs>
                <Pattern id="background-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
                  <Rect x="0" y="0" width="50" height="50" fill="lightgray" />
                  <Rect x="50" y="50" width="50" height="50" fill="lightgray" />
                </Pattern>
              </Defs>

              <Rect x="0" y="0" width="100%" height="100%" fill="url(#background-pattern)" />

              {notes.map(note => (
                <StickyNote
                  key={note.noteId}
                  x={note.x}
                  y={note.y}
                  text={note.text}
                />
              ))}
            </Svg>
          </LongPressGestureHandler>
        </PinchGestureHandler>
      </PanGestureHandler>

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

      {loading && (
        <Modal
          visible={true}
          transparent={true}
          animationType="none"
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="black" />
          </View>
        </Modal>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    ...StyleSheet.absoluteFill,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default StickyNotesCanvas;