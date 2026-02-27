// Script to insert multiple shopkeeper data into Firebase
// Run this with: node scripts/insert-multiple-shopkeepers.js

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

// 13 shopkeepers data with different categories and locations
const shopkeepers = [
  {
    shopName: "Quick Fix Plumbing",
    ownerName: "Ramesh Sharma",
    email: "ramesh.plumbing@growwithus.com",
    contactNumber: "9876543211",
    phone: "9876543211",
    shopAddress: "Shop 15, Connaught Place, Near Metro Station",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110001",
    shopLocation: { latitude: 28.6315, longitude: 77.2167 },
    shopCategory: "Plumbing",
    isIndividual: false,
    rating: 4.5
  },
  {
    shopName: "Bright Spark Electricals",
    ownerName: "Suresh Kumar",
    email: "suresh.electric@growwithus.com",
    contactNumber: "9876543212",
    phone: "9876543212",
    shopAddress: "B-23, Lajpat Nagar Market, Main Road",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110024",
    shopLocation: { latitude: 28.5677, longitude: 77.2431 },
    shopCategory: "Electrician",
    isIndividual: false,
    rating: 4.7
  },
  {
    shopName: "Master Carpenter Works",
    ownerName: "Vijay Singh",
    email: "vijay.carpenter@growwithus.com",
    contactNumber: "9876543213",
    phone: "9876543213",
    shopAddress: "Shop 45, Saket Market, Near PVR",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110017",
    shopLocation: { latitude: 28.5244, longitude: 77.2066 },
    shopCategory: "Carpenter",
    isIndividual: true,
    rating: 4.3
  },
  {
    shopName: "Rainbow Painters",
    ownerName: "Amit Verma",
    email: "amit.painter@growwithus.com",
    contactNumber: "9876543214",
    phone: "9876543214",
    shopAddress: "C-12, Rohini Sector 7, Near Park",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110085",
    shopLocation: { latitude: 28.7041, longitude: 77.1025 },
    shopCategory: "Painter",
    isIndividual: false,
    rating: 4.6
  },
  {
    shopName: "Sparkle Clean Services",
    ownerName: "Priya Gupta",
    email: "priya.cleaning@growwithus.com",
    contactNumber: "9876543215",
    phone: "9876543215",
    shopAddress: "D-56, Dwarka Sector 10, Main Market",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110075",
    shopLocation: { latitude: 28.5921, longitude: 77.0460 },
    shopCategory: "Cleaning",
    isIndividual: false,
    rating: 4.8
  },
  {
    shopName: "Pest Control Pro",
    ownerName: "Rakesh Malhotra",
    email: "rakesh.pest@growwithus.com",
    contactNumber: "9876543216",
    phone: "9876543216",
    shopAddress: "Shop 8, Vasant Kunj, Near Mall",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110070",
    shopLocation: { latitude: 28.5200, longitude: 77.1600 },
    shopCategory: "Pest Control",
    isIndividual: false,
    rating: 4.4
  },
  {
    shopName: "Tech Repair Hub",
    ownerName: "Anil Kapoor",
    email: "anil.appliance@growwithus.com",
    contactNumber: "9876543217",
    phone: "9876543217",
    shopAddress: "Shop 22, Karol Bagh Market, Main Road",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110005",
    shopLocation: { latitude: 28.6519, longitude: 77.1900 },
    shopCategory: "Appliance Repair",
    isIndividual: false,
    rating: 4.5
  },
  {
    shopName: "Glamour Home Salon",
    ownerName: "Neha Sharma",
    email: "neha.salon@growwithus.com",
    contactNumber: "9876543218",
    phone: "9876543218",
    shopAddress: "Flat 301, Green Park Extension, Block A",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110016",
    shopLocation: { latitude: 28.5494, longitude: 77.2066 },
    shopCategory: "Home Salon",
    isIndividual: true,
    rating: 4.9
  },
  {
    shopName: "Green Thumb Gardening",
    ownerName: "Mohan Lal",
    email: "mohan.garden@growwithus.com",
    contactNumber: "9876543219",
    phone: "9876543219",
    shopAddress: "Shop 5, Hauz Khas Village, Near Lake",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110016",
    shopLocation: { latitude: 28.5494, longitude: 77.1960 },
    shopCategory: "Gardening",
    isIndividual: true,
    rating: 4.2
  },
  {
    shopName: "Shine Car Wash",
    ownerName: "Karan Mehta",
    email: "karan.carwash@growwithus.com",
    contactNumber: "9876543220",
    phone: "9876543220",
    shopAddress: "Plot 12, Mayur Vihar Phase 1, Main Road",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110091",
    shopLocation: { latitude: 28.6082, longitude: 77.2970 },
    shopCategory: "Car Wash",
    isIndividual: false,
    rating: 4.3
  },
  {
    shopName: "Cool Breeze AC Services",
    ownerName: "Deepak Yadav",
    email: "deepak.ac@growwithus.com",
    contactNumber: "9876543221",
    phone: "9876543221",
    shopAddress: "Shop 18, Pitampura, Near Metro",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110034",
    shopLocation: { latitude: 28.6942, longitude: 77.1314 },
    shopCategory: "Appliance Repair",
    isIndividual: false,
    rating: 4.6
  },
  {
    shopName: "Express Plumbing Solutions",
    ownerName: "Sanjay Gupta",
    email: "sanjay.plumbing@growwithus.com",
    contactNumber: "9876543222",
    phone: "9876543222",
    shopAddress: "Shop 9, Janakpuri District Centre",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110058",
    shopLocation: { latitude: 28.6219, longitude: 77.0831 },
    shopCategory: "Plumbing",
    isIndividual: true,
    rating: 4.4
  },
  {
    shopName: "Power Electric Works",
    ownerName: "Manoj Tiwari",
    email: "manoj.electric@growwithus.com",
    contactNumber: "9876543223",
    phone: "9876543223",
    shopAddress: "B-45, Rajouri Garden Market, Main Road",
    shopCity: "Delhi",
    shopState: "Delhi",
    shopPincode: "110027",
    shopLocation: { latitude: 28.6415, longitude: 77.1214 },
    shopCategory: "Electrician",
    isIndividual: false,
    rating: 4.7
  }
];

