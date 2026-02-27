import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Button from './Comoponents/Button';
import Typography from './Comoponents/Typography';
import { Colors } from './constants/designSystem';
import { loginFailure, loginStart, loginSuccess } from './redux/authSlice';
import { login } from './Services/auth_services';
import { saveUserData, saveUserRole } from './Services/storage_service';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  useEffect(() => {
    // Check if user is already authenticated
    if (user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else if (user.role === 'shopkeeper') {
        router.replace('/(shopkeeper)/tabs/HomeTab');
      } else {
        router.replace('/(user)/home');
      }
      return;
    }
    
    // Clear errors when user starts typing
    if (emailError && email) setEmailError('');
    if (passwordError && password) setPasswordError('');
    if (error) dispatch(loginFailure('')); // Clear global error
  }, [user, router, email, password, error, dispatch]);

  const validateInputs = () => {
    let isValid = true;
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else {
      const emailRegex = /^[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      }
    }
    
    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.trim().length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }
    
    try {
      dispatch(loginStart());
      
      const result = await login(email.trim(), password);
      
      if (result.success) {
        if (!result.emailVerified) {
          // Reset loading state before redirecting
          dispatch(loginFailure("Email not verified"));
          
          // Redirect to email verification screen
          router.push({
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

        Alert.alert("Success", `Welcome ${result.userData.ownerName || result.userData.name || 'Back'}!`);
        
        // Navigate based on role
        if (result.role === 'admin') {
          router.push('/(admin)/dashboard');
        } else if (result.role === 'shopkeeper') {
          router.push('/(shopkeeper)/tabs/HomeTab');
        } else {
          router.push('/(user)/home');
        }
      }
    } catch (error) {
      const errorMessage = error.message || 'Invalid credentials';
      dispatch(loginFailure(errorMessage));
      
      // More specific error messages
      let alertMessage = errorMessage;
      if (errorMessage.includes('user-not-found')) {
        alertMessage = 'No account found with this email. Please check your email or register.';
      } else if (errorMessage.includes('wrong-password')) {
        alertMessage = 'Incorrect password. Please try again.';
      } else if (errorMessage.includes('too-many-requests')) {
        alertMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert('Login Failed', alertMessage);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.secondary} />
      
      {/* Header with back button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16 }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ padding: 8, borderRadius: 20, backgroundColor: Colors.background.primary, marginLeft: -8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <View style={{ flex: 1, alignItems: 'center', paddingRight: 32 }}>
          <Typography variant="h2" weight="semibold" style={{ color: Colors.text.primary }}>
            Sign In
          </Typography>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: 'center', 
            padding: 24,
            backgroundColor: Colors.background.secondary
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ maxWidth: 400, width: '100%', alignSelf: 'center' }}>
            {/* Logo and welcome message */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: Colors.primary[100],
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <Image
                  source={require('./Assets/icons/icon.png')}
                  style={{ width: 70, height: 70, borderRadius: 35 }}
                  resizeMode="contain"
                />
              </View>
              
              <Typography variant="h2" weight="bold" style={{ color: Colors.text.primary, marginBottom: 8 }}>
                Welcome Back
              </Typography>
              <Typography variant="body" color="secondary" style={{ textAlign: 'center' }}>
                Sign in to continue to your account
              </Typography>
            </View>

            {/* Form fields */}
            <View style={{ gap: 16 }}>
              {/* Email Field */}
              <View>
                <Typography variant="caption" weight="medium" style={{ marginBottom: 8, color: Colors.text.primary }}>
                  Email Address
                </Typography>
                <View style={{
                  borderWidth: 1,
                  borderColor: emailError ? Colors.error.main : Colors.border.main,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  backgroundColor: Colors.background.primary,
                }}>
                  <TextInput
                    placeholder="Enter your email address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    style={{
                      paddingVertical: 16,
                      fontSize: 16,
                      color: Colors.text.primary,
                    }}
                  />
                </View>
                {emailError ? (
                  <Typography variant="caption" color="error" style={{ marginTop: 4 }}>
                    {emailError}
                  </Typography>
                ) : null}
              </View>

              {/* Password Field */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Typography variant="caption" weight="medium" style={{ color: Colors.text.primary }}>
                    Password
                  </Typography>
                  <TouchableOpacity onPress={() => router.push('/ForgotPassword')}>
                    <Typography variant="caption" color="primary" weight="medium">
                      Forgot Password?
                    </Typography>
                  </TouchableOpacity>
                </View>
                
                <View style={{
                  borderWidth: 1,
                  borderColor: passwordError ? Colors.error.main : Colors.border.main,
                  borderRadius: 12,
                  backgroundColor: Colors.background.primary,
                }}>
                  <TextInput
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    textContentType="password"
                    style={{
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      fontSize: 16,
                      color: Colors.text.primary,
                      paddingRight: 48,
                    }}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: [{ translateY: -12 }],
                      padding: 4,
                    }}
                  >
                    <Ionicons 
                      name={showPassword ? "eye" : "eye-off"} 
                      size={24} 
                      color={Colors.text.secondary} 
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Typography variant="caption" color="error" style={{ marginTop: 4 }}>
                    {passwordError}
                  </Typography>
                ) : null}
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <TouchableOpacity 
                  onPress={() => setRememberMe(!rememberMe)}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 1.5,
                    borderColor: rememberMe ? Colors.primary[600] : Colors.border.main,
                    backgroundColor: rememberMe ? Colors.primary[600] : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8,
                  }}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={14} color={Colors.neutral[0]} />
                    )}
                  </View>
                  <Typography variant="caption" color="secondary">
                    Remember me
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <View style={{ marginTop: 24 }}>
                {isLoading ? (
                  <View style={{
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: Colors.primary[400],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <ActivityIndicator size="small" color={Colors.neutral[0]} />
                  </View>
                ) : (
                  <Button
                    title="Sign In"
                    onPress={handleLogin}
                    variant="primary"
                    fullWidth
                  />
                )}
              </View>

              {/* Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: Colors.border.main }} />
                <Typography variant="caption" color="secondary" style={{ marginHorizontal: 16 }}>
                  OR
                </Typography>
                <View style={{ flex: 1, height: 1, backgroundColor: Colors.border.main }} />
              </View>

              {/* Sign Up Link */}
              <View style={{ alignItems: 'center' }}>
                <Typography variant="body" color="secondary" style={{ marginBottom: 4 }}>
                  Don't have an account?
                </Typography>
                <TouchableOpacity onPress={() => router.push('/Onboarding')}>
                  <Typography variant="body" weight="semibold" style={{ color: Colors.primary[600] }}>
                    Create Account
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
