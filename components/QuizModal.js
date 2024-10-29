import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import useAppStyles from '../styles/useAppStyles';
import useAppColors from '../styles/useAppColors';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

const QuizModal = ({ visible, onClose, onComplete, selectedMarker }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const colors = useAppColors();
  const styles = useAppStyles().modalStyles;

  const quizData = selectedMarker?.lessonData?.quiz || []; // Ensure quiz data exists

  const handleAnswer = answer => {
    setAnswers([...answers, answer]);
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close-circle-outline" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Quiz: {selectedMarker?.lessonData?.title}</Text>
        <ScrollView>
          {quizData.length > 0 ? (
            <View>
              <Text style={styles.questionText}>{quizData[currentQuestion].question}</Text>
              {quizData[currentQuestion].options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleAnswer(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noQuizText}>No quiz available for this lesson.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default QuizModal;
