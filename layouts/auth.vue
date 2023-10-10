<script lang="ts" setup>
const route = useRoute();
</script>

<template>
	<div class="auth__layout bg-white d-grid ai-center pos-relative h-full overflow-hidden">
		<div class="auth__layout-left w-100 h-full" :style="`order: ${route.path === '/signup' ? 1 : 2}`"></div>
		<div class="auth__layout-right w-100" :style="`order: ${route.path === '/login' ? 1 : 2}`">
			<div class="content">
				<slot />
			</div>
		</div>
	</div>

	<div class="auth-cta pos-fixed">
		<button class="bg-white col-blue fw-medium cursor-pointer" @click="navigateTo(route.path === '/login' ? '/signup' : '/login')">
			<slot name="cta" />
		</button>
	</div>
</template>

<style lang="scss" scoped>
.auth__layout {
	grid-template-columns: 1fr 1fr;

	@media screen and (max-width: 883px) {
		grid-template-columns: 1fr;
	}

	&-left {
		background: url("~/assets/images/authleft.png") center/cover no-repeat;
		padding: 2rem;

		@media screen and (max-width: 883px) {
			display: none;
		}
	}

	&-right {
		.content {
			max-width: 60rem;
			padding: 2rem;
			margin-left: 4rem;

			@media screen and (max-width: 600px) {
				margin-left: 0;
				max-width: 100%;
			}
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
		border: 0.17rem solid $col-blue;
		box-shadow: #64646f33 0 0.7rem 2.9rem 0;
		transition: all 0.2s ease-in-out;

		&:hover {
			transform: scale(1.05);
		}
	}
}
</style>
