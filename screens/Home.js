import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, FlatList, StyleSheet} from 'react-native';
import {firebaseauth, firestore} from '../FirebaseConfig';

const Home = ({navigation}) => {
    //nothing for now
    return (
        <View style={styles.container}>
            <Text>Home Screen</Text>
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

export default Home;