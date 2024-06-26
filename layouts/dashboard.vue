<script lang="ts" setup>
import "v-calendar/style.css";
import { DatePicker } from "v-calendar";

const route = useRoute();
const { user, tasks } = storeToRefs(useStore());
const { getWorkspaces } = useWorkspace();

const navs = [
	{ name: "home", route: `/dashboard/${route.params.workspace}` },
	{ name: "settings", route: `/dashboard/${route.params.workspace}/settings` },
];

const isModalOpen = ref(false);
const showProfilePictureModal = ref(false);
const date = ref(new Date());
const form = reactive({
	title: "",
	description: "",
	slug: "",
});

const calendarData = computed(() =>
	tasks && Array.isArray(tasks.value) && tasks.value.length > 0
		? tasks.value
				.filter((task) => task.status !== "Completed")
				.map((task) => ({ dates: [task.dueDate], dot: new Date(task.dueDate) < new Date() ? "red" : "blue", popover: { label: task.title + " is due." } }))
		: [],
);

const currentYear = computed(() => new Date().getFullYear());

onMounted(() => useListen("profilePic", (value) => (showProfilePictureModal.value = value)));

await getWorkspaces();
</script>

<template>
	<div class="dashboard w-100 flex position-fixed overflow-y-auto">
		<aside class="dashboard__left position-relative w-100" aria-label="Dashboard Navigation">
			<div class="workspace w-100 position-fixed overflow-y-auto overflow-x-hidden flex flex-column items-start">
				<NuxtLink to="/dashboard" class="logo text-unset weight-bold text-capitalize">Taskgid</NuxtLink>
				<WorkspaceDropdown @add-task="isModalOpen = true" />

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

				<ClientOnly>
					<div class="calendar bg-whitishBlue w-100">
						<DatePicker v-model="date" :attributes="calendarData" transparent borderless />
					</div>
				</ClientOnly>
			</div>

			<div class="user position-absolute flex flex-column">
				<div class="flex items-center" style="gap: 1rem">
					<img :src="user.profile_picture" class="avatar w-100 h-100 cursor-pointer" alt="avatar" @click="showProfilePictureModal = true" />

					<div class="user-detail flex flex-column">
						<h5 class="weight-bold">{{ user.firstName }} {{ user.lastName }}</h5>
						<span class="weight-regular">{{ user.email }}</span>
					</div>
				</div>

				<p class="copyright">© {{ currentYear }} Taskgid Inc.</p>
			</div>
		</aside>
		<main class="dashboard__main position-relative bg-white w-100 overflow-x-hidden">
			<div class="mobile-nav items-start">
				<WorkspaceDropdown @add-task="isModalOpen = true" />
				<img :src="user.profile_picture" class="avatar w-100 h-100 cursor-pointer" alt="avatar" @click="showProfilePictureModal = true" />
			</div>
			<BaseHeader />
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
	background: var(--main-color);

	&__left {
		max-width: 30rem;

		@media screen and (max-width: 900px) {
			display: none;
		}

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
				color: var(--dark);
				margin-bottom: -2rem;
			}

			&__nav {
				@include gap(0.5rem);
				padding-bottom: 3rem;
				border-bottom: 1.5px solid var(--sec-border-color);

				&-item {
					@include gap(1.2rem);
					@include font(1.6rem, 100%);
					letter-spacing: 0.03rem;
					color: var(--text-color);
					padding: 1rem;
					transition: all 0.3s ease-in-out;

					&:hover {
						color: var(--dark);
						font-weight: 700;
					}

					&.active {
						background-color: var(--white);
						color: var(--dark);
						border-radius: 1.4rem;
						border: 1.5px solid var(--sec-border-color);
						font-weight: 700;
					}
				}
			}

			.calendar {
				background-color: var(--white);
				border: 1.5px solid var(--sec-border-color);
				border-radius: 1.4rem;
				padding: 1.6rem;
				margin-bottom: 2rem;
			}
		}

		.user {
			background: var(--main-color);
			bottom: 2rem;
			left: 1rem;
			right: 2rem;
			@include gap(1rem);
			padding: 2rem 0;

			.user-detail {
				@include gap(0.3rem);

				h5 {
					@include font(1.6rem, 100%);
					color: var(--text-color);
				}

				span {
					@include font(1.4rem, 100%);
					color: var(--text-color);
				}
			}

			.copyright {
				@include font(1.2rem, 100%);
				color: var(--text-color);
				padding-top: 2rem;
				border-top: 1.5px solid var(--sec-border-color);
			}
		}
	}

	&__main {
		padding: 2rem;
		margin: 2rem;
		margin-left: 0;
		border-radius: 1.4rem;
		box-shadow: var(--box-shadow);
		z-index: 100;
		overflow: hidden;

		@media screen and (max-width: 900px) {
			margin: 1rem;
			padding: 1rem;
		}

		.mobile-nav {
			display: none;

			@media screen and (max-width: 900px) {
				display: flex;
				gap: 1rem;
				margin-bottom: 5rem;
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

	.avatar {
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 50%;
		object-fit: cover;
		padding: 0.5rem;
		border: 1.5px solid var(--sec-border-color);
	}
}
</style>
