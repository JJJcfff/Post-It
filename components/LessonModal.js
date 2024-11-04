import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import useAppStyles from '../styles/useAppStyles';
import useAppColors from '../styles/useAppColors';
import Icon from 'react-native-vector-icons/Ionicons';
import QuizModal from './QuizModal';

const LessonModal = ({ visible, onClose, onSave, selectedMarker, userId }) => {
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagText, setTagText] = useState('');
  const colors = useAppColors();
  const styles = useAppStyles().modalStyles;
  const [quizModalVisible, setQuizModalVisible] = useState(false);

  const handleAddTag = () => {
    if (tagText.trim() !== '' && !tags.includes(tagText.trim())) {
      setTags([...tags, tagText.trim()]);
      setTagText('');
    }
  };

  const handleSave = () => {
    if (lessonTitle.trim() === '' || lessonDescription.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Title and Description cannot be empty',
      });
      return;
    }
    const lessonData = {
      id: selectedMarker.id, // Using marker ID as lesson ID
      title: lessonTitle,
      description: lessonDescription,
      tags: tags,
      createdBy: userId,
      createdAt: new Date(),
      quiz: [], // Placeholder for quiz data
    };
    onSave(lessonData);
  };
  const isNewMarker = !selectedMarker || !selectedMarker.lessonData;

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close-circle-outline" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{isNewMarker ? 'Create New Lesson' : 'Edit Lesson'}</Text>
        <ScrollView>
          <Text style={styles.label}>Lesson Title</Text>
          <TextInput
            style={styles.input}
            value={lessonTitle}
            onChangeText={setLessonTitle}
            placeholder="Enter lesson title"
          />
          <Text style={styles.label}>Lesson Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={lessonDescription}
            onChangeText={setLessonDescription}
            placeholder="Enter lesson description"
            multiline={true}
            numberOfLines={4}
          />
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => setTags(tags.filter(t => t !== tag))}>
                  <Icon name="close" size={15} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagText}
              onChangeText={setTagText}
              placeholder="Add a tag"
            />
            <TouchableOpacity onPress={handleAddTag} style={styles.addTagButton}>
              <Icon name="add-circle-outline" size={25} color="#000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Lesson</Text>
          </TouchableOpacity>
          {/* Button to open Quiz Modal */}
          <TouchableOpacity onPress={() => setQuizModalVisible(true)} style={styles.quizButton}>
            <Text style={styles.quizButtonText}>Open Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>



      {/* Quiz Modal inside Lesson Modal */}
      <Modal
        visible={quizModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQuizModalVisible(false)}
      >
        <QuizModal
          visible={quizModalVisible}
          onClose={() => setQuizModalVisible(false)}
          onComplete={() => console.log("Quiz Completed")}
          selectedMarker={{ lessonData: { title: lessonTitle, quiz: [{ question: 'Example Question', options: ['Option 1', 'Option 2'] }] } }}
        />
      </Modal>
    </View>
  );
};

export default LessonModal;
