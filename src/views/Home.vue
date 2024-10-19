<template>
	<div
		v-if="loading"
		class="spinner-overlay"
	>
		<p>Loading...</p>
	</div>
	<div
		class="container"
		v-else
	>
		<p>Type: {{ userDetails?.type }}</p>
		<h1>Dashboard</h1>
		<el-tabs v-model="activeTab">
			<el-tab-pane
				label="For Edit"
				name="edit"
			>
				<ArticleWrapper :articles="editArticles" />
			</el-tab-pane>
			<el-tab-pane
				label="Published"
				name="published"
			>
				<ArticleWrapper :articles="publishedArticles" />
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script>
import { mapState } from 'vuex';
import ArticleWrapper from '@/components/Article/ArticleWrapper.vue';
export default {
	name: 'HomePage',
	components: {
		ArticleWrapper,
	},

	computed: {
		...mapState(['userDetails', 'loading']),
	},
	data() {
		return {
			activeTab: 'edit',
			editArticles: [],
			publishedArticles: [],
		};
	},
	mounted() {
		this.loadDummyData();
	},
	methods: {
		loadDummyData() {
			// Dummy data for the articles
			const dummyData = [
				{
					id: 1,
					image: 'https://via.placeholder.com/150',
					title: 'Article Title 1',
					link: '#',
					date: '2024-10-19',
					writerName: 'John Doe',
					editorName: 'Jane Smith',
					status: 'For Edit',
				},
				{
					id: 2,
					image: 'https://via.placeholder.com/150',
					title: 'Article Title 2',
					link: '#',
					date: '2024-10-18',
					writerName: 'Alice Johnson',
					editorName: 'Bob Brown',
					status: 'For Edit',
				},
				{
					id: 3,
					image: 'https://via.placeholder.com/150',
					title: 'Article Title 3',
					link: '#',
					date: '2024-10-18',
					writerName: 'Alice Johnson',
					editorName: 'Bob Brown',
					status: 'Published',
				},
				{
					id: 4,
					image: 'https://via.placeholder.com/150',
					title: 'Article Title 4',
					link: '#',
					date: '2024-10-18',
					writerName: 'Alice Johnson',
					editorName: 'Bob Brown',
					status: 'Published',
				},
				// Add more articles as needed
			];

			this.editArticles = dummyData.filter((article) => article.status === 'For Edit');
			this.publishedArticles = dummyData.filter((article) => article.status === 'Published');
		},
	},
};
</script>

<style scoped>
.spinner-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.8);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}
</style>
