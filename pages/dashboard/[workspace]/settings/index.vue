<script lang="ts" setup>
definePageMeta({
	title: "Settings - Dashboard",
	name: "Settings",
	middleware: ["auth"],
});

const { $axios } = useNuxtApp();
const route = useRoute();
const { user, teams } = storeToRefs(useStore());
const { logout } = useToken();
const push = usePush();

const name = ref(user.value.firstName + " " + user.value.lastName);
const email = user.value.email;
const password = ref("");
const showModal = ref(false);
const modalState = ref("edit-profile");
const inviteeEmail = ref("");
const loading = ref(false);

const openOrCloseModal = (status: boolean, state: string) => {
	modalState.value = state;
	showModal.value = status;
};

const handleEditProfile = () => {
	openOrCloseModal(false, "");
};

const sendInvite = () => {
	try {
		loading.value = true;
		$axios.post("/invite/", { email: inviteeEmail.value, slug: route.params.workspace });
		loading.value = false;
		push.success("Invite sent successfully!");
	} catch (error) {
		setTimeout(() => {
			loading.value = false;
			openOrCloseModal(false, "");
			push.error("Something went wrong, please try again");
		}, 2000);
	}
};

const modalHeader = computed(() => {
	if (modalState.value === "edit-profile") return "Edit Profile";
	if (modalState.value === "logout") return "You are about to log out";
	return "Invite Member";
});
</script>

<template>
	<NuxtLayout name="dashboard">
		<div class="settings-page">
			<h3 class="weight-semiBold col-darkBlue">Settings</h3>
			<div class="log-out flex content-end" style="width: 10%; margin-left: auto">
				<BaseButton value="Log Out" usage="button" type="danger" @click="openOrCloseModal(true, 'logout')" />
			</div>

			<div class="settings-page__card">
				<h5 class="weight-regular col-darkBlue">Account Settings</h5>
				<div class="card-content bg-white flex flex-column items-start">
					<div class="card-content__box w-100 flex items-center bordered">
						<IconsUser class="icon" />
						<div class="details flex flex-column">
							<span class="weight-regular col-grey-3">Fullname</span>
							<span class="weight-semiBold col-black">{{ `${user.firstName} ${user.lastName}` }}</span>
						</div>
					</div>

					<div class="card-content__box w-100 flex items-center bordered">
						<IconsEmail class="icon" />
						<div class="details flex flex-column">
							<span class="weight-regular col-grey-3">Email Address</span>
							<span class="weight-semiBold col-black">{{ user.email }}</span>
						</div>
					</div>

					<div class="card-content__box w-100 flex items-center bordered">
						<div class="details flex flex-column">
							<span class="weight-regular col-grey-3">Password</span>
							<span class="weight-semiBold col-black">**********</span>
						</div>
					</div>

					<BaseButton style="align-self: flex-end" value="Edit" @click="openOrCloseModal(true, 'edit-profile')" />
				</div>
			</div>

			<div class="settings-page__card">
				<div class="flex items-center content-between">
					<h5 class="weight-regular col-darkBlue">Workspace Members</h5>
					<button class="invite border-none bg-transparent weight-regular col-darkBlue cursor-pointer" @click="openOrCloseModal(true, 'invite')">Invite member</button>
				</div>

				<div v-for="member in teams" :key="member.username" class="card-content bg-white flex flex-column items-start">
					<div class="card-content__box w-100 flex items-center bordered">
						<img :src="member.profile_picture" :alt="member.name" />
						<div class="details flex flex-column">
							<span class="weight-regular col-grey-3">{{ member.email }}</span>
							<span class="weight-semiBold col-black">{{ member.name }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<BaseModal v-if="showModal" width="50rem" @close-modal="openOrCloseModal(false, '')">
			<template #default>
				<div class="edit-profile flex flex-column">
					<h1 class="weight-semiBold col-darkBlue">{{ modalHeader }}</h1>
					<form v-if="modalState === 'edit-profile'" class="flex flex-column" @submit.prevent="handleEditProfile">
						<BaseInput id="name" v-model="name" label="Fullname" type="text" />
						<BaseInput id="email" v-model="email" label="Email Address" type="email" :disabled="true" />
						<BaseInput id="password" v-model="password" label="Password" type="password" />

						<BaseButton value="Save" />
					</form>
					<template v-else-if="modalState === 'logout'">
						<p class="weight-regular col-grey">You can always log on to your task manager and continue from where you left off..</p>
						<div class="buttons flex">
							<BaseButton value="Cancel" usage="button" @click="openOrCloseModal(false, '')" />
							<BaseButton value="Log Out" usage="button" type="danger" @click="logout" />
						</div>
					</template>
					<template v-else-if="modalState === 'invite'">
						<form class="flex flex-column" @submit.prevent="sendInvite">
							<BaseInput id="email" v-model="inviteeEmail" label="Email Address" type="email" />
							<BaseButton :value="loading ? 'loading' : 'Send Invite'" />
						</form>
					</template>
				</div>
			</template>
		</BaseModal>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.settings-page {
	h3 {
		@include font(3.2rem, 3.8rem);
	}

	&__card {
		margin-top: 2.4rem;

		h5 {
			@include font(2rem, 2.4rem);
		}

		.invite {
			@include font(1.5rem, 1.5rem);
		}

		.card-content {
			margin-top: 2.4rem;
			border-radius: 1.6rem;
			padding: 3.2rem 2.4rem;
			gap: 1.5rem;

			&__box {
				padding: 2rem;
				@include gap(2.5rem);
				border-radius: 1.6rem;

				img {
					width: 6rem;
					height: 6rem;
					border-radius: 50%;
				}

				.details {
					@include gap(0.5rem);

					span {
						&:first-child {
							@include font(1.6rem, 1.9rem);
						}

						&:last-child {
							@include font(2rem, 2.4rem);
						}
					}
				}
			}
		}
	}
}

.edit-profile {
	padding: 4rem;
	@include gap(2.4rem);

	h1 {
		@include font(2.8rem, 3.4rem);
	}

	form {
		@include gap(2.4rem);
	}

	p {
		@include font(1.8rem, 2.4rem);
	}

	.buttons {
		@include gap(2rem);
	}
}
</style>
