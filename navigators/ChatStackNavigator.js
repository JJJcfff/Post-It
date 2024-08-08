import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MessageList from '../screens/MessageList';
import Message from '../screens/Message';

const ChatStack = createStackNavigator();

function ChatStackNavigator() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen name="MessageList" component={MessageList} />
      <ChatStack.Screen name="Message" component={Message} />
    </ChatStack.Navigator>
  );
}

export default ChatStackNavigator;
