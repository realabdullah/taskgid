<script lang="ts" setup>
const route = useRoute();
</script>

<template>
	<div class="auth__layout bg-white flex items-center content-center position-relative h-full overflow-hidden">
		<div class="content w-100">
			<slot />
		</div>
	</div>

	<div class="auth-cta position-fixed">
		<button class="bg-white weight-medium cursor-pointer text-nowrap" @click="navigateTo(route.path === '/login' ? '/signup' : '/login')">
			<slot name="cta" />
		</button>
	</div>
</template>

<style lang="scss" scoped>
.auth__layout {
	.content {
		max-width: 60rem;
		padding: 2rem;

		@media screen and (max-width: 600px) {
			max-width: 100%;
		}
	}
}

.auth-cta {
	top: 4.4rem;
	right: 12rem;

	@media screen and (max-width: 787px) {
		top: 2rem;
		right: 4rem;
	}

	button {
		@include font(1.6rem, 1.9rem);
		width: 18rem;
		border-radius: 1.2rem;
		padding: 1.5rem 3rem;
		box-shadow: var(--box-shadow);
		transition: all 0.2s ease-in-out;

		&:hover {
			transform: scale(1.05);
		}
	}
}
</style>
