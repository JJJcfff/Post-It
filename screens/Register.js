import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Image, ImageBackground,
} from 'react-native';
import {firebaseapp, firebaseauth} from '../FirebaseConfig';
import {createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import {getFirestore, collection, getDocs, query, where, serverTimestamp, doc, setDoc} from 'firebase/firestore';
import useAppStyles from '../styles/useAppStyles';
import useAppColors from '../styles/useAppColors';

const firestore = getFirestore(firebaseapp);

const Register = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = firebaseauth;
  const styles = useAppStyles().styles;
  const colors = useAppColors();


  const signUp = async () => {
    ///check if all fields are filled
    if (!email || !password || !confirmPassword || !username) {
      alert('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        friends: [],
        notes: [],
        likes: [],
        displayName: username,
        photoURL: "https://firebasestorage.googleapis.com/v0/b/post-it-1d453.appspot.com/o/profilePictures%2Fdefault%2Fdefault-avatar.png?alt=media&token=5f87aade-c8b8-46b2-b99b-791fcee91372",
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
      });
      console.log('User registered');
    } catch (error) {
      console.log(error);
      if (error.code === 'auth/email-already-in-use') {
        alert('Email already in use');
      } else if (error.code === 'auth/invalid-email') {
        alert('Invalid email');
      } else if (error.code === 'auth/weak-password') {
        alert('Password is too weak');
      } else {
        alert('An error occurred. Please try again later');
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/login-page-background.jpg')} style={styles.backgroundImage}>
        <View style={[styles.overlay, {backgroundColor: 'rgba(255, 255, 255, 0.5)'}]}/>
        <KeyboardAvoidingView behavior="padding" style={styles.flexColumn}>
          <Text style={[styles.h1Text, {marginBottom:50}]}>Create an Account</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.borderedInput, {marginVertical: 20, height: 50, width:300}]}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.borderedInput, {marginVertical: 20, height: 50}]}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.borderedInput, {marginVertical: 20, height: 50}]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.borderedInput, {marginVertical: 20, height: 50}]}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#000"/>
          ) : (
            <>
                <View style={[styles.buttonContainer80, {position:'absolute', bottom:'7%'}]}>
              <TouchableOpacity style={[styles.borderedButton, {width:200, backgroundColor: colors.pink, marginBottom:20}]} onPress={signUp}>
                <Text style={styles.borderedButtonText}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Landing')}
              >
                <Text style={styles.borderedButtonText}>Back</Text>
              </TouchableOpacity>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default Register;
