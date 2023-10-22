<script lang="ts" setup>
const { usage, taskToBeUpdated } = defineProps<{
	usage: string;
	taskToBeUpdated?: Task;
}>();

const emit = defineEmits<{
	(event: "close"): void;
	(event: "task-created", value: Task): void;
}>();

const { members } = storeToRefs(useStore());
const { task, createNewTask, updateTask } = useTask();

const priorities = ["Less Important", "Important", "High Priority"];
const submitting = ref(false);

if (usage === "update") Object.assign(task, taskToBeUpdated);

const handleSubmission = async () => {
	try {
		submitting.value = true;
		if (usage === "create") await createNewTask();
		else updateTask(taskToBeUpdated?.id as string);
		emit("task-created", task);
		useEvent("toast", `Task ${usage === "create" ? "created" : "updated"} successfully!`);
		submitting.value = false;
	} catch (error) {
		submitting.value = false;
		useEvent("toast", useFormatError(error as string));
	}
};

const options = members.value.map((member) => ({ id: member.id, label: member.name }));
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
					<BaseMultiSelect id="members" v-model="task.assigned_to" label="Assign to" :options="options" />
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
