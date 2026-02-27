// Script to update existing Amravati vendor services in Firebase
// Run this with: node scripts/update-vendor-services.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } = require('firebase/firestore');

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

// Updated Amravati vendor services data
const vendorServices = [
  {
    email: "vishwas.electric.amravati@gmail.com",
    services: [
      { name: "Wiring", price: 400, duration: "2 hours", title: "Electrical Wiring", description: "Professional electrical wiring installation and repair" },
      { name: "Fan Installation", price: 200, duration: "30 min", title: "Fan Installation", description: "Ceiling and table fan installation services" },
      { name: "Switch Board Repair", price: 300, duration: "1 hour", title: "Switch Board Repair", description: "Repair and maintenance of electrical switchboards" },
      { name: "Light Installation", price: 150, duration: "45 min", title: "Light Installation", description: "LED and traditional light fitting installation" }
    ]
  },
  {
    email: "kiran.plumbing.amravati@gmail.com",
    services: [
      { name: "Pipe Repair", price: 250, duration: "1 hour", title: "Pipe Repair", description: "Leakage repair and pipe replacement services" },
      { name: "Tap Installation", price: 150, duration: "30 min", title: "Tap Installation", description: "Installation and repair of taps and fixtures" },
      { name: "Water Heater Repair", price: 500, duration: "2 hours", title: "Water Heater Repair", description: "Repair and maintenance of water heaters" },
      { name: "Bathroom Fitting", price: 1200, duration: "4 hours", title: "Bathroom Fitting", description: "Complete bathroom fitting and installation" }
    ]
  },
  {
    email: "rahul.carpenter.amravati@gmail.com",
    services: [
      { name: "Furniture Repair", price: 300, duration: "2 hours", title: "Furniture Repair", description: "Repair and restoration of wooden furniture" },
      { name: "Door Installation", price: 1000, duration: "3 hours", title: "Door Installation", description: "Installation of doors and frames" },
      { name: "Window Repair", price: 500, duration: "1.5 hours", title: "Window Repair", description: "Repair and maintenance of windows" },
      { name: "Custom Furniture", price: 3000, duration: "5 days", title: "Custom Furniture", description: "Custom made furniture according to requirements" }
    ]
  },
  {
    email: "priya.salon.amravati@gmail.com",
    services: [
      { name: "Haircut", price: 200, duration: "45 min", title: "Haircut", description: "Professional haircutting services" },
      { name: "Hair Color", price: 600, duration: "2 hours", title: "Hair Coloring", description: "Premium hair coloring and highlights" },
      { name: "Facial", price: 400, duration: "1 hour", title: "Facial Treatment", description: "Deep cleansing facial treatments" },
      { name: "Manicure", price: 150, duration: "30 min", title: "Manicure", description: "Nail care and polish services" }
    ]
  },
  {
    email: "amit.painter.amravati@gmail.com",
    services: [
      { name: "Wall Painting", price: 20, duration: "per sq ft", title: "Wall Painting", description: "Interior and exterior wall painting" },
      { name: "Interior Painting", price: 25, duration: "per sq ft", title: "Interior Painting", description: "Premium interior painting services" },
      { name: "Exterior Painting", price: 30, duration: "per sq ft", title: "Exterior Painting", description: "Weather-resistant exterior painting" },
      { name: "Ceiling Painting", price: 15, duration: "per sq ft", title: "Ceiling Painting", description: "Ceiling and cornice painting" }
    ]
  },
  {
    email: "sunita.cleaning.amravati@gmail.com",
    services: [
      { name: "House Cleaning", price: 600, duration: "3 hours", title: "House Cleaning", description: "Complete house cleaning service" },
      { name: "Deep Cleaning", price: 1200, duration: "5 hours", title: "Deep Cleaning", description: "Thorough deep cleaning of home" },
      { name: "Office Cleaning", price: 800, duration: "4 hours", title: "Office Cleaning", description: "Professional office cleaning service" },
      { name: "Sofa Cleaning", price: 400, duration: "2 hours", title: "Sofa Cleaning", description: "Professional sofa and upholstery cleaning" }
    ]
  },
  {
    email: "rajesh.ac.amravati@gmail.com",
    services: [
      { name: "AC Service", price: 400, duration: "1 hour", title: "AC Service", description: "Regular air conditioner maintenance" },
      { name: "AC Installation", price: 1200, duration: "2 hours", title: "AC Installation", description: "New AC installation services" },
      { name: "Gas Refill", price: 700, duration: "45 min", title: "Gas Refill", description: "Refrigerant gas refill for AC units" },
      { name: "AC Repair", price: 800, duration: "2 hours", title: "AC Repair", description: "Repair of AC units and parts" }
    ]
  },
  {
    email: "vikas.mobile.amravati@gmail.com",
    services: [
      { name: "Screen Replacement", price: 2000, duration: "2 hours", title: "Screen Replacement", description: "Mobile screen replacement services" },
      { name: "Battery Replacement", price: 1500, duration: "1 hour", title: "Battery Replacement", description: "Mobile battery replacement" },
      { name: "Software Issues", price: 800, duration: "1.5 hours", title: "Software Repair", description: "Software troubleshooting and fixes" },
      { name: "Charging Problem", price: 500, duration: "45 min", title: "Charging Repair", description: "Fix charging port and related issues" }
    ]
  },
  {
    email: "anil.pest.amravati@gmail.com",
    services: [
      { name: "Cockroach Control", price: 800, duration: "2 hours", title: "Cockroach Control", description: "Effective cockroach elimination" },
      { name: "Termite Treatment", price: 2000, duration: "4 hours", title: "Termite Treatment", description: "Termite control and prevention" },
      { name: "Mosquito Control", price: 600, duration: "1.5 hours", title: "Mosquito Control", description: "Mosquito control and prevention" },
      { name: "General Pest Control", price: 1000, duration: "3 hours", title: "General Pest Control", description: "General pest control services" }
    ]
  },
  {
    email: "pravin.computer.amravati@gmail.com",
    services: [
      { name: "PC Repair", price: 1000, duration: "2 hours", title: "PC Repair", description: "Desktop computer repair services" },
      { name: "Laptop Repair", price: 1500, duration: "3 hours", title: "Laptop Repair", description: "Laptop repair and maintenance" },
      { name: "Software Installation", price: 500, duration: "1 hour", title: "Software Installation", description: "OS and software installation" },
      { name: "Data Recovery", price: 2500, duration: "4 hours", title: "Data Recovery", description: "Data recovery from damaged drives" }
    ]
  }
];

