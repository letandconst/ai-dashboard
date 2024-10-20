import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export const fetchCollection = async (collectionName, orderByField = null) => {
  try {
    let collectionRef = collection(db, collectionName);

    if (orderByField) {
      const q = query(collectionRef, orderBy(orderByField, "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    const querySnapshot = await getDocs(collectionRef);
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
export const fetchArticles = () => fetchCollection("articles", "date");
export const fetchCompanies = () => fetchCollection("companies");
