<script lang="ts" setup>
import "v-calendar/style.css";
import { DatePicker } from "v-calendar";

const { user, profilePhoto, workspaces, activeWorkspace, tasks } = storeToRefs(useStore());

const navs = [
	{ name: "overview", route: `/dashboard/${activeWorkspace.value}` },
	{ name: "tasks", route: `/dashboard/${activeWorkspace.value}/tasks` },
	{ name: "settings", route: "/dashboard/settings" },
];
const showToast = ref(false);
const errorObject = ref({} as Toast);
const notification = ref(false);
const showProfilePictureModal = ref(false);
const date = ref(new Date());
const currentCalendarTab = ref("calendar");
const showAccountPanel = ref(false);

const workspaceInfo = computed(() => workspaces.value.find((workspace: Workspace) => workspace.id === activeWorkspace.value) ?? ({} as Workspace));

const calendarData = computed(() =>
	tasks && Array.isArray(tasks.value) && tasks.value.length > 0
		? tasks.value
				.filter((task) => task && task.dueDate)
				.map((task) => ({ dates: [task.dueDate], dot: { color: task.status === "completed" ? "#00FF00" : "#FF0000" }, popover: { label: task.title + " is due." } }))
		: [],
);

const switchWorkspace = (workspaceId: string) => {
	activeWorkspace.value = workspaceId;
	navigateTo({ name: "dashboard", params: { workspace: workspaceId } });
};

const accountToggleStyle = computed(() => (showAccountPanel.value ? "29rem" : "2rem"));

onMounted(() => {
	useListen("showToast", (errorObj) => {
		errorObject.value = errorObj as Toast;
		showToast.value = true;

		setTimeout(() => {
			showToast.value = false;
		}, 3500);
	});

	useListen("uploadProfilePicture", (value) => {
		showProfilePictureModal.value = value as boolean;
	});
});
</script>

