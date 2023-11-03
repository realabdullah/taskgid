<script lang="ts" setup>
definePageMeta({
	name: "Task",
	middleware: ["auth"],
});

const { activeWorkspace } = storeToRefs(useStore());
const { task, fetchTask, deleteTask, getTaskStatus } = useTask();

const showUpdateTaskModal = ref(false);
const showDeleteModal = ref(false);

const updateTask = (newTask: Task) => {
	Object.assign(task, newTask);
	showUpdateTaskModal.value = false;
};

await fetchTask();
</script>

<template>
	<NuxtLayout name="dashboard">
		<div class="task-page">
			<div class="breadcumb flex items-end">
				<p class="weight-semiBold col-darkBlue">Tasks</p>
				<IconsArrow variant="chevron-right" />
				<span class="weight-medium col-darkBlue">{{ task.title }}</span>
			</div>

			<nuxt-link :to="`/dashboard/${activeWorkspace}/tasks`" class="back flex items-center content-center text-unset bg-white col-blue">
				<IconsArrow variant="left" />
			</nuxt-link>

			<div class="task-card bg-white flex items-stretch content-between">
				<div class="task-card__detail flex flex-column items-start">
					<p class="title weight-medium col-black">{{ task.title }}</p>
					<span class="status block weight-medium col-green bg-white" :class="getTaskStatus(task.status)">{{ task.status }}</span>
					<p class="desc weight-regular col-grey-3">{{ task.description }}</p>
					<div class="ctas flex items-center">
						<BaseButton v-if="task.status === 'Pending'" class="btn text-nowrap" value="Work on it Now" />
						<BaseButton v-else-if="task.status === 'In Progress'" class="btn text-nowrap" value="Mark As Done" />
						<div v-else-if="task.status === 'Completed'" class="task-completed flex items-center">
							<IconsCompleted />
							<span class="col-green weight-medium">This task has been completed</span>
						</div>
						<div class="flex" style="gap: 1.2rem">
							<button class="delete bg-transparent flex items-center content-center cursor-pointer" @click="showDeleteModal = true">
								<IconsDelete />
							</button>
							<button class="edit bg-transparent flex items-center content-center cursor-pointer" @click="showUpdateTaskModal = true">
								<IconsEdit />
							</button>
						</div>
					</div>
				</div>

				<div class="task-card__dates flex flex-column items-end content-between">
					<div class="task-date flex items-center">
						<div class="task-date__created flex flex-column items-start">
							<span class="title weight-regular col-grey-3 text-nowrap">Date Created</span>
							<span class="date weight-bold col-grey-3 text-nowrap">{{ task.dateAdded }}</span>
						</div>
						<IconsEllipse variant="outline" />
					</div>
					<hr />
					<div class="task-date flex items-center">
						<div class="task-date__created flex flex-column items-start">
							<span class="title weight-regular col-grey-3 text-nowrap text-nowrap">Due Date</span>
							<span class="date weight-bold col-grey-3 text-nowrap">{{ task.dueDate }}</span>
						</div>
						<IconsEllipse variant="solid" />
					</div>
				</div>
			</div>
		</div>

		<!-- UPDATE TASK MODAL -->
		<TasksCreate v-if="showUpdateTaskModal" usage="update" :task-to-be-updated="task" @close="showUpdateTaskModal = false" @task-created="updateTask" />

		<!-- DELETE TASK -->
		<BaseModal v-if="showDeleteModal" width="50rem" @close-modal="showDeleteModal = false">
			<template #default>
				<div class="delete-task flex flex-column">
					<h1 class="weight-semiBold col-black">Delete Task</h1>
					<p class="weight-regular col-grey-3">
						Are you sure you want to delete the task
						<b>‘{{ task.title }}’</b>
						? This task is {{ task.status.toLowerCase() }}.
					</p>
					<div class="delete-task__ctas flex items-center">
						<BaseButton value="No" usage="button" @click="showDeleteModal = false" />
						<BaseButton value="Yes" usage="button" type="danger" @click="deleteTask" />
					</div>
				</div>
			</template>
		</BaseModal>
	</NuxtLayout>
</template>

<style scoped lang="scss">
.task-page {
	.breadcumb {
		@include gap(0.5rem);
		margin-bottom: 1.5rem;

		p {
			@include font(3.2rem, normal);
		}

		span {
			@include font(1.6rem, 1.9rem);
		}
	}

	.back {
		width: 5.6rem;
		height: 5.6rem;
		border-radius: 1.2rem;
		margin-bottom: 2rem;
	}

	.task-card {
		border-radius: 1.6rem;
		padding: 3.2rem 4rem;

		@media screen and (max-width: 850px) {
			padding: 1.5rem 2rem;
			flex-direction: column;
		}

		&__detail {
			.title {
				max-width: 38rem;
				@include font(2.4rem, 2.9rem);
				margin-bottom: 1.2rem;
			}

			.status {
				@include font(1.2rem, 1.4rem);
				border-radius: 1.2rem;
				padding: 0.5rem 1rem;
			}

			.pending {
				background: #fffdf5 !important;
				color: #df9a00 !important;
			}

			.in-progress {
				background: #f2f4fd !important;
				color: #3754db !important;
			}

			.desc {
				max-width: 52rem;
				margin-top: 2rem;
				@include font(1.6rem, 2.4rem);
			}

			.ctas {
				margin-top: 4rem;
				@include gap(2rem);

				@media screen and (max-width: 445px) {
					flex-direction: column;
					align-items: flex-start !important;
					gap: 1rem;
				}

				.task-completed {
					gap: 1.2rem;

					span {
						@include font(1.6rem, 1.9rem);
					}
				}

				.btn {
					margin-top: 0;
				}

				.delete,
				.edit {
					padding: 1.2rem;
					border-radius: 1.2rem;
				}

				.delete {
					background: #fff0f0;
				}

				.edit {
					background: #f6f8fd;
				}
			}
		}

		&__dates {
			@media screen and (max-width: 850px) {
				margin-top: 2rem;
				flex-direction: row !important;
				align-items: center !important;
				@include gap(1.5rem);
			}

			@media screen and (max-width: 445px) {
				flex-direction: column !important;
				align-items: flex-start !important;
				gap: 1rem;
			}

			.task-date {
				@include gap(1.2rem);

				&__created {
					@include gap(0.2rem);

					.title {
						@include font(1.2rem, 1.4rem);
					}

					.date {
						@include font(1.4rem, 1.7rem);
					}
				}
			}

			hr {
				background: #d5d5d5;
				width: 0.06rem;
				height: 100%;
				margin-right: 1.3rem;

				@media screen and (max-width: 850px) {
					width: 100%;
					height: 0.06rem;
					margin-right: 0;
				}

				@media screen and (max-width: 445px) {
					display: none;
				}
			}
		}
	}
}

.delete-task {
	@include gap(1.5rem);
	padding: 3rem;

	h1 {
		@include font(2.8rem, 3.4rem);
	}

	p {
		@include font(1.8rem, 2.4rem);
	}

	&__ctas {
		@include gap(1.6rem);
	}
}
</style>
