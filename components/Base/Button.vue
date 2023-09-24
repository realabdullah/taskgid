<script lang="ts" setup>
defineComponent({ name: "InputButton" });

interface inputButtonProps {
	value: string;
	background: string;
	color: string;
	width: string;
	disabled?: boolean;
}

const { disabled = false } = defineProps<inputButtonProps>();
</script>

<template>
	<button class="__btn w-100 fw-medium" :disabled="disabled">
		<Loader v-if="value === 'loading'" />
		<span v-else>{{ value }}</span>
	</button>
</template>

<style lang="scss" scoped>
.__btn {
	align-self: flex-start;
	max-width: v-bind(width);
	padding: 1.5rem;
	background: v-bind(background);
	border-radius: 1.2rem;
	@include font(1.6rem, 1.9rem);
	color: v-bind(color);
	margin-top: 2.4rem;

	&:hover {
		cursor: pointer;
		opacity: 0.8;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
}
</style>
