import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthState } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Typography from "./Comoponents/Typography";
import { auth, db } from "./Services/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Password
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = () => {
    const emailRegex = /^[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSendResetEmail = async () => {
    if (!validateEmail()) {
      return;
    }

    try {
      setLoading(true);

      // Check if user exists in any collection
      const userExists = await checkUserExists(email.trim().toLowerCase());

      if (!userExists) {
        Alert.alert(
          "Email Not Found",
          "No account found with this email address. Please check your email or register.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Register", onPress: () => console.log("Navigate to register") }
          ]
        );
        setLoading(false);
        return;
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());

      Alert.alert(
        "Email Sent!",
        `We've sent a password reset link to ${email}. Please check your inbox and spam folder.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Optionally move to step 2 or go back to login
              setStep(1);
              setEmail("");
            }
          }
        ]
      );
    } catch (error) {
      console.error("Password reset error:", error);
      
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format. Please enter a valid email.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkUserExists = async (userEmail) => {
    try {
      const collections = ["user", "shop", "admin"];
      
      for (const collectionName of collections) {
        const q = query(collection(db, collectionName), where("email", "==", userEmail));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error checking user:", error);
      return false;
    }
  };

  const validatePassword = () => {
    if (!newPassword) {
      setPasswordError("Password is required");
      return false;
    } else if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    } else if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) {
      return;
    }

    try {
      setLoading(true);
      Alert.alert(
        "Success",
        "Your password has been reset successfully! You can now login with your new password.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to login
              router.replace("/LoginScreen");
            }
          }
        ]
      );
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-white p-4"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
    >
      <View className="max-w-md w-full mx-auto">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-32 h-32 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons 
              name={step === 1 ? "lock-closed" : "key"} 
              size={60} 
              color="#3b82f6" 
            />
          </View>
          <Typography variant="h1" className="text-3xl font-bold text-gray-900 text-center">
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </Typography>
          <Typography variant="body" className="text-gray-600 mt-4 text-center">
            {step === 1 
              ? "Enter your email address and we'll send you instructions to reset your password."
              : "Create a new strong password for your account."
            }
          </Typography>
        </View>

        {step === 1 ? (
          <>
            {/* Email Input */}
            <View className="mb-6">
              <Typography variant="v1" className="font-semibold text-gray-900 mb-2">
                Email Address
              </Typography>
              <View className={`flex-row items-center border rounded-lg px-3 ${
                emailError ? "border-red-500" : "border-gray-300"
              }`}>
                <Ionicons name="mail" size={20} color="#6b7280" />
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  className="flex-1 p-3 text-base"
                />
              </View>
              {emailError ? (
                <Typography variant="caption" color="error" className="mt-1">
                  {emailError}
                </Typography>
              ) : null}
            </View>

            {/* Send Reset Email Button */}
            <TouchableOpacity
              onPress={handleSendResetEmail}
              disabled={loading}
              className={`py-4 rounded-lg items-center mb-4 ${
                loading ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Typography variant="v2" className="text-white ml-2">
                    Sending...
                  </Typography>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="mail" size={20} color="white" />
                  <Typography variant="v2" className="text-white ml-2 font-bold">
                    Send Reset Link
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* New Password Input */}
            <View className="mb-6">
              <Typography variant="v1" className="font-semibold text-gray-900 mb-2">
                New Password
              </Typography>
              <View className={`flex-row items-center border rounded-lg px-3 ${
                passwordError ? "border-red-500" : "border-gray-300"
              }`}>
                <Ionicons name="lock-closed" size={20} color="#6b7280" />
                <TextInput
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  textContentType="password"
                  className="flex-1 p-3 text-base"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Typography variant="caption" color="error" className="mt-1">
                  {passwordError}
                </Typography>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Typography variant="v1" className="font-semibold text-gray-900 mb-2">
                Confirm Password
              </Typography>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3">
                <Ionicons name="lock-closed" size={20} color="#6b7280" />
                <TextInput
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={(text) => setConfirmPassword(text)}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  textContentType="password"
                  className="flex-1 p-3 text-base"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading}
              className={`py-4 rounded-lg items-center mb-4 ${
                loading ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Typography variant="v2" className="text-white ml-2">
                    Resetting...
                  </Typography>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Typography variant="v2" className="text-white ml-2 font-bold">
                    Reset Password
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="py-3 items-center border-t border-gray-200 mt-4"
        >
          <View className="flex-row items-center">
            <Ionicons name="arrow-back" size={16} color="#6b7280" />
            <Typography variant="body" className="text-gray-600 ml-2" weight="medium">
              Back to Login
            </Typography>
          </View>
        </TouchableOpacity>

        {/* Info Box */}
        <View className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Typography variant="body" className="text-blue-800 ml-2" weight="semibold">
              What happens next?
            </Typography>
          </View>
          <Typography variant="caption" className="text-blue-700">
            {step === 1 
              ? "• We'll send a password reset link to your email\n• Click the link in the email to reset your password\n• The link expires after 1 hour"
              : "• Your password will be updated immediately\n• You can use the new password to login\n• Make sure to remember your new password"
            }
          </Typography>
        </View>
      </View>
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
