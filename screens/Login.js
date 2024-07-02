import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
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
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f' }}
      style={styles.background}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <Text style={styles.title}>Welcome to Post-It</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={signIn}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.buttonSecondaryText}>Create Account</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default Login;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  container: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    color: '#fff',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    borderColor: '#fff',
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonSecondaryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
