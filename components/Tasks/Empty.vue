<script lang="ts" setup>
interface EmptyProps {
	description: string;
	extraText: string;
	buttonText?: string;
}

defineProps<EmptyProps>();
</script>

<template>
	<div class="task__empty">
		<IconsTask variant="large" />

		<h2>No Tasks Yet</h2>
		<p>{{ description }}</p>
		<p>{{ extraText }}</p>

		<BaseButton v-if="!!buttonText" class="btn" :value="buttonText" background="#3754DB" color="#FFFFFF" width="213px" />
	</div>
</template>

<style scoped lang="scss">
.task__empty {
	margin-top: 100px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	h2 {
		margin: 50px 0 12px;
		font-weight: 600;
		font-size: 28px;
		line-height: 34px;
		color: #000000;
	}

	p {
		font-weight: 400;
		font-size: 16px;
		line-height: 19px;
		color: #6d6c6c;
	}

	.btn {
		margin-top: 24px;
		align-self: unset;
	}
}
</style>
