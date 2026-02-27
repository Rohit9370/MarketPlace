import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../../Comoponents/Avatar';
import Typography from '../../Comoponents/Typography';
import { BorderRadius, Colors, Spacing } from '../../constants/designSystem';
import { updateUser } from '../../redux/authSlice';
import { getShopBookings } from '../../Services/booking_service';
import { db } from '../../Services/firebase';
import { getShopReviews } from '../../Services/review_service';




export default function HomeTab() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedOrders: 0,
    rating: 0,
    totalReviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen for real-time status changes
  useEffect(() => {
    if (!user?.uid || !user?.docId) {
      console.log('No user UID or docId available for listener');
      return;
    }

    console.log('Setting up real-time listener for shop:', user.docId);
    
    // Listen to the shop document using docId
    const unsubscribe = onSnapshot(
      doc(db, 'shop', user.docId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const shopData = docSnapshot.data();
          const newStatus = shopData.isActive;
          const oldStatus = user.isActive;
          
          console.log('Shop status in Firebase:', newStatus);
          console.log('Current status in Redux:', oldStatus);
          
          // Only update if status actually changed
          if (newStatus !== oldStatus) {
            console.log('Status changed from', oldStatus, 'to', newStatus);
            
            // Update Redux store with new status
            dispatch(updateUser({ isActive: newStatus }));
            
            // Show alert if deactivated while logged in
            if (oldStatus !== false && newStatus === false) {
              Alert.alert(
                'Account Deactivated',
                'Your account has been deactivated by admin. You can still manage your shop, but users cannot see it.',
                [{ text: 'OK' }]
              );
            }
            
            // Show alert if activated
            if (oldStatus === false && newStatus === true) {
              Alert.alert(
                'Account Activated',
                'Congratulations! Your account has been activated. Users can now see and book your services.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      },
      (error) => {
        console.error('Error listening to shop status:', error);
      }
    );

    return () => {
      console.log('Cleaning up real-time listener');
      unsubscribe();
    };
  }, [user?.uid, user?.docId, user?.isActive, dispatch]);

  useEffect(() => {
    if (user?.uid) {
      loadStats();
    }
  }, [user?.uid]);

  const loadStats = async () => {
    // Safety check
    if (!user?.uid) {
      console.log('No user UID available');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get all bookings for this shop
      const bookings = await getShopBookings(user.uid);
      const completed = bookings.filter(b => b.status === 'completed');
      
      // Calculate total revenue from completed bookings
      const totalRevenue = completed.reduce((sum, booking) => sum + (booking.price || 0), 0);
      
      // Get reviews for this shop
      const reviews = await getShopReviews(user.uid);
      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;
      
      // Get recent completed orders (last 3)
      const recent = completed
        .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt))
        .slice(0, 3)
        .map(booking => ({
          id: booking.id,
          customer: booking.userName,
          service: booking.service,
          amount: booking.price,
          date: getTimeAgo(booking.completedAt || booking.createdAt),
        }));
      
      setStats({
        totalRevenue,
        completedOrders: completed.length,
        rating: parseFloat(avgRating),
        totalReviews: reviews.length,
      });
      
      setRecentOrders(recent);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 172800) return 'Yesterday';
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Typography variant="v3" className="text-gray-500 mt-4">Loading dashboard...</Typography>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
        {/* Header with Profile */}
        <View style={{
          backgroundColor: Colors.background.primary,
          paddingHorizontal: Spacing[6],
          paddingVertical: Spacing[6],
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar
              source={user?.ownerPhoto}
              size="xl"
              style={{
                borderWidth: 2,
                borderColor: Colors.primary[500],
              }}
            />
            <View style={{ marginLeft: Spacing[4], flex: 1 }}>
              <Typography variant="h4">
                {user?.ownerName || 'Shopkeeper'}
              </Typography>
              <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                {user?.shopName || 'My Shop'}
              </Typography>
            </View>
            <TouchableOpacity style={{
              backgroundColor: Colors.primary[50],
              padding: Spacing[3],
              borderRadius: BorderRadius.full,
            }}>
              <Ionicons name="notifications-outline" size={24} color={Colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Approval Banner - Show when isActive is explicitly false */}
        {user?.isActive === false && (
          <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[4] }}>
            <View style={{
              backgroundColor: '#fef3c7',
              borderLeftWidth: 4,
              borderLeftColor: '#f59e0b',
              borderRadius: BorderRadius.lg,
              padding: Spacing[4],
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                backgroundColor: '#fbbf24',
                width: 40,
                height: 40,
                borderRadius: BorderRadius.full,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: Spacing[3],
              }}>
                <Ionicons name="time" size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="body" weight="semibold" style={{ color: '#92400e' }}>
                  Account Pending Approval
                </Typography>
                <Typography variant="caption" style={{ color: '#78350f', marginTop: Spacing[1] }}>
                  Your shop is under review. You can manage everything, but users won't see your shop until admin activates it.
                </Typography>
              </View>
            </View>
          </View>
        )}

        {/* Active Status Banner */}
        {user?.isActive === true && (
          <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[4] }}>
            <View style={{
              backgroundColor: '#d1fae5',
              borderLeftWidth: 4,
              borderLeftColor: '#10b981',
              borderRadius: BorderRadius.lg,
              padding: Spacing[4],
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                backgroundColor: '#10b981',
                width: 40,
                height: 40,
                borderRadius: BorderRadius.full,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: Spacing[3],
              }}>
                <Ionicons name="checkmark-circle" size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="body" weight="semibold" style={{ color: '#065f46' }}>
                  Account Active
                </Typography>
                <Typography variant="caption" style={{ color: '#047857', marginTop: Spacing[1] }}>
                  Your shop is live! Users can now see and book your services.
                </Typography>
              </View>
            </View>
          </View>
        )}

        {/* Banner - Only show if exists */}
        {user?.shopBanner && user.shopBanner.trim() !== '' && !user.shopBanner.includes('placeholder') && (
          <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[4] }}>
            <Image
              source={{ uri: user.shopBanner }}
              style={{
                width: '100%',
                height: 160,
                borderRadius: BorderRadius.xl,
              }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Stats Cards */}
        <View className="px-6 mt-6">
          <View className="flex-row justify-between">
            <View className="bg-blue-500 rounded-2xl p-6 w-[48%] items-center shadow-lg">
              <View className="bg-white/20 w-20 h-20 rounded-full items-center justify-center mb-3">
                <Ionicons name="wallet" size={32} color="white" />
              </View>
              <Typography variant="v1" className="text-white text-2xl font-bold">
                ₹{stats.totalRevenue}
              </Typography>
              <Typography variant="v4" className="text-white/80 mt-1">
                Total Revenue
              </Typography>
            </View>

            <View className="bg-green-500 rounded-2xl p-6 w-[48%] items-center shadow-lg">
              <View className="bg-white/20 w-20 h-20 rounded-full items-center justify-center mb-3">
                <Ionicons name="checkmark-done" size={32} color="white" />
              </View>
              <Typography variant="v1" className="text-white text-2xl font-bold">
                {stats.completedOrders}
              </Typography>
              <Typography variant="v4" className="text-white/80 mt-1">
                Orders Completed
              </Typography>
            </View>
          </View>

          <View className="bg-yellow-400 rounded-2xl p-6 mt-4 items-center shadow-lg">
            <View className="flex-row items-center">
              <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center mr-4">
                <Ionicons name="star" size={28} color="white" />
              </View>
              <View>
                <Typography variant="v1" className="text-white text-3xl font-bold">
                  {stats.rating}
                </Typography>
                <Typography variant="v4" className="text-white/80">
                  Average Rating
                </Typography>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View className="px-6 mt-8 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Typography variant="v2" className="text-gray-900 text-lg">
              Recent Completed Orders
            </Typography>
          </View>

          {loading ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Typography variant="v4" className="text-gray-500">Loading...</Typography>
            </View>
          ) : recentOrders.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
              <Typography variant="v3" className="text-gray-500 mt-3">No completed orders yet</Typography>
              <Typography variant="v4" className="text-gray-400 mt-1 text-center">
                Completed orders will appear here
              </Typography>
            </View>
          ) : (
            recentOrders.map((order) => (
              <View key={order.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Typography variant="v3" className="text-gray-900">{order.customer}</Typography>
                    <Typography variant="v4" className="text-gray-500 mt-1">{order.service}</Typography>
                    <Typography variant="v4" className="text-gray-400 text-xs mt-1">{order.date}</Typography>
                  </View>
                  <View className="items-end">
                    <Typography variant="v2" className="text-green-600 font-bold">₹{order.amount}</Typography>
                    <View className="bg-green-100 px-3 py-1 rounded-full mt-2">
                      <Typography variant="v4" className="text-green-700 text-xs">Completed</Typography>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}
