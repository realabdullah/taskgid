<script lang="ts" setup>
definePageMeta({
	title: "Home",
	name: "home",
	middleware: ["auth"],
});

const { workspaces, user } = storeToRefs(useStore());
const { getWorkspaces, createWorkspace, deleteWorkspace, selectedWorkspaceSlug } = useWorkspace();
const { logout } = useToken();
const push = usePush();

const name = computed(() => `${user.value?.firstName} ${user.value?.lastName}`);
const isModalOpen = ref(false);
const modalState = ref<"create" | "update" | "delete">("create");
const activeWorkspaceSlug = ref("");
const workspaceHeader = computed(() => `You have ${workspaces.value.length} workspace${workspaces.value.length > 1 ? "s" : ""}.`);
const form = reactive({
	title: "",
	description: "",
	slug: "",
});
const submitting = ref(false);

const editWorkspace = (slug: string) => {
	const workspace = workspaces.value.find((workspace) => workspace.slug === slug);
	Object.assign(form, workspace);
	modalState.value = "update";
	isModalOpen.value = true;
};

const openMenu = (slug: string) => {
	activeWorkspaceSlug.value = activeWorkspaceSlug.value === slug ? "" : slug;
	selectedWorkspaceSlug.value = slug;
};

const submitForm = async () => {
	try {
		submitting.value = true;
		if (modalState.value === "create") await createWorkspace(form);
		else if (modalState.value === "update") await createWorkspace(form, "update");
		submitting.value = false;
		push.success("Workspace created successfully!");
		closeModal();
	} catch (error) {
		const { message } = formatError(error);
		push.error(message);
	}
};

const handleDeletion = async () => {
	try {
		await deleteWorkspace(selectedWorkspaceSlug.value);
		push.success("Workspace deleted successfully!");
		isModalOpen.value = false;
	} catch (error) {
		const { message } = formatError(error);
		push.error(message);
	}
};

const closeModal = () => {
	form.title = "";
	form.description = "";
	form.slug = "";
	isModalOpen.value = false;
};

const onClickOutside = (event: MouseEvent) => {
	const target = event.target as HTMLElement;
	if (!target.closest(".contextmenu")) {
		activeWorkspaceSlug.value = "";
	}
};

onMounted(() => {
	document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
	document.removeEventListener("click", onClickOutside);
});

await getWorkspaces();
</script>

<template>
	<div class="container w-100 h-full">
		<header class="flex items-center content-between">
			<h1>ErgoSphere</h1>
			<button class="flex items-center bg-transparent cursor-pointer col-danger" style="gap: 0.5rem" @click="logout">
				<IconsLogout />
				Logout
			</button>
		</header>

		<h1 class="welcome">Welcome to your Task Oasis! 🚀 Ready to conquer your to-do list?</h1>

		<div class="workspaces">
			<div class="flex items-center content-between">
				<h2 class="weight-medium">{{ workspaceHeader }}</h2>
				<button class="bg-transparent cursor-pointer col-grey-2" @click="(modalState = 'create'), (isModalOpen = true)">Create a workspace</button>
			</div>

			<ul class="workspace grid">
				<li
					v-for="workspace in workspaces"
					:key="workspace.slug"
					class="workspace__card w-100 position-relative flex flex-column items-start"
					@contextmenu.prevent="name.toLowerCase() === workspace.owner.toLowerCase() && openMenu(workspace.slug)">
					<img :src="workspace.avatar" :alt="workspace.title" />
					<h3 class="weight-medium">{{ workspace.title }}</h3>
					<p>{{ workspace.description }}</p>
					<div class="team flex items-center">
						<span class="weight-medium">Team:</span>
						<div class="team__avatars flex items-center position-relative">
							<img v-for="member in workspace.team" :key="member.username" :src="member.profile_picture" :alt="member.name" />
						</div>
					</div>
					<span class="created-by">Created by {{ name.toLowerCase() === workspace.owner.toLowerCase() ? "you" : workspace.owner }}</span>
					<div class="w-100 flex items-center content-between">
						<nuxt-link :to="`/dashboard/${workspace.slug}`" class="col-grey-2">View</nuxt-link>
						<button v-if="name.toLowerCase() === workspace.owner.toLowerCase()" class="contextmenu bg-transparent col-grey-2 cursor-pointer options" @click="openMenu(workspace.slug)">
							<IconsMore />
						</button>
					</div>
					<div class="contextmenu options-popup bg-white position-absolute z-1" :class="{ open: activeWorkspaceSlug === workspace.slug }">
						<button class="w-100 text-left bg-transparent cursor-pointer" @click="editWorkspace(workspace.slug)">Edit</button>
						<button class="w-100 text-left bg-transparent cursor-pointer" @click="(modalState = 'delete'), openMenu(workspace.slug), (isModalOpen = true)">Delete</button>
					</div>
				</li>
			</ul>
		</div>
	</div>

	<BaseModal v-if="isModalOpen" width="50rem" @close-modal="closeModal">
		<form v-if="['create', 'update'].includes(modalState)" class="modal w-100 flex flex-column content-center items-center" @submit.prevent="submitForm">
			<BaseInput id="title" v-model="form.title" type="text" label="Title" :required="true" />
			<BaseInput id="description" v-model="form.description" type="text" label="Description" :required="true" />
			<BaseInput id="slug" v-model="form.slug" type="text" label="Slug" :required="true" />
			<BaseButton :value="submitting ? 'loading' : 'Save'" />
		</form>
		<template v-else-if="modalState === 'delete'">
			<div class="modal w-100 flex flex-column content-center items-center">
				<p class="col-grey-2">Are you sure you want to delete this workspace? This action cannot be undone.</p>
				<div class="flex items-center content-between w-100" style="gap: 1.5rem">
					<BaseButton value="Cancel" type="outline" usage="button" @click="closeModal" />
					<BaseButton value="Delete" type="danger" usage="button" @click="handleDeletion" />
				</div>
			</div>
		</template>
	</BaseModal>
