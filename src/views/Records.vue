<template>
  <div class="container">
    <h1>Manage Records</h1>
    <div class="button-group">
      <PageButton
        type="primary"
        @open-modal="companyModalVisible = true"
        modalId="add-company"
      >
        <el-icon><Plus /></el-icon> Add User
      </PageButton>
      <PageButton
        type="primary"
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
          :tableData="{ tableType: 'users', data: [] }"
        />
      </el-tab-pane>
      <el-tab-pane label="Companies" name="companies">
        <PageTable
          :tableHeaders="companyHeaders"
          :tableData="{ tableType: 'companies', data: companyRows }"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- Modal for Adding Company -->
    <PageModal
      title="Add New Company"
      :modelValue="companyModalVisible"
      @update:modelValue="companyModalVisible = $event"
      @confirm="addCompany"
    >
      <form @submit.prevent="uploadLogo">
        <div class="form-wrapper">
          <el-form-item>
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              accept="image/*"
              :on-change="handleUploadLogo"
            >
              <img v-if="imageUrl" :src="imageUrl" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <div class="form-fields-wrap">
            <el-form-item label="Name">
              <el-input v-model="newCompany.name" required></el-input>
            </el-form-item>
            <el-form-item label="Status">
              <el-select
                v-model="newCompany.status"
                placeholder="Select Status"
                required
              >
                <el-option label="Active" value="Active"></el-option>
                <el-option label="Inactive" value="Inactive"></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
      </form>
    </PageModal>
    <!-- Modal for Adding Company -->
  </div>
</template>

<script>
import PageTable from "@/components/Table/Table.vue";
import PageModal from "@/components/Modal/Modal.vue";
import PageButton from "@/components/Button/Button.vue";

import { db, storage } from "@/services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default {
  name: "PageRecords",
  components: {
    PageTable,
    PageModal,
    PageButton,
  },
  data() {
    return {
      userHeaders: [
        { label: "First Name", prop: "firstName" },
        { label: "Last Name", prop: "lastName" },
        { label: "Type", prop: "type" },
        { label: "Status", prop: "status" },
      ],
      userRows: [
        { firstName: "John", lastName: "Doe", type: "Admin", status: "Active" },
        {
          firstName: "Jane",
          lastName: "Smith",
          type: "Editor",
          status: "Inactive",
        },
      ],
      companyRows: [],
      companyHeaders: [
        { label: "Logo", prop: "logo" },
        { label: "Name", prop: "name" },
        { label: "Status", prop: "status" },
      ],
      activeTab: "users",
      userModalVisible: false,
      companyModalVisible: false,
      newCompany: {
        logo: "",
        name: "",
        status: "",
      },
      imageUrl: "",
    };
  },
  methods: {
    // Handle Logo Upload
    async handleUploadLogo(file) {
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
      } catch (error) {
        console.error("Upload failed: ", error);
        this.$message.error("Upload failed!");
      }
    },

    // Handle Saving Company to Firebase
    async addCompany() {
      if (this.newCompany.logo) {
        const companies = collection(db, "companies");

        try {
          await addDoc(companies, this.newCompany);

          this.companyModalVisible = false;
          console.log("Company added:", this.newCompany);

          this.resetForm();
        } catch (error) {
          console.error("Error adding company: ", error);
        }
      } else {
        this.$message.error("Please upload a logo!");
      }
    },

    // Handle reset form
    resetForm() {
      this.newCompany = { logo: "", name: "", status: "" };
      this.imageUrl = "";
    },

    // Handle fetch companies from Firebase
    async fetchCompanies() {
      try {
        const querySnapshot = await getDocs(collection(db, "companies"));
        this.companyRows = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("query", querySnapshot);
      } catch (error) {
        console.error("Error fetching companies: ", error);
      }
    },
  },
  created() {
    this.fetchCompanies();
  },
  mounted() {
    console.log("this", this.newCompany);
  },
};
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--vt-c-divider-light-1);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  max-width: 250px;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 250px;
  height: 250px;
  text-align: center;
}

.el-upload img {
  max-width: 100%;
}

.form-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
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
}
</style>
