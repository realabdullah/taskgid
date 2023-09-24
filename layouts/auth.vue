<script lang="ts" setup>
const route = useRoute();
</script>

<template>
	<div class="auth__layout bg-white d-flex pos-relative overflow-hidden">
		<div class="auth__layout-left w-100" :style="`order: ${route.path === '/signup' ? 1 : 2}`">
			<div class="inner d-flex fd-column jc-space-between h-100">
				<h2 class="auth__text as-center fw-semiBold col-white">Take your productivity to the next level.</h2>
				<p class="copyright as-flex-start fw-regular col-white">Copyright {{ new Date().getFullYear() }} | All Right Reserved</p>
			</div>
		</div>
		<div class="auth__layout-right w-100" :style="`order: ${route.path === '/login' ? 1 : 2}`">
			<slot />
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
	max-width: 150rem;
	margin: 0 auto;

	@media screen and (max-width: 787px) {
		width: 100%;
		padding: 2rem;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	&-left {
		max-width: 68rem;
		height: 100dvh;
		padding: 2rem;

		@media screen and (max-width: 1010px) {
			max-width: 50rem;
		}

		@media screen and (max-width: 787px) {
			display: none !important;
		}

		.inner {
			background-image: url("~/assets/images/authleft.png");
			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;
			border-radius: 3.2rem;
		}

		.auth__text {
			@include font(5.6rem, 6.6rem);
			letter-spacing: -0.02rem;
			max-width: 45.4rem;
			margin: auto;

			@media screen and (max-width: 1010px) {
				max-width: 100%;
				padding: 2rem;
			}
		}

		.copyright {
			@include font(2rem, 6.6rem);
			max-width: 45.4rem;
			margin: 0 auto;
		}
	}

	&-right {
		margin-left: 12rem;
		max-width: calc(100% - 68rem);

		@media screen and (max-width: 1010px) {
			max-width: calc(100% - 50rem);
		}

		@media screen and (max-width: 787px) {
			margin-left: 0;
			max-width: 100%;
		}

		@media screen and (min-width: 788px) and (max-width: 1150px) {
			margin: 2rem;
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
		border: 0.17rem solid $col-blue;
	}
}
</style>
