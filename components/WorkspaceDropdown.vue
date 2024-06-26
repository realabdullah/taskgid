<script lang="ts" setup>
defineEmits(["add-task"]);

const route = useRoute();
const { workspaces } = storeToRefs(useStore());

const showWorkspaceDropdown = ref(false);

const currentWorkspace = computed(() => workspaces.value.find((workspace) => workspace.slug === route.params.workspace));
const filteredWorkspaces = computed(() => workspaces.value.filter((workspace) => workspace.slug !== route.params.workspace));

const switchWorkspace = (workspace: string) => {
	navigateTo({ name: "dashboard", params: { workspace } });
};
</script>

<template>
	<div class="workspace__dropdown w-100" :class="{ active: showWorkspaceDropdown }">
		<button class="current bg-transparent w-100 flex items-center content-between cursor-pointer" @click="showWorkspaceDropdown = !showWorkspaceDropdown">
			<div class="flex items-center" style="gap: 1.2rem">
				<img :src="currentWorkspace?.avatar" :alt="currentWorkspace?.title" />
				<div class="detail flex flex-column items-start">
					<span class="weight-medium">Workspace</span>
					<p class="title weight-semiBold">{{ currentWorkspace?.title }}</p>
				</div>
			</div>
			<IconsUpDown />
		</button>

		<ul v-show="showWorkspaceDropdown" class="workspace__dropdown-list bg-white flex flex-column items-start">
			<li v-for="workspace in filteredWorkspaces" :key="workspace.slug" class="w-100 flex items-center cursor-pointer" style="gap: 1.5rem" @click="switchWorkspace(workspace.slug)">
				<img :src="workspace.avatar" :alt="workspace.title" />
				<span class="weight-medium">{{ workspace.title }}</span>
			</li>
			<button class="bg-transparent w-100 flex items-center cursor-pointer" style="gap: 1.5rem" @click="$emit('add-task')">
				<IconsAdd />
				<span class="weight-medium">Create Workspace</span>
			</button>
		</ul>
	</div>
</template>

<style lang="scss" scoped>
.workspace__dropdown {
	background-color: var(--white);
	border: 1.5px solid var(--sec-border-color);
	border-radius: 1.4rem;

	&.active {
		border: none;
		background-color: var(--sec-border-color);
		transition: all 0.3s ease-in-out;
	}

	.current {
		padding: 1rem;
		border-radius: 1.4rem;

		img {
			width: 4.5rem;
			height: 4.5rem;
			border-radius: 1.2rem;
			object-fit: cover;
		}

		.detail {
			@include gap(0.4rem);

			span {
				color: var(--text-color);
				@include font(1.2rem, 100%);
			}

			.title {
				color: var(--text-color);
				@include font(1.4rem, 130%);
			}
		}
	}

	&-list {
		padding: 1.6rem;
		border-radius: 1.4rem;
		background-color: var(--white);
		border: 1.5px solid var(--sec-border-color);
		@include gap(2rem);
		animation: slide-down 0.3s ease-in-out;

		li {
			@include gap(1.2rem);

			img {
				width: 3rem;
				height: 3rem;
				border-radius: 50%;
				object-fit: cover;
			}

			span {
				color: var(--text-color);
				@include font(1.6rem, 100%);
				transition: color 0.3s ease-in-out;

				&:hover {
					color: var(--dark);
				}
			}
		}

		button {
			padding-top: 2rem;
			border-top: 1.5px solid var(--sec-border-color);
			color: var(--text-color);
			@include font(1.6rem, 100%);
			transition: color 0.3s ease-in-out;

			&:hover {
				color: var(--dark);
			}
		}
	}
}

@keyframes slide-down {
	0% {
		transform: translateY(-30%);
	}
	100% {
		transform: translateY(0);
	}
}
</style>
