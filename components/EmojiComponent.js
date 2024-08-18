import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Marker} from 'react-native-maps';
import useAppStyles from "../styles/useAppStyles";
import useAppColors from "../styles/useAppColors";

const EmojiComponent = ({marker, onPress, userId}) => {
  const styles = useAppStyles().markerStyles;
  const colors = useAppColors();
  const backgroundColor = marker.userId === userId ? colors.cyan : colors.yellow;

  const scaleFactor = Math.min(marker.weight, 3);
  const baseSize = 32;
  const emojiSize = baseSize * scaleFactor;
  const containerSize = emojiSize * 1.25;

  return (
    <Marker
      coordinate={marker.coordinate}
      onPress={() => onPress(marker)}
    >
      <View
        style={[
          styles.emojiNoteContainer,
          {
            backgroundColor: backgroundColor,
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
          }
        ]}
      >
        <Text style={{ fontSize: emojiSize }}>
          {marker.emoji}
        </Text>
      </View>
    </Marker>
  );
};

export default EmojiComponent;
