import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Add a new service for a shop
 * @param {string} shopId - Shop owner's UID
 * @param {object} serviceData - Service details
 * @returns {object} - Created service with ID
 */
export async function addService(shopId, serviceData) {
  try {
    const docRef = await addDoc(collection(db, "services"), {
      shopId,
      ...serviceData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log("Service added successfully:", docRef.id);
    return { id: docRef.id, ...serviceData };
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
}

/**
 * Get all services for a specific shop
 * @param {string} shopId - Shop owner's UID
 * @returns {Array} - Array of services
 */
export async function getShopServices(shopId) {
  try {
    const q = query(
      collection(db, "services"),
      where("shopId", "==", shopId)
    );
    
    const querySnapshot = await getDocs(q);
    const services = [];
    
    querySnapshot.forEach((doc) => {
      services.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return services;
  } catch (error) {
    console.error("Error fetching shop services:", error);
    throw error;
  }
}

/**
 * Update a service
 * @param {string} serviceId - Service document ID
 * @param {object} updateData - Data to update
 * @returns {object} - Success status
 */
export async function updateService(serviceId, updateData) {
  try {
    const serviceRef = doc(db, "services", serviceId);
    await updateDoc(serviceRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    console.log("Service updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
}

/**
 * Delete a service
 * @param {string} serviceId - Service document ID
 * @returns {object} - Success status
 */
export async function deleteService(serviceId) {
  try {
    await deleteDoc(doc(db, "services", serviceId));
    console.log("Service deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
}

/**
 * Toggle service active status
 * @param {string} serviceId - Service document ID
 * @param {boolean} isActive - New active status
 * @returns {object} - Success status
 */
export async function toggleServiceStatus(serviceId, isActive) {
  try {
    const serviceRef = doc(db, "services", serviceId);
    await updateDoc(serviceRef, {
      isActive,
      updatedAt: new Date().toISOString()
    });
    
    console.log("Service status updated");
    return { success: true };
  } catch (error) {
    console.error("Error toggling service status:", error);
    throw error;
  }
}
