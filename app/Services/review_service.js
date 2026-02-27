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
 * Get aggregated reviews for multiple shops
 */
export async function getAggregatedReviews(shopIds) {
  try {
    // We need to fetch reviews for all shops at once
    // Since Firestore doesn't support 'in' query for large arrays well,
    // we'll fetch all reviews and then group them by shopId
    const q = query(collection(db, "reviews"), orderBy("shopId"));
    const querySnapshot = await getDocs(q);
    
    const reviewsByShop = {};
    
    querySnapshot.forEach((doc) => {
      const review = {
        id: doc.id,
        ...doc.data()
      };
      
      if (!reviewsByShop[review.shopId]) {
        reviewsByShop[review.shopId] = [];
      }
      reviewsByShop[review.shopId].push(review);
    });
    
    // Calculate aggregate data for each shop
    const aggregates = {};
    Object.keys(reviewsByShop).forEach(shopId => {
      const shopReviews = reviewsByShop[shopId];
      const totalReviews = shopReviews.length;
      const avgRating = totalReviews > 0 
        ? (shopReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : 0;
        
      aggregates[shopId] = {
        totalReviews,
        avgRating: parseFloat(avgRating)
      };
    });
    
    return aggregates;
  } catch (error) {
    console.error("Error fetching aggregated reviews:", error);
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
