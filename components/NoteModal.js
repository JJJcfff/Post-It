import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, FlatList, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import ColorPicker, { Swatches, Preview, HueSlider, HSLSaturationSlider } from 'reanimated-color-picker';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Image as CachedImage } from 'react-native-expo-image-cache';
import DraggableFlatList from 'react-native-draggable-flatlist';

const NoteModal = ({
  modalVisible, setModalVisible, selectedMarker, noteText, setNoteText, tags, setTags, tagText, setTagText,
  handleSave, handleDelete, handleLike, handleAddComment, commentText, setCommentText, userId, handleAddTag,
  handleDeleteTag, searchTags, suggestions, setSuggestions, editVisible, setEditVisible, color, setColor, textColor, setTextColor,
  imageUris, setImageUris, uploadImage
}) => {
  useEffect(() => {
    if (!color) {
      setColor('#FFE900');
    }
    if (!textColor) {
      setTextColor('#000000');
    }
  }, []);

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
        allowsEditing: true,
        quality: 1,
      });
  
      let uris = result.canceled ? [] : result.assets.map(data => data.uri);
  
      const uploadedImageUris = [];
  
      for (const uri of uris) {
        // Compress and convert to JPG
        const manipResult = await manipulateAsync(
          uri,
          [{ resize: { width: 800 } }], // Resize the image (optional)
          { compress: 0.7, format: SaveFormat.JPEG } // Compress to 70% and convert to JPG
        );
  
        const uploadedUri = await uploadImage(manipResult.uri);
        if (uploadedUri) {
          uploadedImageUris.push(uploadedUri);
          console.log("Image uploaded: ", uploadedUri);
        } else {
          console.log("Error uploading image");
        }
      }
      setImageUris([...imageUris, ...uploadedImageUris]);
  
    } catch (error) {
      console.log("Error picking image: ", error);
    }
  };

  const handleDeleteImage = (index) => {
    const newImageUris = [...imageUris];
    newImageUris.splice(index, 1);
    setImageUris(newImageUris);
  };

  const renderImageItem = useCallback(({ item, index, drag, isActive }) => (
    <TouchableOpacity
      onLongPress={drag}
      disabled={isActive}
      style={[
        styles.imageContainer,
        { opacity: isActive ? 0.8 : 1 },
      ]}
    >
      <CachedImage uri={item} style={styles.noteImage} />
      <TouchableOpacity style={styles.deleteImageButton} onPress={() => handleDeleteImage(index)}>
        <Text style={styles.deleteImageButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), []);

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
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          {editVisible && (
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
                  renderItem={({ item }) => (
                    <CachedImage uri={item} style={styles.noteImage} />
                  )}
                  horizontal={true}
                />
              </ScrollView>
              <View style={styles.likeCommentRow}>
                <TouchableOpacity style={styles.likeButton} onPress={() => handleLike(selectedMarker.id)}>
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
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
              <Text style={styles.modalText}>Edit Note</Text>
              <TextInput
                style={[styles.input, styles.borderedInput, { backgroundColor: color, color: textColor }]}
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Edit your note"
                multiline={true}
                scrollEnabled={false}
              />
              <DraggableFlatList
                data={imageUris}
                onDragEnd={({ data }) => setImageUris(data)}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderImageItem}
                horizontal={true}
                style={{maxHeight: 200}}
              />
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Text style={styles.addImageButtonText}>Add Image</Text>
              </TouchableOpacity>
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
              <View style={styles.colorPickerContainer}>
                <Text style={styles.colorPickerLabel}>Background Color:</Text>
                <ColorPicker
                  key="backgroundColorPicker"
                  value={color}
                  sliderThickness={20}
                  thumbSize={30}
                  onComplete={onSelectColor}
                  style={{ width: '95%' }}
                >
                  <Preview
                    hideInitialColor={true}
                    style={{ width: '60%', height: 30, marginBottom: 20, alignSelf: 'center' }}
                  />
                  <HueSlider />
                  <HSLSaturationSlider style={{ marginTop: 20 }} />
                  <Swatches
                    colors={['#FF4E50', '#FC913A', '#F9D423', '#A8E6CF', '#69B4FF', '#C779D0']}
                    style={{ marginTop: 20 }}
                  />
                </ColorPicker>
                <Text style={styles.colorPickerLabel}>Text Color:</Text>
                <ColorPicker
                  key="textColorPicker"
                  value={textColor}
                  sliderThickness={20}
                  thumbSize={30}
                  onComplete={onSelectTextColor}
                  style={{ width: '95%' }}
                >
                  <Preview
                    hideInitialColor={true}
                    style={{ width: '60%', height: 30, marginBottom: 20, alignSelf: 'center' }}
                  />
                  <Swatches
                    colors={['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF']}
                  />
                </ColorPicker>
              </View>
              <View style={[styles.buttonRow]}>
                <TouchableOpacity style={styles.button} onPress={handleSave}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={confirmDelete}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: '100%',
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
  modalViewLarge: {
    width: '100%',
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6347',
    borderRadius: 20,
    padding: 5,
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#9E9E9E',
    borderRadius: 10,
    padding: 10,
    zIndex: 1,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noteScrollView: {
    width: '100%',
  },
  modalText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  likeCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  likeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
  },
  likeButtonText: {
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
  commentsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    width: '100%',
    color: '#333',
  },
  noCommentsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
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
  editButton: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    padding: 10,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 5,
  },
  tagBox: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: '#333',
    fontSize: 10,
    flexWrap: 'wrap',
    maxWidth: 90,
  },
  deleteTagText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 5,
  },
  scrollContainer: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    flex: 1,
    zIndex: 1,
  },
  addTagButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
  },
  addTagButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tagInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 0,
    borderRadius: 10,
    paddingHorizontal: 10,
    flex: 1,
    zIndex: 1,
  },
  autocompleteContainer: {
    flex: 1,
    zIndex: 1,
  },
  suggestionText: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    width: '100%',
  },
  borderedInput: {
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  colorPickerContainer: {
    width: '90%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  colorPickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noteImage: {
    width: 200,
    height: 200,
    margin: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  deleteImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 15,
    padding: 5,
  },
  deleteImageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  addImageButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  addImageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NoteModal;