async function updateVendorServices(vendorData, index) {
  try {
    console.log(`\n📋 Updating services for: ${vendorData.email}`);
    
    // Find the shop by email
    const q = query(collection(db, "shop"), where("email", "==", vendorData.email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`❌ Vendor with email ${vendorData.email} not found in database`);
      return { success: false, reason: 'not_found', email: vendorData.email };
    }
    
    const shopDoc = querySnapshot.docs[0];
    const shopId = shopDoc.id;
    const shopData = shopDoc.data();
    
    console.log(`✅ Found vendor: ${shopData.shopName} (ID: ${shopId})`);
    
    // Delete existing services for this shop
    console.log(`🗑️  Deleting existing services for ${shopData.shopName}...`);
    
    // Query all services for this shop
    const serviceQuery = query(collection(db, "services"), where("shopId", "==", shopId));
    const serviceSnapshot = await getDocs(serviceQuery);
    
    // Delete each service document
    for (const serviceDoc of serviceSnapshot.docs) {
      await deleteDoc(doc(db, "services", serviceDoc.id));
    }
    
    console.log(`✅ Deleted ${serviceSnapshot.size} existing services`);
    
    // Add new services
    if (vendorData.services && vendorData.services.length > 0) {
      for (const service of vendorData.services) {
        await addDoc(collection(db, "services"), {
          ...service,
          shopId: shopId,
          shopName: shopData.shopName,
          isActive: true,
          createdAt: new Date().toISOString()
        });
      }
      console.log(`📝 Added ${vendorData.services.length} new services`);
    }
    
    return {
      success: true,
      email: vendorData.email,
      shopId: shopId
    };
  } catch (error) {
    console.error(`❌ Error updating services for ${vendorData.email}:`, error.message);
    return { 
      success: false, 
      email: vendorData.email, 
      reason: error.message 
    };
  }
}

// Function to delete a document (helper function)


// Function to update all Amravati vendor services
async function updateAllVendorServices() {
  console.log("🚀 Starting to update Amravati vendor services...\n");
  
  const results = [];
  
  for (let i = 0; i < vendorServices.length; i++) {
    const result = await updateVendorServices(vendorServices[i], i);
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log("\n" + "=".repeat(70));
  console.log("📊 AMRAVATI VENDOR SERVICES UPDATE SUMMARY");
  console.log("=".repeat(70));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successfully updated: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total processed: ${results.length}`);
  
  if (successful > 0) {
    console.log("\n✨ Amravati vendor services have been updated in Firebase!");
    console.log("📱 Services will now appear correctly in the app for users");
  } else {
    console.log("\n❌ No services were updated. Check the errors above.");
  }
  
  process.exit(0);
}

// Run the function
updateAllVendorServices().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});