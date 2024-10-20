<template>
  <div v-if="article">
    <div class="container article">
      <img
        :src="article.featuredImage"
        alt="Article Image"
        class="img-fluid"
        loading="lazy"
      />
      <h1>{{ article.title }}</h1>
      <div>
        <span
          ><strong>Date: </strong
          >{{
            article.date
              ? article.date.toDate().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : ""
          }}</span
        >
      </div>
      <div>
        <span><strong>Status: </strong>{{ article.status }}</span>
      </div>
      <div class="article-body" v-html="article.content"></div>
    </div>
  </div>
  <div v-else>
    <p>Error: Article not found.</p>
  </div>
</template>

<script>
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";

export default {
  data() {
    return {
      article: null,
      loading: true,
      error: null,
    };
  },
  async created() {
    await this.fetchArticle(this.$route.params.slug);
  },

  methods: {
    async fetchArticle(slug) {
      try {
        const articlesRef = collection(db, "articles");
        const q = query(articlesRef, where("link", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const articleData = querySnapshot.docs[0].data();
          this.article = articleData;
        } else {
          console.error("Error: Article not found.");
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    removeEmptyParagraphs() {
      const paragraphs = this.$el.querySelectorAll(".article-body p");
      paragraphs.forEach((p) => {
        if (p.innerHTML.trim() === "<br>") {
          p.remove();
        }
      });
    },
  },
  watch: {
    "article.content": {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          this.removeEmptyParagraphs();
        });
      },
    },
  },
};
</script>

<style>
.article-body {
  margin-top: 32px;
  padding-top: 8px;
  border-top: 1px solid var(--vt-c-divider-light-2);
}
.article-body * {
  background-color: transparent !important;
}

.article-body p {
  margin-bottom: 1rem;
}

.article .img-fluid {
  width: 100%;
  margin-bottom: 12px;
}

.article h1 {
  line-height: 1.2;
  margin-bottom: 8px;
}
</style>
