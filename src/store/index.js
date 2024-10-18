import { createStore } from "vuex";
import { auth, db } from "@/services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth"; // Import signOut function
import { collection, query, where, getDocs } from "firebase/firestore";

const store = createStore({
  state: {
    userDetails: null,
    loading: true,
  },
  mutations: {
    setUserDetails(state, userDetails) {
      state.userDetails = userDetails;
    },
    clearUser(state) {
      state.userDetails = null;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
  },
  actions: {
    async fetchUserDetails({ commit }, user) {
      commit("setLoading", true);
      if (user) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDetails = querySnapshot.docs[0].data();
          commit("setUserDetails", userDetails);
        }
      } else {
        commit("clearUser");
      }

      commit("setLoading", false);
    },
    initializeStore({ dispatch }) {
      onAuthStateChanged(auth, (user) => {
        dispatch("fetchUserDetails", user);
      });
    },
    async logout({ commit }) {
      try {
        await signOut(auth);
        commit("clearUser");
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },
});

store.dispatch("initializeStore");

export default store;
