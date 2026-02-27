import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Get all bookings, shopkeepers, and users for admin dashboard
 */
export async function getAllBookings() {
  try {
    // Fetch all bookings
    const bookingsSnapshot = await getDocs(collection(db, "bookings"));
    const bookings = [];
    bookingsSnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Fetch all shopkeepers
    const shopkeepersSnapshot = await getDocs(collection(db, "shop"));
    const shopkeepers = [];
    shopkeepersSnapshot.forEach((doc) => {
      shopkeepers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Fetch all users
    const usersSnapshot = await getDocs(collection(db, "user"));
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      bookings,
      shopkeepers,
      users
    };
  } catch (error) {
    console.error("Error fetching admin data:", error);
    throw error;
  }
}

/**
 * Get all shopkeepers
 */
export async function getAllShopkeepers() {
  try {
    const querySnapshot = await getDocs(collection(db, "shop"));
    const shopkeepers = [];
    
    querySnapshot.forEach((doc) => {
      shopkeepers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return shopkeepers;
  } catch (error) {
    console.error("Error fetching shopkeepers:", error);
    throw error;
  }
}

/**
 * Get all users
 */
export async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "user"));
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * Toggle shopkeeper active/inactive status
 */
export async function toggleShopkeeperStatus(shopId, currentStatus) {
  try {
    const shopRef = doc(db, "shop", shopId);
    const newStatus = !currentStatus;
    
    await updateDoc(shopRef, {
      isActive: newStatus,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Shopkeeper ${shopId} status updated to ${newStatus}`);
    return { success: true, newStatus };
  } catch (error) {
    console.error("Error toggling shopkeeper status:", error);
    throw error;
  }
}

/**
 * Send approval notification to shopkeeper
 */
export async function sendShopkeeperApprovalNotification(shopkeeperData) {
  try {
    // In a real implementation, this would send an actual email
    // For now, we'll just log it and show an alert
    console.log(`📧 Approval notification sent to ${shopkeeperData.email}`);
    console.log(`Welcome message: Your shop "${shopkeeperData.shopName}" has been approved!`);
    
    // Simulate email sending
    return { success: true, message: 'Approval notification sent' };
  } catch (error) {
    console.error("Error sending approval notification:", error);
    return { success: false, message: 'Failed to send notification' };
  }
}
