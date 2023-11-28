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
const { isAuthnSupported, addAuthn, getAuthns, removeAuthn } = useAuthn();
const { user, teams, savedDevices } = storeToRefs(useStore());
const push = usePush();

const form = reactive({
	name: user.value.firstName + " " + user.value.lastName,
	email: user.value.email,
	password: "",
});

const modalState = ref("");
const email = ref("");
const loading = ref(false);
const passkeyDevice = ref("");
const isDeviceNameValid = computed(() => {
	if (!passkeyDevice.value) return false;
	return !savedDevices.value.find((device) => device.device.toLowerCase() === passkeyDevice.value.trim().toLowerCase());
});

const rules = {
	name: { required: helpers.withMessage("Name is required.", required) },
	password: { minLength: helpers.withMessage("Password must be at least 8 characters.", minLength(8)) },
};
const inviteRules = {
	email: { required: helpers.withMessage("Email is required.", required) },
};

const v$ = useVuelidate(rules, form, { $autoDirty: true, $lazy: true });
const inviteV$ = useVuelidate(inviteRules, { email }, { $autoDirty: true, $lazy: true });

const openOrCloseModal = (state: string) => {
	modalState.value = state;
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
		loading.value = false;
		push.error("Something went wrong, please try again");
	}
};

const sendInvite = async () => {
	try {
		await inviteV$.value.$validate();
		if (inviteV$.value.$error) return;
		loading.value = true;
		$axios.post("/invite/", { email: email.value, slug: route.params.workspace });
		loading.value = false;
		openOrCloseModal("");
		push.success("Invite sent successfully!");
	} catch (error) {
		setTimeout(() => {
			loading.value = false;
			openOrCloseModal("");
			push.error("Something went wrong, please try again");
		}, 2000);
	}
};

const addDevice = async () => {
	if (!isDeviceNameValid.value) return;
	const status = await addAuthn(passkeyDevice.value);

	if (status.success) {
		push.success(status.message);
		openOrCloseModal("");
	} else {
		push.error(status.message ?? "Something went wrong, please try again");
	}
};

await getAuthns();
</script>

<template>
	<NuxtLayout name="dashboard">
		<div class="settings-page">
			<h3 class="header weight-regular col-darkBlue">Account Settings</h3>
			<form class="account__settings flex flex-column" @submit.prevent="editUser">
				<BaseInput id="name" v-model="form.name" label="Name" type="text" :errors="v$.name.$errors" />
				<BaseInput id="email" v-model="form.email" label="Email address" type="email" :disabled="true" />
				<BaseInput id="password" v-model="form.password" label="Password" type="password" :errors="v$.password.$errors" />
				<button class="bg-transparent weight-regular cursor-pointer" type="submit">Save</button>
			</form>

			<ClientOnly>
				<template v-if="isAuthnSupported">
					<h3 class="header weight-regular col-darkBlue">Auth Settings</h3>
					<div class="account__settings flex flex-column">
						<div class="flex items-center content-between w-100">
							<span class="weight-regular col-grey-3">Use password-less signin</span>
							<button class="bg-transparent weight-regular cursor-pointer" @click="openOrCloseModal('add-passkey')">Add</button>
						</div>

						<div class="added__authns">
							<span class="head block">Added Devices</span>
							<div v-if="savedDevices && savedDevices.length > 0" class="flex flex-column" style="gap: 1rem">
								<div v-for="device in savedDevices" :key="device._id" class="flex items-center content-between w-100">
									<span class="weight-regular col-grey-3">{{ device.device }}</span>
									<button class="bg-transparent weight-regular cursor-pointer" @click="removeAuthn(device._id)">Remove</button>
								</div>
							</div>

							<span v-else class="weight-regular col-grey-3">No devices added yet.</span>
						</div>
					</div>
				</template>
			</ClientOnly>

			<h3 class="header weight-regular flex items-center content-between">
				Workspace Members
				<button class="invite border-none bg-transparent weight-regular col-darkBlue cursor-pointer" @click="openOrCloseModal('invite')">Invite member</button>
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
								<button class="bg-transparent weight-regular col-darkBlue cursor-pointer" @click="openOrCloseModal('edit-member')">Edit</button>
								<button class="bg-transparent weight-regular col-darkBlue cursor-pointer" @click="openOrCloseModal('delete-member')">Delete</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- SEND INVITE MODAL -->
			<BaseModal v-if="modalState !== ''" width="50rem" @close-modal="openOrCloseModal('')">
				<form v-if="modalState === 'invite'" class="invite__form w-100 flex flex-column items-start content-center" @submit.prevent="sendInvite">
					<h3 class="weight-regular">Invite member</h3>
					<p class="weight-regular col-grey-3">Enter the email address of the person you want to invite to this workspace.</p>
					<BaseInput id="invitee-email" v-model="email" label="Email address" type="email" />
					<button class="bg-transparent weight-regular col-darkBlue cursor-pointer" type="submit">
						{{ loading ? "Sending" : "Send Invite" }}
					</button>
				</form>
				<form v-else-if="modalState === 'add-passkey'" class="invite__form w-100 flex flex-column items-start content-center" @submit.prevent="addDevice">
					<h3 class="weight-regular">Add Device</h3>
					<p class="weight-regular col-grey-3">Enter the name of the device you want to add.</p>
					<BaseInput id="device" v-model="passkeyDevice" label="Device name" type="text" :required="true" />
					<button class="bg-transparent weight-regular col-darkBlue cursor-pointer" type="submit" :disabled="!isDeviceNameValid">Add</button>
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
	padding: 2rem;

	h3 {
		@include font(2rem, 100%);
		color: #3a393e;
	}

	p {
		@include font(1.5rem, 100%);
		color: #3a393e;
	}

	button {
		width: 10rem;
		border: 1.5px solid #e2e2e8;
		border-radius: 1.4rem;
		padding: 1rem;
		box-shadow: #959da533 0px 8px 24px;

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
}

.added__authns {
	.head {
		width: 12rem;
		color: #3a393e;
		margin: 2rem 0;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e2e2e8;
	}
}
</style>