<template>
	<NuxtLoadingIndicator :height="2" color="#3754db" />
	<div class="dashboard-layout bg-greyishBlue w-100 d-flex pos-fixed overflow-y-auto">
		<aside class="dashboard-layout__left w-100 pos-fixed overflow-y-auto overflow-x-hidden d-flex bg-white" aria-label="Dashboard Navigation">
			<div class="workspace-icons w-100 bg-blue d-flex fd-column ai-center">
				<button
					v-for="workspace in workspaces"
					:key="workspace.id"
					class="workspace-avatar bg-blue d-flex ai-center jc-center cursor-pointer"
					:class="{ active: workspace.id === activeWorkspace }"
					@click="switchWorkspace(workspace.id)">
					<img :src="`https://ui-avatars.com/api/?name=${workspace.title}&background=fff&color=0000FF`" alt="workspace" />
				</button>

				<button class="add-workspace col-blue cursor-pointer" @click="navigateTo('/create-workspace')"><IconsPlus /></button>
			</div>
			<div class="workspace-details w-100 d-flex fd-column ai-flex-start">
				<div class="workspace-detail d-flex fd-column ai-flex-start">
					<h4 class="fw-bold col-darkBlue">{{ workspaceInfo.title }}</h4>
					<p class="fw-regular col-grey-3">{{ workspaceInfo.title || user.name }}'s Space</p>
				</div>

				<div class="workspace-nav d-flex ai-flex-start fd-column">
					<NuxtLink
						v-for="(nav, index) in navs"
						:key="index"
						:to="nav.route"
						class="workspace-nav__item d-flex ai-center td-none fw-regular tt-capitalize"
						:class="$route.path === nav.route ? 'fw-bold col-blue' : 'col-grey-3'">
						<IconsSideNav :variant="nav.name" />
						<span>{{ nav.name }}</span>
					</NuxtLink>
				</div>
			</div>
		</aside>
		<main class="dashboard-layout__center pos-relative w-100 overflow-x-hidden">
			<header class="pos-sticky bg-greyishBlue d-flex ai-center jc-space-between">
				<label for="search" class="search pos-relative w-100">
					<input id="search" class="w-100 bg-transparent" type="search" name="search" placeholder="Search your space here..." />
					<IconsSearch class="search-icon pos-absolute cursor-pointer" />
				</label>

				<button class="notification-bell bg-transparent cursor-pointer">
					<IconsNotificationBell :notification="notification" />
				</button>
			</header>
			<NuxtLoadingIndicator color="#3754DB" />
			<div style="padding-bottom: 5rem">
				<slot />
			</div>
			<BaseToast
				v-if="showToast"
				class="toast pos-absolute z-9"
				:toast-style="errorObject.toastStyle"
				:type="errorObject.type"
				:message="errorObject.message"
				:description="errorObject.description" />
		</main>
		<aside v-show="showAccountPanel" class="dashboard-layout__right" aria-label="Dashboard Options">
			<div class="user-sidebar w-100 bg-white pos-fixed overflow-y-auto overflow-x-hidden">
				<div class="user d-flex ai-center jc-center fd-column">
					<img :src="profilePhoto" class="w-100 h-100 cursor-pointer" alt="ABD" @click="showProfilePictureModal = true" />

					<div class="user-detail ta-center">
						<h5 class="fw-bold col-darkBlue">{{ user.name }}</h5>
						<span class="fw-regular col-grey-3">{{ user.email }}</span>
					</div>

					<BaseButton class="btn" value="My Profile" background="#3754DB" color="#FFFFFF" width="108px" />

					<div class="calendar bg-whitishBlue w-100">
						<div class="calendar__header bg-white d-flex ai-center">
							<button
								class="w-100 cursor-pointer"
								:class="currentCalendarTab === 'calendar' ? 'active bg-blue col-white fw-medium' : 'bg-transparent col-grey fw-regular'"
								@click="currentCalendarTab = 'calendar'">
								Calendar
							</button>
							<button
								class="w-100 cursor-pointer"
								:class="currentCalendarTab === 'reminder' ? 'active bg-blue col-white fw-medium' : 'bg-transparent col-grey fw-regular'"
								@click="currentCalendarTab = 'reminder'">
								Reminder
							</button>
						</div>
						<DatePicker v-if="currentCalendarTab === 'calendar'" v-model="date" :attributes="calendarData" transparent borderless />
					</div>
				</div>
			</div>
		</aside>

		<button class="pos-fixed menu-toggle bg-white z-9 cursor-pointer d-flex ai-center jc-center" :style="`right: ${accountToggleStyle}`" @click="showAccountPanel = !showAccountPanel">
			<IconsAccount />
		</button>
	</div>

	<!-- UPLOAD PROFILE PICTURE -->
	<ProfilePhotoUploader v-if="showProfilePictureModal" :profile-picture="profilePhoto" @close="showProfilePictureModal = false" />
</template>

