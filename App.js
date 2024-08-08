import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStackNavigator from './navigators/AuthStack';
import MainTabNavigator from './navigators/BottomTabNavigator';
import { firebaseauth } from './FirebaseConfig';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return firebaseauth.onAuthStateChanged(setUser);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          {user ? <MainTabNavigator /> : <AuthStackNavigator />}
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

export default App;
