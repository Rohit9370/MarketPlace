/**
 * Test script to verify admin login works
 * Run: node scripts/test-admin-login.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration
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

async function testAdminLogin() {
  try {
    console.log('🧪 Testing Admin Login...\n');

    // Step 1: Try to login with Firebase Auth
    console.log('📝 Step 1: Authenticating with Firebase Auth...');
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authentication successful!');
    console.log('   UID:', userCredential.user.uid);
    console.log('   Email:', userCredential.user.email);
    console.log();

    // Step 2: Check if admin document exists in Firestore
    console.log('📝 Step 2: Checking admin document in Firestore...');
    const adminQuery = query(collection(db, 'admin'), where('uid', '==', userCredential.user.uid));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (adminSnapshot.empty) {
      console.log('❌ ERROR: Admin document not found in Firestore!');
      console.log('   The user exists in Firebase Auth but not in Firestore.');
      console.log('   This should not happen. Try running create-admin-user.js again.');
      process.exit(1);
    }

    const adminData = adminSnapshot.docs[0].data();
    console.log('✅ Admin document found!');
    console.log('   Document ID:', adminSnapshot.docs[0].id);
    console.log('   Name:', adminData.name);
    console.log('   Role:', adminData.role);
    console.log('   Email:', adminData.email);
    console.log('   Active:', adminData.isActive);
    console.log();

    // Step 3: Verify role
    console.log('📝 Step 3: Verifying admin role...');
    if (adminData.role === 'admin') {
      console.log('✅ Role is correct: admin');
    } else {
      console.log('❌ ERROR: Role is incorrect:', adminData.role);
      process.exit(1);
    }
    console.log();

    console.log('🎉 All tests passed!');
    console.log();
    console.log('✨ Admin login is working correctly.');
    console.log('   You can now login to the app with:');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log();

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error();
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 Solution: Run the create-admin-user.js script first');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Solution: Check the password is correct (admin123)');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 Solution: Check the email format');
    }
    
    process.exit(1);
  }
}

// Run the test
testAdminLogin();
