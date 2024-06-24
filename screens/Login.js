import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Button, KeyboardAvoidingView, StyleSheet, TextInput, View, Text } from 'react-native';
import { firebaseauth } from '../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = firebaseauth;

  // Debug mode credentials
  const debugEmail = '1@1.com';
  const debugPassword = '111111';
  const debug = true;

  useEffect(() => {
    if (debug) {
      setEmail(debugEmail);
      setPassword(debugPassword);
    }
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('StickyNotesMap'); // Navigate to StickyNotesMap on successful login
    } catch (error) {
      console.log(error);
      alert('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior='padding'>
        <Text style={styles.text}>Login</Text>
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

        {loading ? (
          <ActivityIndicator size='large' color='blue' />
        ) : (
          <>
            <Button title='Sign In' onPress={signIn} />
            <Button title='Create Account' onPress={() => navigation.navigate('Register')} />
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;

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