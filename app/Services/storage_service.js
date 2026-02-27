import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  AUTH_TOKEN: '@auth_token',
  USER_ROLE: '@user_role',
};

// Save user data to AsyncStorage
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

// Get user data from AsyncStorage
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Save user role
export const saveUserRole = async (role) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    return true;
  } catch (error) {
    console.error('Error saving user role:', error);
    return false;
  }
};

// Get user role
export const getUserRole = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Clear all user data (logout)
export const clearUserData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_ROLE,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

// Check if user is logged in
export const isUserLoggedIn = async () => {
  try {
    const userData = await getUserData();
    return userData !== null;
  } catch (error) {
    return false;
  }
};
