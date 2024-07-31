import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { firebaseauth } from '../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = firebaseauth;

  useEffect(() => {
<<<<<<< Updated upstream
    if (debug) {
      setEmail(debugEmail);
      setPassword(debugPassword);
      console.log('Debug mode enabled');
    }
=======
    setEmail('');
    setPassword('');
>>>>>>> Stashed changes
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
<<<<<<< Updated upstream
=======
      navigation.navigate('StickyNotesMap'); 
>>>>>>> Stashed changes
    } catch (error) {
      console.log(error);
      alert('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Thoughtscape</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
        />
        {loading ? (
          <ActivityIndicator size="large" color="#FFA000" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={signIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F8F4', // Light background color
  },
  innerContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B1B1B', // Dark text color
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#E0E0E0', // Light border color
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 10,
    backgroundColor: '#FFF',
    color: '#333',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFA000', // Button color
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#FF6F61',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
