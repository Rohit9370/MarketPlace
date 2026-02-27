// Test script to insert shopkeeper data into Firebase
// Run this with: node scripts/test-firebase-insert.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyCMWNelSOq6Zf2iqWmW8pc9EZRJIcRYyCw",
  authDomain: "serviceprovider-33f80.firebaseapp.com",
  databaseURL: "https://serviceprovider-33f80-default-rtdb.firebaseio.com",
  projectId: "serviceprovider-33f80",
  storageBucket: "serviceprovider-33f80.firebasestorage.app",
  messagingSenderId: "735847697694",
  appId: "1:735847697694:web:f58a5f10a026375b1f8d0f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Test shopkeeper data near Radha Krishna Temple
const testShopkeeper = {
  shopName: "Radha Krishna Services",
  ownerName: "Rajesh Kumar",
  email: "rajesh.rk@growwithus.com",
  contactNumber: "9876543210",
  phone: "9876543210",
  role: "shopkeeper",
  ownerPhoto: "https://via.placeholder.com/150",
  shopLogo: "https://via.placeholder.com/150",
  shopBanner: "https://via.placeholder.com/400x200",
  shopImages: [
    "https://via.placeholder.com/300",
    "https://via.placeholder.com/300",
    "https://via.placeholder.com/300"
  ],
  isIndividual: false,
  shopAddress: "Shop No. 100, Near Radha Krishna Temple, Main Market",
  shopCity: "Delhi",
  shopState: "Delhi",
  shopPincode: "110001",
  shopLocation: {
    latitude: 28.6139,
    longitude: 77.2090
  },
  shopCategory: "Plumbing",
  createdAt: new Date().toISOString(),
  isVerified: true,
  rating: 4.5,
  totalReviews: 0
};

async function insertTestData() {
  try {
    console.log("🔄 Creating test shopkeeper account...");
    
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      testShopkeeper.email, 
      "Test@123456"
    );
    
    console.log("✅ Auth user created with UID:", userCredential.user.uid);
    
    // Add to Firestore
    const shopData = {
      ...testShopkeeper,
      uid: userCredential.user.uid
    };
    
    const docRef = await addDoc(collection(db, "shop"), shopData);
    
    console.log("✅ Shopkeeper data inserted successfully!");
    console.log("📄 Document ID:", docRef.id);
    console.log("\n🔑 LOGIN CREDENTIALS:");
    console.log("Email: rajesh.rk@growwithus.com");
    console.log("Password: Test@123456");
    console.log("\n✨ Data stored in Firebase 'shop' collection");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code === 'auth/email-already-in-use') {
      console.log("\n⚠️  Email already exists. Use these credentials:");
      console.log("Email: rajesh.rk@growwithus.com");
      console.log("Password: Test@123456");
    }
    process.exit(1);
  }
}

insertTestData();
