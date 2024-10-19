<template>
  <div class="container am">
    <p>Type: {{ userDetails?.type }}</p>

    <div class="am-action-wrap">
      <PageButton
        type="primary"
        @open-modal="editorModal = true"
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
            :src="scope.row.image"
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
          <a :href="scope.row.link" target="_blank">{{ scope.row.link }}</a>
        </template>
      </el-table-column>

      <el-table-column label="Writer">
        <template v-slot="scope">
          {{ scope.row.writer }}
        </template>
      </el-table-column>

      <el-table-column label="Editor">
        <template v-slot="scope">
          {{ scope.row.editor }}
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
      title="Add New Article"
      v-model="editorModal"
      @confirm="handleSubmit"
    >
      <template #default>
        <el-form
          :model="form"
          :rules="rules"
          ref="articleForm"
          label-position="top"
        >
          <div class="am-form-control">
            <el-form-item label="Title" prop="title">
              <el-input
                v-model="form.title"
                placeholder="Enter article title"
              />
            </el-form-item>

            <el-form-item label="URL" prop="link">
              <el-input v-model="form.link" placeholder="Generated slug" />
            </el-form-item>
          </div>

          <div class="am-form-control">
            <el-form-item label="Related Company" prop="relatedCompany">
              <el-select
                v-model="form.relatedCompany"
                placeholder="Select Company"
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
                default-value="new Date()"
              />
            </el-form-item>
          </div>
          <!-- WYSIWYG Editor -->
          <el-form-item label="Content" prop="content">
            <QuillEditor v-model="form.content" theme="snow" />
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

import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

import { fetchCompanies } from "@/services/firebase";

export default {
  name: "AllMedia",
  components: {
    PageButton,
    PageModal,
    QuillEditor,
  },
  data() {
    return {
      editorModal: false,
      itemsPerPage: 10,
      currentPage: 1,
      options: [5, 10, 20, 50],
      articles: [
        {
          id: 1,
          image: "https://via.placeholder.com/80",
          title: "Article One",
          link: "http://example.com/1",
          writer: "Author A",
          editor: "Editor A",
          status: "Published",
        },
        {
          id: 2,
          image: "https://via.placeholder.com/80",
          title: "Article Two",
          link: "http://example.com/2",
          writer: "Author B",
          editor: "Editor B",
          status: "For Edit",
        },
        {
          id: 3,
          image: "https://via.placeholder.com/80",
          title: "Article Three",
          link: "http://example.com/3",
          writer: "Author C",
          editor: "Editor C",
          status: "Published",
        },
        {
          id: 4,
          image: "https://via.placeholder.com/80",
          title: "Article Four",
          link: "http://example.com/4",
          writer: "Author D",
          editor: "Editor D",
          status: "For Edit",
        },
        {
          id: 5,
          image: "https://via.placeholder.com/80",
          title: "Article Five",
          link: "http://example.com/5",
          writer: "Author E",
          editor: "Editor E",
          status: "Published",
        },
        {
          id: 6,
          image: "https://via.placeholder.com/80",
          title: "Article Six",
          link: "http://example.com/6",
          writer: "Author F",
          editor: "Editor F",
          status: "For Edit",
        },
        {
          id: 7,
          image: "https://via.placeholder.com/80",
          title: "Article Seven",
          link: "http://example.com/7",
          writer: "Author G",
          editor: "Editor G",
          status: "Published",
        },
        {
          id: 8,
          image: "https://via.placeholder.com/80",
          title: "Article Eight",
          link: "http://example.com/8",
          writer: "Author H",
          editor: "Editor H",
          status: "For Edit",
        },
        {
          id: 9,
          image: "https://via.placeholder.com/80",
          title: "Article Nine",
          link: "http://example.com/9",
          writer: "Author I",
          editor: "Editor I",
          status: "Published",
        },
        {
          id: 10,
          image: "https://via.placeholder.com/80",
          title: "Article Ten",
          link: "http://example.com/10",
          writer: "Author J",
          editor: "Editor J",
          status: "For Edit",
        },
        {
          id: 11,
          image: "https://via.placeholder.com/80",
          title: "Article Eleven",
          link: "http://example.com/11",
          writer: "Author K",
          editor: "Editor K",
          status: "Published",
        },
        {
          id: 12,
          image: "https://via.placeholder.com/80",
          title: "Article Twelve",
          link: "http://example.com/12",
          writer: "Author L",
          editor: "Editor L",
          status: "For Edit",
        },
      ],
      form: {
        relatedCompany: "",
        title: "",
        link: "",
        date: new Date(),
        content: "",
      },
      companies: [],
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
  },
  methods: {
    editArticle(article) {
      console.log("Edit article:", article);
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
    async fetchCompanyList() {
      try {
        this.companies = await fetchCompanies();
      } catch (error) {
        console.error("Failed to load companies", error);
      }
    },
  },
  mounted() {
    console.log("user", this.userDetails?.type);
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

.ql-toolbar.ql-snow + .ql-container.ql-snow {
  height: 300px;
}
</style>
