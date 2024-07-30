import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthStackNavigator from './navigators/AuthStack';
import MainTabNavigator from './navigators/BottomTabNavigator';
import {firebaseauth} from './FirebaseConfig';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return firebaseauth.onAuthStateChanged(setUser);
  }, []);

  return (
      <NavigationContainer>
        {user ? <MainTabNavigator /> : <AuthStackNavigator />}
      </NavigationContainer>
  );
}


export default App;
