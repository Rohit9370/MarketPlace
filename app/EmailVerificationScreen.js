import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import Typography from "./Comoponents/Typography";
import { loginSuccess } from './redux/authSlice';
import { auth } from './Services/firebase';
import { saveUserData, saveUserRole } from './Services/storage_service';

const EmailVerificationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const userData = params.userData ? JSON.parse(params.userData) : null;
  const role = params.role || "user";

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCheckVerification = async () => {
    try {
      setChecking(true);
      
      // Reload user to get latest email verification status
      await auth.currentUser?.reload();
      
      if (auth.currentUser?.emailVerified) {
        // Email is verified, proceed with login
        dispatch(loginSuccess({
          user: userData,
          role: role,
          userData: userData
        }));
        
        await saveUserData(userData);
        await saveUserRole(role);
        
        Alert.alert("Success", "Email verified successfully!");
        
        // Navigate based on role - use push to prevent back navigation
        if (role === "admin") {
          router.push('/(admin)/dashboard');
        } else if (role === "shopkeeper") {
          router.push('/(shopkeeper)/tabs/HomeTab');
        } else {
          router.push('/(user)/home');
        }
      } else {
        Alert.alert("Not Verified", "Please check your email and click the verification link before continuing.");
      }
    } catch (error) {
      console.error("Error checking verification:", error);
      Alert.alert("Error", "Failed to check verification status. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResending(true);
      
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setCountdown(60); // 60 second cooldown
        Alert.alert("Success", "Verification email sent! Please check your inbox.");
      }
    } catch (error) {
      console.error("Error resending email:", error);
      Alert.alert("Error", "Failed to resend verification email. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/LoginScreen');
  };

  return (
    <ScrollView 
      className="flex-1 bg-white p-4"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
    >
      <View className="max-w-md w-full mx-auto">
        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-32 h-32 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="mail-unread" size={60} color="#3b82f6" />
          </View>
          <Typography variant="h1" className="text-3xl font-bold text-gray-900 text-center">
            Verify Your Email
          </Typography>
          <Typography variant="body" className="text-gray-600 mt-4 text-center">
            We've sent a verification link to
          </Typography>
          <Typography variant="body" className="text-blue-600 font-semibold mt-1 text-center">
            {userData?.email || "your email"}
          </Typography>
        </View>

        {/* Instructions */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <Typography variant="body" className="text-gray-700 mb-2">
            Please follow these steps:
          </Typography>
          <View className="ml-2">
            <View className="flex-row items-start mb-2">
              <Typography variant="body" className="text-blue-600 mr-2">1.</Typography>
              <Typography variant="body" className="text-gray-700 flex-1">
                Check your email inbox (and spam folder)
              </Typography>
            </View>
            <View className="flex-row items-start mb-2">
              <Typography variant="body" className="text-blue-600 mr-2">2.</Typography>
              <Typography variant="body" className="text-gray-700 flex-1">
                Click the verification link in the email
              </Typography>
            </View>
            <View className="flex-row items-start">
              <Typography variant="body" className="text-blue-600 mr-2">3.</Typography>
              <Typography variant="body" className="text-gray-700 flex-1">
                Return here and click "I've Verified My Email"
              </Typography>
            </View>
          </View>
        </View>

        {/* Check Verification Button */}
        <TouchableOpacity
          onPress={handleCheckVerification}
          disabled={checking}
          className={`py-4 rounded-lg items-center mb-4 ${
            checking ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          {checking ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Typography variant="v2" className="text-white ml-2">
                Checking...
              </Typography>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Typography variant="v2" className="text-white ml-2 font-bold">
                I've Verified My Email
              </Typography>
            </View>
          )}
        </TouchableOpacity>

        {/* Resend Email Button */}
        <TouchableOpacity
          onPress={handleResendEmail}
          disabled={resending || countdown > 0}
          className={`py-4 rounded-lg items-center mb-4 border-2 ${
            resending || countdown > 0 ? "border-gray-300 bg-gray-100" : "border-blue-600 bg-white"
          }`}
        >
          {resending ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Typography variant="v2" className="text-blue-600 ml-2">
                Sending...
              </Typography>
            </View>
          ) : countdown > 0 ? (
            <Typography variant="v2" className="text-gray-500 font-bold">
              Resend in {countdown}s
            </Typography>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="mail" size={20} color="#3b82f6" />
              <Typography variant="v2" className="text-blue-600 ml-2 font-bold">
                Resend Verification Email
              </Typography>
            </View>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={handleBackToLogin}
          className="py-3 items-center"
        >
          <Typography variant="body" className="text-gray-600">
            Back to Login
          </Typography>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EmailVerificationScreen;
