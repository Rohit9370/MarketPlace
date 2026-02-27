import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Create a new booking
 */
export async function createBooking(bookingData) {
  try {
    const docRef = await addDoc(collection(db, "bookings"), {
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    
    console.log("Booking created with ID:", docRef.id);
    return { success: true, bookingId: docRef.id };
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

/**
 * Get bookings for a user
 */
export async function getUserBookings(userId) {
  try {
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return bookings;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
}

/**
 * Get bookings for a shopkeeper
 */
export async function getShopBookings(shopId) {
  try {
    const q = query(
      collection(db, "bookings"),
      where("shopId", "==", shopId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return bookings;
  } catch (error) {
    console.error("Error fetching shop bookings:", error);
    throw error;
  }
}

/**
 * Accept a booking and generate OTP
 */
export async function acceptBooking(bookingId) {
  try {
    const otpCode = generateOTP();
    const bookingRef = doc(db, "bookings", bookingId);
    
    await updateDoc(bookingRef, {
      status: 'accepted',
      otpCode: otpCode,
      acceptedAt: new Date().toISOString(),
    });
    
    return { success: true, otpCode };
  } catch (error) {
    console.error("Error accepting booking:", error);
    throw error;
  }
}

/**
 * Reject a booking
 */
export async function rejectBooking(bookingId) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    
    await updateDoc(bookingRef, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error rejecting booking:", error);
    throw error;
  }
}

/**
 * Cancel a booking (user cancels their own booking)
 */
export async function cancelBooking(bookingId) {
  try {
    console.log("Attempting to cancel booking:", bookingId);
    
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }
    
    const bookingRef = doc(db, "bookings", bookingId);
    
    await updateDoc(bookingRef, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    });
    
    console.log("Booking cancelled successfully:", bookingId);
    return { success: true };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  }
}

/**
 * Complete a booking with OTP verification
 */
export async function completeBooking(bookingId, enteredOTP, storedOTP, price) {
  try {
    if (enteredOTP !== storedOTP) {
      throw new Error("Invalid OTP code");
    }
    
    const bookingRef = doc(db, "bookings", bookingId);
    
    await updateDoc(bookingRef, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    
    // TODO: Update shopkeeper earnings
    
    return { success: true };
  } catch (error) {
    console.error("Error completing booking:", error);
    throw error;
  }
}

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Listen to bookings in real-time
 */
export function listenToUserBookings(userId, callback) {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(bookings);
  });
}

/**
 * Listen to shop bookings in real-time
 */
export function listenToShopBookings(shopId, callback) {
  const q = query(
    collection(db, "bookings"),
    where("shopId", "==", shopId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(bookings);
  });
}
