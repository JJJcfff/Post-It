import React from 'react';
import { G, Rect, Text as SvgText } from 'react-native-svg';

const StickyNote = ({ x, y, text }) => {
  const padding = 10;
  const rectWidth = 100; // Fixed width for the rectangle
  const rectHeight = 100; // Fixed height for the rectangle

  // Ensure x and y are valid numbers
  const rectX = isNaN(x - rectWidth / 2) ? 0 : x - rectWidth / 2;
  const rectY = isNaN(y - rectHeight / 2) ? 0 : y - rectHeight / 2;

  return (
    <G>
      <Rect
        x={rectX} // Adjust the x position to center the rectangle
        y={rectY} // Adjust the y position to center the rectangle
        width={rectWidth}
        height={rectHeight}
        fill="yellow"
        stroke="black"
        strokeWidth="2"
        rx="5"
        ry="5"
      />
      <SvgText
        x={x} // Center the text horizontally
        y={y} // Center the text vertically
        fill="black"
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle" // Center the text horizontally
        alignmentBaseline="middle" // Center the text vertically
      >
        {text}
      </SvgText>
    </G>
  );
};

export default StickyNote;