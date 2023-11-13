<script lang="ts" setup>
import { useForm } from "vee-validate";
import * as yup from "yup";

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

const schema = yup.object({
	title: yup.string().trim().required(),
	description: yup.string().trim().required(),
	slug: yup.string().trim().required().min(4),
});

const { errors, defineInputBinds } = useForm({
	validationSchema: schema,
});

const form = reactive({
	title: defineInputBinds("title", { validateOnInput: true }),
	description: defineInputBinds("description", { validateOnInput: true }),
	slug: defineInputBinds("slug", { validateOnInput: true }),
});
const submitting = ref(false);

if (usage === "update") Object.assign(form, data);

const submitForm = async () => {
	try {
		if (errors.value) return push.error("Please fill all the required fields.");
		submitting.value = true;
		if (usage === "create") await createWorkspace(form);
		else if (usage === "update") {
			selectedWorkspaceSlug.value = slug as string;
			await createWorkspace(form, "update");
		}
		submitting.value = false;
		push.success("Workspace created successfully!");
		emit("close");
	} catch (error) {
		submitting.value = false;
		const { message } = formatError(error);
		push.error(message);
	}
};
</script>

<template>
	<form class="modal w-100 flex flex-column content-center items-center" @submit.prevent="submitForm">
		<BaseInput id="title" v-model="form.title" type="text" label="Title" :error="errors.title" />
		<BaseInput id="description" v-model="form.description" type="text" label="Description" :error="errors.description" />
		<BaseInput id="slug" v-model="form.slug" type="text" label="Slug" :error="errors.slug" />
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
