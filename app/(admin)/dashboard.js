import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '../Comoponents/Typography';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/designSystem';
import { getAllBookings } from '../Services/admin_service';

export default function HomeTab() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalShopkeepers: 0,
    totalUsers: 0,
    activeShopkeepers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      
      // Calculate stats from data
      const bookings = data.bookings || [];
      const shopkeepers = data.shopkeepers || [];
      const users = data.users || [];
      
      setStats({
        totalShopkeepers: shopkeepers.length,
        totalUsers: users.length,
        activeShopkeepers: shopkeepers.filter(s => s.isActive !== false).length,
      });
      
      // Recent activity - recently added shopkeepers and users
      const recentShopkeepers = shopkeepers
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map(s => ({
          id: s.id,
          type: 'shopkeeper',
          name: s.shopName || s.ownerName,
          category: s.shopCategory,
          time: getTimeAgo(s.createdAt),
        }));
      
      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map(u => ({
          id: u.id,
          type: 'user',
          name: u.name,
          email: u.email,
          time: getTimeAgo(u.createdAt),
        }));
      
      // Combine and sort by time
      const combined = [...recentShopkeepers, ...recentUsers]
        .sort((a, b) => {
          // Sort by original createdAt if available
          const aShop = shopkeepers.find(s => s.id === a.id);
          const aUser = users.find(u => u.id === a.id);
          const bShop = shopkeepers.find(s => s.id === b.id);
          const bUser = users.find(u => u.id === b.id);
          
          const aDate = aShop?.createdAt || aUser?.createdAt;
          const bDate = bShop?.createdAt || bUser?.createdAt;
          
          return new Date(bDate) - new Date(aDate);
        })
        .slice(0, 5);
      
      setRecentActivity(combined);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return Colors.success.main;
      case 'pending': return Colors.warning.main;
      case 'cancelled': return Colors.error.main;
      case 'accepted': return Colors.primary[600];
      default: return Colors.text.secondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Typography variant="body" color="secondary" style={{ marginTop: Spacing[4] }}>
          Loading dashboard...
        </Typography>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: '#8b5cf6',
            paddingHorizontal: Spacing[6],
            paddingVertical: Spacing[8],
            borderBottomLeftRadius: BorderRadius['3xl'],
            borderBottomRightRadius: BorderRadius['3xl'],
          }}
        >
          <Typography variant="h2" color="inverse">
            Admin Dashboard
          </Typography>
          <Typography variant="body" color="inverse" style={{ marginTop: Spacing[2], opacity: 0.9 }}>
            Overview of your platform
          </Typography>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: Spacing[6], marginTop: -Spacing[8] }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[3] }}>
            {/* Total Shopkeepers */}
            <View
              style={{
                flex: 1,
                minWidth: '47%',
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[4],
                ...Shadows.md,
              }}
            >
              <View
                style={{
                  backgroundColor: '#8b5cf620',
                  width: 48,
                  height: 48,
                  borderRadius: BorderRadius.full,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: Spacing[3],
                }}
              >
                <Ionicons name="storefront" size={24} color="#8b5cf6" />
              </View>
              <Typography variant="h3" style={{ color: '#8b5cf6' }}>
                {stats.totalShopkeepers}
              </Typography>
              <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                Shopkeepers
              </Typography>
              <Typography variant="caption" style={{ marginTop: Spacing[1], fontSize: 11, color: '#10b981' }}>
                {stats.activeShopkeepers} active
              </Typography>
            </View>

            {/* Total Users */}
            <View
              style={{
                flex: 1,
                minWidth: '47%',
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[4],
                ...Shadows.md,
              }}
            >
              <View
                style={{
                  backgroundColor: '#f59e0b20',
                  width: 48,
                  height: 48,
                  borderRadius: BorderRadius.full,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: Spacing[3],
                }}
              >
                <Ionicons name="people" size={24} color="#f59e0b" />
              </View>
              <Typography variant="h3" style={{ color: '#f59e0b' }}>
                {stats.totalUsers}
              </Typography>
              <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                Total Users
              </Typography>
            </View>
          </View>
        </View>

        {/* Recently Registered */}
        <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[6] }}>
          <Typography variant="h4" style={{ marginBottom: Spacing[4] }}>
            Recently Registered
          </Typography>
          {recentActivity.length === 0 ? (
            <View
              style={{
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[6],
                alignItems: 'center',
                ...Shadows.sm,
              }}
            >
              <Ionicons name="people-outline" size={48} color={Colors.text.secondary} />
              <Typography variant="body" color="secondary" style={{ marginTop: Spacing[2] }}>
                No recent registrations
              </Typography>
            </View>
          ) : (
            recentActivity.map((activity) => (
              <View
                key={activity.id}
                style={{
                  backgroundColor: Colors.background.primary,
                  borderRadius: BorderRadius.xl,
                  padding: Spacing[4],
                  marginBottom: Spacing[3],
                  ...Shadows.sm,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      backgroundColor: activity.type === 'shopkeeper' ? '#8b5cf620' : '#3b82f620',
                      width: 48,
                      height: 48,
                      borderRadius: BorderRadius.full,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: Spacing[3],
                    }}
                  >
                    <Ionicons
                      name={activity.type === 'shopkeeper' ? 'storefront' : 'person'}
                      size={24}
                      color={activity.type === 'shopkeeper' ? '#8b5cf6' : '#3b82f6'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="body" weight="semibold">
                      {activity.name}
                    </Typography>
                    <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                      {activity.type === 'shopkeeper' 
                        ? `Shopkeeper • ${activity.category || 'No category'}`
                        : `User • ${activity.email}`
                      }
                    </Typography>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Typography variant="caption" color="secondary" style={{ fontSize: 11 }}>
                      {activity.time}
                    </Typography>
                    <View style={{ 
                      backgroundColor: activity.type === 'shopkeeper' ? '#8b5cf610' : '#3b82f610',
                      paddingHorizontal: Spacing[2],
                      paddingVertical: Spacing[1],
                      borderRadius: BorderRadius.md,
                      marginTop: Spacing[1]
                    }}>
                      <Typography variant="caption" style={{ 
                        fontSize: 10,
                        color: activity.type === 'shopkeeper' ? '#8b5cf6' : '#3b82f6'
                      }}>
                        {activity.type === 'shopkeeper' ? 'SHOP' : 'USER'}
                      </Typography>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Removed: Recent Activity section (now merged above) */}
      </ScrollView>
    </SafeAreaView>
  );
}
