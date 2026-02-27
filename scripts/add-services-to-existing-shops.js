// Simple script to add services to existing shops
// Run this with: node scripts/add-services-to-existing-shops.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } = require('firebase/firestore');

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

// Simple service data for each shop
const shopServices = [
  {
    email: "vishwas.electric.amravati@gmail.com",
    services: [
      { name: "Electrical Wiring", price: 400, duration: "2 hours" },
      { name: "Fan Installation", price: 200, duration: "30 min" },
      { name: "Switch Board Repair", price: 300, duration: "1 hour" }
    ]
  },
  {
    email: "kiran.plumbing.amravati@gmail.com",
    services: [
      { name: "Pipe Repair", price: 250, duration: "1 hour" },
      { name: "Tap Installation", price: 150, duration: "30 min" },
      { name: "Water Heater Repair", price: 500, duration: "2 hours" }
    ]
  },
  {
    email: "rahul.carpenter.amravati@gmail.com",
    services: [
      { name: "Furniture Repair", price: 300, duration: "2 hours" },
      { name: "Door Installation", price: 1000, duration: "3 hours" },
      { name: "Window Repair", price: 500, duration: "1.5 hours" }
    ]
  },
  {
    email: "priya.salon.amravati@gmail.com",
    services: [
      { name: "Haircut", price: 200, duration: "45 min" },
      { name: "Hair Color", price: 600, duration: "2 hours" },
      { name: "Facial", price: 400, duration: "1 hour" }
    ]
  },
  {
    email: "amit.painter.amravati@gmail.com",
    services: [
      { name: "Wall Painting", price: 20, duration: "per sq ft" },
      { name: "Interior Painting", price: 25, duration: "per sq ft" },
      { name: "Exterior Painting", price: 30, duration: "per sq ft" }
    ]
  },
  {
    email: "sunita.cleaning.amravati@gmail.com",
    services: [
      { name: "House Cleaning", price: 600, duration: "3 hours" },
      { name: "Deep Cleaning", price: 1200, duration: "5 hours" },
      { name: "Office Cleaning", price: 800, duration: "4 hours" }
    ]
  },
  {
    email: "rajesh.ac.amravati@gmail.com",
    services: [
      { name: "AC Service", price: 400, duration: "1 hour" },
      { name: "AC Installation", price: 1200, duration: "2 hours" },
      { name: "Gas Refill", price: 700, duration: "45 min" }
    ]
  },
  {
    email: "vikas.mobile.amravati@gmail.com",
    services: [
      { name: "Screen Replacement", price: 2000, duration: "2 hours" },
      { name: "Battery Replacement", price: 1500, duration: "1 hour" },
      { name: "Software Issues", price: 800, duration: "1.5 hours" }
    ]
  },
  {
    email: "anil.pest.amravati@gmail.com",
    services: [
      { name: "Cockroach Control", price: 800, duration: "2 hours" },
      { name: "Termite Treatment", price: 2000, duration: "4 hours" },
      { name: "Mosquito Control", price: 600, duration: "1.5 hours" }
    ]
  },
  {
    email: "pravin.computer.amravati@gmail.com",
    services: [
      { name: "PC Repair", price: 1000, duration: "2 hours" },
      { name: "Laptop Repair", price: 1500, duration: "3 hours" },
      { name: "Software Installation", price: 500, duration: "1 hour" }
    ]
  }
];

async function addServicesToShop(shopData) {
  try {
    console.log(`\n🔍 Looking for shop with email: ${shopData.email}`);
    
    // Find the shop by email
    const q = query(collection(db, "shop"), where("email", "==", shopData.email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`❌ Shop with email ${shopData.email} not found`);
      return { success: false, email: shopData.email, reason: 'not_found' };
    }
    
    const shopDoc = querySnapshot.docs[0];
    const shopId = shopDoc.id;
    const shopInfo = shopDoc.data();
    
    console.log(`✅ Found shop: ${shopInfo.shopName} (ID: ${shopId})`);
    
    // Check if services already exist
    const serviceQuery = query(collection(db, "services"), where("shopId", "==", shopId));
    const serviceSnapshot = await getDocs(serviceQuery);
    
    if (serviceSnapshot.size > 0) {
      console.log(`⚠️  Services already exist (${serviceSnapshot.size} found). Skipping...`);
      return { success: false, email: shopData.email, reason: 'services_exist' };
    }
    
    // Add services
    console.log(`📝 Adding ${shopData.services.length} services...`);
    for (const service of shopData.services) {
      await addDoc(collection(db, "services"), {
        ...service,
        shopId: shopId,
        shopName: shopInfo.shopName,
        isActive: true,
        createdAt: new Date().toISOString()
      });
    }
    
    console.log(`✅ Successfully added ${shopData.services.length} services`);
    return { success: true, email: shopData.email, shopId: shopId, serviceCount: shopData.services.length };
    
  } catch (error) {
    console.error(`❌ Error for ${shopData.email}:`, error.message);
    return { success: false, email: shopData.email, reason: error.message };
  }
}

async function addAllServices() {
  console.log("🚀 Starting to add services to existing shops...\n");
  
  const results = [];
  
  for (let i = 0; i < shopServices.length; i++) {
    const result = await addServicesToShop(shopServices[i]);
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 SERVICES ADDITION SUMMARY");
  console.log("=".repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successfully added services: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total processed: ${results.length}`);
  
  if (successful > 0) {
    console.log("\n✨ Services have been added to Firebase!");
    console.log("📱 Services will now appear in the shop details screen");
  }
  
  process.exit(0);
}

// Run the function
addAllServices().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});