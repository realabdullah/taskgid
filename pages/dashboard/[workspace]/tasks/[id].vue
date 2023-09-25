<script lang="ts" setup>
definePageMeta({
	name: "Task",
	middleware: ["auth"],
});

const route = useRoute();
const { activeWorkspace } = storeToRefs(useStore());

const showUpdateTaskModal = ref(false);
const showDeleteModal = ref(false);

const task = reactive({} as Task);

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

const deleteTask = async () => {
	const client = useSupabaseClient();

	const { error } = await client.from("tasks").delete().eq("id", task.id);
	if (error) {
		useEvent("showToast", {
			style: "solid",
			type: "error",
			message: "Failed!",
			description: "An error occured while trying to delete task.",
		});
		return;
	}

	navigateTo("/dashboard/tasks");
};

const fetchTask = async () => {
	const client = useSupabaseClient();
	const { data, error } = await client.from("tasks").select().eq("id", route.params.id);
	if (error) {
		return;
	}

	Object.assign(task, data[0]);
};

const updateTask = async () => {
	await fetchTask();
	showUpdateTaskModal.value = false;
};

await fetchTask();
</script>

<template>
	<NuxtLayout name="dashboard">
		<div class="task-page">
			<div class="breadcumb d-flex ai-flex-end">
				<p class="fw-semiBold col-darkBlue">Tasks</p>
				<IconsArrow variant="chevron-right" />
				<span class="fw-medium col-darkBlue">{{ task.title }}</span>
			</div>

			<nuxt-link :to="`/dashboard/${activeWorkspace}/tasks`" class="back d-flex ai-center jc-center td-none bg-white col-blue">
				<IconsArrow variant="left" />
			</nuxt-link>

			<div class="task-card bg-white d-flex ai-stretch jc-space-between">
				<div class="task-card__detail d-flex fd-column ai-flex-start">
					<p class="title fw-medium col-black">{{ task.title }}</p>
					<span class="status d-block fw-medium col-green bg-white" :class="getTaskStatus(task.status)">{{ task.status }}</span>
					<p class="desc fw-regular col-grey-3">{{ task.description }}</p>
					<div class="ctas d-flex ai-center">
						<BaseButton v-if="task.status === 'Pending'" class="btn text-nowrap" value="Work on it Now" background="#3754DB" color="#FFFFFF" width="180px" />
						<BaseButton v-else-if="task.status === 'In Progress'" class="btn text-nowrap" value="Mark As Done" background="#00C271" color="#FFFFFF" width="180px" />
						<div v-else-if="task.status === 'Completed'" class="task-completed d-flex ai-center">
							<IconsCompleted />
							<span class="col-green fw-medium">This task has been completed</span>
						</div>
						<div class="d-flex" style="gap: 1.2rem">
							<button class="delete bg-transparent d-flex ai-center jc-center cursor-pointer" @click="showDeleteModal = true">
								<IconsDelete />
							</button>
							<button class="edit bg-transparent d-flex ai-center jc-center cursor-pointer" @click="showUpdateTaskModal = true">
								<IconsEdit />
							</button>
						</div>
					</div>
				</div>

				<div class="task-card__dates d-flex fd-column ai-flex-end jc-space-between">
					<div class="task-date d-flex ai-center">
						<div class="task-date__created d-flex fd-column ai-flex-start">
							<span class="title fw-regular col-grey-3 text-nowrap">Date Created</span>
							<span class="date fw-bold col-grey-3 text-nowrap">{{ task.dateAdded }}</span>
						</div>
						<IconsEllipse variant="outline" />
					</div>
					<hr />
					<div class="task-date d-flex ai-center">
						<div class="task-date__created d-flex fd-column ai-flex-start">
							<span class="title fw-regular col-grey-3 text-nowrap text-nowrap">Due Date</span>
							<span class="date fw-bold col-grey-3 text-nowrap">{{ task.dueDate }}</span>
						</div>
						<IconsEllipse variant="solid" />
					</div>
				</div>
			</div>
		</div>

		<!-- UPDATE TASK MODAL -->
		<TasksCreate v-if="showUpdateTaskModal" usage="update" :task-to-be-updated="task" @close="showUpdateTaskModal = false" @task-created="updateTask" />

		<!-- DELETE TASK -->
		<BaseModal v-if="showDeleteModal" width="500px" @close-modal="showDeleteModal = false">
			<template #default>
				<div class="delete-task">
					<h1 class="fw-semiBold col-black">Delete Task</h1>
					<p class="fw-regular col-grey-3">
						Are you sure you want to delete the task
						<b>‘{{ task.title }}’</b>
						? This task is {{ task.status.toLowerCase() }}.
					</p>
					<div class="delete-task__ctas d-flex ai-center">
						<BaseButton value="No" background="#3754DB" color="#FFFFFF" width="120px" @click="showDeleteModal = false" />
						<BaseButton value="Yes" background="#FFF0F0" color="#B80020" width="120px" @click="deleteTask" />
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
	padding: 5rem;

	h1 {
		@include font(2.8rem, 3.4rem);
	}

	p {
		margin-top: 1.5rem;
		@include font(1.8rem, 2.4rem);
	}

	&__ctas {
		@include gap(1.6rem);
	}
}
</style>
