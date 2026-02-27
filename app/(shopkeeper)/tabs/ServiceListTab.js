import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Typography from '../../Comoponents/Typography';
import { uploadToCloudinary } from '../../Services/cloudinnery';
import { addService, deleteService as deleteServiceFromDB, getShopServices, toggleServiceStatus } from '../../Services/service_service';

export default function ServiceListTab() {
  const { user } = useSelector((state) => state.auth);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    images: [],
  });

  const [services, setServices] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      loadServices();
    }
  }, [user?.uid]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const fetchedServices = await getShopServices(user.uid);
      setServices(fetchedServices);
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setNewService({
        ...newService,
        images: [...newService.images, ...result.assets.map(a => a.uri)],
      });
    }
  };

  const addServiceHandler = async () => {
    if (!newService.title || !newService.price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setUploading(true);
      
      let uploadedImages = [];
      if (newService.images.length > 0) {
        for (const imageUri of newService.images) {
          try {
            const uploadedUrl = await uploadToCloudinary(imageUri);
            if (uploadedUrl) {
              uploadedImages.push(uploadedUrl);
            }
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        }
      }

      const serviceData = {
        title: newService.title,
        description: newService.description,
        price: parseInt(newService.price),
        images: uploadedImages,
      };

      const createdService = await addService(user.uid, serviceData);
      setServices([...services, { ...createdService, isActive: true }]);
      setNewService({ title: '', description: '', price: '', images: [] });
      setModalVisible(false);
      Alert.alert('Success', 'Service added successfully!');
    } catch (error) {
      console.error('Error adding service:', error);
      Alert.alert('Error', 'Failed to add service');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await toggleServiceStatus(id, !currentStatus);
      setServices(services.map(s => 
        s.id === id ? { ...s, isActive: !s.isActive } : s
      ));
    } catch (error) {
      console.error('Error toggling service status:', error);
      Alert.alert('Error', 'Failed to update service status');
    }
  };

  const deleteServiceHandler = (id) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteServiceFromDB(id);
              setServices(services.filter(s => s.id !== id));
              Alert.alert('Success', 'Service deleted successfully');
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', 'Failed to delete service');
            }
          },
        },
      ]
    );
  };

  const renderService = ({ item }) => (
    <View style={styles.serviceCard}>
      {item.images && item.images.length > 0 && (
        <Image
          source={{ uri: item.images[0] }}
          style={styles.serviceImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.serviceContent}>
        <Typography variant="v2" style={styles.serviceTitle}>
          {item.title}
        </Typography>
        <Typography variant="v4" style={styles.serviceDescription}>
          {item.description}
        </Typography>
        <Typography variant="v2" style={styles.servicePrice}>
          ₹{item.price}
        </Typography>
      </View>

      <View style={styles.serviceActions}>
        <View style={styles.statusRow}>
          <Typography variant="v4" style={styles.statusText}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Typography>
          <Switch
            value={item.isActive}
            onValueChange={() => toggleActive(item.id, item.isActive)}
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={() => deleteServiceHandler(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={18} color="#dc2626" />
        <Typography variant="v4" style={styles.deleteText}>Delete</Typography>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Typography variant="v1" style={styles.headerTitle}>
            My Services
          </Typography>
          <Typography variant="v4" style={styles.headerSubtitle}>
            {services.length} services
          </Typography>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={20} color="white" />
          <Typography variant="v3" style={styles.addButtonText}>Add</Typography>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Typography variant="v3" style={styles.loadingText}>Loading services...</Typography>
        </View>
      ) : services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
          <Typography variant="v2" style={styles.emptyTitle}>No services yet</Typography>
          <Typography variant="v4" style={styles.emptySubtitle}>
            Add your first service to start receiving bookings
          </Typography>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="v1" style={styles.modalTitle}>Add New Service</Typography>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Typography variant="v3" style={styles.label}>Title *</Typography>
              <TextInput
                placeholder="Service title"
                value={newService.title}
                onChangeText={(text) => setNewService({ ...newService, title: text })}
                style={styles.input}
              />

              <Typography variant="v3" style={styles.label}>Description</Typography>
              <TextInput
                placeholder="Service description"
                value={newService.description}
                onChangeText={(text) => setNewService({ ...newService, description: text })}
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
              />

              <Typography variant="v3" style={styles.label}>Price *</Typography>
              <TextInput
                placeholder="Price in ₹"
                value={newService.price}
                onChangeText={(text) => setNewService({ ...newService, price: text })}
                keyboardType="numeric"
                style={styles.input}
              />

              <Typography variant="v3" style={styles.label}>Images</Typography>
              <TouchableOpacity
                onPress={pickImage}
                style={styles.imagePicker}
              >
                <Ionicons name="images-outline" size={32} color="#9ca3af" />
                <Typography variant="v4" style={styles.imagePickerText}>
                  Tap to add images
                </Typography>
              </TouchableOpacity>

              {newService.images.length > 0 && (
                <View style={styles.imagePreviewContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {newService.images.map((uri, index) => (
                      <View key={index} style={styles.imagePreview}>
                        <Image source={{ uri }} style={styles.previewImage} />
                        <TouchableOpacity
                          onPress={() => {
                            const updatedImages = newService.images.filter((_, i) => i !== index);
                            setNewService({ ...newService, images: updatedImages });
                          }}
                          style={styles.removeImageButton}
                        >
                          <Ionicons name="close" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity
                onPress={addServiceHandler}
                disabled={uploading}
                style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
              >
                <Typography variant="v2" style={styles.submitButtonText}>
                  {uploading ? 'Adding Service...' : 'Add Service'}
                </Typography>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 24,
  },
  headerSubtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    marginLeft: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 24,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  serviceContent: {
    marginBottom: 12,
  },
  serviceTitle: {
    color: '#111827',
    fontSize: 18,
  },
  serviceDescription: {
    color: '#6b7280',
    marginTop: 8,
  },
  servicePrice: {
    color: '#3b82f6',
    marginTop: 12,
    fontWeight: 'bold',
  },
  serviceActions: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    marginTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    color: '#4b5563',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  deleteText: {
    color: '#dc2626',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
  },
  label: {
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  imagePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerText: {
    color: '#6b7280',
    marginTop: 8,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreview: {
    marginRight: 8,
    position: 'relative',
  },
  previewImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
  },
});
