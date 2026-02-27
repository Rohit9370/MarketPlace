import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '../Comoponents/Typography';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/designSystem';
import { toggleShopkeeperStatus } from '../Services/admin_service';
import { getShopServices } from '../Services/service_service';


export default function ShopkeeperDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShopDetails();
  }, []);

  const loadShopDetails = async () => {
    try {
      // Parse shop data from params
      const shopData = JSON.parse(params.shop);
      setShop(shopData);

      // Load services
      const shopServices = await getShopServices(shopData.uid);
      setServices(shopServices);
    } catch (error) {
      console.error('Error loading shop details:', error);
      Alert.alert('Error', 'Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const result = await toggleShopkeeperStatus(shop.id, shop.isActive !== false);
      
      // Update local state
      setShop({ ...shop, isActive: result.newStatus });
      
      Alert.alert(
        'Success',
        `Shop ${result.newStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      console.error('Error toggling status:', error);
      Alert.alert('Error', 'Failed to update shop status');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Typography variant="body" color="secondary" style={{ marginTop: Spacing[4] }}>
          Loading shop details...
        </Typography>
      </SafeAreaView>
    );
  }

  if (!shop) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.text.secondary} />
        <Typography variant="body" color="secondary" style={{ marginTop: Spacing[4] }}>
          Shop not found
        </Typography>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#8b5cf6',
          paddingHorizontal: Spacing[6],
          paddingVertical: Spacing[4],
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: Spacing[4] }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Typography variant="h3" color="inverse">
          Shop Details
        </Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Shop Banner */}
        {shop.shopBanner && (
          <Image
            source={{ uri: shop.shopBanner }}
            style={{
              width: '100%',
              height: 200,
            }}
            resizeMode="cover"
          />
        )}

        {/* Shop Info Card */}
        <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[4] }}>
          <View
            style={{
              backgroundColor: Colors.background.primary,
              borderRadius: BorderRadius.xl,
              padding: Spacing[5],
              ...Shadows.md,
            }}
          >
            {/* Shop Logo & Name */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[4] }}>
              {shop.shopLogo ? (
                <Image
                  source={{ uri: shop.shopLogo }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: BorderRadius.full,
                    backgroundColor: Colors.background.tertiary,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: BorderRadius.full,
                    backgroundColor: Colors.primary[100],
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="storefront" size={40} color={Colors.primary[600]} />
                </View>
              )}
              <View style={{ marginLeft: Spacing[4], flex: 1 }}>
                <Typography variant="h3">{shop.shopName}</Typography>
                <Typography variant="body" color="secondary" style={{ marginTop: Spacing[1] }}>
                  {shop.ownerName}
                </Typography>
                <View
                  style={{
                    backgroundColor: Colors.primary[50],
                    paddingHorizontal: Spacing[2],
                    paddingVertical: Spacing[1],
                    borderRadius: BorderRadius.full,
                    alignSelf: 'flex-start',
                    marginTop: Spacing[2],
                  }}
                >
                  <Typography variant="caption" style={{ color: Colors.primary[700] }}>
                    {shop.shopCategory}
                  </Typography>
                </View>
              </View>
            </View>

            {/* Status Toggle */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: Spacing[3],
                borderTopWidth: 1,
                borderTopColor: Colors.border.light,
                marginTop: Spacing[3],
              }}
            >
              <View>
                <Typography variant="body" weight="semibold">
                  Shop Status
                </Typography>
                <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                  {shop.isActive !== false ? 'Visible to users' : 'Hidden from users'}
                </Typography>
              </View>
              <Switch
                value={shop.isActive !== false}
                onValueChange={handleToggleStatus}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={shop.isActive !== false ? '#10b981' : '#f3f4f6'}
              />
            </View>
          </View>

          {/* Contact Information */}
          <View
            style={{
              backgroundColor: Colors.background.primary,
              borderRadius: BorderRadius.xl,
              padding: Spacing[5],
              marginTop: Spacing[4],
              ...Shadows.sm,
            }}
          >
            <Typography variant="h4" style={{ marginBottom: Spacing[3] }}>
              Contact Information
            </Typography>

            <View style={{ gap: Spacing[3] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail" size={20} color={Colors.text.secondary} />
                <Typography variant="body" style={{ marginLeft: Spacing[3] }}>
                  {shop.email}
                </Typography>
              </View>

              {shop.contactNumber && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="call" size={20} color={Colors.text.secondary} />
                  <Typography variant="body" style={{ marginLeft: Spacing[3] }}>
                    {shop.contactNumber}
                  </Typography>
                </View>
              )}

              {shop.phone && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="phone-portrait" size={20} color={Colors.text.secondary} />
                  <Typography variant="body" style={{ marginLeft: Spacing[3] }}>
                    {shop.phone}
                  </Typography>
                </View>
              )}
            </View>
          </View>

          {/* Location */}
          <View
            style={{
              backgroundColor: Colors.background.primary,
              borderRadius: BorderRadius.xl,
              padding: Spacing[5],
              marginTop: Spacing[4],
              ...Shadows.sm,
            }}
          >
            <Typography variant="h4" style={{ marginBottom: Spacing[3] }}>
              Location
            </Typography>

            <View style={{ gap: Spacing[2] }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name="location" size={20} color={Colors.text.secondary} style={{ marginTop: 2 }} />
                <Typography variant="body" style={{ marginLeft: Spacing[3], flex: 1 }}>
                  {shop.shopAddress}
                </Typography>
              </View>

              <View style={{ flexDirection: 'row', gap: Spacing[4], marginTop: Spacing[2] }}>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" color="secondary">
                    City
                  </Typography>
                  <Typography variant="body" style={{ marginTop: Spacing[1] }}>
                    {shop.shopCity}
                  </Typography>
                </View>
                {shop.shopPincode && (
                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" color="secondary">
                      Pincode
                    </Typography>
                    <Typography variant="body" style={{ marginTop: Spacing[1] }}>
                      {shop.shopPincode}
                    </Typography>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Services */}
          <View
            style={{
              backgroundColor: Colors.background.primary,
              borderRadius: BorderRadius.xl,
              padding: Spacing[5],
              marginTop: Spacing[4],
              marginBottom: Spacing[6],
              ...Shadows.sm,
            }}
          >
            <Typography variant="h4" style={{ marginBottom: Spacing[4] }}>
              Services ({services.length})
            </Typography>

            {services.length === 0 ? (
              <View style={{ paddingVertical: Spacing[4], alignItems: 'center' }}>
                <Ionicons name="list-outline" size={48} color={Colors.text.secondary} />
                <Typography variant="body" color="secondary" style={{ marginTop: Spacing[2] }}>
                  No services added yet
                </Typography>
              </View>
            ) : (
              <View style={{ gap: Spacing[3] }}>
                {services.map((service) => (
                  <View
                    key={service.id}
                    style={{
                      backgroundColor: Colors.background.secondary,
                      borderRadius: BorderRadius.lg,
                      padding: Spacing[3],
                      flexDirection: 'row',
                      gap: Spacing[3],
                    }}
                  >
                    {/* Service Image */}
                    {service.serviceImage ? (
                      <Image
                        source={{ uri: service.serviceImage }}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: BorderRadius.md,
                          backgroundColor: Colors.background.tertiary,
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: BorderRadius.md,
                          backgroundColor: Colors.primary[100],
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Ionicons name="cut" size={32} color={Colors.primary[600]} />
                      </View>
                    )}

                    {/* Service Details */}
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                      <View>
                        <Typography variant="body" weight="semibold">
                          {service.serviceName || 'Unnamed Service'}
                        </Typography>
                        {service.description && (
                          <Typography 
                            variant="caption" 
                            color="secondary" 
                            style={{ marginTop: Spacing[1] }}
                            numberOfLines={2}
                          >
                            {service.description}
                          </Typography>
                        )}
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing[2] }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
                          <Typography variant="body" weight="semibold" style={{ color: Colors.primary[600] }}>
                            ₹{service.price || 0}
                          </Typography>
                          {service.duration && (
                            <>
                              <Typography variant="caption" color="secondary">•</Typography>
                              <Typography variant="caption" color="secondary">
                                {service.duration}
                              </Typography>
                            </>
                          )}
                        </View>

                        {/* Status Badge */}
                        <View
                          style={{
                            backgroundColor: service.isActive ? '#d1fae520' : '#fee2e220',
                            paddingHorizontal: Spacing[2],
                            paddingVertical: Spacing[1],
                            borderRadius: BorderRadius.full,
                          }}
                        >
                          <Typography
                            variant="caption"
                            weight="semibold"
                            style={{
                              color: service.isActive ? '#10b981' : '#ef4444',
                              fontSize: 11,
                            }}
                          >
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
