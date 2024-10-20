import { getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";

export const fetchCollection = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
};

export const fetchUsers = () => fetchCollection("users");
export const fetchArticles = () => fetchCollection("articles");
export const fetchCompanies = () => fetchCollection("companies");
