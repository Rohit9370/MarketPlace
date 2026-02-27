/**
 * Script to create admin user in Firebase Auth and Firestore
 * Run this script once to set up the admin account
 * 
 * Usage: node scripts/create-admin-user.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase configuration (same as app/Services/firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyCMWNelSOq6Zf2iqWmW8pc9EZRJIcRYyCw",
  authDomain: "serviceprovider-33f80.firebaseapp.com",
  databaseURL: "https://serviceprovider-33f80-default-rtdb.firebaseio.com",
  projectId: "serviceprovider-33f80",
  storageBucket: "serviceprovider-33f80.firebasestorage.app",
  messagingSenderId: "735847697694",
  appId: "1:735847697694:web:f58a5f10a026375b1f8d0f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin credentials
const ADMIN_EMAIL = 'admin@growwithus.com';
const ADMIN_PASSWORD = 'admin123';

async function createAdminUser() {
  try {
    console.log('🚀 Starting admin user creation...\n');

    // Step 1: Create user in Firebase Auth
    console.log('📝 Creating admin user in Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );
    
    const user = userCredential.user;
    console.log('✅ Admin user created in Firebase Auth');
    console.log('   UID:', user.uid);
    console.log('   Email:', user.email);

    // Step 2: Create admin document in Firestore
    console.log('\n📝 Creating admin document in Firestore...');
    const adminData = {
      uid: user.uid,
      email: ADMIN_EMAIL,
      name: 'Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const docRef = await addDoc(collection(db, 'admin'), adminData);
    console.log('✅ Admin document created in Firestore');
    console.log('   Document ID:', docRef.id);

    console.log('\n🎉 Admin user setup complete!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('\n✨ You can now login with these credentials in the app.');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n⚠️  Admin user already exists in Firebase Auth.');
      console.log('   If you need to reset, delete the user from Firebase Console first.');
    } else if (error.code === 'auth/weak-password') {
      console.log('\n⚠️  Password is too weak. Use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n⚠️  Invalid email format.');
    }
    
    process.exit(1);
  }
}

// Run the script
createAdminUser();
