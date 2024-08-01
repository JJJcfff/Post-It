import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Marker} from 'react-native-maps';
import {Image as CachedImage} from 'react-native-expo-image-cache';

const MarkerComponent = ({marker, onPress, onDragStart, onDragEnd, userId}) => {
  console.log(marker.imageUris[0]);
  return (
    <Marker
      key={marker.id}
      coordinate={marker.coordinate}
      onPress={() => onPress(marker)}
      draggable={marker.user === userId}
      onDragStart={onDragStart}
      onDragEnd={(e) => onDragEnd(e, marker.id)}
    >
      <View style={[styles.stickyNote, {backgroundColor: marker.color || 'yellow'}]}>
        {(marker.imageUris && marker.imageUris.length != 0 && marker.imageUris[0] != '') ? (
          <View>
            <Text style={[styles.stickyNoteText, {color: marker.textColor || 'black'}]} numberOfLines={2}>
              {marker.text}
            </Text>
            <CachedImage
              uri={marker.imageUris[0]}
              style={{width: 150, height: 150, borderRadius: 5}}
            />
          </View>
        ) : (
          <Text style={[styles.stickyNoteText, {color: marker.textColor || 'black'}]} numberOfLines={5}>
            {marker.text}
          </Text>
        )}
        <Text
          style={[styles.counterText, {color: marker.textColor || 'grey', paddingTop: 5}]}>Likes: {marker.likes}</Text>
        <Text
          style={[styles.counterText, {color: marker.textColor || 'grey'}]}>Comments: {marker.comments.length}</Text>
        <Text style={[styles.counterText, {color: marker.textColor || 'grey'}]} numberOfLines={2}>
          Tags: {marker.tags.length > 0 ? marker.tags.join(', ') : ''}
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
    paddingBottom: 5,
  },
  counterText: {
    fontSize: 10,
  },
});

export default MarkerComponent;
