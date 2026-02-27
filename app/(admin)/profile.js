import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../Comoponents/Avatar';
import Typography from '../Comoponents/Typography';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/designSystem';
import { logout } from '../redux/authSlice';
import { auth } from '../Services/firebase';
import { clearUserData } from '../Services/storage_service';

export default function ProfileTab() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View
          style={{
            backgroundColor: '#8b5cf6',
            paddingHorizontal: Spacing[6],
            paddingVertical: Spacing[8],
            borderBottomLeftRadius: BorderRadius['3xl'],
            borderBottomRightRadius: BorderRadius['3xl'],
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <View style={{ position: 'relative' }}>
              <Avatar
                source={user?.photo}
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
                  backgroundColor: '#8b5cf6',
                  padding: Spacing[2],
                  borderRadius: BorderRadius.full,
                  borderWidth: 2,
                  borderColor: Colors.neutral[0],
                }}
              >
                <Ionicons name="shield-checkmark" size={16} color={Colors.neutral[0]} />
              </View>
            </View>
            <Typography variant="h3" color="inverse" style={{ marginTop: Spacing[4] }}>
              {user?.name || 'Admin'}
            </Typography>
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: Spacing[3],
                paddingVertical: Spacing[1],
                borderRadius: BorderRadius.full,
                marginTop: Spacing[2],
              }}
            >
              <Typography variant="caption" color="inverse" weight="semibold">
                Administrator
              </Typography>
            </View>
            <Typography variant="body" color="inverse" style={{ marginTop: Spacing[2], opacity: 0.9 }}>
              {user?.email || 'admin@growwithus.com'}
            </Typography>
          </View>
        </View>

        {/* Admin Info Card */}
        <View
          style={{
            marginHorizontal: Spacing[6],
            marginTop: -Spacing[6],
            backgroundColor: Colors.background.primary,
            borderRadius: BorderRadius.xl,
            padding: Spacing[5],
            ...Shadows.md,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="shield-checkmark" size={48} color="#8b5cf6" />
            <Typography variant="h4" style={{ marginTop: Spacing[3], color: '#8b5cf6' }}>
              Admin Access
            </Typography>
            <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[2], textAlign: 'center' }}>
              You have full administrative privileges to manage users, shopkeepers, and platform settings
            </Typography>
          </View>
        </View>

        {/* Profile Information */}
        <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[6] }}>
          <Typography variant="h4" style={{ marginBottom: Spacing[4] }}>
            Profile Information
          </Typography>

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
                  {user?.name || 'Admin User'}
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
                  {user?.email || 'admin@growwithus.com'}
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
              <Ionicons name="shield-outline" size={20} color={Colors.text.secondary} />
              <View style={{ marginLeft: Spacing[3], flex: 1 }}>
                <Typography variant="caption" color="secondary">
                  Role
                </Typography>
                <Typography variant="body" weight="medium" style={{ marginTop: Spacing[1] }}>
                  Administrator
                </Typography>
              </View>
            </View>
          </View>

          {user?.phone && (
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
                    {user.phone}
                  </Typography>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[6], marginBottom: Spacing[8] }}>
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
    </SafeAreaView>
  );
}
