<script lang="ts" setup>
const {
	value,
	usage = "submit",
	type,
} = defineProps<{
	value: string;
	usage?: "button" | "submit";
	type?: string;
}>();
</script>

<template>
	<button class="__btn w-100 flex items-center content-center bg-transparent weight-medium col-white self-start" :class="type" :type="usage" :disabled="value === 'loading'">
		<Loader v-if="value === 'loading'" />
		<span v-else>{{ value }}</span>
		<slot />
	</button>
</template>

<style lang="scss" scoped>
.__btn {
	padding: 1.3rem;
	border-radius: 1.2rem;
	@include font(1.6rem, 1.9rem);
	transition: all 0.2s ease-in-out;
	color: var(--text-color);
	box-shadow: var(--box-shadow);
	gap: 0.5rem;

	&:hover {
		cursor: pointer;
		opacity: 0.8;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	&.danger {
		color: #ff0000;
	}
}
</style>
