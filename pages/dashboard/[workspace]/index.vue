<script lang="ts" setup>
definePageMeta({
	title: "Dashboard",
	name: "dashboard",
	middleware: ["auth"],
});

const { tasks } = storeToRefs(useStore());
const { fetchTeams } = useTeam();
const { task: newTask, fetchTasks } = useTask();

const isModalOpen = ref(false);
const popup = ref("");
const selectedSortOption = ref("dueDate");
const selectedFilterOption = ref("all");
const selectedTask = ref({ ...newTask });
const taskModalMode = ref("view");

const openModal = (task: any, mode: string) => {
	selectedTask.value = task;
	taskModalMode.value = mode;
	isModalOpen.value = true;
};

const shortenTextToSummary = (text: string) => {
	if (text.length <= 200) {
		return text;
	} else {
		const truncatedText = text.substring(0, 200 - 3).trim() + "...";
		return truncatedText;
	}
};

const openPopup = (name: string) => {
	popup.value = popup.value === name ? "" : name;
};

const sortOptions = [
	{ name: "title", value: "title" },
	{ name: "due date", value: "dueDate" },
	{ name: "priority", value: "priority" },
	{ name: "status", value: "status" },
];

const filterOptions = [
	{ name: "All", value: "all" },
	{ name: "Not started", value: "not started" },
	{ name: "In Progress", value: "In Progress" },
	{ name: "Completed", value: "Completed" },
	{ name: "Low Priority", value: "Low" },
	{ name: "Medium Priority", value: "Medium" },
	{ name: "High Priority", value: "High" },
];

const sortedTasks = computed(() => {
	if (!tasks.value || !Array.isArray(tasks.value) || tasks.value.length === 0) {
		return [];
	}

	return tasks.value.slice().sort((a, b) => {
		switch (selectedSortOption.value) {
			case "title":
				return a.title.localeCompare(b.title);
			case "dueDate":
				return new Date(a.dueDate).valueOf() - new Date(b.dueDate).valueOf();
			case "priority":
				return a.priority.localeCompare(b.priority);
			case "status":
				return a.status.localeCompare(b.status);
			default:
				return 0;
		}
	});
});

const filteredTasksByStatus = computed(() => {
	if (sortedTasks.value && Array.isArray(sortedTasks.value) && sortedTasks.value.length > 0) {
		if (selectedFilterOption.value === "all") {
			return sortedTasks.value;
		} else {
			return sortedTasks.value.filter(
				(task) => task.status.toLowerCase() === selectedFilterOption.value.toLowerCase() || task.priority.toLowerCase() === selectedFilterOption.value.toLowerCase(),
			);
		}
	} else {
		return [];
	}
});

await fetchTeams();
await fetchTasks();
</script>

