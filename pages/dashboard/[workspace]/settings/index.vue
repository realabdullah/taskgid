<script lang="ts" setup>
import { useVuelidate } from "@vuelidate/core";
import { required, minLength, helpers } from "@vuelidate/validators";

definePageMeta({
	title: "Settings - Dashboard",
	name: "Settings",
	middleware: ["auth"],
});

const { $axios } = useNuxtApp();
const route = useRoute();
const { user, teams } = storeToRefs(useStore());
const push = usePush();

const form = reactive({
	name: user.value.firstName + " " + user.value.lastName,
	email: user.value.email,
	password: "",
});

const rules = {
	name: { required: helpers.withMessage("Name is required.", required) },
	password: { minLength: helpers.withMessage("Password must be at least 8 characters.", minLength(8)) },
};
const inviteRules = {
	email: { required: helpers.withMessage("Email is required.", required) },
};

const showModal = ref(false);
const modalState = ref("edit-profile");
const email = ref("");
const loading = ref(false);

const v$ = useVuelidate(rules, form, { $autoDirty: true, $lazy: true });
const inviteV$ = useVuelidate(inviteRules, { email }, { $autoDirty: true, $lazy: true });

const openOrCloseModal = (status: boolean, state: string) => {
	modalState.value = state;
	showModal.value = status;
};

const editUser = async () => {
	try {
		await v$.value.$validate();
		if (v$.value.$error) return;
		loading.value = true;
		const { name, password } = form;
		const response = await $axios.put("/users/", { name, password });
		user.value = { ...user.value, ...response.data };
		loading.value = false;
		push.success("Profile updated successfully!");
	} catch (error) {
		setTimeout(() => {
			loading.value = false;
			openOrCloseModal(false, "");
			push.error("Something went wrong, please try again");
		}, 2000);
	}
};

const handleEditProfile = () => {
	openOrCloseModal(false, "");
};

const sendInvite = async () => {
	try {
		await inviteV$.value.$validate();
		if (inviteV$.value.$error) return;
		loading.value = true;
		$axios.post("/invite/", { email: email.value, slug: route.params.workspace });
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
</script>

<template>
	<NuxtLayout name="dashboard">
		<div class="settings-page">
			<h3 class="header weight-regular col-darkBlue">Account Settings</h3>
			<form class="account__settings flex flex-column" @submit.prevent="editUser">
				<BaseInput id="name" v-model="form.name" label="Name" type="text" :errors="v$.name.$errors" />
				<BaseInput id="email" v-model="form.email" label="Email address" type="email" :disabled="true" />
				<BaseInput id="password" v-model="form.password" label="Password" type="password" :errors="v$.password.$errors" />
				<button class="bg-transparent weight-regular cursor-pointer" @click="handleEditProfile">Save</button>
			</form>

			<h3 class="header weight-regular flex items-center content-between">
				Workspace Members
				<button class="invite border-none bg-transparent weight-regular col-darkBlue cursor-pointer" @click="openOrCloseModal(true, 'invite')">Invite member</button>
			</h3>
			<div class="members__table w-100">
				<table class="w-100" aria-label="Workspace Members">
					<thead>
						<tr>
							<th>Name</th>
							<th>Username</th>
							<th>Email</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="member in teams" :key="member.username">
							<td>{{ member.name }}</td>
							<td>{{ member.username }}</td>
							<td>{{ member.email }}</td>
							<td>
								<button class="bg-transparent weight-regular col-darkBlue cursor-pointer" @click="openOrCloseModal(true, 'edit-member')">Edit</button>
								<button class="bg-transparent weight-regular col-darkBlue cursor-pointer" @click="openOrCloseModal(true, 'delete-member')">Delete</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- SEND INVITE MODAL -->
			<BaseModal v-if="showModal" width="50rem" @close-modal="openOrCloseModal(false, '')">
				<form class="invite__form flex flex-column items-center content-center">
					<h3 class="weight-regular col-darkBlue">Invite member</h3>
					<p class="weight-regular col-grey-3">Enter the email address of the person you want to invite to this workspace.</p>
					<BaseInput id="invitee-email" v-model="email" label="Email address" type="email" />
					<button class="bg-transparent weight-regular col-darkBlue cursor-pointer" @click="sendInvite">
						<span v-if="loading">Sending...</span>
						<span v-else>Send Invite</span>
					</button>
				</form>
			</BaseModal>
		</div>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.settings-page {
	.header {
		color: #3a393e;
		border-bottom: 1px solid #e2e2e8;
		padding-bottom: 3rem;
		@include font(2rem, 100%);

		&:not(:first-child) {
			margin-top: 4rem;
		}

		.invite {
			@include font(1.5rem, 1.5rem);
			border: 1.5px solid #e2e2e8;
			border-radius: 1.4rem;
			padding: 0.7rem 1.5rem;
		}
	}

	.account__settings {
		@include gap(2rem);
		margin-top: 2rem;
		border: 1.5px solid #e2e2e8;
		border-radius: 1.4rem;
		padding: 2rem;
		box-shadow: #959da533 0px 8px 24px;

		button {
			width: 10rem;
			border: 1.5px solid #e2e2e8;
			border-radius: 1.4rem;
			padding: 1rem;
			box-shadow: #959da533 0px 8px 24px;
		}
	}

	.members__table {
		margin-top: 4rem;
		@include gap(2rem);
		overflow-x: auto;
		border: 1.5px solid #e2e2e8;
		border-radius: 1.4rem;
		padding: 2rem;
		padding-bottom: 0;
		box-shadow: #959da533 0px 8px 24px;
		min-width: 80rem;

		table {
			border-collapse: collapse;

			thead {
				tr {
					th {
						@include font(1.5rem, 100%);
						color: #3a393e;
						text-align: left;
						padding-bottom: 1rem;
					}
				}
			}

			tbody {
				tr {
					&:not(:last-child) {
						border-bottom: 1px solid #e2e2e8;
					}

					td {
						@include font(1.5rem, 100%);
						color: #3a393e;
						padding: 2rem 0;
					}

					button {
						border: 1.5px solid #e2e2e8;
						border-radius: 1.4rem;
						padding: 0.7rem 1.5rem;

						&:not(:first-child) {
							margin-left: 1rem;
						}
					}
				}
			}
		}
	}
}

.invite__form {
	@include gap(2rem);
	width: 40rem;

	h3 {
		@include font(2rem, 100%);
		color: #3a393e;
	}

	p {
		@include font(1.5rem, 100%);
		color: #3a393e;
	}
}
</style>
