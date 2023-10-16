<script lang="ts" setup>
const { usage, taskToBeUpdated } = defineProps<{
	usage: string;
	taskToBeUpdated?: Task;
}>();

const emit = defineEmits<{
	(event: "close"): void;
	(event: "task-created", value: Task): void;
}>();
const client = useSupabaseClient();

const { tasks } = storeToRefs(useStore());
const { task } = useTask();

const priorities = ["Less Important", "Important", "High Priority"];
const submitting = ref(false);

if (usage === "update") Object.assign(task, taskToBeUpdated);

const handleSubmission = async () => {
	try {
		submitting.value = true;
		if (usage === "create") {
			task.dateAdded = new Date().toISOString().substring(0, 10);
			task.task_no = tasks.value ? tasks.value.length + 1 : 1;
			const { error } = await client.from("tasks").insert(task as never);
			if (error) throw new Error(error.message);
		} else {
			const { error } = await client
				.from("tasks")
				.update(task as never)
				.eq("id", taskToBeUpdated?.id);
			if (error) throw new Error(error.message);
		}
		emit("task-created", task);
		submitting.value = false;
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
					<BaseInput id="title" v-model="task.title" label="Task Name" type="text" />
					<div class="form-group d-flex">
						<BaseSelect id="priority" v-model="task.priority" label="Task Priority" :lists="priorities" />
						<BaseInput id="date" v-model="task.dueDate" label="Due Date" type="date" />
					</div>
					<BaseTextArea id="description" v-model="task.description" label="Task Description" />

					<BaseButton :value="submitting ? 'loading' : usage === 'create' ? 'Create Task' : 'Update Task'" />
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
