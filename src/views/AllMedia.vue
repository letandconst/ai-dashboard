<template>
  <div class="container am">
    <div
      class="am-action-wrap"
      :class="{ 'is-writer': userDetails?.type === 'Writer' }"
    >
      <PageButton
        v-if="userDetails?.type === 'Writer'"
        type="primary"
        @open-modal="handleAddArticle"
        modalId="add-article"
      >
        <el-icon><Plus /></el-icon> Add New Article
      </PageButton>

      <el-select
        v-model="itemsPerPage"
        @change="handleItemsPerPageChange"
        placeholder="Items per page"
        style="margin-bottom: 20px"
      >
        <el-option
          v-for="option in options"
          :key="option"
          :label="option"
          :value="option"
        />
      </el-select>
    </div>

    <el-table :data="paginatedData" style="width: 100%">
      <el-table-column label="Actions" width="100">
        <template v-slot="scope">
          <el-button
            type="primary"
            @click="editArticle(scope.row)"
            :disabled="isEditDisabled(scope.row.status)"
            >Edit</el-button
          >
        </template>
      </el-table-column>

      <el-table-column label="Image" width="100">
        <template v-slot="scope">
          <el-image
            :src="scope.row.featuredImage"
            style="width: 80px; height: 80px"
            fit="cover"
          ></el-image>
        </template>
      </el-table-column>

      <el-table-column label="Title">
        <template v-slot="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>

      <el-table-column label="Link">
        <template v-slot="scope">
          <a
            :href="`/article/${scope.row.link}`"
            target="_blank"
            class="am-link"
          >
            {{ scope.row.link }}
          </a>
        </template>
      </el-table-column>

      <el-table-column label="Writer">
        <template v-slot="scope">
          {{ userMap[scope.row.writer] || "" }}
        </template>
      </el-table-column>

      <el-table-column label="Editor">
        <template v-slot="scope">
          {{ userMap[scope.row.editor] || "" }}
        </template>
      </el-table-column>

      <el-table-column label="Status">
        <template v-slot="scope">
          <el-tag
            :type="getTagType(scope.row.status)"
            style="margin: 0; font-size: 14px"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div class="am-pagination">
      <span> Showing {{ start }} to {{ end }} of {{ total }} articles </span>
      <el-pagination
        class="pagination-controls"
        :current-page="currentPage"
        :page-size="itemsPerPage"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      ></el-pagination>
    </div>

    <PageModal
      :title="editMode ? 'Edit Article' : 'Add New Article'"
      v-model="editorModal"
      @confirm="editMode ? saveArticle(true, form.status) : saveArticle(false)"
      @close="handleModalClose"
      :confirmText="editMode ? 'Update' : 'Create'"
      @publish="handlePublish"
    >
      <template #default>
        <el-form :model="form" ref="articleForm" label-position="top">
          <el-form-item label="Featured Image" prop="featuredImage">
            <el-upload
              :show-file-list="false"
              accept="image/*"
              :on-change="handleUploadArticleThumb"
            >
              <template v-if="isUploading">
                <el-icon class="avatar-uploader-icon"><Loading /></el-icon>
              </template>
              <template v-else>
                <div v-if="form.featuredImage" class="uploaded-file">
                  <el-icon class="note-icon"><Notebook /></el-icon>
                  <span class="uploaded-file-name">{{
                    featuredImageName
                  }}</span>
                </div>
                <el-button v-else type="primary">Choose an image</el-button>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item
            label="Title"
            prop="title"
            :class="{ 'is-error': errors.title }"
          >
            <el-input
              v-model="form.title"
              placeholder="Enter article title"
              :style="{ borderColor: errors.title ? 'red' : '' }"
              @input="clearError(['link', 'title'])"
            />
          </el-form-item>

          <el-form-item
            label="URL"
            prop="link"
            :class="{ 'is-error': errors.link }"
          >
            <el-input
              v-model="form.link"
              placeholder="/"
              :style="{ borderColor: errors.link ? 'red' : '' }"
              @input="clearError('link')"
            />
          </el-form-item>

          <div class="am-form-control">
            <el-form-item
              label="Related Company"
              prop="relatedCompany"
              :class="{ 'is-error': errors.relatedCompany }"
            >
              <el-select
                v-model="form.relatedCompany"
                placeholder="Select Company"
                :style="{ borderColor: errors.relatedCompany ? 'red' : '' }"
                @change="clearError('relatedCompany')"
              >
                <el-option
                  v-for="company in companies"
                  :key="company.id"
                  :label="company.name"
                  :value="company.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Date" prop="date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Pick a date"
                :default-value="new Date()"
                :class="{ 'is-error': errors.date }"
                @change="
                  (value) => {
                    errors.date = !value;
                  }
                "
              />
            </el-form-item>
          </div>

          <el-form-item label="Content" prop="content">
            <div ref="editor"></div>
          </el-form-item>
        </el-form>
      </template>
    </PageModal>
  </div>
