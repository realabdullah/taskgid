<script lang="ts" setup>
definePageMeta({
	title: "Create Workspace",
	name: "CreateWorkspace",
	middleware: ["auth"],
});

const workSpaceState = ref("name");
const name = ref("");
const description = ref("");
const submitting = ref(false);

const pageHeadings = computed(() => {
	if (workSpaceState.value === "name") {
		return {
			header: "Create A Workspace.",
			description: "A workspace is where your team members can collaborate on projects.",
		};
	} else {
		return {
			header: "Add Workspace Description.",
			description: "A workspace description is a short summary of what your workspace is about.",
		};
	}
});

const client = useSupabaseClient();
const user = useSupabaseUser();

const createWorkspace = async () => {
	try {
		submitting.value = true;
		const payload = {
			user_id: user.value?.id,
			title: name.value,
			description: description.value,
		};

		const { error } = await client.from("workspaces").insert(payload as any);

		if (error) throw new Error(error.message);

		navigateTo({ path: "/dashboard", query: { workspace: name.value } });
	} catch (error) {
		submitting.value = false;
	}
};

const handleNext = async () => {
	if (workSpaceState.value === "name" && name.value !== "") workSpaceState.value = "description";
	else await createWorkspace();
};
</script>

<template>
	<NuxtLayout name="setup">
		<div class="workspace d-flex fd-column jc-center ai-flex-start w-100 h-100">
			<div class="workspace__create d-flex fd-column jc-center ai-flex-start">
				<h1 class="workspace__create-header fw-bold col-black">{{ pageHeadings.header }}</h1>
				<p class="workspace__create-description fw-regular col-grey">{{ pageHeadings.description }}</p>

				<div class="workspace__create-form w-100">
					<BaseInput v-if="workSpaceState === 'name'" v-model="name" input-type="text" label-for="workspace-name" label="Workspace Name" border-color="#2746D8" :required="true" />

					<BaseInput v-else v-model="description" input-type="text" label-for="workspace-desc" label="Workspace Description" border-color="#2746D8" :required="true" />
				</div>

				<BaseButton
					width="204px"
					type="button"
					:value="submitting ? 'loading' : workSpaceState === 'name' ? 'Next' : 'Create Workspace'"
					background="#3754DB"
					color="#FFFFFF"
					@click="handleNext" />
			</div>
		</div>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.workspace {
	max-width: 40rem;
	margin: 0 auto;

	&__create {
		&-header {
			@include font(2.8rem, 3.4rem);
			margin-bottom: 1.2rem;
		}

		&-description {
			@include font(1.6rem, 1.9rem);
			margin-bottom: 3.2rem;
		}
	}
}
</style>
