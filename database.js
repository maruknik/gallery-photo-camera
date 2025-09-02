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
        'CREATE TABLE IF NOT EXISTS crimes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, imageUri TEXT)',
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

const addCrime = (db, title, description, imageUri) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO crimes (title, description, imageUri) VALUES (?, ?, ?)',
        [title, description, imageUri],
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

export { getDB, createTable, addCrime, getCrimes };