</template>

<script>
import { mapState } from "vuex";
import PageButton from "@/components/Button/Button.vue";
import PageModal from "@/components/Modal/Modal.vue";
import { fileUpload } from "@/utils/fileUpload";
import { slugify } from "@/utils/slugify";

import Quill from "quill";
import "quill/dist/quill.core.css";
import "quill/dist/quill.bubble.css";
import "quill/dist/quill.snow.css";

import { db } from "@/services/firebase";
import { addDoc, collection, updateDoc, doc, getDoc } from "firebase/firestore";
import { fetchArticles, fetchCompanies, fetchUsers } from "@/services/data";

export default {
  name: "AllMedia",
  components: {
    PageButton,
    PageModal,
  },
  data() {
    return {
      editorModal: false,
      editMode: false,
      itemsPerPage: 5,
      currentPage: 1,
      options: [5, 10, 20, 50],
      articles: [],
      form: {
        title: "",
        link: "",
        relatedCompany: null,
        date: new Date(),
        content: "",
        featuredImage: null,
      },
      companies: [],
      isUploading: false,
      errors: {
        title: false,
        link: false,
        relatedCompany: false,
        date: false,
        content: false,
      },
      featuredImageName: "",
      editor: null,
      userMap: {},
      companyMap: {},
    };
  },
  computed: {
    ...mapState(["userDetails", "loading"]),
    total() {
      return this.articles.length;
    },
    start() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    end() {
      return Math.min(this.currentPage * this.itemsPerPage, this.total);
    },
    paginatedData() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      return this.articles.slice(startIndex, startIndex + this.itemsPerPage);
    },
    isEditor() {
      return this.userDetails?.type === "Editor";
    },
  },
  methods: {
    handleModalClose() {
      this.editMode = false;
    },
    resetForm() {
      return {
        title: "",
        link: "",
        relatedCompany: "",
        date: "",
        content: "",
        featuredImage: "",
        status: "For Edit",
      };
    },
    handleAddArticle() {
      this.form = this.resetForm();

      this.editorModal = true;
    },
    async editArticle(article) {
      await this.fetchCompanyMap();

      this.editMode = true;
      this.form = { ...article };

      // Display the selected company value
      if (this.companyMap[article.company]) {
        this.form.relatedCompany = article.company;
      } else {
        this.form.relatedCompany = null;
      }

      if (article.featuredImage) {
        const urlWithoutParams = article.featuredImage.split("?")[0];
        const decodedUrl = decodeURIComponent(urlWithoutParams);

        this.featuredImageName = decodedUrl.split("/").pop();
      }

      // Display the selected date
      if (article.date) {
        const { seconds, nanoseconds } = article.date;
        const milliseconds = seconds * 1000 + Math.floor(nanoseconds / 1000000);
        this.form.date = new Date(milliseconds);
      } else {
        this.form.date = new Date();
      }

      this.editorModal = true;
    },
    async handlePublish() {
      this.editorModal = false;

      this.saveArticle(true, "Published", this.userDetails.id);

      this.editMode = false;
    },

    handleItemsPerPageChange() {
      this.currentPage = 1;
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    getTagType(status) {
      return status === "Published" ? "success" : "warning";
    },
    isEditDisabled(status) {
      return status === "Published" && this.userDetails?.type === "Writer";
    },

    async handleUploadArticleThumb(file) {
      this.isUploading = true;

      try {
        const url = await fileUpload(file, "articles");

        this.form.featuredImage = url;
        this.featuredImageName = file.raw.name;

        setTimeout(() => {
          this.isUploading = false;
        }, 1000);
      } catch (error) {
        this.isUploading = false;
        console.error(error.message);
        this.$message.error(error.message);
      }
    },

    generateSlug(title) {
      return slugify(title);
    },

    clearError(fields) {
      if (Array.isArray(fields)) {
        fields.forEach((field) => {
          this.errors[field] = false;
        });
      } else {
        this.errors[fields] = false;
      }
    },

    clearErrors() {
      Object.keys(this.errors).forEach((key) => (this.errors[key] = false));
      this.resetForm();
    },

    async fetchUserMap() {
      const users = await fetchUsers();
      this.userMap = users.reduce((acc, user) => {
        acc[user.id] = `${user.firstName} ${user.lastName}`;
        return acc;
      }, {});
    },

    async fetchCompanyMap() {
      const companies = await fetchCompanies();
      this.companyMap = companies.reduce((acc, company) => {
        acc[company.id] = company.name;
        return acc;
      }, {});
    },

    initializeQuillEditor() {
      if (!this.editor) {
        this.editor = new Quill(this.$refs.editor, {
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              ["bold", "italic", "underline", "link"],
              [{ color: [] }, { background: [] }],
              ["image"],
            ],
          },
          theme: "snow",
          formats: [
            "header",
            "bold",
            "italic",
            "underline",
            "link",
            "color",
            "background",
            "image",
          ],
          placeholder: "Type something in here!",
        });

        this.editor.on("text-change", () => {
          this.form.content = this.editor.root.innerHTML;

          this.update();
        });
      }
    },

    // Handle Editor Cleanup
    destroyQuillEditor() {
      if (this.editor) {
        const editorContainer = this.$refs.editor;
        const toolbarContainer =
          editorContainer.parentNode.querySelector(".ql-toolbar");

        if (toolbarContainer) toolbarContainer.remove();

        editorContainer.innerHTML = "";
        this.editor = null;
      }
    },

    update: function update() {
      this.$emit(
        "update:modelValue",
        this.editor.getText() ? this.editor.root.innerHTML : ""
      );
    },

    // Article Helper
    async saveArticle(isUpdate = false, status = "For Edit", editorId = null) {
      const requiredFields = [
        "title",
        "link",
        "relatedCompany",
        "date",
        "content",
      ];

      const hasError = requiredFields.reduce((acc, field) => {
        if (!this.form[field]) {
          this.errors[field] = true;
          return true;
        }
        return acc;
      }, false);

      if (hasError) {
        this.$message.error("All fields are required!");
        return;
      }

      if (!this.form.link) {
        this.form.link = slugify(this.form.title);
      }

      const slug = this.form.link;

      const articleData = {
        title: this.form.title,
        link: slug,
        date: this.form.date,
        content: this.form.content,
        featuredImage: this.form.featuredImage,
        status: status,
        company: this.form.relatedCompany,
        editor: isUpdate && this.isEditor ? editorId : "",
      };

      try {
        if (isUpdate) {
          const articleRef = doc(db, "articles", this.form.id);
          const currentArticleSnapshot = await getDoc(articleRef);

          if (currentArticleSnapshot.exists()) {
            const currentArticle = currentArticleSnapshot.data();

            articleData.writer = currentArticle.writer;

            await updateDoc(articleRef, articleData);
            this.$message.success("Article updated successfully!");
          } else {
            articleData.writer = this.userDetails.id;

            const articleDB = collection(db, "articles");
            await addDoc(articleDB, articleData);
            this.$message.success("Article created successfully!");

            this.resetForm();
          }
          this.articles = await fetchArticles();

          this.editorModal = false;
          this.editMode = false;
        }
      } catch (error) {
        console.error(
          isUpdate ? "Failed to update article" : "Failed to create article",
          error
        );
        this.$message.error(
          isUpdate
            ? "Failed to update article. Please try again."
            : "Failed to create article. Please try again."
        );
      }
    },
  },
  watch: {
    // Auto generate slug on title change
    "form.title"(newTitle) {
      this.form.link = this.generateSlug(newTitle);
    },
    // Initialize Quill
    editorModal(newValue) {
      this.$nextTick(() => {
        if (newValue) {
          this.initializeQuillEditor();

          if (this.editor) {
            this.editor.root.innerHTML = this.form.content || "";
          }
        } else {
          this.destroyQuillEditor();
        }
      });
    },
  },
  async mounted() {
    try {
      this.companies = await fetchCompanies();
      this.articles = await fetchArticles();

      // Get the list of users
      await this.fetchUserMap();
    } catch (error) {
      console.error("Failed to load data", error);
    }
  },
};
</script>

