import { addDoc, collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Add a review for a shop
 */
export async function addReview(reviewData) {
  try {
    const docRef = await addDoc(collection(db, "reviews"), {
      ...reviewData,
      createdAt: new Date().toISOString(),
    });
    
    console.log("Review created with ID:", docRef.id);
    return { success: true, reviewId: docRef.id };
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
}

/**
 * Get reviews for a shop
 */
export async function getShopReviews(shopId) {
  try {
    const q = query(
      collection(db, "reviews"),
      where("shopId", "==", shopId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return reviews;
  } catch (error) {
    console.error("Error fetching shop reviews:", error);
    throw error;
  }
}

/**
 * Get reviews by a user
 */
export async function getUserReviews(userId) {
  try {
    const q = query(
      collection(db, "reviews"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return reviews;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
}
