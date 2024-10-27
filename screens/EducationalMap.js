import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import SvgPanZoom from 'react-native-svg-pan-zoom'; // Import the library
import usaStatesData from '../assets/usa-states.json';

const EducationalMap = () => {
  const [paths, setPaths] = useState([]);

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
                    // Adjust the scale and flip the Y-axis to fix orientation
                    const adjustedPoint = [point[0], -point[1]];
                    console.log('Valid Point:', adjustedPoint);
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
          console.log('Generated SVG Path:', path);
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
      <SvgPanZoom
        canvasHeight={600}
        canvasWidth={800}
        minScale={0.5} // Allow zoom out
        maxScale={10}  // Allow zoom in
        initialZoom={1} // Initial zoom level
      >
        <Svg
          width="100%"
          height="100%"
          viewBox="-130 -50 100 80" // Adjusted for better visibility
        >
          
          {paths.map(({ path, key, name }) => (
            <React.Fragment key={key}>
              <Path
                d={path}
                fill="#D6D6DA"
                stroke="#000000"
                strokeWidth={0.01}
              />
            </React.Fragment>
          ))}
        </Svg>
      </SvgPanZoom>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Light background for contrast
  },
});

export default EducationalMap;
