import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker } from 'react-native-maps';

const MarkerComponent = ({ marker, onPress, onDragStart, onDragEnd, userId }) => {
  return (
    <Marker
      key={marker.id}
      coordinate={marker.coordinate}
      onPress={() => onPress(marker)}
      draggable={marker.user === userId}
      onDragStart={onDragStart}
      onDragEnd={(e) => onDragEnd(e, marker.id)}
    >
      <View style={styles.stickyNote}>
        <Text style={styles.stickyNoteText} numberOfLines={5}>
          {marker.text}
        </Text>
        <Text style={styles.counterText}>Likes: {marker.likes}</Text>
        <Text style={styles.counterText}>Comments: {marker.comments.length}</Text>
        <Text style={styles.counterText} numberOfLines={2}>Tags: {marker.tags ? marker.tags.join(', ') : ''}</Text>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  stickyNote: {
    backgroundColor: 'yellow',
    padding: 5,
    borderRadius: 5,
    maxHeight: 260,
    maxWidth: 160,
  },
  stickyNoteText: {
    fontSize: 12,
    flexWrap: 'wrap',
  },
  counterText: {
    fontSize: 10,
    color: 'gray',
  },
});

export default MarkerComponent;
