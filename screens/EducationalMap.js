import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import SvgPanZoom from 'react-native-svg-pan-zoom';
import usaStatesData from '../assets/usa-states.json';
import LessonModal from '../components/LessonModal';
import QuizModal from '../components/QuizModal';

const EducationalMap = () => {
  const [paths, setPaths] = useState([]);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [quizModalVisible, setQuizModalVisible] = useState(false);

  useEffect(() => {
    console.log('Component Mounted');
    if (usaStatesData && usaStatesData.features) {
      console.log('USA States Data Loaded:', usaStatesData);
      const newPaths = usaStatesData.features.flatMap((feature, featureIndex) => {
        const { geometry, id, properties } = feature;
        const featureId = id || `feature-${featureIndex}`;
        console.log(`Processing Feature: ${featureId}`);

        // Handle Polygon and MultiPolygon types
        const coordinatesArray = geometry.type === 'Polygon'
          ? [geometry.coordinates]
          : geometry.coordinates;

        return coordinatesArray.flatMap((polygonCoordinates, polygonIndex) => {
          console.log(`Processing Polygon: ${polygonIndex} for Feature: ${featureId}`);
          const path = polygonCoordinates
            .map(ring => {
              return ring
                .map((point, i) => {
                  if (Array.isArray(point) && point.length === 2) {
                    const adjustedPoint = [point[0], -point[1]];
                    return (i === 0 ? 'M' : 'L') + adjustedPoint.join(' ');
                  } else {
                    console.warn('Invalid point format:', point);
                    return '';
                  }
                })
                .filter(segment => segment !== '')
                .join(' ');
            })
            .join(' ') + 'Z';

          const uniqueKey = `${featureId}-${polygonIndex}`;
          return {
            path,
            key: uniqueKey,
            name: properties.name,
          };
        });
      });
      setPaths(newPaths);
    } else {
      console.warn('USA States Data not loaded or features missing');
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Buttons for opening Lesson and Quiz Modals */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setLessonModalVisible(true)}
        >
          <Text style={styles.buttonText}>Open Lesson</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setQuizModalVisible(true)}
        >
          <Text style={styles.buttonText}>Open Quiz</Text>
        </TouchableOpacity>
      </View>

      <SvgPanZoom canvasHeight={600} canvasWidth={800} minScale={0.5} maxScale={10} initialZoom={1}>
        <Svg width="100%" height="100%" viewBox="-130 -50 100 80">
          {paths.map(({ path, key, name }) => (
            <Path key={key} d={path} fill="#D6D6DA" stroke="#000000" strokeWidth={0.01} />
          ))}
        </Svg>
      </SvgPanZoom>

      {/* Lesson Modal */}
      <Modal visible={lessonModalVisible} transparent animationType="slide" onRequestClose={() => setLessonModalVisible(false)}>
        <LessonModal
          visible={lessonModalVisible}
          onClose={() => setLessonModalVisible(false)}
          onSave={(lessonData) => console.log("Lesson Saved", lessonData)}
          selectedMarker={{ id: 'example-marker-id' }} // Pass example marker data if needed
          userId="123" // Example user ID
        />
      </Modal>

      {/* Quiz Modal */}
      <Modal visible={quizModalVisible} transparent animationType="slide" onRequestClose={() => setQuizModalVisible(false)}>
        <QuizModal
          visible={quizModalVisible}
          onClose={() => setQuizModalVisible(false)}
          onComplete={() => console.log("Quiz Completed")}
          selectedMarker={{ lessonData: { title: 'Example Lesson', quiz: [{ question: 'Example Question', options: ['Option 1', 'Option 2'] }] } }} // Example quiz data
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    zIndex: 1,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EducationalMap;
