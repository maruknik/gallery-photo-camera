import { openDatabase } from 'react-native-sqlite-storage';

const getDB = () => {
  return openDatabase({ name: 'crimes.db', location: 'default' }, () => {}, error => {
    console.error("Failed to open database", error);
  });
};

const createTable = (db) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS crimes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, imageUri TEXT, latitude REAL, longitude REAL)',
        [],
        () => {
          console.log('Crimes table created or already exists.');
          resolve();
        },
        (error) => {
          console.error('Error creating crimes table:', error);
          reject(error);
        }
      );
    });
  });
};

const addCrime = (db, title, description, imageUri, latitude, longitude) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO crimes (title, description, imageUri, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
        [title, description, imageUri, latitude, longitude],
        (_, results) => {
          console.log('Crime added successfully:', results);
          resolve(results.insertId);
        },
        (error) => {
          console.error('Error adding crime:', error);
          reject(error);
        }
      );
    });
  });
};

const seedDatabase = async (db) => {
  await createTable(db);
  const crimesToSeed = [
    { title: 'Крадіжка', description: 'Викрадення гаманця', imageUri: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Crime1', latitude: 49.8397, longitude: 24.0297 },
    { title: 'Хуліганство', description: 'Пошкодження майна', imageUri: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Crime2', latitude: 50.4501, longitude: 30.5234 },
    { title: 'ДТП', description: 'Порушення правил дорожнього руху', imageUri: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Crime3', latitude: 48.3000, longitude: 25.9333 },
  ];

  for (const crime of crimesToSeed) {
    await addCrime(db, crime.title, crime.description, crime.imageUri, crime.latitude, crime.longitude);
  }
  console.log('Database seeded with example crimes.');
};

const getCrimes = (db) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM crimes',
        [],
        (_, results) => {
          const crimes = [];
          for (let i = 0; i < results.rows.length; i++) {
            crimes.push(results.rows.item(i));
          }
          console.log('Crimes fetched successfully:', crimes);
          resolve(crimes);
        },
        (error) => {
          console.error('Error fetching crimes:', error);
          reject(error);
        }
      );
    });
  });
};

export { getDB, createTable, addCrime, getCrimes, seedDatabase };
