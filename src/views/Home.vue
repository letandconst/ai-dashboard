<template>
	<div
		v-if="loading"
		class="spinner-overlay"
	>
		<p>Loading...</p>
	</div>
	<div v-else>
		<h1>Welcome, {{ userDetails?.firstName || 'User' }}</h1>
		<p>Email: {{ userDetails?.email }}</p>
	</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
	name: 'HomePage',

	computed: {
		...mapState(['userDetails', 'loading']),
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
