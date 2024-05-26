import { View, Image, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

interface Address {
  latitude: number;
  longitude: number;
  address: string;
}

const fetchAddresses = async (): Promise<Address[]> => {
  try {
    const response = await fetch('https://66526a0f813d78e6d6d57914.mockapi.io/api/v1/address');
    const data: Address[] = await response.json();
    console.log('entrou no fetch ----<>-----')
    console.log(data)
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return [];
  }
};

const haversineDistance = (coords1: { latitude: number; longitude: number }, coords2: { latitude: number; longitude: number }): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Raio da Terra em km
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d;
};

const findNearestAddress = (currentCoords: { latitude: number; longitude: number }, addresses: Address[]): Address | null => {
  let nearest: Address | null = null;
  let minDistance = Infinity;

  addresses.forEach((address) => {
    const distance = haversineDistance(currentCoords, {
      latitude: address.latitude,
      longitude: address.longitude,
    });
    if (distance < minDistance) {
      minDistance = distance;
      nearest = address;
    }
  });

  return nearest;
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [nearestAddress, setNearestAddress] = useState<Address | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndFindNearestAddress = async () => {
      try {
        // Pega a localização atual
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permissão para acessar localização negada');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const currentCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        // Busca os dados da API
        const addresses = await fetchAddresses();

        // Encontra o endereço mais próximo
        const nearest = findNearestAddress(currentCoords, addresses);
        setNearestAddress(nearest);
      } catch (error) {
        setErrorMsg('Erro ao calcular o endereço mais próximo');
      } finally {
        setLoading(false);
      }
    };

    fetchAndFindNearestAddress();
  }, []);

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View>
        <Text>{errorMsg}</Text>
      </View>
    );
  }
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({ ios: 'cmd + d', android: 'cmd + m' })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Aqui vai aparecer o resultado
        </ThemedText>

      <View>
          {nearestAddress ? (
            <Text>Endereço mais próximo: {nearestAddress.address}</Text>
          ) : (
            <Text>Nenhum endereço encontrado</Text>
          )}
      </View>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
