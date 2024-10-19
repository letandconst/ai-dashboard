<template>
  <div class="container">
    <h1>Manage Records</h1>
    <div class="button-group">
      <PageButton
        type="primary"
        @open-modal="userModalVisible = true"
        modalId="add-user"
      >
        <el-icon><Plus /></el-icon> Add User
      </PageButton>
      <PageButton
        type="info"
        @open-modal="companyModalVisible = true"
        modalId="add-company"
      >
        <el-icon><Plus /></el-icon> Add Company
      </PageButton>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Users" name="users">
        <PageTable
          :tableHeaders="userHeaders"
          :tableData="{ tableType: 'users', data: userRows }"
          :handleEdit="(row) => handleEdit(row, 'user')"
        />
      </el-tab-pane>
      <el-tab-pane label="Companies" name="companies">
        <PageTable
          :tableHeaders="companyHeaders"
          :tableData="{ tableType: 'companies', data: companyRows }"
          :handleEdit="(row) => handleEdit(row, 'company')"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- Modal for Managing User -->
    <PageModal
      :title="editMode ? 'Edit User' : 'Add New User'"
      :modelValue="userModalVisible"
      @update:modelValue="userModalVisible = $event"
      @confirm="editMode ? updateUser() : addUser()"
      @close="clearErrors"
    >
      <form @submit.prevent="addUser">
        <div class="form-wrapper">
          <el-form-item
            label="Email Address"
            :class="{ 'is-error': errors.email }"
          >
            <el-input
              v-model="newUser.email"
              required
              :style="{ borderColor: errors.email ? 'red' : '' }"
              :disabled="editMode"
              @input="clearError('email')"
            />
          </el-form-item>
          <el-form-item
            label="First Name"
            :class="{ 'is-error': errors.firstName }"
          >
            <el-input
              v-model="newUser.firstName"
              required
              :style="{ borderColor: errors.firstName ? 'red' : '' }"
              :disabled="editMode"
              @input="clearError('firstName')"
            />
          </el-form-item>
          <el-form-item
            label="Last Name"
            :class="{ 'is-error': errors.lastName }"
          >
            <el-input
              v-model="newUser.lastName"
              required
              :style="{ borderColor: errors.lastName ? 'red' : '' }"
              :disabled="editMode"
              @input="clearError('lastName')"
            />
          </el-form-item>
          <el-form-item label="Type" :class="{ 'is-error': errors.type }">
            <el-select
              v-model="newUser.type"
              placeholder="Select Type"
              required
              :style="{ borderColor: errors.type ? 'red' : '' }"
              @change="clearError('type')"
            >
              <el-option
                v-for="type in userTypes"
                :key="type"
                :label="type"
                :value="type"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Status" :class="{ 'is-error': errors.status }">
            <el-select
              v-model="newUser.status"
              placeholder="Select Status"
              required
              :style="{ borderColor: errors.status ? 'red' : '' }"
              @change="clearError('status')"
            >
              <el-option
                v-for="status in userStatuses"
                :key="status"
                :label="status"
                :value="status"
              />
            </el-select>
          </el-form-item>
        </div>
      </form>
    </PageModal>

    <!-- Modal for Managing User -->

    <!-- Modal for Managing Company -->
    <PageModal
      :title="editMode ? 'Edit Company' : 'Add New Company'"
      :modelValue="companyModalVisible"
      @update:modelValue="companyModalVisible = $event"
      @confirm="editMode ? updateCompany() : addCompany()"
      @close="clearErrors"
    >
      <form @submit.prevent="uploadLogo">
        <div class="form-wrapper">
          <el-form-item label="Logo">
            <el-upload
              class="avatar-uploader"
              :class="{ 'is-error': errors.logo }"
              :show-file-list="false"
              accept="image/*"
              :on-change="handleUploadLogo"
              @input="clearError('logo')"
            >
              <template v-if="isUploading">
                <el-icon class="avatar-uploader-icon"><Loading /></el-icon>
              </template>
              <template v-else>
                <img v-if="imageUrl" :src="imageUrl" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </template>
            </el-upload>
          </el-form-item>
          <div class="form-fields-wrap">
            <el-form-item label="Name" :class="{ 'is-error': errors.name }">
              <el-input
                v-model="newCompany.name"
                required
                :style="{ borderColor: errors.name ? 'red' : '' }"
                @input="clearError('name')"
              ></el-input>
            </el-form-item>
            <el-form-item label="Status" :class="{ 'is-error': errors.status }">
              <el-select
                v-model="newCompany.status"
                placeholder="Select Status"
                required
                :style="{ borderColor: errors.status ? 'red' : '' }"
                @change="clearError('status')"
              >
                <el-option
                  v-for="status in userStatuses"
                  :key="status"
                  :label="status"
                  :value="status"
                />
              </el-select>
            </el-form-item>
          </div>
        </div>
      </form>
    </PageModal>
    <!-- Modal for Managing Company -->
  </div>
