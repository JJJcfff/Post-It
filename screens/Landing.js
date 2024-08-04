import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const Landing = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/landing-page-background.jpg')}
                style={styles.backgroundImage}
            >
                <View style={styles.overlay} />
                <View style={styles.content}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Text style={styles.buttonText}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50,
    },
    buttonContainer: {
        width: '80%',
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#F8BBD0',
        paddingVertical: 10,
        paddingHorizontal: 70,
        borderRadius: 25,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    registerButton: {
        paddingVertical: 10,
        paddingHorizontal: 50,
        borderRadius: 25,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'medium',
        textDecorationLine: 'underline',

    },
    loginButtonText: {
        color: '#000',
        fontSize: 24,
        fontWeight: 'ultralight',
    },
});

export default Landing;
