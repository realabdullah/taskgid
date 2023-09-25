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
			title: name.value,
			description: description.value,
			created_by: user.value?.id,
			members: [user.value?.id],
			tasks: [],
		};

		const { error } = await client.from("workspaces").insert(payload as any);

		if (error) throw new Error(error.message);
		navigateTo({ path: "/dashboard", query: { workspace: name.value } });
	} catch (error) {
		submitting.value = false;
	}
};

const handleNext = async () => {
	if (workSpaceState.value === "name" && name.value.trim() !== "") workSpaceState.value = "description";
	else if (workSpaceState.value === "description" && description.value.trim() !== "") {
		await createWorkspace();
	}
};
</script>

<template>
	<NuxtLayout name="setup">
		<div class="workspace d-flex fd-column jc-center ai-flex-start w-100 h-100">
			<div class="workspace__create d-flex fd-column jc-center ai-flex-start">
				<h1 class="workspace__create-header fw-bold col-black">{{ pageHeadings.header }}</h1>
				<p class="workspace__create-description fw-regular col-grey">{{ pageHeadings.description }}</p>

				<form class="workspace__create-form w-100" @submit.prevent="handleNext">
					<BaseInput v-if="workSpaceState === 'name'" v-model="name" input-type="text" label-for="workspace-name" label="Workspace Name" border-color="#2746D8" :required="true" />

					<BaseInput v-else v-model="description" input-type="text" label-for="workspace-desc" label="Workspace Description" border-color="#2746D8" :required="true" />

					<BaseButton width="204px" type="submit" :value="submitting ? 'loading' : workSpaceState === 'name' ? 'Next' : 'Create Workspace'" background="#3754DB" color="#FFFFFF" />
				</form>
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
