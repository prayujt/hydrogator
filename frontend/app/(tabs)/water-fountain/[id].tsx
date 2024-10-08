import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, Button } from 'react-native';
import waterFountainData from '../../water-fountains.json'; // Path to your JSON file
import { Foundation } from '@expo/vector-icons';

type Fountain = {
  floor: number;
  description: string;
};

type Location = {
  id: string;
  coordinates: [number, number];
  building: string;
  fountains: Fountain[];
};

export default function WaterFountainDetail() {
  const { id } = useLocalSearchParams(); // Get the dynamic ID from the route
  const router = useRouter();

  // Assuming waterFountainData is an array with an "id" field
  // const fountainData = waterFountainData.find((location: Location) => location.id === id);

  // if (!fountainData) {
  //   return (
  //     <View>
  //       <Text>Water fountain not found</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={{ padding: 20 }}>
      {/* <Text style={{ fontSize: 24 }}>{fountainData.building}</Text>
      <Text>Coordinates: {fountainData.coordinates.join(', ')}</Text>
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Fountains:</Text>
      {fountainData.fountains.map((fountain, index) => (
        <Text key={index}>
          Floor {fountain.floor}: {fountain.description}
        </Text>
      ))} */}
      <Text> I am a water fountain</Text>
      <Button title="Go Back" onPress={() => router.push('/map')} />
    </View>
  );
}
