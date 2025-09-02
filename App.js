import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Image, FlatList, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getDB, createTable, addCrime, getCrimes } from './database';

export default function App() {
  const [db, setDb] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [crimes, setCrimes] = useState([]);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();

    const initializeDB = async () => {
      const database = getDB();
      setDb(database);
      await createTable(database);
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

    console.log(result);

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const saveCrime = async () => {
    if (db && title && description) {
      try {
        await addCrime(db, title, description, imageUri);
        setTitle('');
        setDescription('');
        setImageUri(null);
        loadCrimes(db);
      } catch (error) {
        console.error('Error saving crime:', error);
      }
    } else {
      alert('Будь ласка, введіть назву та опис правопорушення.');
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
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Створити правопорушення</Text>

      <TextInput
        style={styles.input}
        placeholder="Назва"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Опис"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Button title="Вибрати фото" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.selectedImage} />}

      <Button title="Зберегти правопорушення" onPress={saveCrime} />

      <Text style={styles.heading}>Список правопорушень</Text>
      <FlatList
        data={crimes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </ScrollView>
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  selectedImage: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
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
});
