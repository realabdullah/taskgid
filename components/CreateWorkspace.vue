<script lang="ts" setup>
import { useVuelidate } from "@vuelidate/core";
import { required, minLength, helpers } from "@vuelidate/validators";

const { usage, data, slug } = defineProps<{
	usage: string;
	data: any;
	slug?: string;
}>();

const emit = defineEmits<{
	(event: "close"): void;
	(event: "success", value: Task): void;
}>();

const push = usePush();
const { createWorkspace, selectedWorkspaceSlug } = useWorkspace();

const rules = {
	title: { required: helpers.withMessage("Title is required.", required) },
	description: { required: helpers.withMessage("Description is required.", required) },
	slug: { required: helpers.withMessage("Slug is required.", required), minLength: helpers.withMessage("Slug must be at least 3 characters.", minLength(3)) },
};

const form = reactive({
	title: "",
	description: "",
	slug: "",
});

const v$ = useVuelidate(rules, form, { $autoDirty: true, $lazy: true });

const submitting = ref(false);

if (usage === "update") Object.assign(form, data);

const submitForm = async () => {
	try {
		await v$.value.$validate();
		if (v$.value.$error) return push.error("Please fill all the required fields.");
		submitting.value = true;
		if (usage === "create") await createWorkspace(form);
		else if (usage === "update") {
			selectedWorkspaceSlug.value = slug as string;
			await createWorkspace(form, "update");
		}
		submitting.value = false;
		push.success(`Workspace ${usage === "create" ? "created" : "updated"} successfully!`);
		emit("close");
	} catch (error) {
		submitting.value = false;
		push.error((error as any)?.response?.data?.error ?? "Something went wrong!");
	}
};
</script>

<template>
	<form class="modal w-100 flex flex-column content-center items-center" @submit.prevent="submitForm">
		<BaseInput id="title" v-model="form.title" type="text" label="Title" :errors="v$.title.$errors" />
		<BaseInput id="description" v-model="form.description" type="text" label="Description" :errors="v$.description.$errors" />
		<BaseInput id="slug" v-model="form.slug" type="text" label="Slug" :errors="v$.slug.$errors" />
		<BaseButton :value="submitting ? 'loading' : 'Save'" />
	</form>
</template>

<style lang="scss" scoped>
.modal {
	padding: 3rem;
	gap: 1.3rem;

	p {
		@include font(1.5rem, 130%);
	}
}
</style>
