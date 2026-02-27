import { useRouter } from 'expo-router';
import { Image, View } from 'react-native';
import Button from './Comoponents/Button';
import Typography from './Comoponents/Typography';

export default function Onboarding() {
  const router = useRouter();
   
  return (
    <View className="flex-1 bg-white">
      {/* Hero Image */}
      <View className="items-center mt-12">
        <Image
          source={require('./Assets/images/servicewomen.png')}
          className="w-64 h-64 rounded-full"
          resizeMode="cover"
        />
      </View>

      {/* App Info */}
      <View className="px-6 mt-8">
        <Typography variant="v1" className="text-3xl mx-auto">
          Welcome to GrowWithUs
        </Typography>
        <Typography variant="v4" className="flex text-gray-600 text-center mt-2">
          Find trusted service professionals near you or list your services and grow your business.
        </Typography>
      </View>

      {/* Buttons */}
      <View className="px-6 mt-10 space-y-4 flex gap-y-12">
        <Button
          title="Find a Service"
          onPress={() => router.replace('/RegisterUserScreen')} 
          variant="primary"
        />
        <Button
          title="Register as Shopkeeper"
          onPress={() => router.replace('/RegisterShopyScreen')}
          variant="outline"
        />
        <Button
          title="Login"
          onPress={() => router.replace('/LoginScreen')}
          variant="secondary"
        />
      </View>

      {/* Footer */}
      <View className="absolute bottom-4 w-full items-center">
        <Typography variant="v4" className="text-gray-400 text-xs">
          By continuing, you agree to our Terms & Privacy Policy
        </Typography>
      </View>
    </View>
  );
}