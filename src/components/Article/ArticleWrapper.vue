<template>
  <div>
    <div class="article-grid">
      <el-card
        style="max-width: 480px"
        v-for="article in articles"
        :key="article.id"
        class="article-card"
      >
        <template #header>{{ article.title }}</template>
        <img
          src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
          style="width: 100%"
        />
        <p>Date: {{ formatDate(article.date) }}</p>
        <p>Writer: {{ article.writerName }}</p>
        <p>Editor: {{ article.editorName }}</p>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "ArticleWrapper",
  props: {
    articles: {
      type: Array,
      required: true,
    },
  },

  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    },
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
</style>
