import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import useAppStyles from '../styles/useAppStyles';
import useAppColors from '../styles/useAppColors';


const Landing = ({ navigation }) => {
  const styles = useAppStyles().styles;
  const landingStyles = useAppStyles().landingStyles;
  const colors = useAppColors();
    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/landing-page-background.jpg')}
                style={styles.backgroundImage}
            >
                <View style={styles.overlay} />
                <View style={landingStyles.content}>
                        <TouchableOpacity
                            style={[styles.borderedButton, {backgroundColor:colors.pink, width: 200}]}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.borderedButtonText}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.borderedButton, {backgroundColor:colors.mint, width: 200 }]}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Text style={styles.borderedButtonText}>Register</Text>
                        </TouchableOpacity>

                </View>
            </ImageBackground>
        </View>
    );
}


export default Landing;
