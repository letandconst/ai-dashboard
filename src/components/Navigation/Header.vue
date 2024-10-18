<template>
  <el-header>
    <div class="welcome-text">
      Welcome, <strong>{{ userDetails.firstName }}</strong>
    </div>

    <div>
      <el-dropdown v-if="isMobile" trigger="click">
        <el-button type="text" class="dropdown-button">
          <el-icon>
            <More />
          </el-icon>
        </el-button>
        <template v-slot:dropdown>
          <el-dropdown-menu>
            <el-dropdown-item index="2">
              <router-link to="/">Dashboard</router-link>
            </el-dropdown-item>
            <el-dropdown-item index="3">
              <router-link to="/all-media">All Media</router-link>
            </el-dropdown-item>
            <el-dropdown-item index="4" v-if="userDetails.type === 'Editor'">
              <router-link to="/manage-records">Manage Records</router-link>
            </el-dropdown-item>
            <el-dropdown-item index="5" @click="logout"
              >Logout</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-menu
        v-else
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="2">
          <router-link to="/">Dashboard</router-link>
        </el-menu-item>
        <el-menu-item index="3">
          <router-link to="/all-media">All Media</router-link>
        </el-menu-item>
        <el-menu-item index="4" v-if="userDetails.type === 'Editor'">
          <router-link to="/manage-records">Manage Records</router-link>
        </el-menu-item>
        <el-menu-item index="5" @click="logout"> Logout </el-menu-item>
      </el-menu>
    </div>
  </el-header>
</template>

<script>
import "./header.css";
import { mapState } from "vuex";

export default {
  name: "NavigationHeader",
  data() {
    return {
      isMobile: false,
      isAddUserModalVisible: false,
      isSettingsModalVisible: false,
      newUser: {
        firstName: "",
        lastName: "",
        email: "",
        status: "active",
        type: "Viewer",
      },
    };
  },
  computed: {
    ...mapState(["user", "userDetails", "loading"]),
    isEditor() {
      return this.userDetails?.type === "Editor";
    },
  },
  created() {
    this.checkScreenSize();

    window.addEventListener("resize", this.checkScreenSize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkScreenSize);
  },
  methods: {
    checkScreenSize() {
      this.isMobile = window.innerWidth <= 768;
    },
    logout() {
      this.$store.dispatch("logout");
      this.$router.push("/login");
    },
  },
};
</script>
