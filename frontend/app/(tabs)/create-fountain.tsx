import { View } from "react-native";
import { useRouter } from "expo-router";

import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react-native";

const CreateFountainScreen = () => {
  const router = useRouter();
  return (
    <View>
      <Button variant="link" onPress={() => router.push("/")}>
        <ButtonIcon as={ArrowLeftIcon} className="h-5 w-5 text-gray-900" />
        <ButtonText className="text-gray-900">Go Back</ButtonText>
      </Button>
    </View>
  );
};

export default CreateFountainScreen;
