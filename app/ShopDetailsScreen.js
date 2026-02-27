import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Modal,
    Platform,
    ScrollView,
    Share,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Avatar from './Comoponents/Avatar';
import Typography from './Comoponents/Typography';
import { BorderRadius, Colors, Shadows, Spacing } from './constants/designSystem';
import { addReview, getShopReviews } from './Services/review_service';
import { getShopServices } from './Services/service_service';
import { getAllShopkeepers } from './Services/user_services';

const { width } = Dimensions.get('window');

export default function ShopDetailsScreen() {
  const router = useRouter();
  const { shopId } = useLocalSearchParams();
  const { user } = useSelector((state) => state.auth);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef(null);
  
  // Review modal states
  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadShopDetails();
  }, [shopId]);

  const loadShopDetails = async () => {
    try {
      const shops = await getAllShopkeepers();
      const foundShop = shops.find(s => s.id === shopId);
      setShop(foundShop);
      
      if (foundShop) {
        // Load reviews for this shop
        const shopReviews = await getShopReviews(foundShop.uid);
        setReviews(shopReviews);
        
        // Load services for this shop
        setServicesLoading(true);
        const shopServices = await getShopServices(foundShop.id);
        // Filter only active services
        const activeServices = shopServices.filter(s => s.isActive);
        setServices(activeServices);
        setServicesLoading(false);
      }
    } catch (error) {
      console.error('Error loading shop:', error);
      Alert.alert('Error', 'Failed to load shop details');
      setServicesLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    if (!shop?.shopLocation?.latitude || !shop?.shopLocation?.longitude) {
      Alert.alert('Location Not Available', 'The shop location is not available');
      return;
    }

    const lat = shop.shopLocation.latitude;
    const lng = shop.shopLocation.longitude;
    const label = encodeURIComponent(shop.shopName);
    
    // Try to open in Google Maps first, fallback to Apple Maps on iOS or general maps
    const googleMapsUrl = `comgooglemaps://?q=${lat},${lng}&center=${lat},${lng}&zoom=16&views=traffic`;
    const appleMapsUrl = `maps://${lat},${lng}?q=${label}`;
    const webMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    
    // Platform-specific handling
    if (Platform.OS === 'ios') {
      Linking.canOpenURL(googleMapsUrl)
        .then(supported => {
          if (supported) {
            Linking.openURL(googleMapsUrl);
          } else {
            Linking.openURL(appleMapsUrl);
          }
        });
    } else {
      Linking.canOpenURL(googleMapsUrl)
        .then(supported => {
          if (supported) {
            Linking.openURL(googleMapsUrl);
          } else {
            Linking.openURL(webMapsUrl);
          }
        });
    }
  };
  
  const handleCall = () => {
    if (!shop?.contactNumber && !shop?.phone) {
      Alert.alert('No Contact', 'Contact number not available');
      return;
    }

    const phoneNumber = shop.contactNumber || shop.phone;
    Alert.alert(
      'Call Shop',
      `Do you want to call ${shop.shopName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`);
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const message = `Check out ${shop.shopName} on our app!\n\nCategory: ${shop.shopCategory}\nRating: ${shop.rating || '4.5'} ⭐\nLocation: ${shop.shopCity}, ${shop.shopPincode}\n\nServices available - Contact them now!`;
      
      await Share.share({
        message: message,
        title: `${shop.shopName} - Service Provider`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to submit a review');
      return;
    }

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating');
      return;
    }

    if (!reviewComment.trim()) {
      Alert.alert('Comment Required', 'Please write your review');
      return;
    }

    try {
      setSubmittingReview(true);

      const reviewData = {
        userId: user.uid,
        userName: user.name,
        userPhoto: user.profilePhoto || null,
        shopId: shop.uid || shop.id,
        shopName: shop.shopName,
        rating: rating,
        comment: reviewComment.trim(),
      };

      await addReview(reviewData);

      // Reload reviews
      const shopReviews = await getShopReviews(shop.uid || shop.id);
      setReviews(shopReviews);

      setReviewModal(false);
      setRating(0);
      setReviewComment('');
      Alert.alert('Success', 'Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
        <Typography variant="body" color="secondary" style={{ marginTop: Spacing[4] }}>
          Loading shop details...
        </Typography>
      </SafeAreaView>
    );
  }

  if (!shop) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error.main} />
        <Typography variant="body" weight="semibold" style={{ marginTop: Spacing[4] }}>
          Shop not found
        </Typography>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing[4] }}>
          <Typography variant="caption" style={{ color: Colors.primary[600] }}>
            Go Back
          </Typography>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : shop.rating || '4.5';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing[6],
          paddingVertical: Spacing[4],
          backgroundColor: Colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.light,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Typography variant="body" weight="semibold" style={{ marginLeft: Spacing[4] }}>
            Shop Details
          </Typography>
        </View>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-social-outline" size={24} color={Colors.primary[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Shop Banner/Images Slider */}
        <View style={{ position: 'relative' }}>
          {(() => {
            const images = [];
            if (shop.shopBanner) images.push(shop.shopBanner);
            if (shop.shopLogo) images.push(shop.shopLogo);
            
            return images.length > 0 ? (
              <View>
                <FlatList
                  ref={flatListRef}
                  data={images}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentImageIndex(index);
                  }}
                  renderItem={({ item }) => (
                    <Image
                      source={{ uri: item }}
                      style={{ width: width, height: 250 }}
                      resizeMode="cover"
                    />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
                
                {/* Image Pagination Dots */}
                {images.length > 1 && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: Spacing[4],
                      left: 0,
                      right: 0,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: Spacing[2],
                    }}
                  >
                    {images.map((_, index) => (
                      <View
                        key={index}
                        style={{
                          width: currentImageIndex === index ? 24 : 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: currentImageIndex === index 
                            ? Colors.primary[600] 
                            : 'rgba(255,255,255,0.5)',
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View
                style={{
                  width: '100%',
                  height: 250,
                  backgroundColor: Colors.primary[100],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="storefront" size={80} color={Colors.primary[400]} />
              </View>
            );
          })()}

          {/* Circular Profile Photo Overlay */}
          <View
            style={{
              position: 'absolute',
              bottom: -40,
              left: Spacing[6],
              borderWidth: 4,
              borderColor: Colors.background.secondary,
              borderRadius: 50,
              ...Shadows.lg,
            }}
          >
            <Avatar source={shop.ownerPhoto} size="2xl" />
          </View>
        </View>

        {/* Shop Info Card */}
        <View
          style={{
            marginHorizontal: Spacing[6],
            marginTop: Spacing[12],
            backgroundColor: Colors.background.primary,
            borderRadius: BorderRadius.xl,
            padding: Spacing[4],
            ...Shadows.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Typography variant="h3">{shop.shopName}</Typography>
              <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                by {shop.ownerName}
              </Typography>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: Spacing[2],
                }}
              >
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Typography variant="body" weight="semibold" style={{ marginLeft: Spacing[1] }}>
                  {avgRating}
                </Typography>
                <Typography variant="caption" color="secondary" style={{ marginLeft: Spacing[1] }}>
                  ({reviews.length} reviews)
                </Typography>
              </View>
            </View>
            <View
              style={{
                backgroundColor: Colors.primary[50],
                paddingHorizontal: Spacing[3],
                paddingVertical: Spacing[2],
                borderRadius: BorderRadius.lg,
              }}
            >
              <Typography variant="caption" weight="semibold" style={{ color: Colors.primary[700] }}>
                {shop.shopCategory}
              </Typography>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: Spacing[6],
            marginTop: Spacing[4],
            gap: Spacing[3],
          }}
        >
          <TouchableOpacity
            onPress={handleCall}
            style={{
              flex: 1,
              backgroundColor: Colors.success.main,
              paddingVertical: Spacing[4],
              borderRadius: BorderRadius.xl,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              ...Shadows.md,
            }}
          >
            <Ionicons name="call" size={20} color={Colors.neutral[0]} />
            <Typography variant="body" weight="semibold" color="inverse" style={{ marginLeft: Spacing[2] }}>
              Call Now
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNavigate}
            style={{
              flex: 1,
              backgroundColor: Colors.warning.main,
              paddingVertical: Spacing[4],
              borderRadius: BorderRadius.xl,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              ...Shadows.md,
            }}
          >
            <Ionicons name="navigate" size={20} color={Colors.neutral[0]} />
            <Typography variant="body" weight="semibold" color="inverse" style={{ marginLeft: Spacing[2] }}>
              Navigate
            </Typography>
          </TouchableOpacity>
        </View>
        
        <View style={{ flexDirection: 'row', marginHorizontal: Spacing[6], marginTop: Spacing[3], gap: Spacing[3] }}>
          <TouchableOpacity
            onPress={handleShare}
            style={{
              flex: 1,
              backgroundColor: Colors.primary[600],
              paddingVertical: Spacing[4],
              borderRadius: BorderRadius.xl,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              ...Shadows.md,
            }}
          >
            <Ionicons name="share-social" size={20} color={Colors.neutral[0]} />
            <Typography variant="body" weight="semibold" color="inverse" style={{ marginLeft: Spacing[2] }}>
              Share
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View
          style={{
            marginHorizontal: Spacing[6],
            marginTop: Spacing[4],
            backgroundColor: Colors.background.primary,
            borderRadius: BorderRadius.xl,
            padding: Spacing[4],
            ...Shadows.sm,
          }}
        >
          <Typography variant="body" weight="semibold" style={{ marginBottom: Spacing[3] }}>
            Contact Information
          </Typography>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[3] }}>
            <View
              style={{
                backgroundColor: Colors.primary[50],
                padding: Spacing[2],
                borderRadius: BorderRadius.lg,
              }}
            >
              <Ionicons name="call" size={20} color={Colors.primary[600]} />
            </View>
            <View style={{ marginLeft: Spacing[3], flex: 1 }}>
              <Typography variant="caption" color="secondary">
                Phone
              </Typography>
              <Typography variant="caption" weight="medium">
                {shop.contactNumber || shop.phone || 'Not available'}
              </Typography>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: Colors.primary[50],
                padding: Spacing[2],
                borderRadius: BorderRadius.lg,
              }}
            >
              <Ionicons name="location" size={20} color={Colors.primary[600]} />
            </View>
            <View style={{ marginLeft: Spacing[3], flex: 1 }}>
              <Typography variant="caption" color="secondary">
                Address
              </Typography>
              <Typography variant="caption" weight="medium">
                {shop.shopAddress}
              </Typography>
              <Typography variant="caption" color="secondary">
                {shop.shopCity}, {shop.shopState} - {shop.shopPincode}
              </Typography>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={{ marginHorizontal: Spacing[6], marginTop: Spacing[4] }}>
          <Typography variant="body" weight="semibold" style={{ marginBottom: Spacing[3] }}>
            Services & Pricing
          </Typography>
          
          {servicesLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: Spacing[8] }}>
              <ActivityIndicator size="large" color={Colors.primary[600]} />
              <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[2] }}>
                Loading services...
              </Typography>
            </View>
          ) : services.length === 0 ? (
            <View
              style={{
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[6],
                alignItems: 'center',
                ...Shadows.sm,
              }}
            >
              <Ionicons name="briefcase-outline" size={48} color={Colors.text.secondary} />
              <Typography variant="body" weight="semibold" style={{ marginTop: Spacing[3] }}>
                No services available
              </Typography>
              <Typography variant="caption" color="secondary" style={{ textAlign: 'center', marginTop: Spacing[1] }}>
                This shop hasn't added any services yet
              </Typography>
            </View>
          ) : (
            services.map((service) => (
              <View
                key={service.id}
                style={{
                  backgroundColor: Colors.background.primary,
                  borderRadius: BorderRadius.xl,
                  padding: Spacing[4],
                  marginBottom: Spacing[3],
                  ...Shadows.sm,
                }}
              >
                {/* Service Images */}
                <View style={{ marginBottom: Spacing[3] }}>
                  {service.images && service.images.length > 0 ? (
                    <FlatList
                      data={service.images.slice(0, 3)} // Show max 3 images
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item, index }) => (
                        <View style={{ marginRight: index === service.images.length - 1 ? 0 : Spacing[2] }}>
                          <Image
                            source={{ uri: item }}
                            style={{
                              width: service.images.length === 1 ? '100%' : 120,
                              height: 140,
                              borderRadius: BorderRadius.lg,
                            }}
                            resizeMode="cover"
                          />
                          {service.images.length > 3 && index === 2 && (
                            <View
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                borderRadius: BorderRadius.lg,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Typography variant="body" weight="bold" color="inverse">
                                +{service.images.length - 3} more
                              </Typography>
                            </View>
                          )}
                        </View>
                      )}
                      keyExtractor={(item, index) => `${service.id}-${index}`}
                    />
                  ) : (
                    <View
                      style={{
                        width: '100%',
                        height: 140,
                        backgroundColor: Colors.primary[50],
                        borderRadius: BorderRadius.lg,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: Colors.primary[100],
                      }}
                    >
                      <Ionicons name="image-outline" size={40} color={Colors.primary[300]} />
                      <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[2] }}>
                        No images available
                      </Typography>
                    </View>
                  )}
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Typography variant="body" weight="semibold">
                      {service.name || service.title || "Unnamed Service"}
                    </Typography>
                    {service.description && (
                      <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1], lineHeight: 18 }}>
                        {service.description}
                      </Typography>
                    )}
                    {service.duration && (
                      <Typography variant="caption" color="primary" style={{ marginTop: Spacing[1] }}>
                        Duration: {service.duration}
                      </Typography>
                    )}
                  </View>
                  <View
                    style={{
                      backgroundColor: Colors.primary[50],
                      paddingHorizontal: Spacing[3],
                      paddingVertical: Spacing[2],
                      borderRadius: BorderRadius.lg,
                      marginLeft: Spacing[3],
                    }}
                  >
                    <Typography variant="body" weight="bold" style={{ color: Colors.primary[700] }}>
                      ₹{service.price}
                    </Typography>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Reviews Section */}
        <View style={{ marginHorizontal: Spacing[6], marginTop: Spacing[4], marginBottom: Spacing[8] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[4] }}>
            <Typography variant="h4">
              Reviews & Ratings
            </Typography>
            <TouchableOpacity
              onPress={() => setReviewModal(true)}
              style={{
                backgroundColor: Colors.primary[600],
                paddingHorizontal: Spacing[4],
                paddingVertical: Spacing[2],
                borderRadius: BorderRadius.lg,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="create-outline" size={16} color={Colors.neutral[0]} />
              <Typography variant="caption" weight="semibold" color="inverse" style={{ marginLeft: Spacing[1] }}>
                Write Review
              </Typography>
            </TouchableOpacity>
          </View>
          
          {/* Reviews List */}
          {reviews.length === 0 ? (
            <View
              style={{
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[8],
                alignItems: 'center',
                ...Shadows.sm,
              }}
            >
              <Ionicons name="star-outline" size={64} color={Colors.text.secondary} />
              <Typography variant="body" weight="semibold" style={{ marginTop: Spacing[4] }}>
                No reviews yet
              </Typography>
              <Typography variant="caption" color="secondary" style={{ textAlign: 'center', marginTop: Spacing[2] }}>
                Be the first to review this shop
              </Typography>
            </View>
          ) : (
            reviews.map((review) => (
              <View
                key={review.id}
                style={{
                  backgroundColor: Colors.background.primary,
                  borderRadius: BorderRadius.xl,
                  padding: Spacing[4],
                  marginBottom: Spacing[3],
                  ...Shadows.sm,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing[3] }}>
                  <Avatar source={review.userPhoto} size="md" />
                  <View style={{ marginLeft: Spacing[3], flex: 1 }}>
                    <Typography variant="body" weight="semibold">
                      {review.userName}
                    </Typography>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing[1] }}>
                      {[...Array(5)].map((_, index) => (
                        <Ionicons
                          key={index}
                          name={index < review.rating ? 'star' : 'star-outline'}
                          size={14}
                          color="#fbbf24"
                          style={{ marginRight: 2 }}
                        />
                      ))}
                      <Typography variant="caption" color="secondary" style={{ marginLeft: Spacing[2] }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </View>
                  </View>
                </View>
                <Typography variant="caption" style={{ lineHeight: 20 }}>
                  {review.comment}
                </Typography>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Write Review Modal */}
      <Modal visible={reviewModal} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              backgroundColor: Colors.background.primary,
              borderTopLeftRadius: BorderRadius['3xl'],
              borderTopRightRadius: BorderRadius['3xl'],
              padding: Spacing[6],
              maxHeight: '80%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[6] }}>
              <Typography variant="h3">Write a Review</Typography>
              <TouchableOpacity onPress={() => {
                setReviewModal(false);
                setRating(0);
                setReviewComment('');
              }}>
                <Ionicons name="close" size={28} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Shop Info */}
              <View
                style={{
                  backgroundColor: Colors.background.secondary,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing[4],
                  marginBottom: Spacing[6],
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Avatar source={shop?.ownerPhoto} size="md" />
                <View style={{ marginLeft: Spacing[3] }}>
                  <Typography variant="body" weight="semibold">
                    {shop?.shopName}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {shop?.shopCategory}
                  </Typography>
                </View>
              </View>

              {/* Rating */}
              <Typography variant="body" weight="semibold" style={{ marginBottom: Spacing[3] }}>
                Your Rating
              </Typography>
              <View style={{ flexDirection: 'row', marginBottom: Spacing[6], justifyContent: 'center', gap: Spacing[3] }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={{
                      padding: Spacing[2],
                    }}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={48}
                      color={star <= rating ? '#fbbf24' : Colors.text.secondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Review Comment */}
              <Typography variant="body" weight="semibold" style={{ marginBottom: Spacing[2] }}>
                Your Review
              </Typography>
              <TextInput
                placeholder="Share your experience with this service..."
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={6}
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border.main,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing[4],
                  fontSize: 15,
                  textAlignVertical: 'top',
                  marginBottom: Spacing[6],
                  minHeight: 140,
                }}
              />

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitReview}
                disabled={submittingReview}
                style={{
                  backgroundColor: Colors.primary[600],
                  paddingVertical: Spacing[4],
                  borderRadius: BorderRadius.xl,
                  alignItems: 'center',
                  opacity: submittingReview ? 0.6 : 1,
                  ...Shadows.md,
                }}
              >
                <Typography variant="body" weight="semibold" color="inverse">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Typography>
              </TouchableOpacity>

              <Typography variant="caption" color="secondary" style={{ textAlign: 'center', marginTop: Spacing[4] }}>
                Your feedback helps others make better decisions
              </Typography>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
