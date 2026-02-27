import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
// Replaced react-native-maps with OpenStreetMap
// import MapView, { Marker } from 'react-native-maps';
import Avatar from '../Comoponents/Avatar';
import Button from '../Comoponents/Button';
import Typography from '../Comoponents/Typography';
import OpenStreetMap from '../Components/OpenStreetMap';
import { BorderRadius, Colors, Spacing } from '../constants/designSystem';


export default function EditProfileModal({ visible, onClose, userData, onSave }) {
  const [editData, setEditData] = useState({
    ownerName: userData?.ownerName || '',
    shopName: userData?.shopName || '',
    email: userData?.email || '',
    contactNumber: userData?.contactNumber || '',
    phone: userData?.phone || '',
    shopAddress: userData?.shopAddress || '',
    shopCity: userData?.shopCity || '',
    shopState: userData?.shopState || '',
    shopPincode: userData?.shopPincode || '',
    shopCategory: userData?.shopCategory || '',
    ownerPhoto: userData?.ownerPhoto || null,
    shopLogo: userData?.shopLogo || null,
    shopBanner: userData?.shopBanner || null,
    shopLocation: userData?.shopLocation || { latitude: null, longitude: null },
  });

  const [mapVisible, setMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: editData.shopLocation?.latitude || 28.6139,
    longitude: editData.shopLocation?.longitude || 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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

  const takePhoto = async (field) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: field === 'shopBanner' ? [16, 9] : [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setEditData({ ...editData, [field]: result.assets[0].uri });
    }
  };

  const openMap = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setMapRegion({
      ...mapRegion,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setEditData({
      ...editData,
      shopLocation: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    });
    setMapVisible(true);
  };

  const handleMapPress = (coordinate, type, markerType) => {
    // Check if coordinate is provided (could be undefined in some cases)
    if (!coordinate || !coordinate.lat || !coordinate.lng) {
      return;
    }
    
    const { lat: latitude, lng: longitude } = coordinate;
    setEditData({
      ...editData,
      shopLocation: { latitude, longitude },
    });
  };

  const confirmLocation = async () => {
    setMapVisible(false);
    try {
      const { latitude, longitude } = editData.shopLocation;
      if (latitude && longitude) {
        const addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addressResponse.length > 0) {
          const addr = addressResponse[0];
          setEditData({
            ...editData,
            shopAddress: `${addr.name || ''} ${addr.street || ''}, ${addr.subregion || ''}`.trim(),
            shopCity: addr.city || addr.subregion || '',
            shopState: addr.region || '',
            shopPincode: addr.postalCode || '',
          });
        }
      }
    } catch (error) {
      console.log('Geocoding Error:', error);
    }
  };

  const handleSave = () => {
    if (!editData.ownerName.trim()) {
      Alert.alert('Error', 'Owner name is required');
      return;
    }
    if (!editData.shopName.trim()) {
      Alert.alert('Error', 'Shop name is required');
      return;
    }

    onSave(editData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{
          backgroundColor: Colors.background.primary,
          borderTopLeftRadius: BorderRadius['3xl'],
          borderTopRightRadius: BorderRadius['3xl'],
          padding: Spacing[6],
          height: '90%',
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[6] }}>
            <Typography variant="h3">Edit Profile</Typography>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Photo */}
              <View style={{ alignItems: 'center', marginBottom: Spacing[6] }}>
                <Avatar source={editData.ownerPhoto} size="2xl" />
                <View style={{ flexDirection: 'row', marginTop: Spacing[3], gap: Spacing[2] }}>
                  <TouchableOpacity
                    onPress={() => pickImage('ownerPhoto')}
                    style={{
                      backgroundColor: Colors.primary[50],
                      paddingHorizontal: Spacing[4],
                      paddingVertical: Spacing[2],
                      borderRadius: BorderRadius.lg,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="images" size={18} color={Colors.primary[600]} />
                    <Typography variant="caption" style={{ marginLeft: Spacing[1], color: Colors.primary[600] }}>
                      Gallery
                    </Typography>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => takePhoto('ownerPhoto')}
                    style={{
                      backgroundColor: Colors.primary[50],
                      paddingHorizontal: Spacing[4],
                      paddingVertical: Spacing[2],
                      borderRadius: BorderRadius.lg,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="camera" size={18} color={Colors.primary[600]} />
                    <Typography variant="caption" style={{ marginLeft: Spacing[1], color: Colors.primary[600] }}>
                      Camera
                    </Typography>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Shop Logo & Banner */}
              <Typography variant="body" weight="semibold" style={{ marginBottom: Spacing[2] }}>
                Shop Images
              </Typography>
              <View style={{ flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[4] }}>
                <TouchableOpacity
                  onPress={() => pickImage('shopLogo')}
                  style={{
                    flex: 1,
                    height: 100,
                    backgroundColor: Colors.neutral[100],
                    borderRadius: BorderRadius.lg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {editData.shopLogo ? (
                    <Image source={{ uri: editData.shopLogo }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <>
                      <Ionicons name="storefront-outline" size={32} color={Colors.neutral[400]} />
                      <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                        Shop Logo
                      </Typography>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => pickImage('shopBanner')}
                  style={{
                    flex: 1,
                    height: 100,
                    backgroundColor: Colors.neutral[100],
                    borderRadius: BorderRadius.lg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {editData.shopBanner ? (
                    <Image source={{ uri: editData.shopBanner }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <>
                      <Ionicons name="image-outline" size={32} color={Colors.neutral[400]} />
                      <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                        Banner
                      </Typography>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={{ gap: Spacing[4] }}>
                <View>
                  <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                    Owner Name *
                  </Typography>
                  <TextInput
                    value={editData.ownerName}
                    onChangeText={(text) => setEditData({ ...editData, ownerName: text })}
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border.main,
                      borderRadius: BorderRadius.md,
                      padding: Spacing[3],
                      fontSize: 15,
                    }}
                    placeholder="Enter owner name"
                  />
                </View>

                <View>
                  <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                    Shop Name *
                  </Typography>
                  <TextInput
                    value={editData.shopName}
                    onChangeText={(text) => setEditData({ ...editData, shopName: text })}
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border.main,
                      borderRadius: BorderRadius.md,
                      padding: Spacing[3],
                      fontSize: 15,
                    }}
                    placeholder="Enter shop name"
                  />
                </View>

                <View>
                  <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                    Contact Number
                  </Typography>
                  <TextInput
                    value={editData.contactNumber}
                    onChangeText={(text) => setEditData({ ...editData, contactNumber: text })}
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border.main,
                      borderRadius: BorderRadius.md,
                      padding: Spacing[3],
                      fontSize: 15,
                    }}
                    placeholder="Enter contact number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View>
                  <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                    Shop Address
                  </Typography>
                  <TextInput
                    value={editData.shopAddress}
                    onChangeText={(text) => setEditData({ ...editData, shopAddress: text })}
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border.main,
                      borderRadius: BorderRadius.md,
                      padding: Spacing[3],
                      fontSize: 15,
                      minHeight: 80,
                      textAlignVertical: 'top',
                    }}
                    placeholder="Enter shop address"
                    multiline
                    numberOfLines={3}
                  />
                </View>

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
                      placeholder="City"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" weight="medium" style={{ marginBottom: Spacing[1] }}>
                      Pincode
                    </Typography>
                    <TextInput
                      value={editData.shopPincode}
                      onChangeText={(text) => setEditData({ ...editData, shopPincode: text })}
                      style={{
                        borderWidth: 1,
                        borderColor: Colors.border.main,
                        borderRadius: BorderRadius.md,
                        padding: Spacing[3],
                        fontSize: 15,
                      }}
                      placeholder="Pincode"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={openMap}
                  style={{
                    backgroundColor: Colors.primary[50],
                    padding: Spacing[4],
                    borderRadius: BorderRadius.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="location" size={24} color={Colors.primary[600]} />
                  <Typography variant="body" weight="semibold" style={{ marginLeft: Spacing[2], color: Colors.primary[600] }}>
                    Update Location on Map
                  </Typography>
                </TouchableOpacity>
              </View>

              <View style={{ height: Spacing[20] }} />
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Save Button */}
          <View style={{ paddingTop: Spacing[4] }}>
            <Button title="Save Changes" onPress={handleSave} fullWidth />
          </View>
        </View>
      </View>

      {/* Map Modal */}
      <Modal visible={mapVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <OpenStreetMap
            initialRegion={mapRegion}
            markers={editData.shopLocation.latitude ? [{
              latitude: editData.shopLocation.latitude,
              longitude: editData.shopLocation.longitude,
              title: "Shop Location",
              description: "Selected location",
              shopId: "current",
              type: "shop"
            }] : []}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onLocationSelect={handleMapPress}
            style={{ flex: 1 }}
          />
          <View style={{
            position: 'absolute',
            bottom: Spacing[10],
            left: Spacing[5],
            right: Spacing[5],
            flexDirection: 'row',
            gap: Spacing[3],
          }}>
            <Button
              title="Cancel"
              onPress={() => setMapVisible(false)}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title="Confirm Location"
              onPress={confirmLocation}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
