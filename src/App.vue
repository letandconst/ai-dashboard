<template>
  <div id="app">
    <Header v-if="isLoggedIn && !loading" :user="userDetails" />
    <router-view />
  </div>
</template>

<script>
import { mapState } from "vuex";
import Header from "./components/Navigation/Header.vue";
export default {
  name: "App",
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Header,
  },
  computed: {
    ...mapState(["userDetails", "loading"]),
    isLoggedIn() {
      return this.userDetails !== null;
    },
  },
};
</script>
