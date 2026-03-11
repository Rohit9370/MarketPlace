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
  const [emailSent, setEmailSent] = useState(false); // Track if email was sent
  
  const userData = params.userData ? JSON.parse(params.userData) : null;
  const role = params.role || "user";

  useEffect(() => {
    // Auto-send verification email when screen loads
    if (!emailSent && userData?.email) {
      handleResendEmail();
    }
    
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, emailSent]);

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
        
        // Navigate based on role - use replace to prevent back navigation
        if (role === "admin") {
          router.replace('/(admin)/dashboard');
        } else if (role === "shopkeeper") {
          router.replace('/(shopkeeper)/tabs/HomeTab');
        } else {
          router.replace('/(user)/home');
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
        console.log('📧 Resending verification email to:', auth.currentUser.email);
        await sendEmailVerification(auth.currentUser);
        setEmailSent(true);
        setCountdown(60); // 60 second cooldown
        Alert.alert(
          'Email Sent', 
          'Verification email sent! Please check your inbox and spam folder.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No user logged in. Please login again.');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      let errorMessage = 'Failed to resend verification email.';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Error', errorMessage);
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
          <Typography variant="body" className="text-gray-700 mb-2" weight="semibold">
            Please follow these steps:
          </Typography>
          <View className="ml-2">
            <View className="flex-row items-start mb-2">
              <Typography variant="body" className="text-blue-600 mr-2" weight="semibold">1.</Typography>
              <Typography variant="body" className="text-gray-700 flex-1">
                Check your email inbox (and spam folder)
              </Typography>
            </View>
            <View className="flex-row items-start mb-2">
              <Typography variant="body" className="text-blue-600 mr-2" weight="semibold">2.</Typography>
              <Typography variant="body" className="text-gray-700 flex-1">
                Click the verification link in the email
              </Typography>
            </View>
            <View className="flex-row items-start">
              <Typography variant="body" className="text-blue-600 mr-2" weight="semibold">3.</Typography>
              <Typography variant="body" className="text-gray-700 flex-1">
                Return here and click "I've Verified My Email"
              </Typography>
            </View>
          </View>
        </View>

        {/* Email Status Indicator */}
        {emailSent && (
          <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Typography variant="body" className="text-green-700 ml-2" weight="medium">
                Verification email sent to {userData?.email}
              </Typography>
            </View>
          </View>
        )}

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
              <Typography variant="v2" className="text-blue-600 ml-2" weight="semibold">
                Sending...
              </Typography>
            </View>
          ) : countdown > 0 ? (
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={20} color="#9ca3af" />
              <Typography variant="v2" className="text-gray-500 ml-2" weight="semibold">
                Resend in {countdown}s
              </Typography>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="mail" size={20} color="#3b82f6" />
              <Typography variant="v2" className="text-blue-600 ml-2" weight="semibold">
                Resend Verification Email
              </Typography>
            </View>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={handleBackToLogin}
          className="py-3 items-center border-t border-gray-200 mt-4"
        >
          <View className="flex-row items-center">
            <Ionicons name="arrow-back" size={16} color="#6b7280" />
            <Typography variant="body" className="text-gray-600 ml-2" weight="medium">
              Back to Login
            </Typography>
          </View>
        </TouchableOpacity>

        {/* Helpful Tips */}
        <View className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <View className="flex-row items-center mb-2">
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <Typography variant="body" className="text-yellow-800 ml-2" weight="semibold">
              Having trouble?
            </Typography>
          </View>
          <Typography variant="caption" className="text-yellow-700">
            • Check your spam/junk folder if you don't see the email
          </Typography>
          <Typography variant="caption" className="text-yellow-700">
            • Make sure you entered the correct email address
          </Typography>
          <Typography variant="caption" className="text-yellow-700">
            • Wait a few minutes for the email to arrive
          </Typography>
        </View>
      </View>
    </ScrollView>
  );
};

export default EmailVerificationScreen;
