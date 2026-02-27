import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
// import { MapView, Marker } from 'expo-maps';
import { useRouter } from 'expo-router';
import { signOut, updatePassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../Comoponents/Avatar';
import Typography from '../Comoponents/Typography';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/designSystem';
import { logout, updateUser } from '../redux/authSlice';
import { getUserBookings } from '../Services/booking_service';
import { uploadToCloudinary } from '../Services/cloudinnery';
import { auth } from '../Services/firebase';
import { getUserReviews } from '../Services/review_service';
import { clearUserData, saveUserData } from '../Services/storage_service';
import { updateUserProfile } from '../Services/user_services';


export default function ProfileTab() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [editModal, setEditModal] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('profile'); // 'profile' or 'reviews'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    completed: 0,
    reviews: 0
  });
  const [reviews, setReviews] = useState([]);
  
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    profilePhoto: null,
    location: { latitude: 20.9320, longitude: 77.7523 },
  });

  const [mapRegion, setMapRegion] = useState({
    latitude: 20.9320,
    longitude: 77.7523,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Update editData when user data is available
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        profilePhoto: user.profilePhoto || null,
        location: user.location || { latitude: 20.9320, longitude: 77.7523 },
      });

      if (user.location) {
        setMapRegion({
          latitude: user.location.latitude,
          longitude: user.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }
  }, [user]);

  // Fetch booking stats from Firebase
  useEffect(() => {
    if (user?.uid) {
      loadBookingStats();
    }
  }, [user?.uid]);

  const loadBookingStats = async () => {
    try {
      setLoading(true);
      const bookings = await getUserBookings(user.uid);
      const completed = bookings.filter(b => b.status === 'completed').length;
      
      const userReviews = await getUserReviews(user.uid);
      
      // Format reviews with date
      const formattedReviews = userReviews.map(review => ({
        ...review,
        date: new Date(review.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }));
      
      setReviews(formattedReviews);
      
      setBookingStats({
        total: bookings.length,
        completed: completed,
        reviews: userReviews.length
      });
    } catch (error) {
      console.error('Error loading booking stats:', error);
    } finally {
      setLoading(false);
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setEditData({ ...editData, profilePhoto: result.assets[0].uri });
    }
  };

  const openMap = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setMapRegion({
      ...mapRegion,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setEditData({
      ...editData,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    });
    setMapVisible(true);
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setEditData({
      ...editData,
      location: { latitude, longitude }
    });
    
    // Fetch address immediately for preview
    fetchAddressPreview(latitude, longitude);
  };

  const fetchAddressPreview = async (latitude, longitude) => {
    try {
      let addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addressResponse.length > 0) {
        const addressParams = addressResponse[0];
        const formattedAddress = `${addressParams.name || ''} ${addressParams.street || ''}, ${addressParams.subregion || ''}, ${addressParams.city || ''}, ${addressParams.region || ''}, ${addressParams.postalCode || ''}`;
        
        // Update preview in editData
        setEditData(prev => ({
          ...prev,
          location: { latitude, longitude },
          address: formattedAddress.replace(/ ,/g, '').trim(),
          city: addressParams.city || addressParams.subregion || "",
          pincode: addressParams.postalCode || "",
        }));
      }
    } catch (error) {
      console.log("Geocoding Error: ", error);
    }
  };

  const confirmLocation = async () => {
    setMapVisible(false);
    try {
      const { latitude, longitude } = editData.location;
      if (latitude && longitude) {
        let addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addressResponse.length > 0) {
          const addressParams = addressResponse[0];
          const formattedAddress = `${addressParams.name || ''} ${addressParams.street || ''}, ${addressParams.subregion || ''}, ${addressParams.city || ''}, ${addressParams.region || ''}, ${addressParams.postalCode || ''}`;
          
          setEditData({
            ...editData,
            address: formattedAddress.replace(/ ,/g, '').trim(),
            city: addressParams.city || addressParams.subregion || "",
            pincode: addressParams.postalCode || "",
          });
        }
      }
    } catch (error) {
      console.log("Geocoding Error: ", error);
      Alert.alert("Error", "Could not fetch address details.");
    }
  };

  const saveProfile = async () => {
    if (!editData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      setSaving(true);
      
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
            await updatePassword(currentUser, editData.password);
            console.log('Password updated successfully');
          }
        } catch (passwordError) {
          console.error('Error updating password:', passwordError);
          if (passwordError.code === 'auth/requires-recent-login') {
            Alert.alert(
              'Re-authentication Required',
              'For security, please log out and log in again to change your password.'
            );
          } else {
            Alert.alert('Error', 'Failed to update password. Please try again.');
          }
          setSaving(false);
          return;
        }
      }
      
      // Prepare update data
      let profilePhotoUrl = editData.profilePhoto;
      
      // Upload new profile photo if it was changed and is a local file
      if (editData.profilePhoto && editData.profilePhoto !== user?.profilePhoto && editData.profilePhoto.startsWith('file://')) {
        profilePhotoUrl = await uploadToCloudinary(editData.profilePhoto);
      }
      
      const updateData = {
        name: editData.name.trim(),
        phone: editData.phone.trim(),
        address: editData.address.trim(),
        city: editData.city.trim(),
        pincode: editData.pincode.trim(),
        location: editData.location,
        profilePhoto: profilePhotoUrl,
      };

      // Update in Firebase
      await updateUserProfile(user.docId, updateData);

      // Update Redux state
      dispatch(updateUser(updateData));

      // Update AsyncStorage
      const updatedUser = { ...user, ...updateData };
      await saveUserData(updatedUser);

      setSaving(false);
      Alert.alert('Success', 'Profile updated successfully!');
      setEditModal(false);
    } catch (error) {
      setSaving(false);
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const renderReviewCard = ({ item }) => (
    <View
      style={{
        backgroundColor: Colors.background.primary,
        borderRadius: BorderRadius.xl,
        padding: Spacing[4],
        marginBottom: Spacing[3],
        ...Shadows.sm,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2] }}>
        <Typography variant="body" weight="semibold">
          {item.shopName}
        </Typography>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={index}
              name={index < item.rating ? 'star' : 'star-outline'}
              size={14}
              color="#fbbf24"
              style={{ marginLeft: 2 }}
            />
          ))}
        </View>
      </View>
      <Typography variant="caption" style={{ marginBottom: Spacing[2] }}>
        {item.comment}
      </Typography>
      <Typography variant="caption" color="secondary" style={{ fontSize: 11 }}>
        {item.date}
      </Typography>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View
          style={{
            backgroundColor: Colors.primary[600],
            paddingHorizontal: Spacing[6],
            paddingVertical: Spacing[8],
            borderBottomLeftRadius: BorderRadius['3xl'],
            borderBottomRightRadius: BorderRadius['3xl'],
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <View style={{ position: 'relative' }}>
              <Avatar
                source={user?.profilePhoto}
                size="2xl"
                style={{
                  borderWidth: 4,
                  borderColor: Colors.neutral[0],
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: Colors.success.main,
                  padding: Spacing[2],
                  borderRadius: BorderRadius.full,
                  borderWidth: 2,
                  borderColor: Colors.neutral[0],
                }}
              >
                <Ionicons name="checkmark" size={16} color={Colors.neutral[0]} />
              </View>
            </View>
            <Typography variant="h3" color="inverse" style={{ marginTop: Spacing[4] }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body" color="inverse" style={{ marginTop: Spacing[1], opacity: 0.8 }}>
              {user?.email || 'email@example.com'}
            </Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing[2] }}>
              <Ionicons name="location" size={16} color={Colors.neutral[0]} style={{ opacity: 0.8 }} />
              <Typography variant="caption" color="inverse" style={{ marginLeft: Spacing[1], opacity: 0.8 }}>
                {user?.city || 'City'}, {user?.pincode || 'Pincode'}
              </Typography>
            </View>
          </View>
        </View>

        {/* Section Tabs */}
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: Spacing[6],
            marginTop: Spacing[6],
            backgroundColor: Colors.background.primary,
            borderRadius: BorderRadius.xl,
            padding: Spacing[1],
            ...Shadows.sm,
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveSection('profile')}
            style={{
              flex: 1,
              paddingVertical: Spacing[2],
              borderRadius: BorderRadius.lg,
              backgroundColor: activeSection === 'profile' ? Colors.primary[600] : 'transparent',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="caption"
              weight="semibold"
              style={{ color: activeSection === 'profile' ? Colors.neutral[0] : Colors.text.secondary }}
            >
              Profile Info
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveSection('reviews')}
            style={{
              flex: 1,
              paddingVertical: Spacing[2],
              borderRadius: BorderRadius.lg,
              backgroundColor: activeSection === 'reviews' ? Colors.primary[600] : 'transparent',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="caption"
              weight="semibold"
              style={{ color: activeSection === 'reviews' ? Colors.neutral[0] : Colors.text.secondary }}
            >
              My Reviews
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeSection === 'profile' ? (
          <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[6] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[4] }}>
              <Typography variant="h4">Profile Information</Typography>
              <TouchableOpacity onPress={() => setEditModal(true)}>
                <Ionicons name="create-outline" size={24} color={Colors.primary[600]} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[4],
                marginBottom: Spacing[3],
                ...Shadows.sm,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person-outline" size={20} color={Colors.text.secondary} />
                <View style={{ marginLeft: Spacing[3], flex: 1 }}>
                  <Typography variant="caption" color="secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body" weight="medium" style={{ marginTop: Spacing[1] }}>
                    {user?.name || 'Not set'}
                  </Typography>
                </View>
              </View>
            </View>

            <View
              style={{
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[4],
                marginBottom: Spacing[3],
                ...Shadows.sm,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail-outline" size={20} color={Colors.text.secondary} />
                <View style={{ marginLeft: Spacing[3], flex: 1 }}>
                  <Typography variant="caption" color="secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body" weight="medium" style={{ marginTop: Spacing[1] }}>
                    {user?.email || 'Not set'}
                  </Typography>
                </View>
              </View>
            </View>

            <View
              style={{
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[4],
                marginBottom: Spacing[3],
                ...Shadows.sm,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call-outline" size={20} color={Colors.text.secondary} />
                <View style={{ marginLeft: Spacing[3], flex: 1 }}>
                  <Typography variant="caption" color="secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body" weight="medium" style={{ marginTop: Spacing[1] }}>
                    {user?.phone || 'Not set'}
                  </Typography>
                </View>
              </View>
            </View>

            <View
              style={{
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[4],
                marginBottom: Spacing[3],
                ...Shadows.sm,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={20} color={Colors.text.secondary} />
                <View style={{ marginLeft: Spacing[3], flex: 1 }}>
                  <Typography variant="caption" color="secondary">
                    Address
                  </Typography>
                  <Typography variant="body" weight="medium" style={{ marginTop: Spacing[1] }}>
                    {user?.address || 'Not set'}
                  </Typography>
                  <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                    {user?.city || 'City'}, {user?.pincode || 'Pincode'}
                  </Typography>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[6] }}>
            <Typography variant="h4" style={{ marginBottom: Spacing[4] }}>
              My Reviews ({reviews.length})
            </Typography>
            {reviews.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: Spacing[8] }}>
                <Ionicons name="star-outline" size={48} color={Colors.text.secondary} />
                <Typography variant="body" weight="semibold" style={{ marginTop: Spacing[4] }}>
                  No reviews yet
                </Typography>
                <Typography variant="caption" color="secondary" style={{ textAlign: 'center', marginTop: Spacing[2] }}>
                  Complete a service to leave a review
                </Typography>
              </View>
            ) : (
              <FlatList
                data={reviews}
                renderItem={renderReviewCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

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
          <View
            style={{
              backgroundColor: Colors.background.primary,
              borderTopLeftRadius: BorderRadius['3xl'],
              borderTopRightRadius: BorderRadius['3xl'],
              padding: Spacing[6],
              height: '85%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[6] }}>
              <Typography variant="h3">Edit Profile</Typography>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={28} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: Spacing[6] }}>
                <TouchableOpacity onPress={pickImage}>
                  <Avatar source={editData.profilePhoto} size="2xl" />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: Colors.primary[600],
                      padding: Spacing[2],
                      borderRadius: BorderRadius.full,
                    }}
                  >
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                </TouchableOpacity>
              </View>

              <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                Full Name
              </Typography>
              <TextInput
                value={editData.name}
                onChangeText={(text) => setEditData({ ...editData, name: text })}
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
                Phone Number
              </Typography>
              <TextInput
                value={editData.phone}
                onChangeText={(text) => setEditData({ ...editData, phone: text })}
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
                value={editData.address}
                onChangeText={(text) => setEditData({ ...editData, address: text })}
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

              <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                    City
                  </Typography>
                  <TextInput
                    value={editData.city}
                    onChangeText={(text) => setEditData({ ...editData, city: text })}
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
                    value={editData.pincode}
                    onChangeText={(text) => setEditData({ ...editData, pincode: text })}
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
                onPress={openMap}
                style={{
                  marginTop: Spacing[4],
                  backgroundColor: Colors.primary[50],
                  padding: Spacing[4],
                  borderRadius: BorderRadius.xl,
                  borderWidth: 1,
                  borderColor: Colors.primary[200],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="location" size={24} color={Colors.primary[600]} />
                <Typography variant="body" weight="medium" style={{ marginLeft: Spacing[2], color: Colors.primary[600] }}>
                  {editData.location.latitude ? 'Update Location on Map' : 'Select Location on Map'}
                </Typography>
              </TouchableOpacity>

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

      {/* Map Modal */}
      <Modal visible={mapVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          {/* Map Header */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              backgroundColor: Colors.background.primary,
              paddingTop: Spacing[12],
              paddingHorizontal: Spacing[6],
              paddingBottom: Spacing[4],
              ...Shadows.lg,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h4">Select Your Location</Typography>
              <TouchableOpacity onPress={() => setMapVisible(false)}>
                <Ionicons name="close" size={28} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
              Tap on the map to set your location
            </Typography>
          </View>

          <MapView
            style={{ flex: 1 }}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {editData.location.latitude && editData.location.longitude && (
              <Marker
                coordinate={editData.location}
                title="Your Location"
                draggable
                onDragEnd={handleMapPress}
              >
                <View
                  style={{
                    alignItems: 'center',
                  }}
                >
                  {/* Pin Head */}
                  <View
                    style={{
                      backgroundColor: Colors.error.main,
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      borderWidth: 4,
                      borderColor: Colors.neutral[0],
                      justifyContent: 'center',
                      alignItems: 'center',
                      ...Shadows.lg,
                    }}
                  >
                    <Ionicons name="location" size={32} color={Colors.neutral[0]} />
                  </View>
                  {/* Pin Tail */}
                  <View
                    style={{
                      width: 0,
                      height: 0,
                      backgroundColor: 'transparent',
                      borderStyle: 'solid',
                      borderLeftWidth: 10,
                      borderRightWidth: 10,
                      borderTopWidth: 15,
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderTopColor: Colors.error.main,
                      marginTop: -2,
                    }}
                  />
                  {/* Shadow Circle */}
                  <View
                    style={{
                      width: 20,
                      height: 8,
                      borderRadius: 10,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      marginTop: 2,
                    }}
                  />
                </View>
              </Marker>
            )}
          </MapView>

          {/* Location Info Card */}
          {editData.location.latitude && (
            <View
              style={{
                position: 'absolute',
                bottom: 100,
                left: Spacing[6],
                right: Spacing[6],
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[4],
                ...Shadows.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[2] }}>
                <Ionicons name="location" size={20} color={Colors.primary[600]} />
                <Typography variant="body" weight="semibold" style={{ marginLeft: Spacing[2] }}>
                  Selected Location
                </Typography>
              </View>
              
              {editData.address ? (
                <>
                  <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                    {editData.address}
                  </Typography>
                  <View style={{ flexDirection: 'row', marginTop: Spacing[1] }}>
                    {editData.city && (
                      <Typography variant="caption" color="secondary">
                        {editData.city}
                      </Typography>
                    )}
                    {editData.pincode && (
                      <Typography variant="caption" color="secondary">
                        {editData.city ? ' • ' : ''}{editData.pincode}
                      </Typography>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: Spacing[2], paddingTop: Spacing[2], borderTopWidth: 1, borderTopColor: Colors.border.light }}>
                    <Typography variant="caption" color="secondary" style={{ fontSize: 11 }}>
                      {editData.location.latitude.toFixed(6)}, {editData.location.longitude.toFixed(6)}
                    </Typography>
                  </View>
                </>
              ) : (
                <>
                  <Typography variant="caption" color="secondary">
                    Fetching address...
                  </Typography>
                  <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1], fontSize: 11 }}>
                    {editData.location.latitude.toFixed(6)}, {editData.location.longitude.toFixed(6)}
                  </Typography>
                </>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View
            style={{
              position: 'absolute',
              bottom: 20,
              left: Spacing[6],
              right: Spacing[6],
              flexDirection: 'row',
              gap: Spacing[3],
            }}
          >
            <TouchableOpacity 
              onPress={() => setMapVisible(false)} 
              style={{
                flex: 1,
                backgroundColor: Colors.background.primary,
                padding: Spacing[4],
                borderRadius: BorderRadius.xl,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: Colors.border.main,
                ...Shadows.lg,
              }}
            >
              <Typography variant="body" weight="semibold" color="primary">
                Cancel
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={confirmLocation} 
              style={{
                flex: 1,
                backgroundColor: Colors.primary[600],
                padding: Spacing[4],
                borderRadius: BorderRadius.xl,
                alignItems: 'center',
                ...Shadows.lg,
              }}
            >
              <Typography variant="body" weight="semibold" color="inverse">
                Confirm Location
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
