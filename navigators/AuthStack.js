import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Landing  from "../screens/Landing";

const AuthStack = createStackNavigator();

function AuthStackNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Landing" component={Landing} />
            <AuthStack.Screen name="Login" component={Login} />
            <AuthStack.Screen name="Register" component={Register} />
        </AuthStack.Navigator>
    );
}

export default AuthStackNavigator;
