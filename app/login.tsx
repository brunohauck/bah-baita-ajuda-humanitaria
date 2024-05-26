// screens/LoginScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext.tsx';


const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <Text>Login Screen</Text>
      <Button title="Login" onPress={login} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;