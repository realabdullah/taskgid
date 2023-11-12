<script lang="ts" setup>
import "v-calendar/style.css";
import { DatePicker } from "v-calendar";

const route = useRoute();
const { user, tasks, workspaces, allNotificationsRead } = storeToRefs(useStore());
const { getWorkspaces } = useWorkspace();

const navs = [
	{ name: "overview", route: `/dashboard/${route.params.workspace}/` },
	{ name: "tasks", route: `/dashboard/${route.params.workspace}/tasks` },
	{ name: "settings", route: `/dashboard/${route.params.workspace}/settings` },
];
const notification = ref(false);
const showProfilePictureModal = ref(false);
const date = ref(new Date());
const showWorkspaceDropdown = ref(false);
const isModalOpen = ref(false);

const form = reactive({
	title: "",
	description: "",
	slug: "",
});

const currentWorkspace = computed(() => workspaces.value.find((workspace) => workspace.slug === route.params.workspace));
const filteredWorkspaces = computed(() => workspaces.value.filter((workspace) => workspace.slug !== route.params.workspace));

const calendarData = computed(() =>
	tasks && Array.isArray(tasks.value) && tasks.value.length > 0
		? tasks.value
				.filter((task) => task?.dueDate)
				.map((task) => ({ dates: [task.dueDate], dot: { color: task.status === "completed" ? "#00FF00" : "#FF0000" }, popover: { label: task.title + " is due." } }))
		: [],
);

const switchWorkspace = (workspace: string) => {
	navigateTo({ name: "dashboard", params: { workspace } });
};

const currentYear = computed(() => new Date().getFullYear());

onMounted(() => useListen("profilePic", (value) => (showProfilePictureModal.value = value)));

await getWorkspaces();
</script>

<template>
	<div class="dashboard w-100 flex position-fixed overflow-y-auto">
		<aside class="dashboard__left position-relative w-100" aria-label="Dashboard Navigation">
			<div class="workspace w-100 position-fixed overflow-y-auto overflow-x-hidden flex flex-column items-start">
				<NuxtLink to="/dashboard" class="logo text-unset weight-bold text-capitalize">Ergosphere</NuxtLink>
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
						<button class="bg-transparent w-100 flex items-center cursor-pointer" style="gap: 1.5rem" @click="isModalOpen = true">
							<IconsAdd />
							<span class="weight-medium">Create Workspace</span>
						</button>
					</ul>
				</div>

				<div class="workspace__nav w-100 flex items-start flex-column">
					<NuxtLink
						v-for="nav in navs"
						:key="nav.route"
						:to="nav.route"
						class="workspace__nav-item w-100 flex items-center text-unset weight-regular text-capitalize"
						:class="{ active: $route.path === nav.route }">
						<IconsSideNav :variant="nav.name" />
						<span>{{ nav.name }}</span>
					</NuxtLink>
				</div>

				<div class="calendar bg-whitishBlue w-100">
					<DatePicker v-model="date" :attributes="calendarData" transparent borderless />
				</div>
			</div>

			<div class="user position-absolute flex flex-column">
				<div class="flex items-center" style="gap: 1rem">
					<img :src="user.profile_picture" class="w-100 h-100 cursor-pointer" alt="avatar" @click="showProfilePictureModal = true" />

					<div class="user-detail flex flex-column">
						<h5 class="weight-bold">{{ user.firstName }} {{ user.lastName }}</h5>
						<span class="weight-regular">{{ user.email }}</span>
					</div>
				</div>

				<p class="copyright">© {{ currentYear }} Ergosphere Inc.</p>
			</div>
		</aside>
		<main class="dashboard__main position-relative bg-white w-100 overflow-x-hidden">
			<NuxtLoadingIndicator color="#3754DB" />
			<header class="flex items-center content-between">
				<label for="search" class="search position-relative w-100">
					<input id="search" class="w-100 bg-transparent" type="search" name="search" placeholder="Search your space here..." />
					<IconsSearch class="search-icon position-absolute cursor-pointer" />
				</label>

				<div class="flex items-center position-relative" style="gap: 1.2rem">
					<button class="bg-transparent cursor-pointer">
						<IconsUser :active="false" />
					</button>
					<button class="bg-transparent cursor-pointer" @click="notification = !notification">
						<IconsNotificationBell :notification="!allNotificationsRead" />
					</button>

					<Notifications v-if="notification" />
				</div>
			</header>
			<div class="main overflow-y-auto h-100" style="padding-bottom: 15rem">
				<slot />
			</div>
		</main>
	</div>

	<!-- UPLOAD PROFILE PICTURE -->
	<ProfilePhotoUploader v-if="showProfilePictureModal" :profile-picture="user.profile_picture" @close="showProfilePictureModal = false" />

	<!-- CREATE WORKSPACE -->
	<BaseModal v-if="isModalOpen" width="50rem" @close-modal="isModalOpen = false">
		<CreateWorkspace :data="form" usage="create" @close="isModalOpen = false" />
	</BaseModal>
