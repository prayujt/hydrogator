import { StyleSheet } from 'react-native';
import { View } from "react-native";
import MapboxGL from '@rnmapbox/maps';
import {RNMAPBOX_API_KEY} from "@env";

MapboxGL.setAccessToken(RNMAPBOX_API_KEY);

export default function MapScreen() {
  return (
    <View style={styles.container}>
        <MapboxGL.MapView style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1
  }
});