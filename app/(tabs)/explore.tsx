import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, Platform, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

interface Address {
  id: string;
  latitude: number;
  longitude: number;
}

export default function TabTwoScreen() {
  const showMap = true;
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();

    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('https://66526a0f813d78e6d6d57914.mockapi.io/api/v1/address');
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  if (!location) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
<View style={styles.container}>

     {showMap ? (
        <MapView
        style={styles.map}
        initialRegion={{
          latitude: -19.9167,
          longitude: -43.9345,
          latitudeDelta: 0.01, // Ajuste para aumentar o zoom
          longitudeDelta: 0.01, // Ajuste para aumentar o zoom
        }}
      >
        {addresses.map(address => (
          <Marker
            key={address.id}
            coordinate={{ latitude: address.latitude, longitude: address.longitude }}
            title={`Marker ${address.id}`}
          />
        ))}
      </MapView>
      ) : (
        <Text>Mapa desativado para desenvolvimento</Text>
      )}

</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%', // Altura fixa de 400 unidades
  },
});
