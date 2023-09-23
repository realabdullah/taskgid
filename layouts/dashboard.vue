<script lang="ts" setup>
const route = useRoute();

const { user, profilePhoto, workspaces, activeWorkspace } = storeToRefs(useStore());
const { fetchUserWorkspaces, setActiveWorkspace } = useStore();

const navs = [
	{ name: "overview", route: "/dashboard" },
	{ name: "tasks", route: "/dashboard/tasks" },
	{ name: "settings", route: "/dashboard/settings" },
];
const showToast = ref(false);
const errorObject = ref({} as Toast);
const notification = ref(false);
const showProfilePictureModal = ref(false);

const workspaceInfo = computed(() => workspaces.value.find((workspace: Workspace) => workspace.id === activeWorkspace.value) ?? ({} as Workspace));

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

await fetchUserWorkspaces();

if (route.query.workspace) {
	setActiveWorkspace(route.query.workspace as string);
	route.query = {};
}
</script>

<template>
	<div class="dashboard-layout">
		<aside class="dashboard-layout__left" aria-label="Dashboard Navigation">
			<div class="workspace-icons">
				<button
					v-for="workspace in workspaces"
					:key="workspace.id"
					class="workspace-avatar"
					:class="{ active: workspace.id === activeWorkspace }"
					@click="setActiveWorkspace(workspace.id, 'switch')">
					<img :src="`https://ui-avatars.com/api/?name=${workspace.title}&background=fff&color=0000FF`" alt="workspace" />
				</button>

				<button class="add-workspace" @click="navigateTo('/create-workspace')"><IconsPlus /></button>
			</div>
			<div class="workspace-details">
				<div class="workspace-detail">
					<h4>{{ workspaceInfo.title }}</h4>
					<p>{{ workspaceInfo.title || user.name }}'s Space</p>
				</div>

				<div class="workspace-nav">
					<NuxtLink v-for="(nav, index) in navs" :key="index" :to="nav.route" class="workspace-nav__item" :class="{ active: $route.path === nav.route }">
						<IconsSideNav :variant="nav.name" />
						<span>{{ nav.name }}</span>
					</NuxtLink>
				</div>
			</div>
		</aside>
		<main class="dashboard-layout__center">
			<header>
				<label for="search" class="search">
					<input id="search" type="search" name="search" placeholder="Search your space here..." />
					<IconsSearch class="search-icon" />
				</label>

				<div class="notification-bell">
					<IconsNotificationBell :notification="notification" />
				</div>
			</header>
			<NuxtLoadingIndicator color="#3754DB" />
			<slot />
			<BaseToast v-if="showToast" class="toast" :toast-style="errorObject.toastStyle" :type="errorObject.type" :message="errorObject.message" :description="errorObject.description" />
		</main>
		<aside class="dashboard-layout__right" aria-label="Dashboard Options">
			<div class="user-sidebar">
				<div class="user">
					<img :src="profilePhoto" alt="ABD" @click="showProfilePictureModal = true" />

					<div class="user-detail">
						<h5>{{ user.name }}</h5>
						<span>{{ user.email }}</span>
					</div>

					<BaseButton class="btn" value="My Profile" background="#3754DB" color="#FFFFFF" width="108px" />
				</div>
			</div>
		</aside>
	</div>

	<!-- UPLOAD PROFILE PICTURE -->
	<ProfilePhotoUploader v-if="showProfilePictureModal" :profile-picture="profilePhoto" @close="showProfilePictureModal = false" />
</template>

<style lang="scss" scoped>
.dashboard-layout {
	width: 100%;
	height: 100%;
	max-height: 100vh;
	background: #f6f8fd;
	display: grid;
	grid-template-columns: 300px 1fr 300px;

	&__left {
		height: 100vh;
		display: flex;
		gap: 20px;
		background: #ffffff;

		.workspace-icons {
			width: 100%;
			max-width: 70px;
			background: #3754db;
			padding: 16px;
			padding-top: 100px;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 16px;

			.workspace-avatar {
				width: 48px;
				height: 48px;
				background: #3754db;
				border: 0;
				border-radius: 12px;
				padding: 5px;
				display: flex;
				justify-content: center;
				align-items: center;
				cursor: pointer;

				img {
					width: 40px;
					height: 40px;
					object-fit: cover;
					border-radius: 10px;
				}
			}

			.active {
				border: 1.4px solid #fbbe37;
			}

			.add-workspace {
				width: 38px;
				height: 38px;
				background: rgba(255, 255, 255, 0.2);
				border: none;
				border-radius: 10px;
				padding: 8px;
				color: #3754db;
				cursor: pointer;
			}
		}

		.workspace-details {
			width: 100%;
			max-width: 230px;
			padding: 20px;
			padding-top: 100px;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 80px;

			.workspace-detail {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				gap: 4px;

				h4 {
					font-weight: 700;
					font-size: 20px;
					line-height: 24px;
					color: #101c56;
				}

				p {
					font-weight: 400;
					font-size: 14px;
					line-height: 17px;
					color: #666666;
				}
			}

			.workspace-nav {
				display: flex;
				align-items: flex-start;
				flex-direction: column;
				gap: 30px;

				&__item {
					display: flex;
					align-items: center;
					gap: 10px;
					text-decoration: none;
					font-weight: 400;
					font-size: 16px;
					line-height: 19px;
					color: #666666;
					text-transform: capitalize;
				}

				.active {
					font-weight: 700;
					color: #3754db;
				}
			}
		}
	}

	&__center {
		position: relative;
		padding: 25px 40px;

		header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 50px;

			.search {
				position: relative;
				width: 100%;
				max-width: 350px;

				input {
					width: 100%;
					height: 50px;
					border: 0.7px solid #a8abbd;
					border-radius: 12px;
					background: transparent;
					padding: 16px;
				}

				&-icon {
					position: absolute;
					top: 50%;
					transform: translate(0, -50%);
					right: 15px;
					cursor: pointer;
				}
			}
		}

		.toast {
			position: absolute;
			top: 80px;
			right: 40px;
			z-index: 1000;
		}
	}

	&__right {
		.user-sidebar {
			width: 100%;
			max-width: 258px;
			background: #ffffff;
			border-radius: 24px;
			padding: 20px;
			position: fixed;
			right: 20px;
			top: 20px;
			bottom: 20px;

			.user {
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
				gap: 24px;

				img {
					width: 100%;
					max-width: 90px;
					height: 100%;
					max-height: 90px;
					object-fit: cover;
					border-radius: 16px;
					box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
				}

				.user-detail {
					text-align: center;

					h5 {
						font-weight: 700;
						font-size: 20px;
						line-height: 24px;
						color: #101c56;
						margin-bottom: 5px;
					}

					span {
						font-weight: 400;
						font-size: 14px;
						line-height: 17px;
						color: #666666;
					}
				}

				.btn {
					align-self: center;
				}
			}
		}
	}
}
</style>
