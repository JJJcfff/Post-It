import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import LessonModal from '../components/LessonModal';

const EducationalMap = () => {
  const [lessonModalVisible, setLessonModalVisible] = useState(false);

  const handleImageClick = () => {
    setLessonModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Clickable Image */}
      <TouchableOpacity onPress={handleImageClick}>
        <Image
          source={require('../assets/images/maryland.png')} // Adjust the path if needed
          style={styles.image}
        />
      </TouchableOpacity>

      {/* Lesson Modal */}
      <Modal
        visible={lessonModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLessonModalVisible(false)}
      >
        <LessonModal
          visible={lessonModalVisible}
          onClose={() => setLessonModalVisible(false)}
          onSave={(lessonData) => console.log("Lesson Saved", lessonData)}
          selectedMarker={{ id: 'maryland-marker' }}
          userId="123" // Example user ID
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: 300, // Adjust the width as needed
    height: 400, // Adjust the height as needed
    resizeMode: 'contain',
  },
});

export default EducationalMap;