<style lang="scss" scoped>
.dashboard-layout {
	height: 100dvh;
	padding-bottom: 2rem;

	&__left {
		top: 0;
		left: 0;
		bottom: 0;
		max-width: 28rem;
		height: 100dvh;
		@include gap(2rem);
		-ms-overflow-style: none;
		scrollbar-width: none;

		&::-webkit-scrollbar {
			display: none;
		}

		@media screen and (max-width: 787px) {
			max-width: 20rem;
			@include gap(0rem);
		}

		@media screen and (max-width: 600px) {
			max-width: 10rem;
		}

		.workspace-icons {
			max-width: 7rem;
			padding: 1.6rem;
			padding-top: 10rem;
			gap: 1.6rem;

			@media screen and (max-width: 787px) {
				max-width: 5rem;
			}

			.workspace-avatar {
				width: 4.8rem;
				height: 4.8rem;
				border-radius: 1.2rem;
				padding: 0.5rem;

				@media screen and (max-width: 787px) {
					width: 3.8rem;
					height: 3.8rem;
				}

				img {
					width: 4rem;
					height: 4rem;
					object-fit: cover;
					border-radius: 1rem;

					@media screen and (max-width: 787px) {
						width: 3.2rem;
						height: 3.2rem;
					}
				}
			}

			.active {
				border: 0.14rem solid $col-yellowShade;
			}

			.add-workspace {
				width: 3.8rem;
				height: 3.8rem;
				background: #ffffff33;
				border-radius: 1rem;
				padding: 0.8rem;

				@media screen and (max-width: 787px) {
					width: 3.2rem;
					height: 3.2rem;
				}
			}
		}

		.workspace-details {
			max-width: 23rem;
			padding: 2rem;
			padding-top: 10rem;
			@include gap(8rem);

			@media screen and (max-width: 787px) {
				max-width: 18rem;
			}

			@media screen and (max-width: 600px) {
				max-width: 8rem;
				padding: 10rem 1.2rem 0;
			}

			.workspace-detail {
				@include gap(0.4rem);

				@media screen and (max-width: 600px) {
					display: none !important;
				}

				h4 {
					@include font(2rem, 2.4rem);
				}

				p {
					@include font(1.4rem, 1.7rem);
				}
			}

			.workspace-nav {
				@include gap(3rem);

				&__item {
					@include gap(1rem);
					@include font(1.6rem, 1.9rem);

					span {
						@media screen and (max-width: 600px) {
							display: none;
						}
					}
				}
			}
		}
	}

	&__center {
		margin-left: 28rem;
		margin-right: calc(25.8rem + 2rem);
		padding: 2.5rem 4rem;

		@media screen and (max-width: 1110px) {
			margin-right: 0;
		}

		@media screen and (max-width: 787px) {
			margin-left: 20rem;
			padding: 2rem;
		}

		@media screen and (max-width: 600px) {
			margin-left: 10rem;
		}

		header {
			top: 2.5rem;
			margin-bottom: 5rem;

			.search {
				max-width: 35rem;

				input {
					height: 5rem;
					border: 0.07rem solid #a8abbd;
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

		.toast {
			top: 8rem;
			right: 4rem;
		}
	}

	&__right {
		@media screen and (min-width: 1111px) {
			display: block !important;
		}

		.user-sidebar {
			max-width: 25.8rem;
			border-radius: 2.4rem;
			padding: 2rem;
			right: 2rem;
			top: 2rem;
			bottom: 2rem;
			box-shadow: #959da533 0 0.8rem 2.4rem;
			-ms-overflow-style: none;
			scrollbar-width: none;

			&::-webkit-scrollbar {
				display: none;
			}

			@media screen and (max-width: 787px) {
				right: 1rem;
				top: 1rem;
				bottom: 1rem;
				animation: fade-in-right 0.3s cubic-bezier(0.39, 0.575, 0.565, 1) both;
			}

			.user {
				@include gap(2.4rem);

				img {
					max-width: 9rem;
					max-height: 9rem;
					object-fit: cover;
					border-radius: 1.6rem;
					box-shadow: #110c2e26 0 4.8rem 10rem 0;
				}

				.user-detail {
					h5 {
						@include font(2rem, 2.4rem);
						margin-bottom: 0.5rem;
					}

					span {
						@include font(1.4rem, 1.7rem);
					}
				}

				.btn {
					align-self: center;
				}

				.calendar {
					max-width: 21.8rem;
					border-radius: 1.2rem;
					padding: 1.6rem;
					margin-top: 8.2rem;
					margin-bottom: 2rem;

					&__header {
						padding: 0.4rem 0.3rem;
						margin-bottom: 2rem;
						border-radius: 0.4rem;
						@include gap(0.4rem);

						button {
							@include font(1rem, normal);
							padding: 0.8rem 1.6rem;
							border-radius: 0.4rem;
						}
					}
				}
			}
		}
	}

	.menu-toggle {
		bottom: 2rem;
		padding: 1rem;
		border-radius: 1rem;
		box-shadow: #959da533 0 0.8rem 2.4rem;

		@media screen and (min-width: 1111px) {
			display: none !important;
		}
	}
}

@keyframes fade-in-right {
	0% {
		transform: translateX(50px);
		opacity: 0;
	}
	100% {
		transform: translateX(0);
		opacity: 1;
	}
}
</style>
