<script lang="ts" setup>
defineProps<{
	task: Task;
}>();

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
	<div class="tasks-card">
		<div class="status">
			<span>T-{{ task.task_no }}</span>
			<span :class="getTaskStatus(task.status)">{{ task.status }}</span>
		</div>
		<p>{{ task.title }}</p>
		<nuxt-link :to="`/dashboard/tasks/${task.id}`" class="task-url">
			<span>View Task</span>
			<IconsArrow variant="right" />
		</nuxt-link>
	</div>
</template>

<style scoped lang="scss">
.tasks-card {
	background: #ffffff;
	border-radius: 12px;
	padding: 20px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	.status {
		display: flex;
		align-items: center;
		justify-content: space-between;

		span {
			&:first-child {
				font-weight: 600;
				font-size: 14px;
				line-height: 17px;
				color: #b9b9b9;
			}

			&:last-child {
				display: block;
				font-weight: 500;
				font-size: 12px;
				line-height: 14px;
				color: #00c271;
				background: #f0fff9;
				border-radius: 12px;
				padding: 5px 10px;
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
		margin-top: 15px;
		margin-bottom: 25px;
		max-width: 200px;
		font-weight: 500;
		font-size: 16px;
		line-height: 22px;
		color: #16171d;
	}

	.task-url {
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
		line-height: 17px;
		color: #3754db;
		padding-left: 0;
	}
}
</style>
