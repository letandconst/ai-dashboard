<template>
  <el-header>
    <div class="welcome-text">
      Welcome,
      <strong>{{ userDetails.firstName }} ({{ userDetails.type }})</strong>
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
            <el-dropdown-item
              :index="(2).toString()"
              :class="{ active: activeMenu === 2 }"
            >
              <router-link to="/" @click="setActiveMenu(2)"
                >Dashboard</router-link
              >
            </el-dropdown-item>
            <el-dropdown-item
              :index="(3).toString()"
              :class="{ active: activeMenu === 3 }"
            >
              <router-link to="/all-media" @click="setActiveMenu(3)"
                >All Media</router-link
              >
            </el-dropdown-item>
            <el-dropdown-item
              :index="(4).toString()"
              v-if="userDetails.type === 'Editor'"
              :class="{ active: activeMenu === 4 }"
            >
              <router-link to="/manage-records" @click="setActiveMenu(4)"
                >Manage Records</router-link
              >
            </el-dropdown-item>
            <el-dropdown-item :index="(5).toString()" @click="logout"
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
        :default-active="activeMenu.toString()"
      >
        <el-menu-item
          :index="(2).toString()"
          :class="{ active: activeMenu === 2 }"
        >
          <router-link to="/" @click="setActiveMenu(2)">Dashboard</router-link>
        </el-menu-item>
        <el-menu-item
          :index="(3).toString()"
          :class="{ active: activeMenu === 3 }"
        >
          <router-link to="/all-media" @click="setActiveMenu(3)"
            >All Media</router-link
          >
        </el-menu-item>
        <el-menu-item
          :index="(4).toString()"
          v-if="userDetails.type === 'Editor'"
          :class="{ active: activeMenu === '4' }"
        >
          <router-link to="/manage-records" @click="setActiveMenu(4)"
            >Manage Records</router-link
          >
        </el-menu-item>
        <el-menu-item :index="(5).toString()" @click="logout"
          >Logout</el-menu-item
        >
      </el-menu>
    </div>
  </el-header>
</template>

<script>
import "./header.css";
import { mapState } from "vuex";

export default {
  name: "NavigationHeader",
  computed: {
    ...mapState(["user", "userDetails", "loading", "activeMenu"]),
  },
  created() {
    this.$store.dispatch("initializeActiveMenu");
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
    setActiveMenu(index) {
      this.$store.commit("setActiveMenu", index);
    },
    logout() {
      this.$store.dispatch("logout");
      this.$router.push("/login");
    },
  },
};
</script>
