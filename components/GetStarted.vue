<script lang="ts" setup>
const { user, tasks, activeWorkspace } = storeToRefs(useStore());

const selected = ref("");
const showCreateTaskModal = ref(false);

const onTaskCreated = () => {
	showCreateTaskModal.value = false;
	navigateTo(`/dashboard/${activeWorkspace.value}/tasks`);
};
</script>

<template>
	<div class="get-started">
		<h3 class="weight-bold col-black">Let’s get you started</h3>

		<div class="get-started__todos flex flex-column w-100">
			<button
				v-if="user.profile_picture === ''"
				class="todo bg-white flex items-center content-between cursor-pointer"
				:class="{ active: selected === 'profilePicture' }"
				@click="selected = 'profilePicture'">
				<div class="todo-title flex items-center">
					<IconsGetStarted variant="profile-picture" />
					<p class="weight-regular col-grey-3 text-left">Hey {{ user.name }}, Update your Profile Picture</p>
				</div>
				<button class="bg-transparent flex items-center col-grey-3 weight-regular cursor-pointer" @click="useEvent('uploadProfilePicture', true)">
					<span class="text-nowrap">Get Started</span>
					<IconsArrow variant="right" />
				</button>
			</button>

			<button v-if="tasks.length === 0" class="todo bg-white flex items-center content-between cursor-pointer" :class="{ active: selected === 'firstTask' }" @click="selected = 'firstTask'">
				<div class="todo-title flex items-center">
					<IconsGetStarted variant="first-task" />
					<p class="weight-regular col-grey-3 text-left">Create your First Task in your Workspace</p>
				</div>
				<button class="bg-transparent flex items-center col-grey-3 weight-regular cursor-pointer" @click="showCreateTaskModal = true">
					<span class="text-nowrap">Get Started</span>
					<IconsArrow variant="right" />
				</button>
			</button>
		</div>
	</div>

	<!-- CREATE TASK MODAL -->
	<TasksCreate v-if="showCreateTaskModal" usage="create" @task-created="onTaskCreated" @close="showCreateTaskModal = false" />
</template>

<style lang="scss" scoped>
.get-started {
	h3 {
		@include font(2rem, 2.4rem);
		margin-bottom: 2.5rem;
	}

	&__todos {
		@include gap(2rem);

		.todo {
			padding: 1.2rem 1.4rem;
			border-radius: 1.6rem;

			&-title {
				@include gap(1.4rem);

				p {
					@include font(1.6rem, 1.9rem);
					max-width: 30rem;
				}
			}

			button {
				@include font(1.6rem, 1.9rem);
				@include gap(1.5rem);
			}
		}

		.active {
			border: 0.2rem solid $col-lightBlue;

			.todo-title p,
			button {
				font-weight: 600 !important;
				color: $col-blue !important;
			}
		}
	}
}
</style>