</template>

<style lang="scss" scoped>
.container {
	padding: 3rem;

	@media screen and (max-width: 600px) {
		padding: 1.5rem;
	}

	header {
		h1 {
			@include font(4rem, 100%);

			@media screen and (max-width: 600px) {
				@include font(3rem, 100%);
			}
		}
	}

	.welcome {
		margin-top: 10rem;
		@include font(3rem, 100%);

		@media screen and (max-width: 600px) {
			margin-top: 5rem;
			@include font(2rem, 100%);
		}
	}

	.workspaces {
		margin-top: 3rem;

		.workspace {
			margin-top: 5rem;
			grid-template-columns: repeat(auto-fit, minmax(20rem, 40rem));
			@include gap(1.5rem);

			@media screen and (max-width: 600px) {
				grid-template-columns: 1fr;
			}

			&__card {
				padding: 2rem;
				border-radius: 0.5rem;
				border: 1px solid #d5d1d1c8;
				box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
				@include gap(1.5rem);

				img {
					width: 8rem;
					height: 8rem;
					object-fit: cover;
					border-radius: 50%;
					margin-bottom: 1.5rem;
				}

				h3 {
					@include font(2rem, 100%);
				}

				p {
					@include font(1.5rem, 100%);
				}

				.team {
					@include gap(1rem);

					span {
						@include font(1.5rem, 100%);
					}

					&__avatars {
						img {
							width: 2rem;
							height: 2rem;
							margin-bottom: 0;
							margin-left: -0.2rem;
							filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.25));
						}
					}
				}

				.created-by {
					@include font(1rem, 100%);
				}

				.options {
					width: 3rem;
					height: 3rem;

					&-popup {
						bottom: -7rem;
						right: 2rem;
						width: 10rem;
						border-radius: 0.5rem;
						border: 1px solid #d5d1d1c8;
						box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
						opacity: 0;
						visibility: hidden;
						transition: all 0.2s ease-in-out;

						&.open {
							opacity: 1;
							visibility: visible;
						}

						button {
							padding: 1.3rem;
							border-bottom: 1px solid #d5d1d1c8;
							@include font(1.5rem, 100%);

							&:last-child {
								border-bottom: none;
							}
						}
					}
				}
			}
		}
	}
}

.modal {
	padding: 3rem;
	gap: 1.3rem;

	p {
		@include font(1.5rem, 130%);
	}
}
</style>
