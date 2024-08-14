import React, {useState, useEffect} from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    StyleSheet,
    TextInput,
    View,
    Text,
    TouchableOpacity, ImageBackground,
} from 'react-native';
import {firebaseauth} from '../FirebaseConfig';
import {signInWithEmailAndPassword} from 'firebase/auth';
import useAppStyles from '../styles/useAppStyles';
import useAppColors from '../styles/useAppColors';
const Login = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = firebaseauth;

    const styles = useAppStyles().styles;
    const colors = useAppColors();

    useEffect(() => {
        const debug = true; // Set to true if you want to enable debug mode
        if (debug) {
            setEmail('1@1.com');
            setPassword('111111');
            console.log('Debug mode enabled');
        }
    }, []);

    const signIn = async () => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.log(error);
            alert('Invalid email or password');
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <ImageBackground source={require('../assets/login-page-background.jpg')} style={styles.backgroundImage}>
                <View style={[styles.overlay, {backgroundColor: 'rgba(255, 255, 255, 0.5)'}]} />
                <View style={styles.flexColumn}>
                    <Text style={[styles.h1Text, {marginBottom:40}]}>Noted</Text>
                    <View style={styles.inputContainer} >
                    <TextInput
                        style={[styles.borderedInput, {marginBottom: 20, width: 300, height: 50}]}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        placeholderTextColor="#aaa"
                    />
                    </View>
                    <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.borderedInput, {marginBottom: 20, width: 300, height: 50}]}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#aaa"
                    />
                    </View>
                    <View style={[styles.buttonContainer80, {position:'absolute', bottom:'7%'}]}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#FF6B6B"/>
                    ) : (
                        <TouchableOpacity style={[styles.borderedButton, {width: 200, backgroundColor: colors.pink, marginBottom:20}] } onPress={signIn}>
                            <Text style={styles.borderedButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
                        <Text style={styles.borderedButtonText}>Back</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
};

export default Login;
