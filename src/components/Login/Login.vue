<template>
  <el-row
    class="d-flex flex-column justify-center align-center full-height"
    type="flex"
    justify="center"
    align="middle"
  >
    <el-card class="login-card">
      <div class="text-center">
        <h2>Login</h2>
      </div>
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            placeholder="Enter your email"
            class="custom-login-input"
          ></el-input>
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            class="custom-login-input"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="custom-login-btn w-100 mt"
            @click="validateForm"
          >
            Login
          </el-button>
        </el-form-item>

        <el-alert
          v-if="error"
          title="Invalid email or password. Please try again."
          type="error"
          class="mt-2 custom-alert"
        ></el-alert>
      </el-form>
    </el-card>
  </el-row>
</template>

<script>
import "./login.css";
import { auth } from "@/services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { mapActions } from "vuex";

export default {
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
      error: null,
      rules: {
        email: [
          {
            required: true,
            message: "Email is required",
            trigger: "blur",
          },
          {
            type: "email",
            message: "Please enter a valid email address",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "Password is required",
            trigger: "blur",
          },
        ],
      },
    };
  },

  methods: {
    ...mapActions(["setUserDetails"]),

    // Handle Form Validate
    validateForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.login();
        } else {
          console.log("Validation failed");
          return false;
        }
      });
    },

    // Handle Login
    async login() {
      try {
        await signInWithEmailAndPassword(
          auth,
          this.form.email,
          this.form.password
        );

        this.$router.push("/");
      } catch (err) {
        this.error = "Invalid email or password. Please try again.";
        console.error("Login error:", err);
      }
    },
  },
};
</script>
