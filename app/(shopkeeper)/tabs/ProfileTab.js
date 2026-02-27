import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// Replaced react-native-maps with OpenStreetMap
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../../Comoponents/Avatar';
import Typography from '../../Comoponents/Typography';
import OpenStreetMap from '../../Components/OpenStreetMap';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/designSystem';
import { logout, updateUser } from '../../redux/authSlice';
import { uploadToCloudinary } from '../../Services/cloudinnery';
import { auth } from '../../Services/firebase';
import { clearUserData, saveUserData } from '../../Services/storage_service';
import { updateShopkeeperProfile } from '../../Services/user_services';


export default function ProfileTab() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [editModal, setEditModal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editData, setEditData] = useState({
    ownerName: '',
    shopName: '',
    email: '',
    password: '',
    contactNumber: '',
    phone: '',
    shopAddress: '',
    shopCity: '',
    shopState: '',
    shopPincode: '',
    shopCategory: '',
    ownerPhoto: null,
    shopLogo: null,
    shopBanner: null,
    shopLocation: null,
  });

  // Only update editData when modal opens - NO user dependency to avoid loop
  useEffect(() => {
    if (editModal && user) {
      setEditData({
        ownerName: user.ownerName || '',
        shopName: user.shopName || '',
        email: user.email || '',
        password: '', // Don't pre-fill password for security
        contactNumber: user.contactNumber || '',
        phone: user.phone || '',
        shopAddress: user.shopAddress || '',
        shopCity: user.shopCity || '',
        shopState: user.shopState || '',
        shopPincode: user.shopPincode || '',
        shopCategory: user.shopCategory || '',
        ownerPhoto: user.ownerPhoto || null,
        shopLogo: user.shopLogo || null,
        shopBanner: user.shopBanner || null,
        shopLocation: user.shopLocation || null,
      });
      
      // Set initial location for map
      if (user.shopLocation) {
        setSelectedLocation({
          latitude: user.shopLocation.latitude,
          longitude: user.shopLocation.longitude,
        });
      }
    }
  }, [editModal]); // Only editModal dependency

  const getCurrentLocation = async () => {
    try {
   
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied', 
          'Location permission is required to use this feature. Please enable it in your device settings.'
        );
        return;
      }

      // Show loading
      Alert.alert('Getting Location', 'Please wait...');

      // Get current position with timeout
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
        maximumAge: 10000,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setSelectedLocation(newLocation);
      
      // Get address from coordinates
      try {
        const address = await Location.reverseGeocodeAsync(newLocation);
        if (address[0]) {
          setEditData({
            ...editData,
            shopLocation: newLocation,
            shopCity: address[0].city || editData.shopCity,
            shopState: address[0].region || editData.shopState,
            shopPincode: address[0].postalCode || editData.shopPincode,
          });
          Alert.alert('Success', 'Current location set successfully!');
        } else {
          setEditData({
            ...editData,
            shopLocation: newLocation,
          });
          Alert.alert('Success', 'Location set! Please fill city and pincode manually.');
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        setEditData({
          ...editData,
          shopLocation: newLocation,
        });
        Alert.alert('Success', 'Location set! Please fill city and pincode manually.');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Error', 
        'Failed to get current location. Please check if location services are enabled on your device.'
      );
    }
  };

  const openLocationPicker = () => {
    if (!selectedLocation && user?.shopLocation) {
      setSelectedLocation({
        latitude: user.shopLocation.latitude,
        longitude: user.shopLocation.longitude,
      });
    } else if (!selectedLocation) {
      // Default to Delhi if no location set
      setSelectedLocation({
        latitude: 28.6139,
        longitude: 77.2090,
      });
    }
    setLocationModal(true);
  };

  const confirmLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    try {
      // Get address from coordinates
      const address = await Location.reverseGeocodeAsync(selectedLocation);
      if (address[0]) {
        // Build full address string
        const fullAddress = [
          address[0].name,
          address[0].street,
          address[0].district,
          address[0].city,
          address[0].region,
        ].filter(Boolean).join(', ');

        setEditData({
          ...editData,
          shopLocation: selectedLocation,
          shopAddress: fullAddress || editData.shopAddress,
          shopCity: address[0].city || editData.shopCity,
          shopState: address[0].region || editData.shopState,
          shopPincode: address[0].postalCode || editData.shopPincode,
        });
        Alert.alert('Success', 'Location and address updated successfully!');
      } else {
        setEditData({
          ...editData,
          shopLocation: selectedLocation,
        });
        Alert.alert('Success', 'Location set! Please fill address details manually.');
      }
      setLocationModal(false);
    } catch (error) {
      console.error('Error getting address:', error);
      setEditData({
        ...editData,
        shopLocation: selectedLocation,
      });
      setLocationModal(false);
      Alert.alert('Success', 'Location set! Please fill address details manually.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              await clearUserData();
              dispatch(logout());
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const pickImage = async (field) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: field === 'shopBanner' ? [16, 9] : [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setEditData({ ...editData, [field]: result.assets[0].uri });
    }
  };

  const saveProfile = async () => {
    if (!editData.ownerName.trim()) {
      Alert.alert('Error', 'Owner name is required');
      return;
    }
    if (!editData.shopName.trim()) {
      Alert.alert('Error', 'Shop name is required');
      return;
    }

    try {
      setSaving(true);
      
      // Upload new images if they were changed
      let ownerPhotoUrl = editData.ownerPhoto;
      let shopLogoUrl = editData.shopLogo;
      let shopBannerUrl = editData.shopBanner;

      // Check if image is a local URI (starts with file://)
      if (ownerPhotoUrl && ownerPhotoUrl.startsWith('file://')) {
        ownerPhotoUrl = await uploadToCloudinary(ownerPhotoUrl);
      }
      if (shopLogoUrl && shopLogoUrl.startsWith('file://')) {
        shopLogoUrl = await uploadToCloudinary(shopLogoUrl);
      }
      if (shopBannerUrl && shopBannerUrl.startsWith('file://')) {
        shopBannerUrl = await uploadToCloudinary(shopBannerUrl);
      }

      const updateData = {
        ownerName: editData.ownerName,
        shopName: editData.shopName,
        contactNumber: editData.contactNumber,
        phone: editData.phone || editData.contactNumber,
        shopAddress: editData.shopAddress,
        shopCity: editData.shopCity,
        shopState: editData.shopState,
        shopPincode: editData.shopPincode,
        shopLocation: editData.shopLocation,
        ownerPhoto: ownerPhotoUrl,
        shopLogo: shopLogoUrl,
        shopBanner: shopBannerUrl,
      };

      // Update Firebase
      await updateShopkeeperProfile(user.docId, updateData);

      // Handle password update if provided
      if (editData.password && editData.password.trim().length > 0) {
        if (editData.password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters');
          setSaving(false);
          return;
        }

        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            // Update password in Firebase Auth
            await updatePassword(currentUser, editData.password);
            Alert.alert('Success', 'Profile and password updated successfully!');
          }
        } catch (passwordError) {
          console.error('Password update error:', passwordError);
          
          // If re-authentication is required
          if (passwordError.code === 'auth/requires-recent-login') {
            Alert.alert(
              'Re-authentication Required',
              'For security reasons, please log out and log in again to change your password.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert('Error', 'Profile updated but password change failed. Please try again later.');
          }
        }
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
      }

      // Update Redux
      const updatedUser = { ...user, ...updateData };
      dispatch(updateUser(updatedUser));

      // Update AsyncStorage
      await saveUserData(updatedUser);

      setEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={{
          backgroundColor: Colors.primary[600],
          paddingHorizontal: Spacing[6],
          paddingVertical: Spacing[8],
          borderBottomLeftRadius: BorderRadius['3xl'],
          borderBottomRightRadius: BorderRadius['3xl'],
        }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ position: 'relative' }}>
              <Avatar
                source={user?.ownerPhoto}
                size="2xl"
                style={{
                  borderWidth: 4,
                  borderColor: Colors.neutral[0],
                }}
              />
              <TouchableOpacity
                onPress={() => pickImage('ownerPhoto')}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: Colors.neutral[0],
                  padding: Spacing[2],
                  borderRadius: BorderRadius.full,
                  ...Shadows.sm,
                }}
              >
                <Ionicons name="camera" size={16} color={Colors.primary[600]} />
              </TouchableOpacity>
            </View>
            <Typography variant="h3" color="inverse" style={{ marginTop: Spacing[4] }}>
              {user?.ownerName || 'Shopkeeper'}
            </Typography>
            <Typography variant="body" color="inverse" style={{ marginTop: Spacing[1], opacity: 0.8 }}>
              {user?.email || 'email@example.com'}
            </Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing[3] }}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Typography variant="body" color="inverse" style={{ marginLeft: Spacing[1] }}>
                {user?.rating || '4.5'} Rating
              </Typography>
              <Typography variant="body" color="inverse" style={{ marginLeft: Spacing[2], opacity: 0.8 }}>
                • {user?.totalReviews || '0'} Reviews
              </Typography>
            </View>
          </View>
        </View>

        {/* Shop Info Card */}
        <View style={{
          marginHorizontal: Spacing[6],
          marginTop: -Spacing[6],
          backgroundColor: Colors.background.primary,
          borderRadius: BorderRadius.xl,
          padding: Spacing[4],
          ...Shadows.md,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              backgroundColor: Colors.primary[50],
              padding: Spacing[3],
              borderRadius: BorderRadius.lg,
            }}>
              <Ionicons name="storefront" size={24} color={Colors.primary[600]} />
            </View>
            <View style={{ marginLeft: Spacing[4], flex: 1 }}>
              <Typography variant="body" weight="semibold">
                {user?.shopName || 'My Shop'}
              </Typography>
              <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                {user?.shopCategory || 'Service Provider'}
              </Typography>
            </View>
            <TouchableOpacity onPress={() => setEditModal(true)}>
              <Ionicons name="create-outline" size={24} color={Colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Details */}
        <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[6] }}>
          <Typography variant="h4" style={{ marginBottom: Spacing[4] }}>
            Profile Information
          </Typography>

          <View style={{
            backgroundColor: Colors.background.primary,
            borderRadius: BorderRadius.xl,
            padding: Spacing[4],
            marginBottom: Spacing[3],
            ...Shadows.sm,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person-outline" size={20} color={Colors.text.secondary} />
              <View style={{ marginLeft: Spacing[3], flex: 1 }}>
                <Typography variant="caption" color="secondary">
                  Owner Name
                </Typography>
                <Typography variant="body" weight="medium" style={{ marginTop: Spacing[1] }}>
                  {user?.ownerName || 'Not set'}
                </Typography>
              </View>
            </View>
          </View>

          <View style={{
            backgroundColor: Colors.background.primary,
            borderRadius: BorderRadius.xl,
            padding: Spacing[4],
            marginBottom: Spacing[3],
            ...Shadows.sm,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="call-outline" size={20} color={Colors.text.secondary} />
              <View style={{ marginLeft: Spacing[3], flex: 1 }}>
                <Typography variant="caption" color="secondary">
                  Contact Number
                </Typography>
                <Typography variant="body" weight="medium" style={{ marginTop: Spacing[1] }}>
                  {user?.contactNumber || 'Not set'}
                </Typography>
              </View>
            </View>
          </View>

          <View style={{
            backgroundColor: Colors.background.primary,
            borderRadius: BorderRadius.xl,
            padding: Spacing[4],
            marginBottom: Spacing[3],
            ...Shadows.sm,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={20} color={Colors.text.secondary} />
              <View style={{ marginLeft: Spacing[3], flex: 1 }}>
                <Typography variant="caption" color="secondary">
                  Address
                </Typography>
                <Typography variant="body" weight="medium" style={{ marginTop: Spacing[1] }}>
                  {user?.shopAddress || 'Not set'}
                </Typography>
              </View>
            </View>
          </View>

          <View style={{
            backgroundColor: Colors.background.primary,
            borderRadius: BorderRadius.xl,
            padding: Spacing[4],
            marginBottom: Spacing[3],
            ...Shadows.sm,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="business-outline" size={20} color={Colors.text.secondary} />
              <View style={{ marginLeft: Spacing[3], flex: 1 }}>
                <Typography variant="caption" color="secondary">
                  City & Pincode
                </Typography>
                <Typography variant="body" weight="medium" style={{ marginTop: Spacing[1] }}>
                  {user?.shopCity || 'Not set'} - {user?.shopPincode || 'N/A'}
                </Typography>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[4], marginBottom: Spacing[8] }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: Colors.error.light,
              borderRadius: BorderRadius.xl,
              padding: Spacing[4],
              borderWidth: 1,
              borderColor: Colors.error.main,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="log-out-outline" size={24} color={Colors.error.main} />
              <Typography variant="body" weight="semibold" style={{ marginLeft: Spacing[2], color: Colors.error.main }}>
                Logout
              </Typography>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModal} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{
            backgroundColor: Colors.background.primary,
            borderTopLeftRadius: BorderRadius['3xl'],
            borderTopRightRadius: BorderRadius['3xl'],
            padding: Spacing[6],
            height: '85%',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[6] }}>
              <Typography variant="h3">Edit Profile</Typography>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={28} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: Spacing[6] }}>
                <TouchableOpacity onPress={() => pickImage('ownerPhoto')}>
                  <Avatar source={editData.ownerPhoto} size="2xl" />
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: Colors.primary[600],
                    padding: Spacing[2],
                    borderRadius: BorderRadius.full,
                  }}>
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                </TouchableOpacity>
              </View>

              <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                Owner Name
              </Typography>
              <TextInput
                value={editData.ownerName}
                onChangeText={(text) => setEditData({ ...editData, ownerName: text })}
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border.main,
                  borderRadius: BorderRadius.md,
                  padding: Spacing[3],
                  marginBottom: Spacing[4],
                  fontSize: 15,
                }}
              />

              <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                Shop Name
              </Typography>
              <TextInput
                value={editData.shopName}
                onChangeText={(text) => setEditData({ ...editData, shopName: text })}
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border.main,
                  borderRadius: BorderRadius.md,
                  padding: Spacing[3],
                  marginBottom: Spacing[4],
                  fontSize: 15,
                }}
              />

              <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                Email
              </Typography>
              <TextInput
                value={editData.email}
                onChangeText={(text) => setEditData({ ...editData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border.main,
                  borderRadius: BorderRadius.md,
                  padding: Spacing[3],
                  marginBottom: Spacing[4],
                  fontSize: 15,
                  backgroundColor: Colors.background.tertiary,
                  color: Colors.text.secondary,
                }}
              />

              <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                Password (leave blank to keep current)
              </Typography>
              <TextInput
                value={editData.password}
                onChangeText={(text) => setEditData({ ...editData, password: text })}
                placeholder="Enter new password"
                secureTextEntry
                autoCapitalize="none"
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border.main,
                  borderRadius: BorderRadius.md,
                  padding: Spacing[3],
                  marginBottom: Spacing[4],
                  fontSize: 15,
                }}
              />

              <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                Contact Number
              </Typography>
              <TextInput
                value={editData.contactNumber}
                onChangeText={(text) => setEditData({ ...editData, contactNumber: text })}
                keyboardType="phone-pad"
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border.main,
                  borderRadius: BorderRadius.md,
                  padding: Spacing[3],
                  marginBottom: Spacing[4],
                  fontSize: 15,
                }}
              />

              <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                Address
              </Typography>
              <TextInput
                value={editData.shopAddress}
                onChangeText={(text) => setEditData({ ...editData, shopAddress: text })}
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border.main,
                  borderRadius: BorderRadius.md,
                  padding: Spacing[3],
                  marginBottom: Spacing[4],
                  fontSize: 15,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
              />

              <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                Shop Location
              </Typography>
              <TouchableOpacity
                onPress={openLocationPicker}
                style={{
                  backgroundColor: Colors.primary[600],
                  paddingVertical: Spacing[4],
                  borderRadius: BorderRadius.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: Spacing[4],
                }}
              >
                <Ionicons name="location" size={20} color="white" />
                <Typography variant="body" weight="semibold" color="inverse" style={{ marginLeft: Spacing[2] }}>
                  {editData.shopLocation ? 'Update Location' : 'Select Location on Map'}
                </Typography>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                    City
                  </Typography>
                  <TextInput
                    value={editData.shopCity}
                    onChangeText={(text) => setEditData({ ...editData, shopCity: text })}
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border.main,
                      borderRadius: BorderRadius.md,
                      padding: Spacing[3],
                      fontSize: 15,
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                    Pincode
                  </Typography>
                  <TextInput
                    value={editData.shopPincode}
                    onChangeText={(text) => setEditData({ ...editData, shopPincode: text })}
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border.main,
                      borderRadius: BorderRadius.md,
                      padding: Spacing[3],
                      fontSize: 15,
                    }}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={saveProfile}
                disabled={saving}
                style={{
                  backgroundColor: Colors.primary[600],
                  paddingVertical: Spacing[4],
                  borderRadius: BorderRadius.lg,
                  alignItems: 'center',
                  marginTop: Spacing[6],
                  marginBottom: Spacing[6],
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Typography variant="body" weight="semibold" color="inverse">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Typography>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      <Modal visible={locationModal} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.primary }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: Spacing[4],
            borderBottomWidth: 1,
            borderBottomColor: Colors.border.light,
          }}>
            <TouchableOpacity onPress={() => setLocationModal(false)}>
              <Ionicons name="close" size={28} color={Colors.text.primary} />
            </TouchableOpacity>
            <Typography variant="h4">Select Location</Typography>
            <TouchableOpacity onPress={confirmLocation}>
              <Typography variant="body" weight="semibold" style={{ color: Colors.primary[600] }}>
                Done
              </Typography>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            {selectedLocation && (
              <OpenStreetMap
                initialRegion={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                markers={[{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  title: "Current Location",
                  description: "Drag to adjust location",
                  shopId: "current",
                  type: "shop"
                }]}
                showsMyLocationButton={true}
                onLocationSelect={(coordinate) => {
                  // Check if coordinate is provided (could be undefined in some cases)
                  if (!coordinate || !coordinate.lat || !coordinate.lng) {
                    return;
                  }
                  
                  const { lat: latitude, lng: longitude } = coordinate;
                  setSelectedLocation({ latitude, longitude });
                }}
                style={{ flex: 1 }}
              />
            )}
          </View>

          <View style={{
            padding: Spacing[4],
            backgroundColor: Colors.background.primary,
            borderTopWidth: 1,
            borderTopColor: Colors.border.light,
          }}>
            <View style={{
              backgroundColor: Colors.primary[50],
              padding: Spacing[3],
              borderRadius: BorderRadius.md,
              marginBottom: Spacing[3],
            }}>
              <Typography variant="caption" color="secondary" style={{ marginBottom: Spacing[1] }}>
                Selected Coordinates:
              </Typography>
              <Typography variant="body" weight="medium">
                {selectedLocation && selectedLocation.latitude !== undefined && selectedLocation.longitude !== undefined
                  ? `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`
                  : 'No location selected'}
              </Typography>
            </View>
            
            <TouchableOpacity
              onPress={getCurrentLocation}
              style={{
                backgroundColor: Colors.primary[600],
                paddingVertical: Spacing[3],
                borderRadius: BorderRadius.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="navigate" size={20} color="white" />
              <Typography variant="body" weight="semibold" color="inverse" style={{ marginLeft: Spacing[2] }}>
                Use My Current Location
              </Typography>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
