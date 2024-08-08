import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { firebaseauth, firestore } from '../FirebaseConfig';
import { getAuth } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";

const Message = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [otherChatUsers, setOtherChatUsers] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const unsubscribe = firebaseauth.onAuthStateChanged(async user => {
      if (user) {
        setCurrentUser(user);
        const otherUserId = navigation.getParam('otherUserId');
        const chat = await getChat(user.uid, otherUserId);
        if (chat) {
          setChatId(chat.id);
          loadMessages(chat.id);
        } else {
          const newChatId = await createChat(user.uid, otherUserId);
          setChatId(newChatId);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const getChat = async (uid1, uid2) => {
    const chat = await firestore.collection('chats').where('users', 'array-contains-any', [uid1, uid2]).get();
    if (chat.empty) {
      return null;
    }
    return { id: chat.docs[0].id, ...chat.docs[0].data() };
  };

  const createChat = async (uid1, uid2) => {
    const chat = await firestore.collection('chats').add({
      users: [uid1, uid2],
      createdAt: serverTimestamp(),
    });
    return chat.id;
  };

  const loadMessages = async (chatId) => {
    const messagesSnapshot = await firestore.collection('chats').doc(chatId).collection('messages').orderBy('createdAt').get();
    const loadedMessages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMessages(loadedMessages);
  };

  const sendMessage = async () => {
    if (messageText.trim() === '') return;

    await firestore.collection('chats').doc(chatId).collection('messages').add({
      text: messageText,
      createdAt: serverTimestamp(),
      senderId: currentUser.uid,
    });

    setMessageText('');
    loadMessages(chatId);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text>{item.text}</Text>
            <Text style={styles.timestamp}>{new Date(item.createdAt.seconds * 1000).toLocaleString()}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <TextInput
        value={messageText}
        onChangeText={setMessageText}
        style={styles.input}
        placeholder="Type a message"
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
  },
});

export default Message;
