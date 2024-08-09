import React from 'react';
import { View, StyleSheet } from 'react-native';

const HorizontalSeparator = () => {
  return <View style={styles.horizontalSeparator} />;
};

const styles = StyleSheet.create({
  horizontalSeparator: {
    height: 2,
    backgroundColor: '#222',
    marginTop: 10,
  },
});

export default HorizontalSeparator;
