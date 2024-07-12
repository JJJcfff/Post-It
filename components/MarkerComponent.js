import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
      <View style={[styles.stickyNote, { backgroundColor: marker.color || 'yellow' }]}>
        <Text style={[styles.stickyNoteText, { color: marker.textColor || 'black' }]} numberOfLines={5}>
          {marker.text}
        </Text>
        <Text style={[styles.counterText, { color: marker.textColor || 'grey' }]}>Likes: {marker.likes}</Text>
        <Text style={[styles.counterText, { color: marker.textColor || 'grey' }]}>Comments: {marker.comments.length}</Text>
        <Text style={[styles.counterText, { color: marker.textColor || 'grey' }]} numberOfLines={2}>
          Tags: {marker.tags != '' ? marker.tags.join(', ') : ''}
        </Text>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  stickyNote: {
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
  },
});

export default MarkerComponent;