async function insertShopkeeper(shopData, index) {
  try {
    const password = "Test@123456";
    
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      shopData.email, 
      password
    );
    
    // Prepare Firestore data
    const firestoreData = {
      ...shopData,
      uid: userCredential.user.uid,
      role: "shopkeeper",
      isActive: false, // Default inactive - requires admin activation
      ownerPhoto: "https://via.placeholder.com/150",
      shopLogo: "https://via.placeholder.com/150",
      shopBanner: "https://via.placeholder.com/400x200",
      shopImages: [
        "https://via.placeholder.com/300",
        "https://via.placeholder.com/300",
        "https://via.placeholder.com/300"
      ],
      createdAt: new Date().toISOString(),
      isVerified: true,
      totalReviews: Math.floor(Math.random() * 50) + 10
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, "shop"), firestoreData);
    
    console.log(`✅ ${index + 1}. ${shopData.shopName} - Created (${shopData.email})`);
    
    return {
      success: true,
      email: shopData.email,
      docId: docRef.id
    };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  ${index + 1}. ${shopData.shopName} - Already exists (${shopData.email})`);
      return { success: false, email: shopData.email, reason: 'exists' };
    }
    console.error(`❌ ${index + 1}. ${shopData.shopName} - Error:`, error.message);
    return { success: false, email: shopData.email, reason: error.message };
  }
}

async function insertAllShopkeepers() {
  console.log("🚀 Starting bulk shopkeeper insertion...\n");
  
  const results = [];
  
  for (let i = 0; i < shopkeepers.length; i++) {
    const result = await insertShopkeeper(shopkeepers[i], i);
    results.push(result);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 INSERTION SUMMARY");
  console.log("=".repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successfully created: ${successful}`);
  console.log(`⚠️  Already existed/Failed: ${failed}`);
  console.log(`📝 Total processed: ${results.length}`);
  
  console.log("\n🔑 ALL LOGIN CREDENTIALS:");
  console.log("Password for all accounts: Test@123456\n");
  
  shopkeepers.forEach((shop, index) => {
    console.log(`${index + 1}. ${shop.email}`);
  });
  
  console.log("\n✨ All data stored in Firebase 'shop' collection");
  console.log("🎉 Ready to use!");
  
  process.exit(0);
}

insertAllShopkeepers();
