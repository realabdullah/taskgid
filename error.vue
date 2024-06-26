<script setup lang="ts">
const { error } = defineProps({
	error: Object,
});
const { clearToken } = useToken();
const handleError = () => {
	if (error?.statusCode === 401) clearToken();
	clearError({ redirect: "/" });
};
</script>

<template>
	<div class="error position-relative h-full w-100 overflow-hidden" :class="{ 'not-found': error?.statusCode === 404 }">
		<button class="position-absolute bg-transparent border-none cursor-pointer col-text" @click="handleError">Home 🏡</button>
		<h3>{{ error?.statusMessage }}</h3>
	</div>
</template>

<style lang="scss" scoped>
.error {
	background-color: beige;

	&.not-found {
		background-image: url("https://res.cloudinary.com/dxvhsze0l/image/upload/v1697998295/kggpznnbbmn5g7mwxaj9.png");
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
	}

	// src: https://codepen.io/emanuelgsouza
	button {
		top: 3rem;
		right: 3rem;
		padding: 1.5rem;
		outline: none;

		&::after,
		&::before {
			content: "";
			display: block;
			position: absolute;
			width: 20%;
			height: 20%;
			border: 2px solid;
			transition: all 0.6s ease;
			border-radius: 2px;
		}

		&::after {
			bottom: 0;
			right: 0;
			border-top-color: transparent;
			border-left-color: transparent;
			border-bottom-color: var(--text-color);
			border-right-color: var(--text-color);
		}

		&::before {
			top: 0;
			left: 0;
			border-bottom-color: transparent;
			border-right-color: transparent;
			border-top-color: var(--text-color);
			border-left-color: var(--text-color);
		}

		&:hover::after,
		&:hover::before {
			border-bottom-color: var(--text-color);
			border-right-color: var(--text-color);
			border-top-color: var(--text-color);
			border-left-color: var(--text-color);
			width: 100%;
			height: 100%;
		}
	}

	h3 {
		font-size: 3rem;
		font-weight: 700;
		text-align: center;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
}
</style>