<template>
	<NuxtLayout name="dashboard">
		<div class="dashboard">
			<div class="dashboard__header flex items-center content-between">
				<h1 class="dashboard__header-title">Tasks ({{ filteredTasksByStatus.length }})</h1>
				<div class="flex items-center" style="gap: 1rem">
					<button class="dashboard__header-button bg-transparent cursor-pointer flex items-center position-relative" style="gap: 0.5rem" @click="openPopup('filter')">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="15">
							<path d="M21 4V6H20L15 13.5V22H9V13.5L4 6H3V4H21ZM6.4037 6L11 12.8944V20H13V12.8944L17.5963 6H6.4037Z" fill="rgba(69,68,71,1)"></path>
						</svg>
						Filter

						<div v-if="popup === 'filter'" class="popup bg-white position-absolute">
							<button
								v-for="option in filterOptions"
								:key="option.value"
								class="bg-transparent cursor-pointer text-capitalize text-left"
								:class="{ selected: option.value === selectedFilterOption }"
								@click="selectedFilterOption = option.value">
								{{ option.name }}
							</button>
						</div>
					</button>
					<button class="dashboard__header-button bg-transparent cursor-pointer flex items-center position-relative" style="gap: 0.5rem" @click="openPopup('sort')">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
							<path d="M20 4V16H23L19 21L15 16H18V4H20ZM12 18V20H3V18H12ZM14 11V13H3V11H14ZM14 4V6H3V4H14Z" fill="rgba(69,68,71,1)"></path>
						</svg>
						Sort

						<div v-if="popup === 'sort'" class="popup bg-white position-absolute flex flex-column" style="gap: 1rem">
							<button
								v-for="option in sortOptions"
								:key="option.value"
								class="bg-transparent cursor-pointer text-capitalize text-left"
								:class="{ selected: option.value === selectedSortOption }"
								@click="selectedSortOption = option.value">
								{{ option.name }}
							</button>
						</div>
					</button>
					<button class="dashboard__header-button bg-transparent cursor-pointer" @click="openModal(newTask, 'create')">Create Task</button>
				</div>
			</div>

			<div class="dashboard__content">
				<ul v-if="filteredTasksByStatus && filteredTasksByStatus.length > 0" class="dashboard__content-tasks grid">
					<li v-for="task in filteredTasksByStatus" :key="task._id" class="task bg-white cursor-pointer flex flex-column content-between" @click="openModal(task, 'view')">
						<div class="flex flex-column">
							<div class="flex items-center content-between">
								<h3 class="task__title">{{ task.title }}</h3>
								<button class="task__action bg-transparent cursor-pointer">
									<IconsMore />
								</button>
							</div>
							<p class="task__description">{{ shortenTextToSummary(task.description) }}</p>
						</div>

						<div class="task__meta flex items-center content-between">
							<span class="task__meta-item flex items-center" style="gap: 0.5rem">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
									<path
										d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM7 5H4V9H20V5H17V7H15V5H9V7H7V5Z"
										fill="rgba(102,101,111,1)"></path>
								</svg>
								{{ formatDate(task.dueDate) }}
							</span>
							<div class="status task__meta-item text-capitalize">{{ task.status }}</div>
							<span class="task__meta-priority" :class="task.priority.toLowerCase()">{{ task.priority }}</span>
						</div>
					</li>
				</ul>

				<!-- EMPTY STATE -->
				<div v-else class="dashboard__content-empty position-relative">
					<p class="dashboard__content-empty-text position-absolute text-center">
						You have no task created in your workspace yet.
						<br />
						Get productive, create a task now.
					</p>
				</div>
			</div>

			<TaskDetails v-if="isModalOpen" :data="selectedTask" :mode="taskModalMode" @close="isModalOpen = false" />
		</div>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.dashboard {
	&__header {
		margin-bottom: 2rem;

		&-title {
			@include font(2.4rem, 130%);
		}

		&-button {
			@include font(1.4rem, 100%);
			border: 1.5px solid #e2e2e8;
			border-radius: 1.4rem;
			padding: 0.7rem 1.5rem;
			transition: all 0.3s ease-in-out;

			&:hover {
				background-color: #e2e2e8;
			}

			.popup {
				width: 15rem;
				top: 4rem;
				right: 0;
				border: 1.5px solid #e2e2e8;
				border-radius: 1.4rem;
				box-shadow: #959da533 0px 8px 24px;
				transition: all 0.3s ease-in-out;
				z-index: 9;

				button {
					@include font(1.4rem, 100%);
					color: #454447;
					width: 100%;
					padding: 0.7rem 1.5rem;

					&:first-child {
						padding-top: 1.5rem;
						border-top-left-radius: 1.4rem;
						border-top-right-radius: 1.4rem;
					}

					&:last-child {
						padding-bottom: 1.5rem;
						border-bottom-left-radius: 1.4rem;
						border-bottom-right-radius: 1.4rem;
					}

					&:hover {
						background-color: #e2e2e8;
					}

					&.selected {
						background-color: #e2e2e8;
					}
				}
			}
		}
	}

	&__content {
		&-tasks {
			grid-template-columns: repeat(auto-fit, minmax(40rem, 1fr));
			@include gap(2rem);

			.task {
				padding: 1.6rem;
				border-radius: 1.4rem;
				border: 1.5px solid #e2e2e8;
				@include gap(1.2rem);
				box-shadow: #959da533 0px 8px 24px;

				&__title {
					color: #454447;
					@include font(1.6rem, 130%);
				}

				&__action {
					color: #e2e2e8;
					width: 2rem;
					height: 2rem;
				}

				&__description {
					max-width: 60rem;
					margin-top: 1.5rem;
					color: #66656f;
					@include font(1.4rem, 100%);
				}

				&__meta {
					margin-top: 2.5rem;
					@include gap(1.2rem);

					&-item {
						color: #66656f;
						@include font(1.4rem, 100%);
					}

					&-priority {
						color: #66656f;
						padding: 0.5rem 2rem 0.7rem;
						border-radius: 1.4rem;
						@include font(1.4rem, 100%);

						&.high {
							background-color: #f4433662;
						}

						&.medium {
							background-color: #ffc10773;
						}

						&.low {
							background-color: #4caf4f58;
						}
					}
				}
			}
		}

		&-empty {
			margin-top: 2rem;
			@include gap(1rem);
			width: 100%;
			height: calc(100dvh - 25rem);
			border-radius: 1.4rem;
			border: 1.5px solid #e2e2e8;
			box-shadow: #959da533 0px 8px 24px;

			&-text {
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				@include font(1.8rem, 130%);
				color: #66656f;
			}
		}
	}
}
</style>
