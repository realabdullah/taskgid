<script lang="ts" setup>
defineProps<{
	task: Task;
}>();

const { activeWorkspace } = storeToRefs(useStore());

const getTaskStatus = (status: string) => {
	switch (status) {
		case "Pending":
			return "pending";
		case "In Progress":
			return "in-progress";
		default:
			return "completed";
	}
};
</script>

<template>
	<div class="tasks-card bg-white d-flex fd-column jc-space-between">
		<div class="status d-flex ai-center jc-space-between">
			<span>T-{{ task.task_no }}</span>
			<span :class="getTaskStatus(task.status)">{{ task.status }}</span>
		</div>
		<p class="fw-medium col-darkBlue">{{ task.title }}</p>
		<nuxt-link :to="`/dashboard/${activeWorkspace}/tasks/${task.id}`" class="task-url td-none d-flex ai-center cursor-pointer fw-semiBold col-blue">
			<span>View Task</span>
			<IconsArrow variant="right" />
		</nuxt-link>
	</div>
</template>

<style scoped lang="scss">
.tasks-card {
	border-radius: 1.2rem;
	padding: 2rem;

	.status {
		span {
			&:first-child {
				font-weight: 600;
				@include font(1.4rem, 1.7rem);
				color: #b9b9b9;
			}

			&:last-child {
				display: block;
				font-weight: 500;
				@include font(1.2rem, 1.4rem);
				color: #00c271;
				background: #f0fff9;
				border-radius: 1.2rem;
				padding: 0.5rem 1rem;
			}
		}

		.pending {
			background: #fffdf5 !important;
			color: #df9a00 !important;
		}

		.in-progress {
			background: #f2f4fd !important;
			color: #3754db !important;
		}
	}

	p {
		margin-top: 1.5rem;
		margin-bottom: 2.5rem;
		max-width: 20rem;
		@include font(1.6rem, 2.2rem);
	}

	.task-url {
		@include gap(1.2rem);
		@include font(1.4rem, 1.7rem);
		padding-left: 0;
	}
}
</style>
