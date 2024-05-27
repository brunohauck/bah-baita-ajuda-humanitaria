// screens/LoginScreen.tsx
import { useAuth } from '@/app/AuthContext';
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';




const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <Text>Login Screen v2</Text>
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