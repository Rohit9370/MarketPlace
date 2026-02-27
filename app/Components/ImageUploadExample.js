import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { uploadToCloudinary } from '../Services/cloudinnery';

const ImageUploadExample = () => {
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setUploadedUrl(null);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setUploadedUrl(null);
    }
  };

  // Upload to Cloudinary
  const handleUpload = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      setUploading(true);
      const url = await uploadToCloudinary(imageUri, 'example-folder');
      
      if (url) {
        setUploadedUrl(url);
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        Alert.alert('Error', 'Upload failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Cloudinary Image Upload Demo</Text>
      
      {/* Image Preview */}
      <View className="items-center mb-6">
        {imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            className="w-64 h-48 rounded-lg border border-gray-300"
            resizeMode="cover"
          />
        ) : (
          <View className="w-64 h-48 rounded-lg border-2 border-dashed border-gray-400 items-center justify-center">
            <Text className="text-gray-500">No image selected</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-center space-x-4 mb-6">
        <TouchableOpacity 
          onPress={pickImage}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Choose Image</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={takePhoto}
          className="bg-green-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Take Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Button */}
      {imageUri && !uploadedUrl && (
        <TouchableOpacity 
          onPress={handleUpload}
          disabled={uploading}
          className={`py-4 rounded-lg items-center ${
            uploading ? 'bg-gray-400' : 'bg-purple-600'
          }`}
        >
          <Text className="text-white font-bold text-lg">
            {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Result */}
      {uploadedUrl && (
        <View className="mt-6 p-4 bg-green-50 rounded-lg">
          <Text className="text-green-800 font-medium mb-2">Upload Successful!</Text>
          <Text className="text-green-700 text-sm mb-3">Image URL:</Text>
          <Text className="text-blue-600 text-xs bg-white p-2 rounded">
            {uploadedUrl}
          </Text>
          
          <TouchableOpacity 
            onPress={() => {
              // Open in browser
              // Linking.openURL(uploadedUrl);
            }}
            className="mt-3 bg-blue-100 px-4 py-2 rounded"
          >
            <Text className="text-blue-700 text-center">View Image</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ImageUploadExample;