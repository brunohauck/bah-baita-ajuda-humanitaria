import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Linking, Text } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

interface Address {
  latitude: number;
  longitude: number;
  address: string;
  url: string;
}

const fetchAddresses = async (): Promise<Address[]> => {
  try {
    const response = await fetch('https://66526a0f813d78e6d6d57914.mockapi.io/api/v1/address');
    const data: Address[] = await response.json();
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
  const showMap = true;
  const [loading, setLoading] = useState(true);
  const [nearestAddress, setNearestAddress] = useState<Address | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);

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
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentCoords(coords);

        // Busca os dados da API
        const addresses = await fetchAddresses();

        // Encontra o endereço mais próximo
        const nearest = findNearestAddress(coords, addresses);
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
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showMap ? (
      <>
            {nearestAddress && currentCoords && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentCoords.latitude,
            longitude: currentCoords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: nearestAddress.latitude,
              longitude: nearestAddress.longitude,
            }}
            title={nearestAddress.address}
            onPress={() => Linking.openURL('https://docs.google.com/forms/d/1wh19xbDIJhROdJjn0gE4_epUrS8iKnKXwWhHqtaE_8g/prefill')}
          />
        </MapView>
      )}
      </>
            ) : (
              <Text>Mapa desativado para desenvolvimento</Text>
            )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
