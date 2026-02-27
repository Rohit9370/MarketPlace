import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// Replaced react-native-maps with OpenStreetMap
// import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Avatar from '../Comoponents/Avatar';
import Typography from '../Comoponents/Typography';
import OpenStreetMap from '../Components/OpenStreetMap';
import { categories } from '../constants/categories';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/designSystem';
import { getAggregatedReviews } from '../Services/review_service';
import { getAllShopkeepers } from '../Services/user_services';

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance; 
};

export default function HomeTab() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [shopkeepers, setShopkeepers] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRange, setSelectedRange] = useState(10); // Default 10km range

  useEffect(() => {
    getUserLocation();
    loadShopkeepers();
  }, []);

  useEffect(() => {
    filterShops();
  }, [searchQuery, selectedCategory, shopkeepers, selectedRange, userLocation]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show nearby shops');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadShopkeepers = async () => {
    try {
      const shops = await getAllShopkeepers();
      // Filter only active shopkeepers (isActive can be true, undefined, or null for active shops)
      const activeShops = shops.filter(shop => shop.isActive !== false && shop.isActive !== 0);
      
      // Get aggregated reviews for all shops
      const shopIds = activeShops.map(shop => shop.id);
      const reviewsData = await getAggregatedReviews(shopIds);
      
      // Add review data to each shop
      const shopsWithReviews = activeShops.map(shop => {
        const reviewInfo = reviewsData[shop.id] || { avgRating: 0, totalReviews: 0 };
        return {
          ...shop,
          rating: reviewInfo.avgRating,
          totalReviews: reviewInfo.totalReviews
        };
      });
      
      setShopkeepers(shopsWithReviews);
      setFilteredShops(shopsWithReviews);
      
    } catch (error) {
      console.error('Error loading shopkeepers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterShops = () => {
    let filtered = shopkeepers;

    // Filter by distance if user location is available
    if (userLocation && selectedRange) {
      filtered = filtered.map(shop => {
        if (shop.shopLocation?.latitude && shop.shopLocation?.longitude) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            shop.shopLocation.latitude,
            shop.shopLocation.longitude
          );
          return { ...shop, distance: distance.toFixed(1) };
        }
        return { ...shop, distance: null };
      }).filter(shop => {
        // Only show shops within selected range
        return shop.distance === null || parseFloat(shop.distance) <= selectedRange;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(shop =>
        shop.shopName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.shopCategory?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(shop => shop.shopCategory === selectedCategory);
    }
    
    setFilteredShops(filtered);
  };

  const renderShopCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: '/ShopDetailsScreen',
        params: { shopId: item.id }
      })}
      style={{
        backgroundColor: Colors.background.primary,
        borderRadius: BorderRadius.xl,
        marginHorizontal: Spacing[6],
        marginBottom: Spacing[4],
        ...Shadows.md,
      }}
    >
      {/* Shop Banner */}
      {item.shopBanner && item.shopBanner.trim() !== '' && !item.shopBanner.includes('placeholder') ? (
        <Image
          source={{ uri: item.shopBanner }}
          style={{
            width: '100%',
            height: 160,
            borderTopLeftRadius: BorderRadius.xl,
            borderTopRightRadius: BorderRadius.xl,
          }}
          resizeMode="cover"
          onError={(error) => {
            console.log('Image load error for shop:', item.shopName, error.nativeEvent.error);
          }}
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: 160,
            backgroundColor: Colors.primary[100],
            borderTopLeftRadius: BorderRadius.xl,
            borderTopRightRadius: BorderRadius.xl,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="storefront" size={48} color={Colors.primary[400]} />
        </View>
      )}

      {/* Shop Info */}
      <View style={{ padding: Spacing[4] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[2] }}>
          <Avatar source={item.ownerPhoto} size="md" />
          <View style={{ marginLeft: Spacing[3], flex: 1 }}>
            <Typography variant="body" weight="semibold">
              {item.shopName}
            </Typography>
            <Typography variant="caption" color="secondary">
              {item.ownerName}
            </Typography>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Typography variant="caption" style={{ marginLeft: Spacing[1] }}>
                {item.rating ? item.rating.toFixed(1) : '0.0'}
              </Typography>
            </View>
            <Typography variant="caption" color="secondary">
              {item.totalReviews || '0'} reviews
            </Typography>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing[2] }}>
          <Ionicons name="location-outline" size={16} color={Colors.text.secondary} />
          <Typography variant="caption" color="secondary" style={{ marginLeft: Spacing[1], flex: 1 }}>
            {item.shopCity} • {item.shopPincode}
          </Typography>
          {item.distance && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="navigate" size={14} color={Colors.primary[600]} />
              <Typography variant="caption" weight="semibold" style={{ marginLeft: Spacing[1], color: Colors.primary[600] }}>
                {item.distance} km
              </Typography>
            </View>
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: Spacing[3],
            paddingTop: Spacing[3],
            borderTopWidth: 1,
            borderTopColor: Colors.border.light,
          }}
        >
          <View
            style={{
              backgroundColor: Colors.primary[50],
              paddingHorizontal: Spacing[3],
              paddingVertical: Spacing[1],
              borderRadius: BorderRadius.full,
            }}
          >
            <Typography variant="caption" style={{ color: Colors.primary[700] }}>
              {item.shopCategory}
            </Typography>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryChip = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(selectedCategory === item.name ? null : item.name)}
      style={{
        backgroundColor: selectedCategory === item.name ? Colors.primary[600] : Colors.background.primary,
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[2],
        borderRadius: BorderRadius.full,
        marginRight: Spacing[2],
        borderWidth: 1,
        borderColor: selectedCategory === item.name ? Colors.primary[600] : Colors.border.main,
        ...Shadows.sm,
      }}
    >
      <Typography
        variant="caption"
        weight="medium"
        style={{
          color: selectedCategory === item.name ? Colors.neutral[0] : Colors.text.primary,
        }}
      >
        {item.name}
      </Typography>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: Colors.primary[600],
          paddingHorizontal: Spacing[6],
          paddingVertical: Spacing[4],
          borderBottomLeftRadius: BorderRadius['2xl'],
          borderBottomRightRadius: BorderRadius['2xl'],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar source={user?.profilePhoto} size="md" />
            <View style={{ marginLeft: Spacing[3] }}>
              <Typography variant="caption" color="inverse" style={{ opacity: 0.8 }}>
                Welcome back,
              </Typography>
              <Typography variant="body" weight="semibold" color="inverse">
                {user?.name}
              </Typography>
            </View>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: Spacing[2],
              borderRadius: BorderRadius.full,
            }}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.neutral[0]} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.neutral[0],
            borderRadius: BorderRadius.xl,
            paddingHorizontal: Spacing[4],
            marginTop: Spacing[4],
            ...Shadows.sm,
          }}
        >
          <Ionicons name="search" size={20} color={Colors.text.secondary} />
          <TextInput
            placeholder="Search services or shops..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              paddingVertical: Spacing[3],
              paddingHorizontal: Spacing[3],
              fontSize: 15,
              color: Colors.text.primary,
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* View Toggle */}
        {/* View Mode Toggle */}
        <View style={{ flexDirection: 'row', marginTop: Spacing[3], gap: Spacing[2] }}>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={{
              flex: 1,
              backgroundColor: viewMode === 'list' ? Colors.neutral[0] : 'rgba(255,255,255,0.2)',
              paddingVertical: Spacing[2],
              borderRadius: BorderRadius.lg,
              alignItems: 'center',
            }}
          >
            <Typography
              variant="caption"
              weight="semibold"
              style={{ color: viewMode === 'list' ? Colors.primary[600] : Colors.neutral[0] }}
            >
              List View
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('map')}
            style={{
              flex: 1,
              backgroundColor: viewMode === 'map' ? Colors.neutral[0] : 'rgba(255,255,255,0.2)',
              paddingVertical: Spacing[2],
              borderRadius: BorderRadius.lg,
              alignItems: 'center',
            }}
          >
            <Typography
              variant="caption"
              weight="semibold"
              style={{ color: viewMode === 'map' ? Colors.primary[600] : Colors.neutral[0] }}
            >
              Map View
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Distance Range Selector */}
        <View style={{ marginTop: Spacing[3] }}>
          <Typography variant="caption" style={{ color: Colors.neutral[0], marginBottom: Spacing[2] }}>
            Show shops within:
          </Typography>
          <View style={{ flexDirection: 'row', gap: Spacing[2] }}>
            {[5, 10, 20, 50].map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => setSelectedRange(range)}
                style={{
                  flex: 1,
                  backgroundColor: selectedRange === range ? Colors.neutral[0] : 'rgba(255,255,255,0.2)',
                  paddingVertical: Spacing[2],
                  borderRadius: BorderRadius.lg,
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  weight="semibold"
                  style={{ color: selectedRange === range ? Colors.primary[600] : Colors.neutral[0] }}
                >
                  {range}km
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={{ marginTop: Spacing[4] }}>
        <Typography variant="body" weight="semibold" style={{ paddingHorizontal: Spacing[6], marginBottom: Spacing[2] }}>
          Categories
        </Typography>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing[6] }}
        />
      </View>

      {/* Content */}
      {viewMode === 'list' ? (
        <View style={{ flex: 1, marginTop: Spacing[4] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing[6], marginBottom: Spacing[3] }}>
            <Typography variant="body" weight="semibold">
              Available Services
            </Typography>
            <Typography variant="caption" color="secondary">
              {filteredShops.length} shops found
            </Typography>
          </View>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body" color="secondary">Loading...</Typography>
            </View>
          ) : filteredShops.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing[6] }}>
              <Ionicons name="search-outline" size={64} color={Colors.text.secondary} />
              <Typography variant="body" weight="semibold" style={{ marginTop: Spacing[4] }}>
                No shops found
              </Typography>
              <Typography variant="caption" color="secondary" style={{ textAlign: 'center', marginTop: Spacing[2] }}>
                Try adjusting your search or filters
              </Typography>
            </View>
          ) : (
            <FlatList
              data={filteredShops}
              renderItem={renderShopCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: Spacing[6] }}
            />
          )}
        </View>
      ) : (
        <View style={{ flex: 1, marginTop: Spacing[4] }}>
          {/* Show message if no shops have location data */}
          {filteredShops.filter(s => s.shopLocation?.latitude && s.shopLocation?.longitude).length === 0 ? (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                marginHorizontal: Spacing[6],
                justifyContent: 'center',
                alignItems: 'center',
                padding: Spacing[6],
                ...Shadows.sm,
              }}
            >
              <Ionicons name="location-outline" size={64} color={Colors.text.secondary} />
              <Typography variant="body" weight="semibold" style={{ marginTop: Spacing[4] }}>
                No shops with location data
              </Typography>
              <Typography variant="caption" color="secondary" style={{ textAlign: 'center', marginTop: Spacing[2] }}>
                Shops need to add their location to appear on the map
              </Typography>
            </View>
          ) : (
            <OpenStreetMap
              initialRegion={{
                latitude: userLocation?.latitude || 20.9320,
                longitude: userLocation?.longitude || 77.7523,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
              markers={[
                // User's current location marker
                ...(userLocation?.latitude && userLocation?.longitude ? [{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  title: "Your Location",
                  description: "Current location",
                  shopId: "user",
                  type: 'user'
                }] : []),
                // Shop markers
                ...filteredShops
                  .filter(shop => shop.shopLocation?.latitude && shop.shopLocation?.longitude)
                  .map(shop => ({
                    latitude: shop.shopLocation.latitude,
                    longitude: shop.shopLocation.longitude,
                    title: shop.shopName,
                    description: `${shop.shopCategory} • ${shop.shopCity}`,
                    shopId: shop.id,
                    type: 'shop'
                  }))
              ]}
              showsUserLocation={true}
              showsMyLocationButton={false}
              onLocationSelect={(coordinate, shopId, markerType) => {
                // Only navigate if it's a shop marker, not the user's location
                if (shopId && shopId !== 'user-location' && shopId !== 'user' && markerType === 'shop') {
                  router.push({
                    pathname: '/ShopDetailsScreen',
                    params: { shopId: shopId }
                  });
                }
              }}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
