<script lang="ts" setup>
defineProps<{
	description: string;
	extraText: string;
	buttonText?: string;
}>();
defineEmits(["create-task"]);
</script>

<template>
	<div class="task__empty d-flex fd-column ai-center jc-center">
		<IconsTask variant="large" />

		<h2 class="fw-semiBold col-black">No Tasks Yet</h2>
		<p class="fw-regular col-grey">{{ description }}</p>
		<p class="fw-regular col-grey">{{ extraText }}</p>

		<BaseButton v-if="!!buttonText" class="btn" :value="buttonText" @click="$emit('create-task')" />
	</div>
</template>

<style scoped lang="scss">
.task__empty {
	margin-top: 10rem;

	h2 {
		margin: 5rem 0 1.2rem;
		@include font(2.8rem, 3.4rem);
	}

	p {
		@include font(1.6rem, 1.9rem);
	}

	.btn {
		margin-top: 2.4rem;
	}
}
</style>
