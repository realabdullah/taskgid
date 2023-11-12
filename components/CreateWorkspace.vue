<script lang="ts" setup>
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

const form = reactive({
	title: "",
	description: "",
	slug: "",
});
const submitting = ref(false);

if (usage === "update") Object.assign(form, data);

const submitForm = async () => {
	try {
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
		<BaseInput id="title" v-model="form.title" type="text" label="Title" :required="true" />
		<BaseInput id="description" v-model="form.description" type="text" label="Description" :required="true" />
		<BaseInput id="slug" v-model="form.slug" type="text" label="Slug" :required="true" />
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
