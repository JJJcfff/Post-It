import React, { useState } from 'react';
import { ActivityIndicator, Button, KeyboardAvoidingView, StyleSheet, TextInput, View, Text } from 'react-native';
import { firebaseauth } from '../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = firebaseauth;

  const signUp = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate('StickyNotesCanvas'); // Navigate to StickyNotesMap on successful registration
    } catch (error) {
      console.log(error);
      if (error.code === 'auth/email-already-in-use') {
        alert('Email already in use');
      }
      else {
        alert('Invalid email or password');
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior='padding'>
        <Text style={styles.text}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
        />

        <TextInput
          style={styles.input}
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder='Confirm Password'
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {loading ? (
          <ActivityIndicator size='large' color='blue' />
        ) : (
          <>
            <Button title='Create Account' onPress={signUp} />
            <Button title='Back to Login' onPress={() => navigation.navigate('Login')} />
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
    textAlign: 'center',
    margin: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: 300,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    paddingHorizontal: 10,
  },
  button: {
    width: 300,
    height: 40,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    color: 'white',
  },
});