import { createStore } from "vuex";
import { auth, db } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const store = createStore({
  state: {
    user: null,
    userDetails: null,
    loading: true,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setUserDetails(state, userDetails) {
      state.userDetails = userDetails;
    },
    clearUser(state) {
      state.user = null;
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
    initializeStore({ commit }) {
      onAuthStateChanged(auth, (user) => {
        commit("setUser", user);
        this.dispatch("fetchUserDetails", user);
      });
    },
    logout({ commit }) {
      commit("clearUser");
    },
  },
});

store.dispatch("initializeStore");

export default store;
