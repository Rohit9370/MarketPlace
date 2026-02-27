import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import Typography from './Comoponents/Typography';
import { BorderRadius, Colors, Spacing } from './constants/designSystem';
import { db } from './Services/firebase';

// Amravati vendor data
const amravatiVendors = [
  {
    shopName: "Shree Sai Electric Works",
    ownerName: "Vishwas Deshmukh",
    email: "vishwas.electric.amravati@gmail.com",
    contactNumber: "9422345678",
    phone: "9422345678",
    shopAddress: "Opposite Bus Stand, Civil Lines, Amravati",
    shopCity: "Amravati",
    shopState: "Maharashtra",
    shopPincode: "444601",
    shopLocation: { latitude: 20.9320, longitude: 77.7523 },
    shopCategory: "Electrician",
    openingTime: "08:00 AM",
    closingTime: "08:00 PM",
    shopLogo: "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=400&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=800&h=300&fit=crop",
    shopImages: [
      "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=400&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&fit=crop",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&fit=crop"
    ],
    services: [
      { name: "Wiring", price: 400, duration: "2 hours" },
      { name: "Fan Installation", price: 200, duration: "30 min" },
      { name: "Switch Board Repair", price: 300, duration: "1 hour" },
      { name: "Light Installation", price: 150, duration: "45 min" }
    ]
  },
  {
    shopName: "Kiran Plumbing Services",
    ownerName: "Sunil Kadam",
    email: "kiran.plumbing.amravati@gmail.com",
    contactNumber: "9834567890",
    phone: "9834567890",
    shopAddress: "Station Road, Amravati",
    shopCity: "Amravati",
    shopState: "Maharashtra",
    shopPincode: "444601",
    shopLocation: { latitude: 20.9250, longitude: 77.7450 },
    shopCategory: "Plumbing",
    openingTime: "07:00 AM",
    closingTime: "07:00 PM",
    shopLogo: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=800&h=300&fit=crop",
    shopImages: [
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&fit=crop",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&fit=crop"
    ],
    services: [
      { name: "Pipe Repair", price: 250, duration: "1 hour" },
      { name: "Tap Installation", price: 150, duration: "30 min" },
      { name: "Water Heater Repair", price: 500, duration: "2 hours" },
      { name: "Bathroom Fitting", price: 1200, duration: "4 hours" }
    ]
  },
  {
    shopName: "Rajput Wood Works",
    ownerName: "Rahul Rajput",
    email: "rahul.carpenter.amravati@gmail.com",
    contactNumber: "8876543210",
    phone: "8876543210",
    shopAddress: "New Market, Amravati",
    shopCity: "Amravati",
    shopState: "Maharashtra",
    shopPincode: "444601",
    shopLocation: { latitude: 20.9180, longitude: 77.7500 },
    shopCategory: "Carpenter",
    openingTime: "08:00 AM",
    closingTime: "06:00 PM",
    shopLogo: "https://images.unsplash.com/photo-1504148455328-c37660d64553?w=400&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=800&h=300&fit=crop",
    shopImages: [
      "https://images.unsplash.com/photo-1504148455328-c37660d64553?w=400&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&fit=crop",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&fit=crop"
    ],
    services: [
      { name: "Furniture Repair", price: 300, duration: "2 hours" },
      { name: "Door Installation", price: 1000, duration: "3 hours" },
      { name: "Window Repair", price: 500, duration: "1.5 hours" },
      { name: "Custom Furniture", price: 3000, duration: "5 days" }
    ]
  },
  {
    shopName: "Royal Beauty Parlour",
    ownerName: "Priya Joshi",
    email: "priya.salon.amravati@gmail.com",
    contactNumber: "7766554433",
    phone: "7766554433",
    shopAddress: "MG Road, Amravati",
    shopCity: "Amravati",
    shopState: "Maharashtra",
    shopPincode: "444601",
    shopLocation: { latitude: 20.9300, longitude: 77.7550 },
    shopCategory: "Home Salon",
    openingTime: "09:00 AM",
    closingTime: "08:00 PM",
    shopLogo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=800&h=300&fit=crop",
    shopImages: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&fit=crop",
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&fit=crop",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&fit=crop"
    ],
    services: [
      { name: "Haircut", price: 200, duration: "45 min" },
      { name: "Hair Color", price: 600, duration: "2 hours" },
      { name: "Facial", price: 400, duration: "1 hour" },
      { name: "Manicure", price: 150, duration: "30 min" }
    ]
  },
  {
    shopName: "Sharma Painter Works",
    ownerName: "Amit Sharma",
    email: "amit.painter.amravati@gmail.com",
    contactNumber: "9422112233",
    phone: "9422112233",
    shopAddress: "Railway Colony, Amravati",
    shopCity: "Amravati",
    shopState: "Maharashtra",
    shopPincode: "444601",
    shopLocation: { latitude: 20.9200, longitude: 77.7400 },
    shopCategory: "Painter",
    openingTime: "08:00 AM",
    closingTime: "06:00 PM",
    shopLogo: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=800&h=300&fit=crop",
    shopImages: [
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&fit=crop",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&fit=crop"
    ],
    services: [
      { name: "Wall Painting", price: 20, duration: "per sq ft" },
      { name: "Interior Painting", price: 25, duration: "per sq ft" },
      { name: "Exterior Painting", price: 30, duration: "per sq ft" },
      { name: "Ceiling Painting", price: 15, duration: "per sq ft" }
    ]
  },
  {
    shopName: "Clean Home Services",
    ownerName: "Sunita Patil",
    email: "sunita.cleaning.amravati@gmail.com",
    contactNumber: "8423456789",
    phone: "8423456789",
    shopAddress: "Gandhi Nagar, Amravati",
    shopCity: "Amravati",
    shopState: "Maharashtra",
    shopPincode: "444601",
    shopLocation: { latitude: 20.9250, longitude: 77.7600 },
    shopCategory: "Cleaning",
    openingTime: "07:00 AM",
    closingTime: "07:00 PM",
    shopLogo: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=800&h=300&fit=crop",
    shopImages: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&fit=crop",
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&fit=crop",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&fit=crop"
    ],
    services: [
      { name: "House Cleaning", price: 600, duration: "3 hours" },
      { name: "Deep Cleaning", price: 1200, duration: "5 hours" },
      { name: "Office Cleaning", price: 800, duration: "4 hours" },
      { name: "Sofa Cleaning", price: 400, duration: "2 hours" }
    ]
  },
  {
    shopName: "AC Master Repair",
    ownerName: "Rajesh Wagh",
    email: "rajesh.ac.amravati@gmail.com",
    contactNumber: "9422987654",
    phone: "9422987654",
    shopAddress: "Chhatrapati Square, Amravati",
    shopCity: "Amravati",
    shopState: "Maharashtra",
    shopPincode: "444601",
    shopLocation: { latitude: 20.9350, longitude: 77.7480 },
    shopCategory: "AC Repair",
    openingTime: "08:00 AM",
    closingTime: "08:00 PM",
    shopLogo: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=800&h=300&fit=crop",
    shopImages: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&fit=crop",
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&fit=crop",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&fit=crop"
    ],
    services: [
      { name: "AC Service", price: 400, duration: "1 hour" },
      { name: "AC Installation", price: 1200, duration: "2 hours" },
      { name: "Gas Refill", price: 700, duration: "45 min" },
      { name: "AC Repair", price: 800, duration: "2 hours" }
    ]
  },
  {
    shopName: "Mobile Zone Repair",
    ownerName: "Vikas More",
    email: "vikas.mobile.amravati@gmail.com",
    contactNumber: "9834123456",
    phone: "9834123456",
    shopAddress: "Subhash Chowk, Amravati",
    shopCity: "Amravati",
    shopState: "Maharashtra",
    shopPincode: "444601",
    shopLocation: { latitude: 20.9280, longitude: 77.7520 },
    shopCategory: "Mobile Repair",
    openingTime: "09:00 AM",
    closingTime: "08:00 PM",
    shopLogo: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=800&h=300&fit=crop",
    shopImages: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&fit=crop",
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&fit=crop",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&fit=crop"
    ],
    services: [
      { name: "Screen Replacement", price: 2000, duration: "2 hours" },
      { name: "Battery Replacement", price: 1500, duration: "1 hour" },
      { name: "Software Issues", price: 800, duration: "1.5 hours" },
      { name: "Charging Problem", price: 500, duration: "45 min" }
    ]
  },
  {
    shopName: "Quick Pest Control",
    ownerName: "Anil Meshram",
    email: "anil.pest.amravati@gmail.com",
    contactNumber: "9422567890",
    phone: "9422567890",
    shopAddress: "Station Area, Amravati",
    shopCity: "Amravati",
    shopState: "Maharashtra",
    shopPincode: "444601",
    shopLocation: { latitude: 20.9220, longitude: 77.7460 },
    shopCategory: "Pest Control",
    openingTime: "08:00 AM",
    closingTime: "06:00 PM",
    shopLogo: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=800&h=300&fit=crop",
    shopImages: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&fit=crop",
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&fit=crop",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&fit=crop"
    ],
    services: [
      { name: "Cockroach Control", price: 800, duration: "2 hours" },
      { name: "Termite Treatment", price: 2000, duration: "4 hours" },
      { name: "Mosquito Control", price: 600, duration: "1.5 hours" },
      { name: "General Pest Control", price: 1000, duration: "3 hours" }
    ]
  },
  {
    shopName: "Sai Computer Solutions",
    ownerName: "Pravin Shinde",
    email: "pravin.computer.amravati@gmail.com",
    contactNumber: "9834987654",
    phone: "9834987654",
    shopAddress: "IT Park, Amravati",
    shopCity: "Amravati",
    shopState: "Maharashtra",
    shopPincode: "444601",
    shopLocation: { latitude: 20.9150, longitude: 77.7580 },
    shopCategory: "Computer Repair",
    openingTime: "10:00 AM",
    closingTime: "07:00 PM",
    shopLogo: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1593757711882-1b7ce0c53e5d?w=800&h=300&fit=crop",
    shopImages: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&fit=crop",
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&fit=crop",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&fit=crop"
    ],
    services: [
      { name: "PC Repair", price: 1000, duration: "2 hours" },
      { name: "Laptop Repair", price: 1500, duration: "3 hours" },
      { name: "Software Installation", price: 500, duration: "1 hour" },
      { name: "Data Recovery", price: 2500, duration: "4 hours" }
    ]
  }
];

const DataGatheringScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [completedCount, setCompletedCount] = useState(0);

  const createVendor = async (vendorData, index) => {
    try {
      console.log(`Processing: ${vendorData.shopName} (${vendorData.contactNumber})`);
      
      // Check if shop already exists by email
      const q = query(collection(db, "shop"), where("email", "==", vendorData.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setProgress(`${index + 1}/${amravatiVendors.length} - ${vendorData.shopName} (Already exists)`);
        setCompletedCount(prev => prev + 1);
        return { success: false, reason: 'already_exists', email: vendorData.email };
      }
      
      // Prepare data for Firestore
      const { services, ...shopData } = vendorData;
      const firestoreData = {
        ...shopData,
        uid: null, // Will be set if we create auth user
        role: "shopkeeper",
        isActive: true,
        emailVerified: true,
        ownerPhoto: vendorData.shopLogo,
        shopBanner: vendorData.shopBanner,
        shopImages: vendorData.shopImages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVerified: true,
        totalReviews: 0,
        rating: 0 // Initially no rating
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "shop"), firestoreData);
      
      console.log(`${index + 1}. ${vendorData.shopName} - Added to database (ID: ${docRef.id})`);
      setProgress(`${index + 1}/${amravatiVendors.length} - ${vendorData.shopName} (Added)`);
      setCompletedCount(prev => prev + 1);
      
      // Add services
      if (services && services.length > 0) {
        for (const service of services) {
          await addDoc(collection(db, "services"), {
            ...service,
            shopId: docRef.id, // Store the document ID of the shop
            shopName: vendorData.shopName,
            isActive: true,
            createdAt: new Date().toISOString()
          });
        }
        console.log(`   Added ${services.length} services`);
      }
      
      return {
        success: true,
        email: vendorData.email,
        docId: docRef.id
      };
    } catch (error) {
      console.error(`Error processing ${vendorData.shopName}:`, error.message);
      setProgress(`${index + 1}/${amravatiVendors.length} - ${vendorData.shopName} (Error)`);
      setCompletedCount(prev => prev + 1);
      return { 
        success: false, 
        email: vendorData.email, 
        reason: error.message 
      };
    }
  };

  const gatherAmravatiVendors = async () => {
    setIsLoading(true);
    setProgress('Starting data gathering...');
    setCompletedCount(0);
    
    const results = [];
    
    for (let i = 0; i < amravatiVendors.length; i++) {
      const result = await createVendor(amravatiVendors[i], i);
      results.push(result);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsLoading(false);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    Alert.alert(
      "Data Gathering Complete!",
      `Successfully added: ${successful}\nAlready existed/Failed: ${failed}\nTotal processed: ${results.length}`,
      [{ text: "OK" }]
    );
    
    setProgress('Complete!');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background.secondary, padding: Spacing[4] }}>
      <View style={{ padding: Spacing[4] }}>
        <Typography variant="heading" weight="bold" style={{ textAlign: 'center', marginBottom: Spacing[4] }}>
          Amravati Vendor Data Gathering
        </Typography>
        
        <View style={{ 
          backgroundColor: Colors.background.primary, 
          padding: Spacing[4], 
          borderRadius: BorderRadius.lg, 
          marginBottom: Spacing[4],
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 4,
            },
          })
        }}>
          <Typography variant="body" style={{ marginBottom: Spacing[4] }}>
            This screen allows you to gather and store Amravati vendor data directly from your mobile device.
          </Typography>
          
          <Typography variant="body" weight="semibold" style={{ marginBottom: Spacing[2] }}>
            Features:
          </Typography>
          <Typography variant="caption" style={{ marginBottom: Spacing[1] }}>• Stores 10+ local vendors in Firebase</Typography>
          <Typography variant="caption" style={{ marginBottom: Spacing[1] }}>• Adds vendor details, location, and services</Typography>
          <Typography variant="caption" style={{ marginBottom: Spacing[1] }}>• Checks for duplicates to avoid duplication</Typography>
          <Typography variant="caption">• Works offline with proper sync</Typography>
        </View>
        
        <TouchableOpacity
          onPress={gatherAmravatiVendors}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? Colors.primary[400] : Colors.primary[600],
            padding: Spacing[4],
            borderRadius: BorderRadius.lg,
            alignItems: 'center',
            marginBottom: Spacing[4],
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.neutral[0]} />
          ) : (
            <Typography variant="body" weight="semibold" color="inverse">
              Gather & Store Amravati Vendors
            </Typography>
          )}
        </TouchableOpacity>
        
        {progress ? (
          <View style={{ 
            backgroundColor: Colors.background.primary, 
            padding: Spacing[3], 
            borderRadius: BorderRadius.md,
            marginBottom: Spacing[2],
          }}>
            <Typography variant="caption">{progress}</Typography>
            <Typography variant="caption" color="secondary">
              Progress: {completedCount}/{amravatiVendors.length} vendors processed
            </Typography>
          </View>
        ) : null}
        
        <View style={{ 
          backgroundColor: Colors.background.primary, 
          padding: Spacing[4], 
          borderRadius: BorderRadius.md,
        }}>
          <Typography variant="body" weight="semibold" style={{ marginBottom: Spacing[2] }}>
            About This Feature:
          </Typography>
          <Typography variant="caption">
            This mobile data gathering tool allows administrators to add local vendors directly from their mobile device. 
            The data is stored securely in Firebase and becomes immediately available to all users of the app.
          </Typography>
        </View>
      </View>
    </ScrollView>
  );
};

export default DataGatheringScreen;