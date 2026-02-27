// Debug script to check shop data and service linking
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase config - using the same configuration as the app
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

async function debugShopData() {
  try {
    console.log("🔍 Debugging shop data and service linking...\n");
    
    // Get all shops
    const shopsSnapshot = await getDocs(collection(db, "shop"));
    console.log(`📊 Found ${shopsSnapshot.size} shops in database\n`);
    
    for (const shopDoc of shopsSnapshot.docs) {
      const shopData = shopDoc.data();
      const shopId = shopDoc.id;
      
      console.log(`🏪 Shop: ${shopData.shopName || 'Unnamed'}`);
      console.log(`   Document ID: ${shopId}`);
      console.log(`   Email: ${shopData.email || 'N/A'}`);
      console.log(`   UID field: ${shopData.uid || 'undefined'}`);
      console.log(`   Category: ${shopData.shopCategory || 'N/A'}`);
      
      // Check services for this shop
      const serviceQuery = query(collection(db, "services"), where("shopId", "==", shopId));
      const serviceSnapshot = await getDocs(serviceQuery);
      
      console.log(`   Services found: ${serviceSnapshot.size}`);
      
      if (serviceSnapshot.size > 0) {
        serviceSnapshot.forEach((serviceDoc, index) => {
          const serviceData = serviceDoc.data();
          console.log(`     ${index + 1}. ${serviceData.name || serviceData.title || 'Unnamed Service'} - ₹${serviceData.price || 'N/A'}`);
        });
      } else {
        console.log(`     ❌ No services found for this shop`);
      }
      
      console.log("");
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugShopData();