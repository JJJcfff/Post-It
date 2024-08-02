import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStackNavigator from './navigators/AuthStack';
import MainTabNavigator from './navigators/BottomTabNavigator';
import { firebaseauth } from './FirebaseConfig';
import { Provider } from 'react-redux';
import store from './redux/store';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return firebaseauth.onAuthStateChanged(setUser);
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        {user ? <MainTabNavigator /> : <AuthStackNavigator />}
      </NavigationContainer>
    </Provider>
  );
}

export default App;
