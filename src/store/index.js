import { createStore } from "vuex";
import { auth, db } from "@/services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth"; // Import signOut function
import { collection, query, where, getDocs } from "firebase/firestore";

const store = createStore({
  state: {
    userDetails: null,
    loading: true,
    activeMenu: 2,
  },
  mutations: {
    setActiveMenu(state, menuIndex) {
      state.activeMenu = menuIndex;
      localStorage.setItem("activeMenu", menuIndex);
    },
    loadActiveMenuFromStorage(state) {
      const savedMenu = localStorage.getItem("activeMenu");
      if (savedMenu) {
        state.activeMenu = Number(savedMenu);
      }
    },
    setUserDetails(state, userDetails) {
      state.userDetails = userDetails;
    },
    clearUser(state) {
      state.userDetails = null;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    resetActiveMenu(state) {
      state.activeMenu = 2;
      localStorage.setItem("activeMenu", 2);
    },
  },
  actions: {
    initializeActiveMenu({ commit }) {
      commit("loadActiveMenuFromStorage");
    },
    async fetchUserDetails({ commit }, user) {
      commit("setLoading", true);
      if (user) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDetails = querySnapshot.docs[0].data();
          const docId = querySnapshot.docs[0].id;

          commit("setUserDetails", { ...userDetails, id: docId });
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
        commit("resetActiveMenu");
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },
  getters: {
    getActiveMenu: (state) => state.activeMenu,
  },
});

store.dispatch("initializeStore");

export default store;