</template>

<style lang="scss" scoped>
.dashboard {
	height: 100dvh;
	background: #f8f8f9;

	&__left {
		max-width: 30rem;

		.workspace {
			max-width: 30rem;
			top: 1rem;
			left: 1rem;
			bottom: 1rem;
			padding: 1rem;
			padding-right: 3rem;
			@include gap(5rem);
			-ms-overflow-style: none;
			scrollbar-width: none;
			height: calc(100% - 14rem);

			&::-webkit-scrollbar {
				display: none;
			}

			.logo {
				@include font(3rem, 100%);
				color: #171718;
				margin-bottom: -2rem;
			}

			&__dropdown {
				background-color: #ffffff;
				border: 1.5px solid #e2e2e8;
				border-radius: 1.4rem;

				&.active {
					border: none;
					background-color: #ededef;
					transition: all 0.3s ease-in-out;
				}

				.current {
					padding: 1rem;

					img {
						width: 4.5rem;
						height: 4.5rem;
						border-radius: 1.2rem;
						object-fit: cover;
					}

					.detail {
						@include gap(0.4rem);

						span {
							@include font(1.2rem, 100%);
						}

						.title {
							@include font(1.4rem, 130%);
						}
					}
				}

				&-list {
					padding: 1.6rem;
					border-radius: 1.4rem;
					border: 1.5px solid #e2e2e8;
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
							color: #66656f;
							@include font(1.6rem, 100%);
							transition: color 0.3s ease-in-out;

							&:hover {
								color: #000000;
							}
						}
					}

					button {
						padding-top: 2rem;
						border-top: 1.5px solid #f1f1f2;
						color: #66656f;
						@include font(1.6rem, 100%);
						transition: color 0.3s ease-in-out;

						&:hover {
							color: #000000;
						}
					}
				}
			}

			&__nav {
				@include gap(0.5rem);
				padding-bottom: 3rem;
				border-bottom: 1.5px solid #e2e2e8;

				&-item {
					@include gap(1.2rem);
					@include font(1.6rem, 100%);
					letter-spacing: 0.03rem;
					color: #66656f;
					padding: 1rem;
					transition: all 0.3s ease-in-out;

					&:hover {
						color: #000000;
						font-weight: 700;
					}

					&.active {
						background-color: #ffffff;
						color: #000000;
						border-radius: 1.4rem;
						border: 1.5px solid #e2e2e8;
						font-weight: 700;
					}
				}
			}

			.calendar {
				background-color: #ffffff;
				border: 1.5px solid #e2e2e8;
				border-radius: 1.4rem;
				padding: 1.6rem;
				margin-bottom: 2rem;
			}
		}

		.user {
			background: #f8f8f9;
			bottom: 2rem;
			left: 1rem;
			right: 2rem;
			@include gap(1rem);
			padding: 2rem 0;

			img {
				width: 4.5rem;
				height: 4.5rem;
				border-radius: 50%;
				object-fit: cover;
				padding: 0.5rem;
				border: 1.5px solid #e2e2e8;
			}

			.user-detail {
				@include gap(0.3rem);

				h5 {
					@include font(1.6rem, 100%);
					color: #454447;
				}

				span {
					@include font(1.4rem, 100%);
					color: #66656f;
				}
			}

			.copyright {
				@include font(1.2rem, 100%);
				color: #66656f;
				padding-top: 2rem;
				border-top: 1.5px solid #e2e2e8;
			}
		}
	}

	&__main {
		padding: 2rem;
		margin: 2rem;
		margin-left: 0;
		border-radius: 1.4rem;
		border: 1.5px solid #e2e2e8;
		box-shadow: #959da533 0px 8px 24px;
		z-index: 100;
		overflow: hidden;

		header {
			margin-bottom: 5rem;

			.search {
				max-width: 35rem;

				input {
					height: 5rem;
					border: 1.5px solid #e2e2e8;
					border-radius: 1.2rem;
					padding: 1.6rem;
				}

				&-icon {
					top: 50%;
					transform: translate(0, -50%);
					right: 1.5rem;
				}
			}
		}

		.main {
			-ms-overflow-style: none;
			scrollbar-width: none;

			&::-webkit-scrollbar {
				display: none;
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
