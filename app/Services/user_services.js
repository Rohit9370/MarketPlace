import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";


export async function getUserData(uid) {
  try {

    const shopQuery = query(collection(db, "shop"), where("uid", "==", uid));
    const shopSnapshot = await getDocs(shopQuery);
    
    if (!shopSnapshot.empty) {
      const shopData = shopSnapshot.docs[0].data();
      return {
        ...shopData,
        docId: shopSnapshot.docs[0].id,
        role: "shopkeeper"
      };
    }

    const userQuery = query(collection(db, "user"), where("uid", "==", uid));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      return {
        ...userData,
        docId: userSnapshot.docs[0].id,
        role: "user"
      };
    }
    
    throw new Error("User data not found");
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

/**
 * Update user profile data
 * @param {string} docId - Document ID
 * @param {object} updateData - Data to update
 * @returns {object} - Success status
 */
export async function updateUserProfile(docId, updateData) {
  try {
    const userRef = doc(db, "user", docId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    console.log("User profile updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Update shopkeeper profile data
 * @param {string} docId - Document ID
 * @param {object} updateData - Data to update
 * @returns {object} - Success status
 */
export async function updateShopkeeperProfile(docId, updateData) {
  try {
    const shopRef = doc(db, "shop", docId);
    await updateDoc(shopRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    console.log("Shopkeeper profile updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating shopkeeper profile:", error);
    throw error;
  }
}

/**
 * Get all shopkeepers from Firestore
 * @returns {Array} - Array of shopkeeper data
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
 * Get shopkeepers by category
 * @param {string} category - Category name
 * @returns {Array} - Filtered shopkeepers
 */
export async function getShopkeepersByCategory(category) {
  try {
    const q = query(
      collection(db, "shop"), 
      where("shopCategory", "==", category)
    );
    const querySnapshot = await getDocs(q);
    const shopkeepers = [];
    
    querySnapshot.forEach((doc) => {
      shopkeepers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return shopkeepers;
  } catch (error) {
    console.error("Error fetching shopkeepers by category:", error);
    throw error;
  }
}