</template>

<script>
import PageTable from "@/components/Table/Table.vue";
import PageModal from "@/components/Modal/Modal.vue";
import PageButton from "@/components/Button/Button.vue";

import { db, auth, storage, createUserAuthInstance } from "@/services/firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

const USER_HEADERS = [
  { label: "First Name", prop: "firstName" },
  { label: "Last Name", prop: "lastName" },
  { label: "Type", prop: "type" },
  { label: "Status", prop: "status" },
];

const COMPANY_HEADERS = [
  { label: "Logo", prop: "logo" },
  { label: "Name", prop: "name" },
  { label: "Status", prop: "status" },
];

const entities = {
  company: {
    modalVisible: "companyModalVisible",
    newData: "newCompany",
    idField: "currentCompanyId",
    logoField: "logo",
  },
  user: {
    modalVisible: "userModalVisible",
    newData: "newUser",
    idField: "currentUserId",
  },
};

export default {
  name: "PageRecords",
  components: {
    PageTable,
    PageModal,
    PageButton,
  },
  data() {
    return {
      userHeaders: USER_HEADERS,
      userRows: [],
      companyRows: [],
      companyHeaders: COMPANY_HEADERS,
      userTypes: ["Writer", "Editor"],
      userStatuses: ["Active", "Inactive"],
      activeTab: "users",
      userModalVisible: false,
      companyModalVisible: false,
      isUploading: false,
      editMode: false,
      currentCompanyId: null,
      errors: {
        name: false,
        status: false,
        logo: false,
        firstName: false,
        lastName: false,
        type: false,
      },
      imageUrl: "",
      newCompany: {
        logo: "",
        name: "",
        status: "",
      },
      newUser: {
        firstName: "",
        lastName: "",
        type: "",
        status: "",
      },
    };
  },
  methods: {
    // Handle Logo Upload
    async handleUploadLogo(file) {
      this.isUploading = true;
      const isImage = file.raw.type.startsWith("image/");
      if (!isImage) {
        this.$message.error("You can only upload image files!");
        return;
      }

      try {
        const storageRef = ref(storage, `logos/${file.raw.name}`);

        await uploadBytes(storageRef, file.raw);

        const url = await getDownloadURL(storageRef);

        this.imageUrl = url;
        this.newCompany.logo = url;

        setTimeout(() => {
          this.isUploading = false;
        }, 1000);
      } catch (error) {
        this.isUploading = false;
        console.error("Upload failed: ", error);
        this.$message.error("Upload failed!");
      }
    },

    // Handle Add Company
    async addCompany() {
      Object.keys(this.errors).forEach((key) => (this.errors[key] = false));

      const requiredFields = ["name", "status", "logo"];
      const hasError = requiredFields.reduce((acc, field) => {
        if (!this.newCompany[field]) {
          this.errors[field] = true;
          return true;
        }
        return acc;
      }, false);

      if (hasError) {
        this.$message.error("All fields are required!");
        return;
      }

      const companies = collection(db, "companies");

      try {
        await addDoc(companies, this.newCompany);

        await this.fetchCompanies();

        this.activeTab = "companies";
        this.companyModalVisible = false;
        this.resetForm();
      } catch (error) {
        console.error("Error adding company: ", error);
      }
    },

    // Handle Get Company
    async fetchCompanies() {
      try {
        const querySnapshot = await getDocs(collection(db, "companies"));
        this.companyRows = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching companies: ", error);
      }
    },

    // Handle Update Company
    async updateCompany() {
      if (this.currentCompanyId) {
        try {
          const companyRef = doc(db, "companies", this.currentCompanyId);
          await updateDoc(companyRef, this.newCompany);

          const index = this.companyRows.findIndex(
            (company) => company.id === this.currentCompanyId
          );
          if (index !== -1) {
            this.companyRows.splice(index, 1, {
              ...this.newCompany,
              id: this.currentCompanyId,
            });
          }

          this.resetForm();
          this.companyModalVisible = false;
        } catch (error) {
          console.error("Error updating company: ", error);
        }
      }
    },

    // Handle Show Edit Modal
    handleEdit(entity, type) {
      const config = entities[type];

      if (!config) return;

      this[config.newData] = { ...entity };
      this[config.idField] = entity.id;
      this.editMode = true;

      this[config.modalVisible] = true;

      if (type === "company") {
        this.imageUrl = entity[config.logoField];
      }
    },

    // Handle Add User
    async addUser() {
      Object.keys(this.errors).forEach((key) => (this.errors[key] = false));

      const requiredFields = [
        "email",
        "firstName",
        "lastName",
        "type",
        "status",
      ];
      const hasError = requiredFields.reduce((acc, field) => {
        if (!this.newUser[field]) {
          this.errors[field] = true;
          return true;
        }
        return acc;
      }, false);

      if (hasError) {
        this.$message.error("All fields are required!");
        return;
      }

      const userExists = await this.checkUserEmailExists(this.newUser.email);
      if (userExists) {
        this.$message.error("Email already exists!");
        return;
      }

      const usersCollection = collection(db, "users");
      const newAuth = createUserAuthInstance();
      try {
        await createUserWithEmailAndPassword(
          newAuth,
          this.newUser.email,
          `${import.meta.env.VITE_TEMP_USER_PASS}`
        );

        await addDoc(usersCollection, {
          email: this.newUser.email,
          firstName: this.newUser.firstName,
          lastName: this.newUser.lastName,
          type: this.newUser.type,
          status: this.newUser.status,
        });

        await this.fetchUsers();

        await this.sendResetPasswordEmail(this.newUser.email);
        this.userModalVisible = false;
        this.activeTab = "users";
        this.resetForm();
      } catch (error) {
        console.error("Error adding user: ", error);
        this.errors = { ...this.errors, ...error };
      }
    },

    // Handle Get Users
    async fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        this.userRows = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    },

    // Handle Update User
    async updateUser() {
      if (this.currentUserId) {
        try {
          const userRef = doc(db, "users", this.currentUserId);
          const updatedData = {
            type: this.newUser.type,
            status: this.newUser.status,
          };
          await updateDoc(userRef, updatedData);

          const index = this.userRows.findIndex(
            (user) => user.id === this.currentUserId
          );
          if (index !== -1) {
            this.userRows.splice(index, 1, {
              ...this.userRows[index],
              ...updatedData,
              id: this.currentUserId,
            });
          }

          this.resetForm();
          this.userModalVisible = false;
        } catch (error) {
          console.error("Error updating user: ", error);
        }
      }
    },

    // Firebase function to send reset password
    async sendResetPasswordEmail(email) {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error) {
        console.error("Error sending password reset email: ", error);
      }
    },

    // Check if user email exists
    async checkUserEmailExists(email) {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    },

    // Handle Reset Form
    resetForm() {
      this.newCompany = { logo: "", name: "", status: "" };
      this.imageUrl = "";
      this.currentCompanyId = null;
      this.editMode = false;

      this.newUser = {
        email: "",
        firstName: "",
        lastName: "",
        type: "",
        status: "",
      };
    },

    clearError(field) {
      this.errors[field] = false;
    },

    clearErrors() {
      Object.keys(this.errors).forEach((key) => (this.errors[key] = false));
      this.resetForm();
    },
  },
  created() {
    this.fetchCompanies();
    this.fetchUsers();
  },
};
</script>

<style>
.button-group {
  margin-bottom: 24px;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--vt-c-divider-light-1);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader.is-error .el-upload {
  border-color: red;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
}

.el-upload img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  padding: 8px;
  border-radius: 8px;
}

.form-fields-wrap {
  width: 100%;
}

@media screen and (max-width: 768px) {
  .form-wrapper {
    flex-direction: column;
    gap: 8px;
  }

  .form-fields-wrap .el-form-item {
    margin-bottom: 8px;
  }

  .el-dialog__footer {
    text-align: center;
  }

  .records .el-form-item {
    margin-bottom: 12px;
  }

  .records .el-dialog {
    width: calc(100% - 24px);
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;

    button {
      margin-left: 0 !important;
    }
  }
}
</style>