<style>
.am-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.am-action-wrap {
  display: flex;
  justify-content: flex-end;
}

.am-action-wrap.is-writer {
  display: flex;
  justify-content: space-between;
}

.am-form-control {
  display: flex;
  align-items: center;
  gap: 18px;
}

.am-form-control .el-form-item {
  width: 100%;
}

.am-form-control .el-date-editor.el-input,
.el-date-editor.el-input__wrapper {
  width: 100%;
}

.am-action-wrap .el-select {
  max-width: 100px;
}

.am .el-form-item:last-child .el-form-item__content {
  display: block;
}

.am .uploaded-file {
  display: flex;
  align-items: center;
  gap: 8px;
}

.am .el-form-item.is-error .el-select__wrapper,
.am .is-error .el-input__wrapper {
  box-shadow: 0 0 0 1px red;
}

.ql-toolbar.ql-snow + .ql-container.ql-snow {
  height: 300px;
}

.am .el-dialog {
  width: 75%;
}

.am-link {
  color: #000000;
}

.el-table .cell {
  text-overflow: unset;
}
@media screen and (max-width: 768px) {
  .am .el-dialog {
    width: calc(100% - 48px);
  }

  .am-form-control {
    flex-direction: column;
    gap: 0;
  }

  .el-popup-parent--hidden {
    width: 100% !important;
  }
}
</style>
