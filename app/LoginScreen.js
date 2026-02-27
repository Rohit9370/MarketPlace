import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Button from './Comoponents/Button';
import Typography from './Comoponents/Typography';
import { loginFailure, loginStart, loginSuccess } from './redux/authSlice';
import { login } from './Services/auth_services';
import { saveUserData, saveUserRole } from './Services/storage_service';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      dispatch(loginStart());
      const result = await login(email, password);
      
      if (result.success) {
      
        if (!result.emailVerified) {
          // Reset loading state before redirecting
          dispatch(loginFailure("Email not verified"));
          
          // Redirect to email verification screen
          router.replace({
            pathname: '/EmailVerificationScreen',
            params: {
              userData: JSON.stringify({
                ...result.user,
                ...result.userData
              }),
              role: result.role
            }
          });
          return;
        }

        // Extract only serializable data from Firebase user
        const serializableUserData = {
          uid: result.user.uid,
          email: result.user.email,
          emailVerified: result.user.emailVerified,
          ...result.userData // This already contains clean data from Firestore
        };
        
        // Dispatch login success with clean user data
        dispatch(loginSuccess({
          user: serializableUserData,
          role: result.role
        }));
        
        // Save to AsyncStorage
        await saveUserData(serializableUserData);
        await saveUserRole(result.role);

        Alert.alert("Success", `Welcome ${result.userData.ownerName || result.userData.name}!`);
        
        // Navigate based on role
        if (result.role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else if (result.role === 'shopkeeper') {
          router.replace('/(shopkeeper)/tabs/HomeTab');
        } else {
          router.replace('/(user)/home');
        }
      }
    } catch (error) {
      dispatch(loginFailure(error.message || 'Invalid credentials'));
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Back Button */}
      <TouchableOpacity 
        onPress={() => router.replace('/Onboarding')}
        className="absolute top-4 left-4 z-10 p-2"
      >
        <Ionicons name="arrow-back" size={24} color="#6b7280" />
      </TouchableOpacity>

      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <View className="flex-1 px-6 justify-center">
          {/* Logo */}
          <View className="items-center mb-8">
            <Image
              source={require('./Assets/icons/icon.png')}
              className="w-24 h-24 rounded-full mb-4"
              resizeMode="contain"
            />
            <Typography variant="v1" className="text-4xl text-gray-900">
              Welcome Back
            </Typography>
            <Typography variant="v4" className="text-gray-600 mt-2">
              Login to continue
            </Typography>
          </View>

          <View className="space-y-4">
            <View>
              <Typography variant="v3" className="text-gray-700 mb-2">
                Email
              </Typography>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-lg p-3 text-base"
              />
            </View>

            <View>
              <Typography variant="v3" className="text-gray-700 mb-2">
                Password
              </Typography>
              <View className="flex-row items-center border border-gray-300 rounded-lg pr-3">
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  className="flex-1 p-3 text-base"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity className="self-end">
              <Typography variant="v4" className="text-blue-600">
                Forgot Password?
              </Typography>
            </TouchableOpacity>

            <View className="mt-6">
              {isLoading ? (
                <View className="bg-blue-600 py-3 rounded-lg items-center">
                  <ActivityIndicator color="white" />
                </View>
              ) : (
                <Button
                  title="Login"
                  onPress={handleLogin}
                  variant="primary"
                />
              )}
            </View>

            <View className="flex-row justify-center mt-4">
              <Typography variant="v4" className="text-gray-600">
                Don't have an account?{' '}
              </Typography>
              <TouchableOpacity onPress={() => router.replace('/Onboarding')}>
                <Typography variant="v4" className="text-blue-600 font-semibold">
                  Sign Up
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
