// Script to check shopkeepers in Firebase
// Run this with: node scripts/check-shopkeepers.js

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkShopkeepers() {
  try {
    console.log("🔍 Checking shopkeepers in Firebase...\n");
    
    const querySnapshot = await getDocs(collection(db, "shop"));
    
    if (querySnapshot.empty) {
      console.log("❌ No shopkeepers found in database!");
      console.log("\n💡 To add shopkeepers, run:");
      console.log("   node scripts/insert-multiple-shopkeepers.js");
    } else {
      console.log(`✅ Found ${querySnapshot.size} shopkeepers:\n`);
      
      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.shopName || 'Unnamed'}`);
        console.log(`   Email: ${data.email || 'N/A'}`);
        console.log(`   Category: ${data.shopCategory || 'N/A'}`);
        console.log(`   Status: ${data.isActive !== false ? 'Active' : 'Inactive'}`);
        console.log(`   ID: ${doc.id}\n`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkShopkeepers();
