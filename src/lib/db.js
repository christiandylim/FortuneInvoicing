// Mocking Firestore API for development without a real Firebase project
// This uses localStorage to persist data

const getStorage = (collection) => {
  const data = localStorage.getItem(`db_${collection}`);
  return data ? JSON.parse(data) : [];
};

const setStorage = (collection, data) => {
  localStorage.setItem(`db_${collection}`, JSON.stringify(data));
};

const generateId = () => Math.random().toString(36).substring(2, 15);

export const collection = (db, collectionName) => collectionName;

export const doc = (db, collectionName, id) => ({ collectionName, id });

export const getDocs = async (collectionName) => {
  const data = getStorage(collectionName);
  return {
    docs: data.map(item => ({
      id: item.id,
      data: () => item
    }))
  };
};

export const getDoc = async (docRef) => {
  const data = getStorage(docRef.collectionName);
  const item = data.find(i => i.id === docRef.id);
  if (item) {
    return {
      exists: () => true,
      id: item.id,
      data: () => item
    };
  }
  return { exists: () => false };
};

export const addDoc = async (collectionName, data) => {
  const currentData = getStorage(collectionName);
  const id = generateId();
  const newItem = { ...data, id, createdAt: new Date().toISOString() };
  setStorage(collectionName, [...currentData, newItem]);
  return { id };
};

export const updateDoc = async (docRef, data) => {
  const currentData = getStorage(docRef.collectionName);
  const index = currentData.findIndex(i => i.id === docRef.id);
  if (index !== -1) {
    currentData[index] = { ...currentData[index], ...data, updatedAt: new Date().toISOString() };
    setStorage(docRef.collectionName, currentData);
  }
};

export const deleteDoc = async (docRef) => {
  const currentData = getStorage(docRef.collectionName);
  setStorage(docRef.collectionName, currentData.filter(i => i.id !== docRef.id));
};

export const db = "mock-db";
