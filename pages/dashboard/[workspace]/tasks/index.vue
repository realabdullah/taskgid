<script lang="ts" setup>
definePageMeta({
	title: "Tasks - Dashboard",
	name: "tasks",
	middleware: ["auth"],
});

const { tasks } = storeToRefs(useStore());
const { fetchUserInfo, fetchWorkspaceTasks } = useStore();

const showCreateTaskModal = ref(false);
const tasksTab = ["All Tasks", "Pending", "In Progress", "Completed"];
const activeTab = ref("All Tasks");
const indicatorWidth = ref(0);
const indicatorLeft = ref(0);

const setActiveTab = (tab: string) => {
	activeTab.value = tab;

	const index = tasksTab.indexOf(tab);
	const button = document.querySelectorAll(".tasks-bar button")[index] as HTMLElement;
	if (!button) return;
	indicatorWidth.value = button.offsetWidth;
	indicatorLeft.value = button.offsetLeft;
};

const taskCount = computed(() => {
	return (value: string) => {
		return tasks.value.filter((task) => {
			if (value === "All Tasks") {
				return task;
			}

			return task.status === value;
		}).length;
	};
});

const filteredTasks = computed(() => {
	return tasks.value.filter((task) => {
		if (activeTab.value === "All Tasks") {
			return task;
		}

		return task.status === activeTab.value;
	});
});

const taskCreated = async () => {
	await fetchWorkspaceTasks();
	showCreateTaskModal.value = false;
};

onMounted(() => {
	setActiveTab("All Tasks");
});

await fetchUserInfo();
await fetchWorkspaceTasks();
</script>

<template>
	<NuxtLayout name="dashboard">
		<div class="task-page">
			<div class="task-page__header flex items-center content-between">
				<div class="texts">
					<h1 class="weight-semiBold col-darkBlue">Tasks</h1>
					<p class="weight-regular col-grey-2">Your tasks in your space.</p>
				</div>
				<BaseButton v-if="tasks.length > 0" value="Create Task" usage="button" style="width: 15%" @click="showCreateTaskModal = true" />
			</div>

			<div v-if="tasks.length > 0" class="task-page__list">
				<div class="tasks-bar flex items-center position-relative overflow-x-auto">
					<button
						v-for="(tab, index) in tasksTab"
						:key="index"
						class="bg-transparent flex items-center cursor-pointer text-nowrap"
						:class="{ active: activeTab === tab }"
						@click="setActiveTab(tab)">
						<span class="tab weight-regular">{{ tab }}</span>
						<span class="count block weight-medium">{{ taskCount(tab) }}</span>
					</button>

					<span class="indicator position-absolute bg-blue" :style="{ width: `${indicatorWidth}px`, transform: `translateX(${indicatorLeft}px)` }"></span>
				</div>

				<div v-if="filteredTasks.length > 0" class="tasks grid">
					<TasksCard v-for="task in filteredTasks" :key="task.id" :task="task" />
				</div>
				<TasksEmpty v-else :description="`You have no task ${activeTab.toLowerCase()} yet.`" :extra-text="`Get productive. Have a Task ${activeTab}.`" />
			</div>

			<TasksEmpty
				v-else
				button-text="Create a Task"
				description="You have no task created in your workspace yet."
				extra-text="Get productive. Create a Task Now."
				@create-task="showCreateTaskModal = true" />
		</div>

		<!-- CREATE TASK MODAL -->
		<TasksCreate v-if="showCreateTaskModal" usage="create" @close="showCreateTaskModal = false" @task-created="taskCreated" />
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.task-page {
	&__header {
		@media screen and (max-width: 930px) {
			flex-direction: column;
			align-items: flex-start;
		}

		.texts {
			h1 {
				@include font(3.2rem, 3.8rem);
				margin-bottom: 1.2rem;
			}

			p {
				@include font(2rem, 2.4rem);
			}
		}
	}

	&__list {
		margin-top: 4.2rem;

		.tasks-bar {
			width: fit-content;
			@include gap(2.8rem);
			padding-bottom: 1.4rem;
			border-bottom: 0.034rem solid #a9a9a9;

			button {
				@include gap(1.2rem);

				.tab {
					@include font(1.6rem, 1.9rem);
					color: #808080;
				}

				.count {
					@include font(1.2rem, 1.4rem);
					color: #16171d;
					padding: 0.5rem 1.2rem;
					background: #f0f0f0;
					border-radius: 1.2rem;
				}
			}

			.active {
				.tab {
					font-weight: 600;
					color: #3754db;
				}

				.count {
					background: #f2f4fd;
					color: #3754db;
				}
			}

			.indicator {
				bottom: -0.34px;
				left: 0;
				height: 0.2rem;
				transition: all 0.3s ease-in-out;
			}
		}

		.tasks {
			margin-top: 2rem;
			grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
			@include gap(2rem);
		}
	}
}
</style>
