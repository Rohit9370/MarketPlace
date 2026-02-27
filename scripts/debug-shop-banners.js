// Debug script to check shop banner data
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function debugShopBanners() {
  try {
    console.log("🔍 Debugging shop banner data...\n");
    
    // Get all shops
    const shopsSnapshot = await getDocs(collection(db, "shop"));
    console.log(`📊 Found ${shopsSnapshot.size} shops in database\n`);
    
    let hasBannerCount = 0;
    let noBannerCount = 0;
    
    for (const shopDoc of shopsSnapshot.docs) {
      const shopData = shopDoc.data();
      const shopId = shopDoc.id;
      
      console.log(`🏪 Shop: ${shopData.shopName || 'Unnamed'}`);
      console.log(`   Document ID: ${shopId}`);
      console.log(`   Email: ${shopData.email || 'N/A'}`);
      console.log(`   Category: ${shopData.shopCategory || 'N/A'}`);
      console.log(`   Status: ${shopData.isActive !== false ? 'Active' : 'Inactive'}`);
      
      // Check banner data
      if (shopData.shopBanner) {
        console.log(`   🖼️  Banner: ${shopData.shopBanner}`);
        console.log(`   ✅ Has banner URL`);
        hasBannerCount++;
      } else {
        console.log(`   ❌ No banner`);
        noBannerCount++;
      }
      
      // Check if banner URL is valid format
      if (shopData.shopBanner && shopData.shopBanner.startsWith('http')) {
        console.log(`   ✅ Valid URL format`);
      } else if (shopData.shopBanner) {
        console.log(`   ⚠️  Invalid URL format: ${shopData.shopBanner.substring(0, 50)}...`);
      }
      
      console.log("");
    }
    
    console.log("📊 SUMMARY:");
    console.log(`✅ Shops with banners: ${hasBannerCount}`);
    console.log(`❌ Shops without banners: ${noBannerCount}`);
    console.log(`📊 Total shops: ${shopsSnapshot.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugShopBanners();