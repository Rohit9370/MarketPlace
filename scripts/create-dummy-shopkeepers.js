const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
require('dotenv').config();

// Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Dummy shopkeepers data
const dummyShopkeepers = [
  {
    email: 'salon.beauty@yopmail.com',
    password: 'password123',
    ownerName: 'Rajesh Kumar',
    shopName: 'Royal Beauty Salon',
    shopCategory: 'Salon',
    contactNumber: '9876543210',
    phone: '9876543210',
    shopAddress: 'Shop No. 12, MG Road, Jabalpur',
    shopCity: 'Jabalpur',
    shopState: 'Madhya Pradesh',
    shopPincode: '482001',
    shopLocation: { latitude: 23.1815, longitude: 79.9864 },
    openingTime: '09:00 AM',
    closingTime: '08:00 PM',
    shopLogo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    services: [
      { name: 'Haircut', price: 150, duration: '30 min' },
      { name: 'Hair Color', price: 800, duration: '90 min' },
      { name: 'Facial', price: 500, duration: '45 min' }
    ]
  },
  {
    email: 'plumber.services@yopmail.com',
    password: 'password123',
    ownerName: 'Amit Sharma',
    shopName: 'Quick Fix Plumbing',
    shopCategory: 'Plumber',
    contactNumber: '9876543211',
    phone: '9876543211',
    shopAddress: 'Near Railway Station, Civil Lines, Jabalpur',
    shopCity: 'Jabalpur',
    shopState: 'Madhya Pradesh',
    shopPincode: '482001',
    shopLocation: { latitude: 23.1685, longitude: 79.9339 },
    openingTime: '08:00 AM',
    closingTime: '07:00 PM',
    shopLogo: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    services: [
      { name: 'Pipe Repair', price: 300, duration: '1 hour' },
      { name: 'Tap Installation', price: 200, duration: '30 min' },
      { name: 'Bathroom Fitting', price: 1500, duration: '3 hours' }
    ]
  },
  {
    email: 'electrician.pro@yopmail.com',
    password: 'password123',
    ownerName: 'Suresh Patel',
    shopName: 'Bright Electricals',
    shopCategory: 'Electrician',
    contactNumber: '9876543212',
    phone: '9876543212',
    shopAddress: 'Gole Bazar, Jabalpur',
    shopCity: 'Jabalpur',
    shopState: 'Madhya Pradesh',
    shopPincode: '482002',
    shopLocation: { latitude: 23.1765, longitude: 79.9513 },
    openingTime: '07:00 AM',
    closingTime: '09:00 PM',
    shopLogo: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    services: [
      { name: 'Wiring', price: 500, duration: '2 hours' },
      { name: 'Fan Installation', price: 250, duration: '45 min' },
      { name: 'AC Repair', price: 800, duration: '1.5 hours' }
    ]
  },
  {
    email: 'carpenter.wood@yopmail.com',
    password: 'password123',
    ownerName: 'Ramesh Verma',
    shopName: 'Wood Craft Carpentry',
    shopCategory: 'Carpenter',
    contactNumber: '9876543213',
    phone: '9876543213',
    shopAddress: 'Napier Town, Jabalpur',
    shopCity: 'Jabalpur',
    shopState: 'Madhya Pradesh',
    shopPincode: '482001',
    shopLocation: { latitude: 23.1645, longitude: 79.9462 },
    openingTime: '08:00 AM',
    closingTime: '06:00 PM',
    shopLogo: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    services: [
      { name: 'Furniture Repair', price: 400, duration: '2 hours' },
      { name: 'Door Installation', price: 1200, duration: '3 hours' },
      { name: 'Custom Furniture', price: 5000, duration: '1 week' }
    ]
  },
  {
    email: 'mechanic.auto@yopmail.com',
    password: 'password123',
    ownerName: 'Vikram Singh',
    shopName: 'Auto Care Garage',
    shopCategory: 'Mechanic',
    contactNumber: '9876543214',
    phone: '9876543214',
    shopAddress: 'Wright Town, Jabalpur',
    shopCity: 'Jabalpur',
    shopState: 'Madhya Pradesh',
    shopPincode: '482002',
    shopLocation: { latitude: 23.1595, longitude: 79.9372 },
    openingTime: '07:00 AM',
    closingTime: '08:00 PM',
    shopLogo: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    services: [
      { name: 'Oil Change', price: 600, duration: '30 min' },
      { name: 'Brake Service', price: 1200, duration: '1 hour' },
      { name: 'Engine Repair', price: 3000, duration: '4 hours' }
    ]
  },
  {
    email: 'painter.colors@yopmail.com',
    password: 'password123',
    ownerName: 'Manoj Gupta',
    shopName: 'Rainbow Painters',
    shopCategory: 'Painter',
    contactNumber: '9876543215',
    phone: '9876543215',
    shopAddress: 'Vijay Nagar, Jabalpur',
    shopCity: 'Jabalpur',
    shopState: 'Madhya Pradesh',
    shopPincode: '482002',
    shopLocation: { latitude: 23.1525, longitude: 79.9285 },
    openingTime: '08:00 AM',
    closingTime: '06:00 PM',
    shopLogo: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    services: [
      { name: 'Wall Painting', price: 15, duration: 'per sq ft' },
      { name: 'Exterior Painting', price: 20, duration: 'per sq ft' },
      { name: 'Texture Painting', price: 25, duration: 'per sq ft' }
    ]
  },
  {
    email: 'cleaning.home@yopmail.com',
    password: 'password123',
    ownerName: 'Priya Sharma',
    shopName: 'Sparkle Clean Services',
    shopCategory: 'Cleaning',
    contactNumber: '9876543216',
    phone: '9876543216',
    shopAddress: 'Madan Mahal, Jabalpur',
    shopCity: 'Jabalpur',
    shopState: 'Madhya Pradesh',
    shopPincode: '482001',
    shopLocation: { latitude: 23.1455, longitude: 79.9198 },
    openingTime: '07:00 AM',
    closingTime: '07:00 PM',
    shopLogo: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    services: [
      { name: 'House Cleaning', price: 800, duration: '2 hours' },
      { name: 'Deep Cleaning', price: 1500, duration: '4 hours' },
      { name: 'Sofa Cleaning', price: 500, duration: '1 hour' }
    ]
  },
  {
    email: 'ac.repair@yopmail.com',
    password: 'password123',
    ownerName: 'Anil Kumar',
    shopName: 'Cool Air AC Services',
    shopCategory: 'AC Repair',
    contactNumber: '9876543217',
    phone: '9876543217',
    shopAddress: 'Gorakhpur, Jabalpur',
    shopCity: 'Jabalpur',
    shopState: 'Madhya Pradesh',
    shopPincode: '482003',
    shopLocation: { latitude: 23.1385, longitude: 79.9111 },
    openingTime: '08:00 AM',
    closingTime: '08:00 PM',
    shopLogo: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    services: [
      { name: 'AC Service', price: 500, duration: '1 hour' },
      { name: 'AC Installation', price: 1500, duration: '2 hours' },
      { name: 'Gas Refill', price: 800, duration: '45 min' }
    ]
  }
];

