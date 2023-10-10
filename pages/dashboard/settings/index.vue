<script lang="ts" setup>
definePageMeta({
	title: "Settings - Dashboard",
	name: "Settings",
	middleware: ["auth"],
});

const { user } = storeToRefs(useStore());
const client = useSupabaseClient();

const name = ref(user.value.name);
const email = ref(user.value.email);
const password = ref("");
const showModal = ref(false);
const modalState = ref("edit-profile");

const openOrCloseModal = (status: boolean, state: string) => {
	modalState.value = state;
	showModal.value = status;
};

const handleEditProfile = async () => {
	const payload = {
		name: name.value,
		email: email.value,
	};

	const { error: updateError } = await client.auth.updateUser({
		email: email.value,
		password: password.value,
	});

	const { error } = await client
		.from("users")
		.update(payload as never)
		.eq("id", user.value.id);

	if (updateError || error) return;

	user.value.name = name.value;
	user.value.email = email.value;
	openOrCloseModal(false, "");
};

const logOut = async () => {
	const { error } = await client.auth.signOut();
	if (error) return;
	navigateTo("/login");
};
</script>

<template>
	<NuxtLayout name="dashboard">
		<div class="settings-page">
			<h3 class="fw-semiBold col-darkBlue">Settings</h3>
			<div class="log-out d-flex jc-flex-end" style="width: 10%; margin-left: auto">
				<BaseButton value="Log Out" usage="button" type="danger" @click="openOrCloseModal(true, 'log-out')" />
			</div>

			<div class="settings-page__card">
				<h5 class="fw-regular col-darkBlue">Account Settings</h5>
				<div class="card-content bg-white d-flex fd-column ai-flex-start">
					<div class="card-content__box w-100 d-flex ai-center bordered">
						<IconsUser class="icon" />
						<div class="details d-flex fd-column">
							<span class="fw-regular col-grey-3">Fullname</span>
							<span class="fw-semiBold col-black">{{ user.name }}</span>
						</div>
					</div>

					<div class="card-content__box w-100 d-flex ai-center bordered">
						<IconsEmail class="icon" />
						<div class="details d-flex fd-column">
							<span class="fw-regular col-grey-3">Email Address</span>
							<span class="fw-semiBold col-black">{{ user.email }}</span>
						</div>
					</div>

					<div class="card-content__box w-100 d-flex ai-center bordered">
						<div class="details d-flex fd-column">
							<span class="fw-regular col-grey-3">Password</span>
							<span class="fw-semiBold col-black">**********</span>
						</div>
					</div>

					<BaseButton style="align-self: flex-end" value="Edit" @click="openOrCloseModal(true, 'edit-profile')" />
				</div>
			</div>
		</div>

		<BaseModal v-if="showModal" width="50rem" @close-modal="openOrCloseModal(false, '')">
			<template #default>
				<div class="edit-profile d-flex fd-column">
					<h1 class="fw-semiBold col-darkBlue">{{ modalState === "edit-profile" ? "Edit Profile" : "You are about to log out" }}</h1>
					<form v-if="modalState === 'edit-profile'" class="d-flex fd-column" @submit.prevent="handleEditProfile">
						<BaseInput id="name" v-model="name" label="Fullname" type="text" />
						<BaseInput id="email" v-model="email" label="Email Address" type="email" />
						<BaseInput id="password" v-model="password" label="Password" type="password" />

						<BaseButton value="Save" />
					</form>
					<template v-else>
						<p class="fw-regular col-grey">You can always log on to your task manager and continue from where you left off..</p>
						<div class="buttons d-flex">
							<BaseButton value="Cancel" usage="button" @click="openOrCloseModal(false, '')" />
							<BaseButton value="Log Out" usage="button" type="danger" @click="logOut" />
						</div>
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
			margin-bottom: 2rem;
		}

		.card-content {
			border-radius: 1.6rem;
			padding: 3.2rem 2.4rem;
			gap: 1.5rem;

			&__box {
				padding: 2rem;
				@include gap(2.5rem);
				border-radius: 1.6rem;

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
