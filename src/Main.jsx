import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Notify from "./Notify";

export default function Main() {
  const [linea, setLinea] = useState(null);
  const [busCoordinates, setBusCoordinates] = useState([]);
  const [loadingLocation, setLaodingLocation] = useState(true);

  const [currentLocation, setCurrentLocation] = useState(null);

  const [region, setRegion] = useState({
    latitude: -34.909557,
    longitude: -56.169695,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    // pedir permisos de ubicación
    // obtener y guardar ubicación en estado
    async function getLocation() {
      setLaodingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("El permiso a la ubicación fue denegado");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLaodingLocation(false);
    }

    getLocation();
  }, []);

  async function handleSearchBus() {
    // traer buses del servidor, para la ruta especificada
    const res = await axios.post(
      "http://montevideo.gub.uy/buses/rest/stm-online",
      {
        empresa: 50,
        lineas: [linea],
      }
    );

    const coordinates = res.data.features.map((feature) => {
      return {
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        id: feature.properties.id,
      };
    });

    setBusCoordinates(coordinates);
    // console.log("coordinates", coordinates);
  }

  // se reasigna cada vez que se actualiza el componente
  // let interval = null;

  // guardar valor que no se resetea al actualizar el componente
  const intervalRef = useRef(null);

  function getBusesInterval() {
    Keyboard.dismiss();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(handleSearchBus, 1000);
  }

  function centrarEnMiUbicacion() {
    if (!currentLocation) return;
    setRegion({
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }

  return (
    <View style={styles.container}>
      <View style={{ position: "relative", marginBottom: 10 }}>
        <TextInput
          value={linea}
          onChangeText={setLinea}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Escribe una línea"
          onSubmitEditing={getBusesInterval}
        />
        <Text style={{ position: "absolute", right: 0, bottom: 10 }}>🔎</Text>
      </View>
      <Button
        disabled={!linea}
        onPress={getBusesInterval}
        title="Search"
      />
      <Button
        onPress={centrarEnMiUbicacion}
        title="Ubicar"
      />

      {!loadingLocation && (
        <>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            <Marker pinColor="blue" coordinate={currentLocation} />
            {busCoordinates.map((coordinate) => (
              <Marker key={coordinate.id} coordinate={coordinate} />
            ))}
          </MapView>
          <Notify title={"Avisame en 5"} seconds={5} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center",
  },
  input: {
    borderBottomWidth: 1,
    width: 200,
    height: 35,
    padding: 5,
    paddingRight: 30,
  },
  map: {
    marginTop: 10,
    height: 300,
    width: "90%",
  },
});
