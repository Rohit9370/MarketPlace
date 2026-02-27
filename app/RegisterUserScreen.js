import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Modal, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useDispatch } from "react-redux";
import Typography from "./Comoponents/Typography";
import { register } from "./Services/auth_services";

const RegisterUserScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [allowManualEntry, setAllowManualEntry] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 20.9320,
    longitude: 77.7523,
  });
  const [mapRegion, setMapRegion] = useState({
    latitude: 20.9320,
    longitude: 77.7523,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const confirmLocation = async () => {
    try {
      // Reverse geocode to get address details
      const result = await Location.reverseGeocodeAsync(selectedLocation);
      
      if (result && result.length > 0) {
        const location = result[0];
        const address = `${location.street || ''} ${location.name || ''} ${location.subregion || ''}`.trim();
        const city = location.city || location.subregion || location.region || '';
        const pincode = location.postalCode || '';
        
        setFormData({
          ...formData,
          address: address || `Lat: ${selectedLocation.latitude.toFixed(4)}, Lng: ${selectedLocation.longitude.toFixed(4)}`,
          city: city,
          pincode: pincode,
          location: selectedLocation,
        });
        setMapVisible(false);
        Alert.alert("Success", "Location selected successfully!");
      } else {
        // Fallback: Save coordinates and let user enter manually
        setFormData({
          ...formData,
          address: `Lat: ${selectedLocation.latitude.toFixed(4)}, Lng: ${selectedLocation.longitude.toFixed(4)}`,
          location: selectedLocation,
        });
        setMapVisible(false);
        Alert.alert(
          "Location Saved", 
          "Coordinates saved. Please enter city and pincode manually.",
          [
            {
              text: "OK",
              onPress: () => {
                setAllowManualEntry(true);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      // Fallback: Save coordinates anyway
      setFormData({
        ...formData,
        address: `Lat: ${selectedLocation.latitude.toFixed(4)}, Lng: ${selectedLocation.longitude.toFixed(4)}`,
        location: selectedLocation,
      });
      setMapVisible(false);
      Alert.alert(
        "Location Saved", 
        "Coordinates saved. Please enter city and pincode manually.",
        [
          {
            text: "OK",
            onPress: () => setAllowManualEntry(true)
          }
        ]
      );
    }
  };

  const openMapPicker = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to pick location');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      
      setMapVisible(true);
    } catch (error) {
      console.error("Location error:", error);
      setMapVisible(true); // Open with default location
    }
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    
    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    
    if (!formData.phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }
    
    if (!formData.address.trim()) {
      Alert.alert("Error", "Please enter your address");
      return;
    }
    
    if (!formData.city.trim()) {
      Alert.alert("Error", "Please enter your city");
      return;
    }
    
    if (!formData.pincode.trim()) {
      Alert.alert("Error", "Please enter your pincode");
      return;
    }
    
    if (!formData.password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }
    
    if (!formData.confirmPassword.trim()) {
      Alert.alert("Error", "Please confirm your password");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }
    
    if (formData.phone.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }
    
    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare registration data
      const registrationData = {
        ...formData,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      
      // Register user
      const result = await register(registrationData);
      
      if (result.success) {
        // Show success message with email verification info
        Alert.alert(
          "Registration Successful!",
          "A verification email has been sent to your email address. Please verify your email before logging in.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/LoginScreen")
            }
          ]
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Registration Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
<>
    <ScrollView 
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingTop: 60, paddingBottom: '78%', paddingHorizontal: 16 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="max-w-md w-full mx-auto">
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.replace('/Onboarding')}
          className="absolute top-0 left-0 p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#6b7280" />
        </TouchableOpacity>

        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="person-add" size={40} color="#10b981" />
          </View>
          <Typography variant="h1" className="text-3xl font-bold text-gray-900">
            Join GrowWithUs
          </Typography>
          <Typography variant="body" className="text-gray-600 mt-2">
            Create your account to find services near you
          </Typography>
        </View>

        {/* Name Input */}
        <View className="mb-4">
          <Typography variant="v1" className="font-semibold text-gray-900 mb-2">
            Full Name
          </Typography>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3">
            <Ionicons name="person" size={20} color="#6b7280" />
            <TextInput
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              className="flex-1 p-3 text-base"
            />
          </View>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Typography variant="v1" className="font-semibold text-gray-900 mb-2">
            Email Address
          </Typography>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3">
            <Ionicons name="mail" size={20} color="#6b7280" />
            <TextInput
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              className="flex-1 p-3 text-base"
            />
          </View>
        </View>

        {/* Phone Input */}
        <View className="mb-4">
          <Typography variant="v1" className="font-semibold text-gray-900 mb-2">
            Phone Number
          </Typography>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3">
            <Ionicons name="call" size={20} color="#6b7280" />
            <TextInput
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              maxLength={10}
              className="flex-1 p-3 text-base"
            />
          </View>
        </View>

        {/* Location Section - Read Only */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Typography variant="v1" className="font-semibold text-gray-900">
              Location Details
            </Typography>
            <TouchableOpacity 
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
              onPress={openMapPicker}
            >
              <Ionicons name="map" size={16} color="white" />
              <Typography variant="v4" className="text-white ml-1 font-semibold">
                Pick Location
              </Typography>
            </TouchableOpacity>
          </View>
          
          {/* Address Input - Read Only */}
          <View className="mb-3">
            <Typography variant="v4" className="text-gray-600 mb-1">
              Address
            </Typography>
            <View className="flex-row items-start border border-gray-300 rounded-lg px-3 bg-gray-50">
              <Ionicons name="location" size={20} color="#6b7280" style={{ marginTop: 12 }} />
              <TextInput
                placeholder="Select location from map"
                value={formData.address}
                editable={false}
                multiline
                numberOfLines={2}
                className="flex-1 p-3 text-base text-gray-500"
                style={{ minHeight: 60, textAlignVertical: 'top' }}
              />
            </View>
          </View>

          {/* City and Pincode Row - Read Only */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Typography variant="v4" className="text-gray-600 mb-1">
                City
              </Typography>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
                <Ionicons name="business" size={20} color="#6b7280" />
                <TextInput
                  placeholder="Auto-filled or enter manually"
                  value={formData.city}
                  editable={allowManualEntry}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  className="flex-1 p-3 text-base text-gray-500"
                />
              </View>
            </View>

            <View className="flex-1">
              <Typography variant="v4" className="text-gray-600 mb-1">
                Pincode
              </Typography>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
                <Ionicons name="pin" size={20} color="#6b7280" />
                <TextInput
                  placeholder="Auto-filled or enter manually"
                  value={formData.pincode}
                  editable={allowManualEntry}
                  onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                  keyboardType="numeric"
                  maxLength={6}
                  className="flex-1 p-3 text-base text-gray-500"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Typography variant="v1" className="font-semibold text-gray-900 mb-2">
            Password
          </Typography>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3">
            <Ionicons name="lock-closed" size={20} color="#6b7280" />
            <TextInput
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
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
        </View>

        {/* Confirm Password Input */}
        <View className="mb-6">
          <Typography variant="v1" className="font-semibold text-gray-900 mb-2">
            Confirm Password
          </Typography>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3">
            <Ionicons name="lock-closed" size={20} color="#6b7280" />
            <TextInput
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry={!showConfirmPassword}
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

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          className={`py-4 rounded-lg items-center mb-6 ${
            isLoading ? "bg-gray-400" : "bg-green-600"
          }`}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <Ionicons name="hourglass" size={20} color="white" />
              <Typography variant="v2" className="text-white ml-2">
                Creating Account...
              </Typography>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="person-add" size={20} color="white" />
              <Typography variant="v2" className="text-white ml-2 font-bold">
                Create Account
              </Typography>
            </View>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View className="items-center">
          <Typography variant="body" className="text-gray-600">
            Already have an account?
          </Typography>
          <TouchableOpacity onPress={() => router.replace("/LoginScreen")}>
            <Typography variant="v2" className="text-blue-600 font-bold mt-1">
              Sign In
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>

    <Modal visible={mapVisible} animationType="slide">
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={mapRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
        >
          {selectedLocation.latitude && (
            <Marker 
              coordinate={selectedLocation} 
              title="Selected Location"
              draggable
              onDragEnd={handleMapPress}
            >
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="location" size={40} color="#ef4444" />
              </View>
            </Marker>
          )}
        </MapView>
        
        <View className="absolute bottom-10 left-5 right-5 flex-row justify-between gap-3">
          <TouchableOpacity 
            onPress={() => setMapVisible(false)} 
            className="bg-red-500 p-4 rounded-lg flex-1 items-center"
          >
            <Typography variant="v2" className="text-white font-bold">Cancel</Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={confirmLocation} 
            className="bg-green-600 p-4 rounded-lg flex-1 items-center"
          >
            <Typography variant="v2" className="text-white font-bold">Confirm Location</Typography>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
</>
  );
};

export default RegisterUserScreen;