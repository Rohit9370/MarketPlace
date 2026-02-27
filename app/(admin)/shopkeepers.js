import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '../Comoponents/Typography';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/designSystem';
import { getAllShopkeepers, toggleShopkeeperStatus } from '../Services/admin_service';

export default function ShopkeepersTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shopkeepers, setShopkeepers] = useState([]);
  const [filteredShopkeepers, setFilteredShopkeepers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadShopkeepers();
  }, []);

  useEffect(() => {
    filterShopkeepers();
  }, [searchQuery, shopkeepers]);

  const loadShopkeepers = async () => {
    try {
      setLoading(true);
      const data = await getAllShopkeepers();
      console.log('Loaded shopkeepers:', data.length, data);
      setShopkeepers(data);
      setFilteredShopkeepers(data);
    } catch (error) {
      console.error('Error loading shopkeepers:', error);
      Alert.alert('Error', 'Failed to load shopkeepers');
    } finally {
      setLoading(false);
    }
  };

  const filterShopkeepers = () => {
    if (!searchQuery.trim()) {
      setFilteredShopkeepers(shopkeepers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = shopkeepers.filter(
      (shop) =>
        shop.shopName?.toLowerCase().includes(query) ||
        shop.shopCategory?.toLowerCase().includes(query) ||
        shop.shopAddress?.toLowerCase().includes(query)
    );
    setFilteredShopkeepers(filtered);
  };

  const handleToggleStatus = async (shopId, currentStatus) => {
    try {
      const result = await toggleShopkeeperStatus(shopId, currentStatus);
      
      // Update local state
      setShopkeepers((prev) =>
        prev.map((shop) =>
          shop.id === shopId ? { ...shop, isActive: result.newStatus } : shop
        )
      );
      
      Alert.alert(
        'Success',
        `Shopkeeper ${result.newStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      console.error('Error toggling status:', error);
      Alert.alert('Error', 'Failed to update shopkeeper status');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShopkeepers();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Typography variant="body" color="secondary" style={{ marginTop: Spacing[4] }}>
          Loading shopkeepers...
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
          paddingTop: Spacing[6],
          paddingBottom: Spacing[8],
        }}
      >
        <Typography variant="h2" color="inverse">
          Shopkeepers
        </Typography>
        <Typography variant="body" color="inverse" style={{ marginTop: Spacing[2], opacity: 0.9 }}>
          Manage all shopkeepers
        </Typography>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.background.primary,
            borderRadius: BorderRadius.xl,
            paddingHorizontal: Spacing[4],
            marginTop: Spacing[4],
            ...Shadows.sm,
          }}
        >
          <Ionicons name="search" size={20} color={Colors.text.secondary} />
          <TextInput
            placeholder="Search by name, category, or address..."
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={{ flex: 1, marginTop: -Spacing[6] }}
      >
        <View style={{ paddingHorizontal: Spacing[6], paddingBottom: Spacing[8] }}>
          {/* Stats */}
          <View
            style={{
              backgroundColor: Colors.background.primary,
              borderRadius: BorderRadius.xl,
              padding: Spacing[4],
              marginBottom: Spacing[4],
              ...Shadows.sm,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Typography variant="h3" style={{ color: '#8b5cf6' }}>
                  {shopkeepers.length}
                </Typography>
                <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                  Total
                </Typography>
              </View>
              <View style={{ width: 1, backgroundColor: Colors.border.main }} />
              <View style={{ alignItems: 'center' }}>
                <Typography variant="h3" style={{ color: '#10b981' }}>
                  {shopkeepers.filter((s) => s.isActive !== false).length}
                </Typography>
                <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                  Active
                </Typography>
              </View>
              <View style={{ width: 1, backgroundColor: Colors.border.main }} />
              <View style={{ alignItems: 'center' }}>
                <Typography variant="h3" style={{ color: '#ef4444' }}>
                  {shopkeepers.filter((s) => s.isActive === false).length}
                </Typography>
                <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                  Inactive
                </Typography>
              </View>
            </View>
          </View>

          {/* Shopkeepers List */}
          {filteredShopkeepers.length === 0 ? (
            <View
              style={{
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[8],
                alignItems: 'center',
                ...Shadows.sm,
              }}
            >
              <Ionicons name="storefront-outline" size={48} color={Colors.text.secondary} />
              <Typography variant="body" color="secondary" style={{ marginTop: Spacing[2] }}>
                {searchQuery ? 'No shopkeepers found' : 'No shopkeepers yet'}
              </Typography>
            </View>
          ) : (
            filteredShopkeepers.map((shop) => (
              <TouchableOpacity
                key={shop.id}
                onPress={() => router.push({
                  pathname: '/(admin)/ShopkeeperDetailScreen',
                  params: { shop: JSON.stringify(shop) }
                })}
                style={{
                  backgroundColor: Colors.background.primary,
                  borderRadius: BorderRadius.xl,
                  padding: Spacing[4],
                  marginBottom: Spacing[3],
                  ...Shadows.sm,
                }}
              >
                <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
                  {/* Shop Image */}
                  <Image
                    source={
                      shop.shopImage
                        ? { uri: shop.shopImage }
                        : require('../Assets/images/shopimage.jpg')
                    }
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: BorderRadius.lg,
                      backgroundColor: Colors.background.tertiary,
                    }}
                  />

                  {/* Shop Details */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Typography variant="body" weight="semibold">
                          {shop.shopName || 'Unnamed Shop'}
                        </Typography>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing[1] }}>
                          <Ionicons name="pricetag" size={14} color={Colors.text.secondary} />
                          <Typography variant="caption" color="secondary" style={{ marginLeft: Spacing[1] }}>
                            {shop.shopCategory || 'No category'}
                          </Typography>
                        </View>
                      </View>

                      {/* Status Toggle */}
                      <Switch
                        value={shop.isActive !== false}
                        onValueChange={() => handleToggleStatus(shop.id, shop.isActive !== false)}
                        trackColor={{ false: '#d1d5db', true: '#86efac' }}
                        thumbColor={shop.isActive !== false ? '#10b981' : '#f3f4f6'}
                      />
                    </View>

                    {/* Address */}
                    {shop.shopAddress && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing[2] }}>
                        <Ionicons name="location" size={14} color={Colors.text.secondary} />
                        <Typography
                          variant="caption"
                          color="secondary"
                          style={{ marginLeft: Spacing[1], flex: 1 }}
                          numberOfLines={1}
                        >
                          {shop.shopAddress}
                        </Typography>
                      </View>
                    )}

                    {/* Contact */}
                    {shop.shopPhone && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing[1] }}>
                        <Ionicons name="call" size={14} color={Colors.text.secondary} />
                        <Typography variant="caption" color="secondary" style={{ marginLeft: Spacing[1] }}>
                          {shop.shopPhone}
                        </Typography>
                      </View>
                    )}

                    {/* Status Badge */}
                    <View
                      style={{
                        alignSelf: 'flex-start',
                        backgroundColor: shop.isActive !== false ? '#d1fae520' : '#fee2e220',
                        paddingHorizontal: Spacing[2],
                        paddingVertical: Spacing[1],
                        borderRadius: BorderRadius.full,
                        marginTop: Spacing[2],
                      }}
                    >
                      <Typography
                        variant="caption"
                        weight="semibold"
                        style={{
                          color: shop.isActive !== false ? '#10b981' : '#ef4444',
                          fontSize: 11,
                        }}
                      >
                        {shop.isActive !== false ? 'Active' : 'Inactive'}
                      </Typography>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
