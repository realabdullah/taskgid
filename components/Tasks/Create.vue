<script lang="ts" setup>
const { usage, taskToBeUpdated } = defineProps<{
	usage: string;
	taskToBeUpdated?: Task;
}>();

const { tasks, activeWorkspace } = storeToRefs(useStore());

const priorities = ["Less Important", "Important", "High Priority"];
const title = ref("");
const description = ref("");
const dueDate = ref(new Date().toISOString().substring(0, 10));
const priority = ref("");
const status = ref("Pending");
const submitting = ref(false);

const updatePriority = (value: string) => (priority.value = value);
const emit = defineEmits(["close", "task-created"]);
const client = useSupabaseClient();
const user = useSupabaseUser();

if (usage === "update") {
	title.value = taskToBeUpdated?.title ?? "";
	description.value = taskToBeUpdated?.description ?? "";
	dueDate.value = taskToBeUpdated?.dueDate ?? "";
	updatePriority(taskToBeUpdated?.priority ?? "");
	status.value = taskToBeUpdated?.status ?? "";
}

const handleSubmission = async () => {
	try {
		submitting.value = true;
		const payload = {
			user_id: user.value?.id,
			title: title.value,
			description: description.value,
			dateAdded: taskToBeUpdated?.dateAdded ?? new Date().toISOString().substr(0, 10),
			dueDate: dueDate.value,
			priority: priority.value,
			status: status.value,
			task_no: taskToBeUpdated?.task_no ?? tasks.value ? tasks.value.length + 1 : 1,
			workspace_id: activeWorkspace.value,
		};

		if (usage === "create") {
			const { error } = await client.from("tasks").insert(payload as any);
			if (error) throw new Error(error.message);
		} else {
			const { error } = await client
				.from("tasks")
				.update(payload as never)
				.eq("id", taskToBeUpdated?.id);
			if (error) throw new Error(error.message);
		}
		submitting.value = false;
		emit("task-created");
	} catch (error) {
		submitting.value = false;
		useEvent("toast", useFormatError(error as string));
	}
};
</script>

<template>
	<BaseModal width="50rem" @close-modal="$emit('close')">
		<template #default>
			<div class="create-task">
				<h1 class="fw-semiBold col-black">{{ usage === "create" ? "Create Task" : "Edit This Task." }}</h1>
				<form class="d-flex fd-column" @submit.prevent="handleSubmission">
					<BaseInput id="title" v-model="title" label="Task Name" type="text" />
					<div class="form-group d-flex">
						<BaseSelect id="priority" v-model="priority" label="Task Priority" :lists="priorities" />
						<BaseInput id="date" v-model="dueDate" label="Due Date" type="date" />
					</div>
					<BaseTextArea id="description" v-model="description" label="Task Description" />

					<BaseButton :value="usage === 'create' ? 'Create Task' : 'Save Task'" />
				</form>
			</div>
		</template>
	</BaseModal>
</template>

<style lang="scss" scoped>
.create-task {
	padding: 5rem;

	h1 {
		@include font(2.8rem, 3.4rem);
		margin-bottom: 1.5rem;
	}

	form {
		@include gap(2.4rem);

		.form-group {
			@include gap(1.5rem);
		}
	}
}
</style>
