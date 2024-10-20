<template>
  <div>
    <div class="article-grid">
      <a
        v-for="article in articles"
        :key="article.id"
        :href="`/article/${article.link}`"
        class="article-card-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <el-card style="max-width: 480px" class="article-card">
          <template #header>{{ article.title }}</template>
          <img :src="article.featuredImage" style="width: 100%" />
          <p>Date: {{ formatDate(article.date) }}</p>
          <p>Writer: {{ userMap[article.writer] || "" }}</p>
          <p>Editor: {{ userMap[article.editor] || "" }}</p>
        </el-card>
      </a>
    </div>
  </div>
</template>

<script>
import { fetchUsers } from "@/services/data";
export default {
  name: "ArticleWrapper",
  props: {
    articles: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      userMap: {},
    };
  },

  methods: {
    formatDate(date) {
      if (!date) return "";

      const { seconds, nanoseconds } = date;
      const milliseconds = seconds * 1000 + Math.floor(nanoseconds / 1000000);
      const formattedDate = new Date(milliseconds);

      return formattedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },

    async fetchUserMap() {
      const users = await fetchUsers();
      this.userMap = users.reduce((acc, user) => {
        acc[user.id] = `${user.firstName} ${user.lastName}`;
        return acc;
      }, {});
    },
  },
  async mounted() {
    try {
      await this.fetchUserMap();
    } catch (error) {
      console.error("Failed to load data", error);
    }
  },
};
</script>

<style scoped>
.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.article-card {
  width: 100%;
}

.article-image {
  max-width: 100%;
  height: auto;
}

.article-info {
  padding: 16px;
}

.article-card-link {
  text-decoration: none;
}
</style>
