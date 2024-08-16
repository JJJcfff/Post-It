import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, FlatList, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import ColorPicker, { Swatches, Preview, HueSlider, HSLSaturationSlider } from 'reanimated-color-picker';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Image as CachedImage } from 'react-native-expo-image-cache';
import DraggableFlatList from 'react-native-draggable-flatlist';
import ImageViewer from 'react-native-image-zoom-viewer';
import RNModal from 'react-native-modal';
import {getAuth} from "firebase/auth";
import Ionicons from 'react-native-vector-icons/Ionicons';
import {firebaseauth, firestore} from '../FirebaseConfig';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import useAppStyles from "../styles/useAppStyles";
import useAppColors from "../styles/useAppColors";




const NoteModal = ({
  modalVisible, setModalVisible, selectedMarker, noteText, setNoteText, tags, setTags, tagText, setTagText,
  handleSave, handleDelete, handleLike, handleAddComment, commentText, setCommentText, userId, handleAddTag,
  handleDeleteTag, searchTags, suggestions, setSuggestions, editVisible, setEditVisible, color, setColor, textColor, setTextColor,
  imageUris, setImageUris, uploadImage, removeImage,likeButtonPressable, setLikeButtonPressable, isNewMarker, setIsNewMarker,
}) => {
  const navigation = useNavigation();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [initialImageIndex, setInitialImageIndex] = useState(0);
  const [uploadingImages, setUploadingImages] = useState([]);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [noteOwnerUid, setNoteOwnerUid] = useState('');
  const [noteOwnerDisplayName, setNoteOwnerDisplayName] = useState('');
  const [noteOwnerPhotoURL, setNoteOwnerPhotoURL] = useState('');

  const styles = useAppStyles().noteModalStyles;
  const colors = useAppColors();


  useEffect(() => {
    if (!color) {
      setColor('#FFE900');
    }
    if (!textColor) {
      setTextColor('#000000');
    }
    if (selectedMarker) {
      setShowBackgroundColorPicker(false);
      setShowTextColorPicker(false);
      setLikeButtonPressable(true);
    }
  }, []);

  useEffect(() => {
    if (selectedMarker && selectedMarker.imageUris) {
      setImageUris(selectedMarker.imageUris);
    }
  }, [selectedMarker]);

  const auth = getAuth();
  const user = auth.currentUser;


  const fetchNoteOwnerInfo = async () => {
    try {
      if (!selectedMarker?.user) {
        throw new Error("No user ID found in selected marker.");
      }

      const noteOwnerDocRef = doc(firestore, 'users', selectedMarker.user);
      const noteOwnerDoc = await getDoc(noteOwnerDocRef);
      if (noteOwnerDoc.exists()) {
        const noteOwnerData = noteOwnerDoc.data();
        setNoteOwnerUid(selectedMarker.user);
        setNoteOwnerDisplayName(noteOwnerData.displayName);
        setNoteOwnerPhotoURL(noteOwnerData.photoURL);
        console.log("Note owner info fetched: ", noteOwnerData);
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching note owner info: ", error);
    }
  }

  useEffect(() => {
    if (selectedMarker) {
      fetchNoteOwnerInfo();
    }
  } , [selectedMarker]);

  const onSelectColor = (color) => {
    const selectedColor = color.hex || color;
    setColor(selectedColor);
    console.log("Color selected: ", selectedColor);
  };

  const onSelectTextColor = (color) => {
    const selectedColor = color.hex || color;
    setTextColor(selectedColor);
    console.log("Text Color selected: ", selectedColor);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this note?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: handleDelete,
          style: "destructive"
        }
      ]
    );
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        const newUploadingImages = result.assets.map(asset => ({
          uri: asset.uri,
          isUploading: true
        }));
        setUploadingImages(prev => [...prev, ...newUploadingImages]);

        for (const asset of result.assets) {
          const manipResult = await manipulateAsync(
            asset.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: SaveFormat.JPEG }
          );

          const uploadedUri = await uploadImage(manipResult.uri);
          if (uploadedUri) {
            setImageUris(prev => [...prev, uploadedUri]);
            console.log("Image uploaded: ", uploadedUri);
          } else {
            console.log("Error uploading image");
          }

          setUploadingImages(prev => prev.filter(img => img.uri !== asset.uri));
        }
      }
    } catch (error) {
      console.log("Error picking image: ", error);
    }
  };

  const handleDeleteImage = (imageUri) => {
    let UrisToRemove = [];
    UrisToRemove.push(imageUri);
    removeImage(UrisToRemove);
    setImageUris(prevImageUris => prevImageUris.filter(uri => uri !== imageUri));
  };

  const handleLikeButtonPressed = (id) => {
    if (likeButtonPressable) {
      handleLike(id);
    } else {
      console.log("Like button is not pressable");
    }
  }

  const handleMessageButtonPressed = () => {
    console.log('Message button pressed');
    navigation.navigate('Message', { otherUserId: noteOwnerUid });
  }

  const handleAddFriendButtonPressed = ( ) => {
    console.log('Add friend button pressed');
  }

  const renderViewImageItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => {
        setImageUrls(selectedMarker.imageUris.map(uri => ({ url: uri })));
        setInitialImageIndex(index);
        setImageModalVisible(true);
      }}
      style={styles.imageContainer}
    >
      <View style={styles.squareImageContainer}>
        <CachedImage uri={item} style={styles.noteImage} />
      </View>
    </TouchableOpacity>
  );

  const renderEditImageItem = useCallback(({ item, index, drag, isActive }) => {
    const isUploading = uploadingImages.some(img => img.uri === item);

    return (
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive || isUploading}
        onPress={() => {
          if (!isUploading) {
            const correctIndex = imageUris.indexOf(item); // Find the correct index
            setImageUrls(imageUris.map(uri => ({ url: uri })));
            setInitialImageIndex(correctIndex);
            setImageModalVisible(true);
          } else {
            console.log("Image is uploading, cannot view yet");
          }
        }}
        style={[
          styles.imageContainer,
          { opacity: isActive ? 0.8 : 1 },
        ]}
      >
        <View style={styles.squareImageContainer}>
          {isUploading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <CachedImage uri={item} style={styles.noteImage} />
          )}
        </View>
        {!isUploading && (
          <TouchableOpacity
            style={styles.deleteImageButton}
            onPress={() => handleDeleteImage(item)} // Pass the item itself
          >
            <Text style={styles.deleteImageButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }, [imageUris, uploadingImages]);

  return (
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
        <View style={[styles.modalView, !editVisible && styles.modalViewLarge]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => {
            setModalVisible(false);
            setEditVisible(false);
            if (isNewMarker) {
              setIsNewMarker(false);
            }
          }}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          {(editVisible && !isNewMarker) && (
            <TouchableOpacity style={styles.backButton} onPress={() => setEditVisible(false)}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          {!editVisible ? (
            <>
              <ScrollView style={styles.noteScrollView}>
                <Text style={styles.modalText}>{selectedMarker?.text}</Text>
                <FlatList
                  data={selectedMarker?.imageUris || []}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderViewImageItem}
                  horizontal={true}
                  style={styles.imageList}
                  contentContainerStyle={styles.imageListContent}
                />
                <View style={styles.likeCommentRow}>
                  <TouchableOpacity style={styles.likeButton} onPress={() => handleLikeButtonPressed(selectedMarker.id)}>
                    <Text style={styles.likeButtonText}>👍 Like ({selectedMarker?.likes})</Text>
                  </TouchableOpacity>
                  {selectedMarker?.user === userId && (
                      <TouchableOpacity style={styles.editButton} onPress={() => setEditVisible(true)}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                  )}
                </View>
                {selectedMarker?.tags && selectedMarker.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {selectedMarker.tags.map((tag, index) => (
                          <View key={index} style={styles.tagBox}>
                            <Text style={styles.tagText} numberOfLines={2} ellipsizeMode="tail">{tag}</Text>
                          </View>
                      ))}
                    </View>
                )}
                {(selectedMarker?.user === userId) ? (<View style={{alignItems:'center', flex:1, marginVertical:10}}><Text>Posted By You</Text></View>)
                  : (<View style={styles.userProfileContainer}>
                  <TouchableOpacity onPress={() => {console.log('UserProfile Pressed')}} style={styles.profileInfo}>
                    <CachedImage uri={noteOwnerPhotoURL} style={styles.avatar}/>
                    <Text style={styles.displayName}>{noteOwnerDisplayName}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleMessageButtonPressed} style={styles.modalProfileActionButton}>
                    <Ionicons name="chatbubble" size={20} color="#333" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAddFriendButtonPressed} style={styles.modalProfileActionButton}>
                    <Ionicons name="person-add" size={20} color="#333" />
                  </TouchableOpacity>
                </View>)}

                <View>
                  <Text style={styles.commentsHeader}>Comments ({selectedMarker?.comments?.length || 0}):</Text>
                  {selectedMarker?.comments?.length > 0 ? (
                      <FlatList
                          style={styles.commentList}
                          data={selectedMarker?.comments}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({ item }) => <Text style={styles.comment}>{item}</Text>}
                      />
                  ) : (
                      <Text style={styles.noCommentsText}>There are no comments yet.</Text>
                  )}
                </View>
              </ScrollView>
              <View style={styles.commentRow}>
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
            </>
          ) : (
            <View style= {{width:'100%'}}>
              <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.modalText}>
                  {isNewMarker ? 'Create Note' : 'Edit Note'}
                </Text>
                <TextInput
                  style={[styles.input, styles.borderedInput, { backgroundColor: color, color: textColor }]}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Edit your note"
                  multiline={true}
                  scrollEnabled={false}
                  autoFocus={true}
                />
                {imageUris.length > 0 && (
                  <>
                    <DraggableFlatList
                      data={[...imageUris, ...uploadingImages.map(img => img.uri)]}
                      onDragEnd={({ data }) => setImageUris(data.filter(uri => !uploadingImages.some(img => img.uri === uri)))}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={renderEditImageItem}
                      horizontal={true}
                      style={styles.imageList}
                      contentContainerStyle={styles.imageListContent}
                    />
                  </>
                )}
                <>
                  <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                    <Text style={styles.addImageButtonText}>Add Image</Text>
                  </TouchableOpacity>
                </>
                <View style={styles.tagInputRow}>
                  <Autocomplete
                    style={styles.tagInput}
                    containerStyle={styles.autocompleteContainer}
                    data={suggestions}
                    value={tagText}
                    onChangeText={(text) => {
                      setTagText(text);
                      searchTags(text);
                    }}
                    placeholder="Add a tag"
                    placeholderTextColor={'#666'}
                    flatListProps={{
                      keyExtractor: (_, idx) => idx.toString(),
                      renderItem: ({ item }) => (
                        <TouchableOpacity onPress={() => {
                          setTagText(item);
                          setSuggestions([]);
                        }}>
                          <Text style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                      ),
                    }}
                  />
                  <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                    <Text style={styles.addTagButtonText}>Add Tag</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <View key={index} style={styles.tagBox}>
                      <Text style={styles.tagText} numberOfLines={2} ellipsizeMode="tail">{tag}</Text>
                      <TouchableOpacity onPress={() => handleDeleteTag(tag)}>
                        <Text style={styles.deleteTagText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <View style={styles.colorPickerContainer}>
                  <TouchableOpacity onPress={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}>
                    <Text style={styles.colorPickerLabel}>Background Color:</Text>
                  </TouchableOpacity>
                  <ColorPicker
                    key="backgroundColorPicker"
                    value={color}
                    sliderThickness={20}
                    thumbSize={30}
                    onComplete={onSelectColor}
                    style={{ width: '95%' }}
                  >
                    <TouchableOpacity onPress={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}>
                      <Preview
                        hideInitialColor={true}
                        style={{ width: '60%', height: 30, marginBottom: 20, alignSelf: 'center' }}
                      />
                    </TouchableOpacity>
                    {showBackgroundColorPicker && (
                      <>
                        <HueSlider />
                        <HSLSaturationSlider style={{ marginTop: 20 }} />
                        <Swatches
                          colors={['#FF4E50', '#FC913A', '#F9D423', '#A8E6CF', '#69B4FF', '#C779D0']}
                          style={{ marginTop: 20 }}
                        />
                      </>
                    )}
                  </ColorPicker>
                  <TouchableOpacity onPress={() => setShowTextColorPicker(!showTextColorPicker)}>
                    <Text style={styles.colorPickerLabel}>Text Color:</Text>
                  </TouchableOpacity>
                  <ColorPicker
                    key="textColorPicker"
                    value={textColor}
                    sliderThickness={20}
                    thumbSize={30}
                    onComplete={onSelectTextColor}
                    style={{ width: '95%' }}
                  >
                    <TouchableOpacity onPress={() => setShowTextColorPicker(!showTextColorPicker)}>
                      <Preview
                        hideInitialColor={true}
                        style={{ width: '60%', height: 30, marginBottom: 20, alignSelf: 'center' }}
                      />
                    </TouchableOpacity>
                    {showTextColorPicker && (
                      <Swatches
                        colors={['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF']}
                      />
                    )}
                  </ColorPicker>
                </View>
                <View style={[styles.buttonRow]}>
                  <TouchableOpacity style={[styles.button, { flex: 1 }]} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  {!isNewMarker && <TouchableOpacity style={[styles.button, styles.deleteButton, {flex:1}]} onPress={confirmDelete}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      <RNModal isVisible={imageModalVisible} onBackdropPress={() => setImageModalVisible(false)} style={styles.fullScreenModal}>
        <ImageViewer
          imageUrls={imageUrls}
          index={initialImageIndex}
          onSwipeDown={() => setImageModalVisible(false)}
          enableSwipeDown={true}
        />
      </RNModal>
    </Modal>
  );
};
export default NoteModal;
