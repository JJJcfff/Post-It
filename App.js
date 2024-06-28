import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import Register from './screens/Register';
import ChatBot from './screens/ChatBot';
import StickyNotesCanvas from './screens/StickyNotesCanvas.js';
import StickyNotesMap from './screens/StickyNotesMap.js';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="ChatBot" component={ChatBot} />
        {/* <Stack.Screen name="StickyNotesCanvas" component={StickyNotesCanvas} /> */}
        <Stack.Screen name="StickyNotesMap" component={StickyNotesMap} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
