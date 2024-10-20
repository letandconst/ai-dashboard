<template>
  <div v-if="loading" class="spinner-overlay">
    <p>Loading...</p>
  </div>
  <div class="container" v-else>
    <p>Type: {{ userDetails?.type }}</p>
    <h1>Dashboard</h1>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="For Edit" name="edit">
        <div v-if="editArticles.length === 0">No data</div>
        <div v-else>
          <ArticleWrapper :articles="editArticles" />
        </div>
      </el-tab-pane>
      <el-tab-pane label="Published" name="published">
        <div v-if="publishedArticles.length === 0">No data</div>
        <div v-else>
          <ArticleWrapper :articles="publishedArticles" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState } from "vuex";
import ArticleWrapper from "@/components/Article/ArticleWrapper.vue";
import { fetchArticles } from "@/services/data";
export default {
  name: "HomePage",
  components: {
    ArticleWrapper,
  },

  computed: {
    ...mapState(["userDetails", "loading"]),
  },
  data() {
    return {
      activeTab: "edit",
      editArticles: [],
      publishedArticles: [],
    };
  },
  async mounted() {
    await this.loadArticles();
  },
  methods: {
    async loadArticles() {
      try {
        const articles = await fetchArticles();
        this.editArticles = articles.filter(
          (article) => article.status === "For Edit"
        );
        this.publishedArticles = articles.filter(
          (article) => article.status === "Published"
        );
      } catch (error) {
        console.error("Failed to load articles", error);
      }
    },
  },
};
</script>
