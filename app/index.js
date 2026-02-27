import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import '../global.css';
import Onboarding from './Onboarding';
import { setUser } from './redux/authSlice';
import { getUserData as getStoredUserData, getUserRole } from './Services/storage_service';

export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [fontsLoaded] = useFonts({
    OpenSans_Bold: require('./Assets/fonts/OpenSans_Condensed-Bold.ttf'),
    OpenSans_ExtraBold: require('./Assets/fonts/OpenSans_Condensed-ExtraBold.ttf'),
    OpenSans_Medium: require('./Assets/fonts/OpenSans_Condensed-Medium.ttf'),
    OpenSans_Regular: require('./Assets/fonts/OpenSans_Condensed-Regular.ttf'),
    OpenSans_SemiBold: require('./Assets/fonts/OpenSans_Condensed-SemiBold.ttf'),
  });

  useEffect(() => {
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const userData = await getStoredUserData();
      const userRole = await getUserRole();

      if (userData && userRole) {
        dispatch(setUser({ user: userData, role: userRole }));
        
        // Navigate immediately
        if (userRole === 'admin') {
          router.replace('/(admin)/dashboard');
        } else if (userRole === 'shopkeeper') {
          router.replace('/(shopkeeper)/tabs/HomeTab');
        } else {
          router.replace('/(user)/home');
        }
      } else {
        // No existing login, show splash then onboarding
        setTimeout(() => {
          setIsLoading(false);
          setIsCheckingAuth(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking login:', error);
      setTimeout(() => {
        setIsLoading(false);
        setIsCheckingAuth(false);
      }, 2000);
    }
  };

  if (isLoading || !fontsLoaded || isCheckingAuth) {
    return (
      <ImageBackground 
        source={require('./Assets/images/splash.png')} 
        className="flex-1 items-center justify-center bg-gray-100" 
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
      <Onboarding />
    </SafeAreaView>
  );
}
