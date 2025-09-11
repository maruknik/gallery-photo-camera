import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { getDB, createTable, getCrimes, seedDatabase } from './database';

const CrimeList = () => {
  const [crimes, setCrimes] = useState([]);

  useEffect(() => {
    const loadCrimes = async () => {
      try {
        const db = getDB();
        await createTable(db);
        await seedDatabase(db); // Seed database for testing
        const fetchedCrimes = await getCrimes(db);
        setCrimes(fetchedCrimes);
      } catch (error) {
        console.error('Failed to load crimes:', error);
      }
    };

    loadCrimes();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.crimeItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.location}>Широта: {item.latitude}</Text>
      <Text style={styles.location}>Довгота: {item.longitude}</Text>
      {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.image} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Список правопорушень</Text>
      <FlatList
        data={crimes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  crimeItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  location: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
});

export default CrimeList;
