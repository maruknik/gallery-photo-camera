import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, FlatList, Button, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { getDB, createTable, getCrimes, seedDatabase } from './database';
import { uploadImageToCloudinary } from './ImageUpload';

export default function App() {
  const [db, setDb] = useState(null);
  const [crimes, setCrimes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }

      let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    })();

    const initializeDB = async () => {
      const database = getDB();
      setDb(database);
      await createTable(database);
      await seedDatabase(database); 
      loadCrimes(database);
    };
    initializeDB();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setUploadedImageUrl(null); 
    }
  };

  const handleUpload = async () => {
    if (selectedImage) {
      console.log('Uploading image:', selectedImage);
      const imageUrl = await uploadImageToCloudinary(selectedImage);
      if (imageUrl) {
        setUploadedImageUrl(imageUrl);
        console.log('Uploaded image secure URL:', imageUrl);
        // Add crime to database with location
        if (currentLocation && db) {
          await addCrime(db, 'Нове правопорушення', 'Опис нового правопорушення', imageUrl, currentLocation.latitude, currentLocation.longitude);
          loadCrimes(db);
        }
      } else {
        console.error('Image upload failed.');
      }
    } else {
      alert('Please select an image first.');
    }
  };

  const loadCrimes = async (database) => {
    try {
      const fetchedCrimes = await getCrimes(database);
      setCrimes(fetchedCrimes);
      console.log('Loaded crimes:', fetchedCrimes);
    } catch (error) {
      console.error('Error loading crimes:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.crimeItem}>
      <Text style={styles.crimeTitle}>{item.title}</Text>
      <Text style={styles.crimeDescription}>{item.description}</Text>
      {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.crimeImage} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Список правопорушень</Text>
      <FlatList
        data={crimes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />

      <Text style={styles.heading}>Завантажити фото в Cloudinary</Text>
      <Button title="Вибрати фото для завантаження" onPress={pickImage} />
      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />}
      <Button title="Завантажити на Cloudinary" onPress={handleUpload} disabled={!selectedImage} />
      {uploadedImageUrl && <Text>Uploaded URL: {uploadedImageUrl}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  crimeItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  crimeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  crimeDescription: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  crimeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginTop: 10,
    borderRadius: 5,
  },
  selectedImagePreview: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginVertical: 10,
    alignSelf: 'center',
  },
});
