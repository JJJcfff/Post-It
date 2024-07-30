//chat screen
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { firebaseauth, firestore } from '../FirebaseConfig';

const Chat = ({ navigation }) => {
    //nothing for now
    return (
        <View style={styles.container}>
            <Text>Chat Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Chat;