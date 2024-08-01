import React, {useState} from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    StyleSheet,
    TextInput,
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import {firebaseapp, firebaseauth} from '../FirebaseConfig';
import {createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import {getFirestore, collection, getDocs, query, where, serverTimestamp, doc, setDoc} from 'firebase/firestore';

const firestore = getFirestore(firebaseapp);

const Register = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = firebaseauth;


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
            await updateProfile(userCredential.user, {
                displayName: username,
                photoURL: "https://firebasestorage.googleapis.com/v0/b/post-it-1d453.appspot.com/o/profilePictures%2Fdefault%2Fdefault-avatar.png?alt=media&token=5f87aade-c8b8-46b2-b99b-791fcee91372",
            });
            const userDocRef = doc(firestore, 'users', userCredential.user.uid);
            await setDoc(userDocRef, {
                friends: [],
                notes: [],
                likes: [],
                createdAt: serverTimestamp(),
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
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <Text style={styles.title}>Create an Account</Text>
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
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
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
              <TextInput
                style={styles.input}
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
                <TouchableOpacity style={styles.button} onPress={signUp}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonSecondary}
                  onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.buttonSecondaryText}>Back</Text>
                </TouchableOpacity>
            </>
          )}
      </KeyboardAvoidingView>
    );
};

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 30,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginVertical: 10,
        color: '#333',
        borderColor: '#ddd',
        borderWidth: 1,
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
    },
    buttonSecondary: {
        borderColor: '#1e90ff',
        borderWidth: 1,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonSecondaryText: {
        color: '#1e90ff',
        fontSize: 18,
    },
});
