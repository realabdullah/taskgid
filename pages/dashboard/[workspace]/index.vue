<script lang="ts" setup>
definePageMeta({
	title: "Dashboard",
	name: "dashboard",
	middleware: ["auth"],
});

const { tasks } = storeToRefs(useStore());
const { fetchTeams } = useTeam();
const { task: newTask, fetchTasks, deleteTask } = useTask();

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
	{ name: "Low Priority", value: "Low" },
	{ name: "Medium Priority", value: "Medium" },
	{ name: "High Priority", value: "High" },
];

const completedTasks = computed(() => {
	if (!tasks.value || !Array.isArray(tasks.value) || tasks.value.length === 0) {
		return [];
	}

	return tasks.value.filter((task) => task.status.toLowerCase() === "completed");
});

const sortedTasks = computed(() => {
	if (!tasks.value || !Array.isArray(tasks.value) || tasks.value.length === 0) {
		return [];
	}

	return tasks.value
		.slice()
		.sort((a, b) => {
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
		})
		.filter((task) => task.status.toLowerCase() !== "completed");
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

const onOutsideClick = (event: MouseEvent) => {
	if (!(event.target as HTMLElement).closest(".popup") && !(event.target as HTMLElement).closest(".dashboard__header-button")) {
		popup.value = "";
	}
};

onMounted(() => {
	window.addEventListener("click", onOutsideClick);
});

onUnmounted(() => {
	window.removeEventListener("click", onOutsideClick);
});
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
						Filter: {{ selectedFilterOption }}

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
						Sort: {{ selectedSortOption }}

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
					<TaskCard
						v-for="(task, index) in filteredTasksByStatus"
						:key="task._id"
						v-model="filteredTasksByStatus[index]"
						@open-modal="openModal(task, 'view')"
						@edit="openModal(task, 'edit')"
						@delete="deleteTask(task._id)" />
				</ul>

				<!-- EMPTY STATE -->
				<div v-else class="dashboard__content-empty position-relative">
					<p class="dashboard__content-empty-text position-absolute text-center">
						You have no task created in your workspace yet.
						<br />
						Get productive, create a task now.
					</p>
				</div>

				<template v-if="completedTasks && completedTasks.length > 0">
					<div class="dashboard__header flex items-center content-between">
						<h1 class="dashboard__header-title">Completed Tasks ({{ completedTasks.length }})</h1>
					</div>
					<ul class="dashboard__content-tasks grid">
						<TaskCard
							v-for="(task, index) in completedTasks"
							:key="task._id"
							v-model="completedTasks[index]"
							@open-modal="openModal(task, 'view')"
							@edit="openModal(task, 'edit')"
							@delete="deleteTask(task._id)" />
					</ul>
				</template>
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

			&:last-child {
				margin-top: 4rem;
			}
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
			grid-template-columns: repeat(auto-fit, 45rem);
			@include gap(2rem);
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
