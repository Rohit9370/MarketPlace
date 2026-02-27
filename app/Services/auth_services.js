import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function register(formData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    
    if (userCredential) {
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      const collectionName = formData.role === "shopkeeper" ? "shop" : "user";
      
      // Remove password from data before storing
      const { password, confirmPassword, ...dataToStore } = formData;
      const userdata = {
        ...dataToStore,
        uid: userCredential.user.uid,
        emailVerified: false,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, collectionName), userdata);
      console.log("User registered successfully with ID:", docRef.id);
      return { 
        success: true, 
        userId: userCredential.user.uid, 
        docId: docRef.id,
        emailSent: true 
      };
    }
  } catch (err) {
    console.error("Registration error:", err);
    throw new Error(err.message || "Registration failed");
  }
}

// Fetch user data from Firestore
async function getUserDataFromFirestore(uid) {
  try {
    // Check in 'admin' collection first
    const adminQuery = query(collection(db, "admin"), where("uid", "==", uid));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (!adminSnapshot.empty) {
      const adminData = adminSnapshot.docs[0].data();
      return {
        ...adminData,
        docId: adminSnapshot.docs[0].id,
        role: "admin"
      };
    }
    
    // Check in 'shop' collection
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
    
    // Check in 'user' collection
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

export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential) {
            console.log("User logged in successfully", userCredential.user.uid);
            
            // Fetch user data from Firestore
            const userData = await getUserDataFromFirestore(userCredential.user.uid);
            
            // Skip email verification for admin and test accounts
            const skipVerificationEmails = [
              'admin@growwithus.com',
              'test@test.com',
              'demo@demo.com'
            ];
            
            const shouldSkipVerification = skipVerificationEmails.includes(email.toLowerCase()) || 
                                          userData.role === 'admin';
            
            // Return user data with email verification status
            return { 
              success: true, 
              user: userCredential.user,
              userData: userData,
              role: userData.role,
              emailVerified: shouldSkipVerification ? true : userCredential.user.emailVerified
            };
        }
    } catch (err) {
        console.error("Login error:", err);
        throw new Error(err.message || "Login failed");
    }
}