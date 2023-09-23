<script lang="ts" setup>
defineComponent({ name: "InputButton" });

interface inputButtonProps {
	value: string;
	background: string;
	color: string;
	width: string;
}

defineProps<inputButtonProps>();
</script>

<template>
	<button class="__btn">
		<Loader v-if="value === 'loading'" />
		<span v-else>{{ value }}</span>
	</button>
</template>

<style lang="scss" scoped>
.__btn {
	align-self: flex-start;
	width: 100%;
	max-width: v-bind(width);
	padding: 15px;
	background: v-bind(background);
	border: none;
	border-radius: 12px;
	font-weight: 500;
	font-size: 16px;
	line-height: 19px;
	color: v-bind(color);
	margin-top: 24px;

	&:hover {
		cursor: pointer;
		opacity: 0.8;
	}
}
</style>
