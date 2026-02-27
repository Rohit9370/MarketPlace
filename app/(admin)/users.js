import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '../Comoponents/Typography';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/designSystem';
import { getAllUsers } from '../Services/admin_service';

export default function UsersTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      console.log('Loaded users:', data.length, data);
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.secondary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Typography variant="body" color="secondary" style={{ marginTop: Spacing[4] }}>
          Loading users...
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
          Users
        </Typography>
        <Typography variant="body" color="inverse" style={{ marginTop: Spacing[2], opacity: 0.9 }}>
          All registered users
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
            placeholder="Search by name, email, or phone..."
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
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <Typography variant="h3" style={{ color: '#f59e0b' }}>
                  {users.length}
                </Typography>
                <Typography variant="caption" color="secondary" style={{ marginTop: Spacing[1] }}>
                  Total Users
                </Typography>
              </View>
            </View>
          </View>

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <View
              style={{
                backgroundColor: Colors.background.primary,
                borderRadius: BorderRadius.xl,
                padding: Spacing[8],
                alignItems: 'center',
                ...Shadows.sm,
              }}
            >
              <Ionicons name="people-outline" size={48} color={Colors.text.secondary} />
              <Typography variant="body" color="secondary" style={{ marginTop: Spacing[2] }}>
                {searchQuery ? 'No users found' : 'No users yet'}
              </Typography>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                onPress={() => router.push({
                  pathname: '/(admin)/UserDetailScreen',
                  params: { user: JSON.stringify(user) }
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
                  {/* User Image */}
                  <Image
                    source={
                      user.photo
                        ? { uri: user.photo }
                        : require('../Assets/images/servicewomen.png')
                    }
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: BorderRadius.full,
                      backgroundColor: Colors.background.tertiary,
                    }}
                  />

                  {/* User Details */}
                  <View style={{ flex: 1 }}>
                    <Typography variant="body" weight="semibold">
                      {user.name || 'Unnamed User'}
                    </Typography>

                    {/* Email */}
                    {user.email && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing[2] }}>
                        <Ionicons name="mail" size={14} color={Colors.text.secondary} />
                        <Typography
                          variant="caption"
                          color="secondary"
                          style={{ marginLeft: Spacing[1], flex: 1 }}
                          numberOfLines={1}
                        >
                          {user.email}
                        </Typography>
                      </View>
                    )}

                    {/* Phone */}
                    {user.phone && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing[1] }}>
                        <Ionicons name="call" size={14} color={Colors.text.secondary} />
                        <Typography variant="caption" color="secondary" style={{ marginLeft: Spacing[1] }}>
                          {user.phone}
                        </Typography>
                      </View>
                    )}

                    {/* Address */}
                    {user.address && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing[1] }}>
                        <Ionicons name="location" size={14} color={Colors.text.secondary} />
                        <Typography
                          variant="caption"
                          color="secondary"
                          style={{ marginLeft: Spacing[1], flex: 1 }}
                          numberOfLines={1}
                        >
                          {user.address}
                        </Typography>
                      </View>
                    )}
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