async function createDummyShopkeepers() {
  console.log('🚀 Starting to create dummy shopkeepers...\n');

  for (const shopkeeper of dummyShopkeepers) {
    try {
      console.log(`Creating: ${shopkeeper.shopName} (${shopkeeper.email})`);
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        shopkeeper.email,
        shopkeeper.password
      );

      // Prepare data for Firestore
      const { password, services, ...shopData } = shopkeeper;
      const firestoreData = {
        ...shopData,
        uid: userCredential.user.uid,
        role: 'shopkeeper',
        emailVerified: true, // Auto-verify for dummy accounts
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'shop'), firestoreData);
      console.log(`✅ Created shopkeeper with ID: ${docRef.id}`);

      // Add services
      if (services && services.length > 0) {
        for (const service of services) {
          await addDoc(collection(db, 'services'), {
            ...service,
            shopId: docRef.id,
            shopkeeperId: userCredential.user.uid,
            shopName: shopkeeper.shopName,
            isActive: true,
            createdAt: new Date().toISOString()
          });
        }
        console.log(`   Added ${services.length} services`);
      }

      console.log('');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  Email already exists: ${shopkeeper.email}`);
      } else {
        console.error(`❌ Error creating ${shopkeeper.email}:`, error.message);
      }
      console.log('');
    }
  }

  console.log('✨ Done! All dummy shopkeepers created.');
  console.log('\n📧 Login credentials:');
  console.log('Email: any of the above @yopmail.com emails');
  console.log('Password: password123');
  process.exit(0);
}

createDummyShopkeepers();
