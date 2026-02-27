
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from 'react-native-maps';
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from 'react-redux';
import Typography from "./Comoponents/Typography";
import { categories } from './constants/categories';
import { register } from './Services/auth_services';
import { uploadToCloudinary } from "./Services/cloudinnery";


const RegisterShopyScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
 useEffect(() => {
  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('The app requires location permission to function properly.');
      return;
    }
    // Optionally, get user's location and set mapRegion
    const location = await Location.getCurrentPositionAsync({});
    setMapRegion({
      ...mapRegion,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  })();
}, []);

  const [registerState,setregisterState]=useState(false);
  const [Error,setError]=useState("")
  const pagerRef = useRef(null);
  const totalPages = 3;
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({

    shopName: "",
    ownerName: "",
    email: "",
    contactNumber: "",
    phone: "",
    password: "",
    confirmPassword: "",
    //shop images and media
    ownerPhoto: null,
    shopLogo: null,
    shopBanner: null,
    shopImages: [],
    videoUrl: "",
    //shop timing
    openingTime: "",
    closingTime: "",
    //shop location details
    isIndividual: false,
    shopAddress: "",
    shopCity: "",
    shopState: "",
    shopPincode: "",
    shopLocation: {
      latitude: null,
      longitude: null,
    },
    //shop services and categories
    shopCategories: [],
    shopCategory: null, // Single selection
  });

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 20.9320, 
    longitude: 77.7523,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const validatePage = (page) => {
    switch (page) {
      case 0:
        if (!formData.shopName.trim()) return "Shop name is required";
        if (!formData.ownerName.trim()) return "Owner name is required";
        if (!formData.email.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) return "Invalid email format";
        if (!formData.contactNumber.trim()) return "Contact number is required";
        if (!formData.phone.trim()) return "Phone is required";
        if (!formData.password.trim()) return "Password is required";
        if (!formData.confirmPassword.trim()) return "Confirm password is required";
        if (formData.password !== formData.confirmPassword) return "Passwords do not match";
        return null;
      case 1:
        if (!formData.ownerPhoto) return "Owner photo is required";
        if (formData.shopImages.length > 0 && formData.shopImages.length < 3) return "Please upload at least 3 shop images if you choose to provide them";
        return null;
      case 2:
        if (!formData.shopCategory) return "Please select a service category";
        if (!formData.shopAddress.trim()) return "Address is required";
        if (!formData.shopCity.trim()) return "City is required";
        return null;
      default:
        return null;
    }
  };

  const goToNextPage = () => {
    const error = validatePage(currentPage);
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }
    if (currentPage < totalPages - 1) {
      pagerRef.current?.setPage(currentPage + 1);
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1);
      setCurrentPage(currentPage - 1);
    }
  };


  const openMap = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setMapRegion({
      ...mapRegion,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setFormData({
      ...formData,
      shopLocation: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    });
    setMapVisible(true);
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setFormData({
      ...formData,
      shopLocation: { latitude, longitude }
    });
  };

  const confirmLocation = async () => {
    setMapVisible(false);
    try {
        const { latitude, longitude } = formData.shopLocation;
        if (latitude && longitude) {
            let addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (addressResponse.length > 0) {
                const addressParams = addressResponse[0];
                const formattedAddress = `${addressParams.name || ''} ${addressParams.street || ''}, ${addressParams.subregion || ''}, ${addressParams.city || ''}, ${addressParams.region || ''}, ${addressParams.postalCode || ''}`;
                
                setFormData({
                    ...formData,
                    shopAddress: formattedAddress.replace(/ ,/g, '').trim(),
                    shopCity: addressParams.city || addressParams.subregion || "",
                    shopPincode: addressParams.postalCode || "",
                    shopState: addressParams.region || "", 
                });
            }
        }
    } catch (error) {
        console.log("Geocoding Error: ", error);
        Alert.alert("Error", "Could not fetch address details.");
    }
  };

  const handleSubmit = async () => {
    const error = validatePage(currentPage);
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    try {
      setIsLoading(true);
      
      let ownerPhotoUrl = null;
      let shopLogoUrl = null;
      let shopBannerUrl = null;
      let shopImagesUrls = [];

 
      if (formData.ownerPhoto) {
        ownerPhotoUrl = await uploadToCloudinary(formData.ownerPhoto);
        if (!ownerPhotoUrl) throw new Error("Failed to upload owner photo");
      } else {
         throw new Error("Owner photo is missing");
      }

      // Upload Optional Images
      if (formData.shopLogo) {
        shopLogoUrl = await uploadToCloudinary(formData.shopLogo);
      }
      if (formData.shopBanner) {
        shopBannerUrl = await uploadToCloudinary(formData.shopBanner);
      }
      if (formData.shopImages.length > 0) {
        for (const uri of formData.shopImages) {
            const url = await uploadToCloudinary(uri);
            if (url) shopImagesUrls.push(url);
        }
      }

      const finalData = {
        ...formData,
        role: "shopkeeper",
        ownerPhoto: ownerPhotoUrl,
        shopLogo: shopLogoUrl,
        shopBanner: shopBannerUrl,
        shopImages: shopImagesUrls,
        isIndividual: formData.isIndividual,
        isActive: false, // Admin will activate
        createdAt: new Date(),
      };
      
      const result = await register(finalData);
      
      if (result.success) {
        setIsLoading(false);
        
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
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Something went wrong during submission.");
      console.error(err);
      Alert.alert("Error", err.message || "Something went wrong during submission.");
    }
  };

  // Render buttons based on current page
  const renderButtons = () => {
    if (currentPage === totalPages - 1) {
  
      return (
        <View className="flex-row justify-between px-4 py-2">
          <TouchableOpacity
            onPress={goToPrevPage}
            className="flex-1 mr-2 bg-gray-500 py-3 rounded-lg items-center flex-row justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Typography variant="v2" className="text-white ml-2">
              Back
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            className="flex-1 ml-2 bg-green-600 py-3 rounded-lg items-center flex-row justify-center"
          >
            <Typography variant="v2" className="text-white mr-2">
              Submit
            </Typography>
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
      );
    } else {
      // Other pages: Show Back (if not first) and Next
      return (
        <View className="flex-row justify-between px-4 py-2">
          {currentPage > 0 && (
            <TouchableOpacity
              onPress={goToPrevPage}
              className="flex-1 mr-2 bg-gray-500 py-3 rounded-lg items-center flex-row justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
              <Typography variant="v2" className="text-white ml-2">
                Back
              </Typography>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={goToNextPage}
            className={`${currentPage > 0 ? "flex-1 ml-2" : "flex-1"} bg-blue-600 py-3 rounded-lg items-center flex-row justify-center`}
          >
            <Typography variant="v2" className="text-white mr-2">
              Next
            </Typography>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      );
    }
  };

  const pickImage = async (field) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: field === "shopBanner" ? [1, 1] : [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      if (field === "shopImages") {
        setFormData({ ...formData, shopImages: [...formData.shopImages, result.assets[0].uri] });
      } else {
        setFormData({ ...formData, [field]: result.assets[0].uri });
      }
    }
  };

  const takePhoto = async (field) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to take photos');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: field === "shopBanner" ? [1, 1] : [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFormData({ ...formData, [field]: result.assets[0].uri });
    }
  };

  const removeShopImage = (index) => {
    const updatedImages = formData.shopImages.filter((_, i) => i !== index);
    setFormData({ ...formData, shopImages: updatedImages });
  };




  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Back Button */}
      {currentPage === 0 && (
        <TouchableOpacity 
          onPress={() => router.replace('/Onboarding')}
          className="absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-md"
          style={{ elevation: 3 }}
        >
          <Ionicons name="arrow-back" size={24} color="#6b7280" />
        </TouchableOpacity>
      )}

      <View className="w-full mx-auto rounded-full h-1 bg-gray-300 mt-6 px-4">
      <View
        style={{
        width: `${((currentPage + 1) / totalPages) * 100}%`,
        height: "100%",
        backgroundColor: "#3b82f6",
        borderRadius: 999,
        }}
      />
      </View>
      <Typography
      variant="h1"
      numberOfLines={2}
      className="mt-6 px-4 text-4xl font-bold text-gray-900"
      >
      Create Your Shop Account
      </Typography>
      <Typography
      variant="body"
      className="mt-2 px-4 text-gray-500"
      >
      Step {currentPage + 1} of {totalPages}
      </Typography>

      <PagerView
      ref={pagerRef}
      style={{ flex: 1 }}
      initialPage={0}
      onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      scrollEnabled={false}
      >
      <View key="0" className="flex-1 p-4">
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: '86%' }}>
          <Typography variant="v1" className="font-semibold text-gray-900">Shop Name *</Typography>
          <TextInput
          placeholder="Enter shop name"
          value={formData.shopName}
          className="border border-gray-300 rounded-lg mt-2 p-3 text-base"
          onChangeText={(text) => setFormData({ ...formData, shopName: text })}
          />
          
          <Typography variant="v1" className="mt-4 font-semibold text-gray-900">Owner Name *</Typography>
          <TextInput
          placeholder="Enter owner name"
          value={formData.ownerName}
          className="border border-gray-300 rounded-lg mt-2 p-3 text-base"
          onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
          />
          
          <Typography variant="v1" className="mt-4 font-semibold text-gray-900">Email *</Typography>
          <TextInput
          placeholder="Enter email address"
          value={formData.email}
          keyboardType="email-address"
          className="border border-gray-300 rounded-lg mt-2 p-3 text-base"
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
          
          <Typography variant="v1" className="mt-4 font-semibold text-gray-900">Contact Number *</Typography>
          <TextInput
          placeholder="10-digit contact number"
          value={formData.contactNumber}
          keyboardType="phone-pad"
          maxLength={10}
          className="border border-gray-300 rounded-lg mt-2 p-3 text-base"
          onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
          />
          
          <Typography variant="v1" className="mt-4 font-semibold text-gray-900">Phone *</Typography>
          <TextInput
          placeholder="10-digit phone number"
          value={formData.phone}
          keyboardType="phone-pad"
          maxLength={10}
          className="border border-gray-300 rounded-lg mt-2 p-3 text-base"
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />
          
          <Typography variant="v1" className="mt-4 font-semibold text-gray-900">Password *</Typography>
          <View className="flex-row items-center border border-gray-300 rounded-lg mt-2 pr-3">
          <TextInput
            placeholder="Min. 8 characters"
            value={formData.password}
            secureTextEntry={!showPassword}
            className="flex-1 p-3 text-base"
            onChangeText={(text) => setFormData({ ...formData, password: text })}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#6b7280" />
          </TouchableOpacity>
          </View>
          
          <Typography variant="v1" className="mt-4 font-semibold text-gray-900">Confirm Password *</Typography>
          <View className="flex-row items-center border border-gray-300 rounded-lg mt-2 pr-3">
          <TextInput
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            secureTextEntry={!showConfirmPassword}
            className="flex-1 p-3 text-base"
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#6b7280" />
          </TouchableOpacity>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <View key="1" className="flex-1 p-4">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <Typography variant="v3" className="font-semibold text-gray-900 mb-4">Complete your branding & verification</Typography>
          
          {/* Owner Photo */}
          <Typography variant="v1" className="font-semibold text-gray-900">Owner Photo *</Typography>
          <View className="flex-row items-center mt-2 mb-4">
            <TouchableOpacity 
              onPress={() => pickImage("ownerPhoto")}
              className="size-32 bg-gray-100 rounded-lg items-center justify-center border border-dashed border-gray-400 overflow-hidden"
            >
              {formData.ownerPhoto ? (
                <Image source={{ uri: formData.ownerPhoto }} className="w-full h-full" />
              ) : (
                <>
                  <FontAwesome5 name="user" size={24} color="gray" />
                  <Typography variant="body" className="text-xs text-gray-500 mt-1">Upload</Typography>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => takePhoto("ownerPhoto")} className="ml-4 bg-gray-200 p-3 rounded-full">
              <FontAwesome5 name="camera" size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {/* Shop Logo */}
          <Typography variant="v1" className="font-semibold text-gray-900">Shop Logo (Optional)</Typography>
          <TouchableOpacity 
            onPress={() => pickImage("shopLogo")}
            className="size-32 bg-gray-100 rounded-full mt-2 mb-4 items-center justify-center border border-dashed border-gray-400 overflow-hidden"
          >
            {formData.shopLogo ? (
              <Image source={{ uri: formData.shopLogo }} className="w-full h-full" />
            ) : (
              <>
                <Ionicons name="image" size={24} color="gray" />
                <Typography variant="body" className="text-xs text-gray-500 mt-1">Logo</Typography>
              </>
            )}
          </TouchableOpacity>

          {/* Shop Banner */}
          <Typography variant="v1" className="font-semibold text-gray-900">Shop Banner (Optional)</Typography>
          <TouchableOpacity 
            onPress={() => pickImage("shopBanner")}
            className="w-full h-40 bg-gray-100 rounded-lg mt-2 mb-4 items-center justify-center border border-dashed border-gray-400 overflow-hidden"
          >
            {formData.shopBanner ? (
              <Image source={{ uri: formData.shopBanner }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <>
                <Ionicons name="images" size={32} color="gray" />
                <Typography variant="body" className="text-gray-500 mt-1">Upload Banner (16:9)</Typography>
              </>
            )}
          </TouchableOpacity>

          {/* Shop Images */}
          <Typography variant="v1" className="font-semibold text-gray-900">Shop Images (Optional, min 3 if provided)</Typography>
          <View className="flex-row flex-wrap mt-2">
            {formData.shopImages.map((uri, index) => (
              <View key={index} className="size-24 m-1 rounded-lg overflow-hidden border border-gray-300">
                <Image source={{ uri }} className="w-full h-full" />
                <TouchableOpacity 
                  onPress={() => removeShopImage(index)}
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              onPress={() => pickImage("shopImages")}
              className="size-24 m-1 bg-gray-100 rounded-lg items-center justify-center border border-dashed border-gray-400"
            >
              <Ionicons name="add" size={32} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Video URL */}
          <Typography variant="v1" className="mt-4 font-semibold text-gray-900">Shop Video URL (Optional)</Typography>
          <TextInput
            placeholder="YouTube or video link"
            value={formData.videoUrl}
            className="border border-gray-300 rounded-lg mt-2 p-3 text-base"
            onChangeText={(text) => setFormData({ ...formData, videoUrl: text })}
          />
        </ScrollView>
      </View>

      <View key="2" className="flex-1 p-4">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Typography variant="v1" className="font-semibold text-gray-900">Location & Services</Typography>

          <TouchableOpacity 
            onPress={() => setCategoryModalVisible(true)}
            className="mt-4 border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
          >
             <View className="flex-row items-center">
                <Ionicons name="apps" size={20} color="#4b5563" />
                <Typography variant="body" className="ml-2 text-gray-700">
                    {formData.shopCategory || "Select Service Category *"}
                </Typography>
             </View>
             <Ionicons name="chevron-down" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-lg mt-4">
            <Typography variant="body" className="font-medium">Are you an individual provider?</Typography>
            <TouchableOpacity 
              onPress={() => setFormData({ ...formData, isIndividual: !formData.isIndividual })}
              className={`w-12 h-6 rounded-full p-1 ${formData.isIndividual ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <View className={`w-4 h-4 rounded-full bg-white transition-all ${formData.isIndividual ? "ml-6" : "ml-0"}`} />
            </TouchableOpacity>
          </View>

          <Typography variant="v1" className="mt-6 font-semibold text-gray-900">
            {formData.isIndividual ? "Home/Service Location *" : "Shop Address *"}
          </Typography>
          <TextInput
            placeholder="Enter full address"
            value={formData.shopAddress}
            multiline
            numberOfLines={3}
            className="border border-gray-300 rounded-lg mt-2 p-3 text-base text-start"
            style={{ textAlignVertical: 'top' }}
            onChangeText={(text) => setFormData({ ...formData, shopAddress: text })}
          />

          <View className="flex-row mt-4">
            <View className="flex-1 mr-2">
              <Typography variant="v1" className="font-semibold text-gray-900">City *</Typography>
              <TextInput
                placeholder="City"
                value={formData.shopCity}
                className="border border-gray-300 rounded-lg mt-2 p-3 text-base"
                onChangeText={(text) => setFormData({ ...formData, shopCity: text })}
              />
            </View>
            <View className="flex-1">
              <Typography variant="v1" className="font-semibold text-gray-900">Pincode</Typography>
              <TextInput
                placeholder="Pincode"
                value={formData.shopPincode}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg mt-2 p-3 text-base"
                onChangeText={(text) => setFormData({ ...formData, shopPincode: text })}
              />
            </View>
          </View>

          {/* Opening and Closing Time */}
          <View className="flex-row mt-4">
            <View className="flex-1 mr-2">
              <Typography variant="v1" className="font-semibold text-gray-900">Opening Time</Typography>
              <TextInput
                placeholder="e.g., 09:00 AM"
                value={formData.openingTime}
                className="border border-gray-300 rounded-lg mt-2 p-3 text-base"
                onChangeText={(text) => setFormData({ ...formData, openingTime: text })}
              />
            </View>
            <View className="flex-1">
              <Typography variant="v1" className="font-semibold text-gray-900">Closing Time</Typography>
              <TextInput
                placeholder="e.g., 08:00 PM"
                value={formData.closingTime}
                className="border border-gray-300 rounded-lg mt-2 p-3 text-base"
                onChangeText={(text) => setFormData({ ...formData, closingTime: text })}
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={openMap}
            className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-200 flex-row items-center justify-center"
          >
            <Ionicons name="location" size={24} color="#3b82f6" />
            <Typography variant="v2" className="text-blue-600 ml-2">Select on Map</Typography>
          </TouchableOpacity>

          {/* Map Modal */}
          <Modal visible={mapVisible} animationType="slide">
            <View style={{ flex: 1 }}>
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={mapRegion}
                    onPress={handleMapPress}
                    showsUserLocation={true}
                >
                    {formData.shopLocation.latitude && (
                        <Marker coordinate={formData.shopLocation} title="Shop Location" />
                    )}
                </MapView>
                <View className="absolute bottom-10 left-5 right-5 flex-row justify-between">
                    <TouchableOpacity 
                        onPress={() => setMapVisible(false)} 
                        className="bg-red-500 p-4 rounded-lg flex-1 mr-2 items-center"
                    >
                        <Typography variant="v2" className="text-white font-bold">Cancel</Typography>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={confirmLocation} 
                        className="bg-green-600 p-4 rounded-lg flex-1 ml-2 items-center"
                    >
                        <Typography variant="v2" className="text-white font-bold">Confirm Location</Typography>
                    </TouchableOpacity>
                </View>
            </View>
          </Modal>

           {/* Category Selection Modal */}
           <Modal visible={categoryModalVisible} animationType="slide" transparent={true}>
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl p-4 h-3/4">
                <View className="flex-row justify-between items-center mb-4">
                  <Typography variant="v2" className="text-xl font-bold">Select Service Category</Typography>
                  <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                    <Ionicons name="close" size={24} color="black" />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="flex-row flex-wrap justify-between">
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => {
                          setFormData({ ...formData, shopCategory: cat.name });
                          setCategoryModalVisible(false);
                        }}
                        className={`w-[48%] p-4 mb-3 rounded-lg border flex-row items-center ${formData.shopCategory === cat.serviceName ? "bg-blue-50 border-blue-500" : "bg-gray-50 border-gray-200"}`}
                      >
                        <Ionicons name={cat.serviceName || "construct"} size={20} color={formData.shopCategory === cat.serviceName ? "#3b82f6" : "#4b5563"} />
                        <Typography variant="body" className={`ml-2 ${formData.shopCategory === cat.serviceName ? "text-blue-600 font-semibold" : "text-gray-700"}`}>
                          {cat.serviceName}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
          
          {/* Loading Overlay */}
          {isLoading && (
            <Modal transparent={true} animationType="fade">
              <View className="flex-1 bg-black/50 justify-center items-center">
                <View className="bg-white p-6 rounded-lg items-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Typography variant="body" className="mt-4 font-semibold text-gray-800">Processing Registration...</Typography>
                </View>
              </View>
            </Modal>
          )}

        </ScrollView>
      </View>
      </PagerView>
      {renderButtons()}
    </SafeAreaView>
    );
};

export default RegisterShopyScreen;
