<script lang="ts" setup>
definePageMeta({
	title: "Dashboard",
	name: "dashboard",
	middleware: ["auth"],
});

// const { tasks } = storeToRefs(useStore());
const { fetchTeams } = useTeam();
const taskTitles = [
	"Implement user authentication",
	"Create task creation form",
	"Add drag and drop functionality",
	"Implement task filtering",
	"Add task assignment feature",
	"Create task detail view",
	"Add task priority feature",
	"Implement task search functionality",
	"Create team management page",
	"Add task deadline feature",
];

const taskDescriptions = [
	"Create a login system that allows users to authenticate themselves.",
	"Create a form that allows users to create new tasks.",
	"Add the ability to drag and drop tasks to different categories.",
	"Implement a feature that allows users to filter tasks by category.",
	"Add the ability to assign tasks to team members.",
	"Create a page that displays detailed information about a task.",
	"Implement a feature that allows users to prioritize tasks.",
	"Implement a search bar that allows users to search for tasks.",
	"Create a page that allows users to manage their teams.",
	"Add the ability to set deadlines for tasks.",
];

const taskPriorities = ["High", "Medium", "Low"];

const taskAssignees = ["John Doe", "Jane Doe", "Bob Smith", "Alice Johnson", "David Lee", "Emily Chen"];

const tasks = Array.from({ length: 10 }, (_, index) => ({
	id: Math.floor(Math.random() * 100000),
	title: taskTitles[index],
	description: taskDescriptions[index],
	dueDate: "2021-10-31",
	assignees: [taskAssignees[Math.floor(Math.random() * taskAssignees.length)], taskAssignees[Math.floor(Math.random() * taskAssignees.length)]],
	priority: taskPriorities[Math.floor(Math.random() * taskPriorities.length)],
}));
const isModalOpen = ref(false);

await fetchTeams();
</script>

<template>
	<NuxtLayout name="dashboard">
		<div class="dashboard">
			<div class="dashboard__header flex items-center content-between">
				<h1 class="dashboard__header-title">Tasks ({{ tasks.length }})</h1>
				<button class="dashboard__header-button bg-transparent cursor-pointer">Create Task</button>
			</div>

			<div class="dashboard__content">
				<ul class="dashboard__content-tasks grid">
					<li v-for="task in tasks" :key="task.id" class="task bg-white cursor-pointer flex flex-column content-between" @click="isModalOpen = !isModalOpen">
						<div class="flex flex-column">
							<div class="flex items-center content-between">
								<h3 class="task__title">{{ task.title }}</h3>
								<button class="task__action bg-transparent cursor-pointer">
									<IconsMore />
								</button>
							</div>
							<p class="task__description">{{ task.description }}</p>
						</div>

						<div class="task__meta flex items-center content-between">
							<span class="task__meta-item flex items-center" style="gap: 0.5rem">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
									<path
										d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM7 5H4V9H20V5H17V7H15V5H9V7H7V5Z"
										fill="rgba(102,101,111,1)"></path>
								</svg>
								{{ task.dueDate }}
							</span>
							<span class="task__meta-priority" :class="task.priority.toLowerCase()">{{ task.priority }}</span>
						</div>
					</li>
				</ul>
			</div>

			<BaseModal width="50rem" @close-modal="isModalOpen = false">
				<TaskDetails />
			</BaseModal>
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
		}
	}

	&__content {
		&-tasks {
			grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
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
	}
}
</style>
