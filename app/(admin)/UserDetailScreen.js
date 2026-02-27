import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '../Comoponents/Typography';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/designSystem';
import { getUserBookings } from '../Services/booking_service';
import { getUserReviews } from '../Services/review_service';


export default function UserDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log(params)
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDetails();
  }, []);

  const loadUserDetails = async () => {
    try {
      // Parse user data from params
      const userData = JSON.parse(params.user);
      setUser(userData);
      console.log(userData)
      // Load bookings
      const userBookings = await getUserBookings(userData.uid);
      setBookings(userBookings);

      // Load reviews
      const userReviews = await getUserReviews(userData.uid);
      setReviews(userReviews);
    } catch (error) {
      console.error('Error loading user details:', error);
      Alert.alert('Error', 'Failed to load user details');
    } finally {
      setLoading(false);
    }
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
          Loading user details...
        </Typography>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.text.secondary} />
        <Typography variant="body" color="secondary" style={{ marginTop: Spacing[4] }}>
          User not found
        </Typography>
      </SafeAreaView>
    );
  }

  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.price || 0), 0);

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
          User Details
        </Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[4] }}>
          <View
            style={{
              backgroundColor: Colors.background.primary,
              borderRadius: BorderRadius.xl,
              padding: Spacing[5],
              ...Shadows.md,
              alignItems: 'center',
            }}
          >
            {/* Profile Photo */}
            {user.photo ? (
              <Image
                source={{ uri: user.photo }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: BorderRadius.full,
                  backgroundColor: Colors.background.tertiary,
                }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: BorderRadius.full,
                  backgroundColor: Colors.primary[100],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="person" size={50} color={Colors.primary[600]} />
              </View>
            )}

            <Typography variant="h3" style={{ marginTop: Spacing[3] }}>
              {user.name}
            </Typography>
            <Typography variant="body" color="secondary" style={{ marginTop: Spacing[1] }}>
              User Account
            </Typography>
          </View>

          {/* Statistics */}
          <View style={{ flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[4] }}>
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[4],
                alignItems: 'center',
                ...Shadows.sm,
              }}
            >
              <Typography variant="h3" style={{ color: Colors.primary[600] }}>
                {bookings.length}
              </Typography>
              <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                Total Bookings
              </Typography>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[4],
                alignItems: 'center',
                ...Shadows.sm,
              }}
            >
              <Typography variant="h3" style={{ color: Colors.success.main }}>
                {completedBookings}
              </Typography>
              <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                Completed
              </Typography>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[4],
                alignItems: 'center',
                ...Shadows.sm,
              }}
            >
              <Typography variant="h3" style={{ color: Colors.warning.main }}>
                {reviews.length}
              </Typography>
              <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                Reviews
              </Typography>
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
                  {user.email}
                </Typography>
              </View>

              {user.phone && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="call" size={20} color={Colors.text.secondary} />
                  <Typography variant="body" style={{ marginLeft: Spacing[3] }}>
                    {user.phone}
                  </Typography>
                </View>
              )}

              {user.address && (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Ionicons name="location" size={20} color={Colors.text.secondary} style={{ marginTop: 2 }} />
                  <Typography variant="body" style={{ marginLeft: Spacing[3], flex: 1 }}>
                    {user.address}
                  </Typography>
                </View>
              )}
            </View>
          </View>

          {/* Spending Summary */}
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
              Spending Summary
            </Typography>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body" color="secondary">
                Total Spent
              </Typography>
              <Typography variant="h3" style={{ color: Colors.success.main }}>
                ₹{totalSpent}
              </Typography>
            </View>
          </View>

          {/* Recent Bookings */}
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
              Recent Bookings ({bookings.length})
            </Typography>

            {bookings.length === 0 ? (
              <View style={{ paddingVertical: Spacing[4], alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={48} color={Colors.text.secondary} />
                <Typography variant="body" color="secondary" style={{ marginTop: Spacing[2] }}>
                  No bookings yet
                </Typography>
              </View>
            ) : (
              bookings.slice(0, 5).map((booking, index) => (
                <View
                  key={booking.id}
                  style={{
                    paddingVertical: Spacing[3],
                    borderTopWidth: index > 0 ? 1 : 0,
                    borderTopColor: Colors.border.light,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Typography variant="body" weight="semibold">
                        {booking.shopName}
                      </Typography>
                      <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                        {booking.service} • ₹{booking.price}
                      </Typography>
                    </View>
                    <View
                      style={{
                        backgroundColor: `${getStatusColor(booking.status)}20`,
                        paddingHorizontal: Spacing[2],
                        paddingVertical: Spacing[1],
                        borderRadius: BorderRadius.full,
                      }}
                    >
                      <Typography
                        variant="caption"
                        weight="semibold"
                        style={{
                          color: getStatusColor(booking.status),
                          fontSize: 11,
                        }}
                      >
                        {booking.status}
                      </Typography>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Recent Reviews */}
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
            <Typography variant="h4" style={{ marginBottom: Spacing[3] }}>
              Recent Reviews ({reviews.length})
            </Typography>

            {reviews.length === 0 ? (
              <View style={{ paddingVertical: Spacing[4], alignItems: 'center' }}>
                <Ionicons name="star-outline" size={48} color={Colors.text.secondary} />
                <Typography variant="body" color="secondary" style={{ marginTop: Spacing[2] }}>
                  No reviews yet
                </Typography>
              </View>
            ) : (
              reviews.slice(0, 5).map((review, index) => (
                <View
                  key={review.id}
                  style={{
                    paddingVertical: Spacing[3],
                    borderTopWidth: index > 0 ? 1 : 0,
                    borderTopColor: Colors.border.light,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Typography variant="body" weight="semibold">
                        {review.shopName}
                      </Typography>
                      <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                        {review.comment}
                      </Typography>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: Spacing[2] }}>
                      <Ionicons name="star" size={14} color="#fbbf24" />
                      <Typography variant="caption" style={{ marginLeft: Spacing[1] }}>
                        {review.rating}
                      </Typography>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
