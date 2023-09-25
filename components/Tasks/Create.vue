<script lang="ts" setup>
const props = defineProps<{
	usage: string;
	taskToBeUpdated?: Task;
}>();

const { tasks, activeWorkspace } = storeToRefs(useStore());

const priorities = ["Less Important", "Important", "High Priority"];
const title = ref("");
const description = ref("");
const dueDate = ref(new Date().toISOString().substr(0, 10));
const priority = ref("");
const status = ref("Pending");
const submitting = ref(false);

const updatePriority = (value: string) => {
	priority.value = value;
};
const emit = defineEmits(["close", "task-created"]);
const client = useSupabaseClient();
const user = useSupabaseUser();

if (props.usage === "update") {
	title.value = props.taskToBeUpdated?.title ?? "";
	description.value = props.taskToBeUpdated?.description ?? "";
	dueDate.value = props.taskToBeUpdated?.dueDate ?? "";
	updatePriority(props.taskToBeUpdated?.priority ?? "");
	status.value = props.taskToBeUpdated?.status ?? "";
}

const handleSubmission = async () => {
	try {
		submitting.value = true;
		const payload = {
			user_id: user.value?.id,
			title: title.value,
			description: description.value,
			dateAdded: props.taskToBeUpdated?.dateAdded ?? new Date().toISOString().substr(0, 10),
			dueDate: dueDate.value,
			priority: priority.value,
			status: status.value,
			task_no: props.taskToBeUpdated?.task_no ?? tasks.value ? tasks.value.length + 1 : 1,
			workspace_id: activeWorkspace.value,
		};

		if (props.usage === "create") {
			const { error } = await client.from("tasks").insert(payload as any);
			if (error) throw new Error(error.message);
		} else {
			const { error } = await client
				.from("tasks")
				.update(payload as never)
				.eq("id", props.taskToBeUpdated?.id);
			if (error) throw new Error(error.message);
		}
		submitting.value = false;
		emit("task-created");
	} catch (error) {
		submitting.value = false;
	}
};
</script>

<template>
	<BaseModal width="500px" @close-modal="$emit('close')">
		<template #default>
			<div class="create-task">
				<h1>{{ usage === "create" ? "Create Task" : "Edit This Task." }}</h1>
				<form @submit.prevent="handleSubmission">
					<BaseInput v-model="title" label-for="title" label="Task Name" input-type="text" :required="true" border-color="#A8ABBD" />
					<div class="form-group">
						<BaseSelect label="Task Priority" :lists="priorities" :selected-value="priority" @selected="updatePriority" />
						<BaseInput v-model="dueDate" label-for="date" label="Due Date" input-type="date" :required="true" border-color="#A8ABBD" />
					</div>
					<BaseTextArea v-model="description" name="description" label="Task Description" placeholder="Type your content here...." :required="true" border-color="#A8ABBD" />

					<BaseButton :value="usage === 'create' ? 'Create Task' : 'Save Task'" background="#3754DB" color="#FFFFFF" width="202px" type="submit" />
				</form>
			</div>
		</template>
	</BaseModal>
</template>

<style lang="scss" scoped>
.create-task {
	padding: 50px;

	h1 {
		font-weight: 600;
		font-size: 28px;
		line-height: 34px;
		color: #000000;
		margin-bottom: 15px;
	}

	form {
		.form-group {
			display: flex;
			gap: 15px;
			margin-bottom: 24px;
		}
	}
}
</style>
