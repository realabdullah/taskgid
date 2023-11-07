<script lang="ts" setup>
const { usage, task } = defineProps<{
	usage: string;
	task: Task;
}>();

const emit = defineEmits<{
	(event: "close"): void;
	(event: "success", value: Task): void;
}>();

const { teams } = storeToRefs(useStore());
const { createNewTask, updateTask } = useTask();
const push = usePush();
const form = reactive(task);

const priorities = ["Low", "Medium", "High"];
const submitting = ref(false);

const handleSubmission = async () => {
	try {
		submitting.value = true;
		let newTask: Task;
		if (usage === "create") newTask = await createNewTask(form);
		else newTask = await updateTask(form);
		emit("success", newTask);
		push.success(`${usage === "create" ? "Created" : "Updated"} task successfully.`);
	} catch (error) {
		submitting.value = false;
		push.error(`Failed to ${usage} task.`);
	}
};
</script>

<template>
	<BaseModal width="50rem" @close-modal="$emit('close')">
		<template #default>
			<div class="create-task">
				<h1 class="weight-semiBold col-black">{{ usage === "create" ? "Create Task" : "Edit This Task." }}</h1>
				<form class="flex flex-column" @submit.prevent="handleSubmission">
					<BaseInput id="title" v-model="form.title" label="Task Tile" type="text" />
					<div class="form-group flex">
						<BaseSelect id="priority" v-model="form.priority" label="Task Priority" :lists="priorities" />
						<BaseInput id="date" v-model="form.dueDate" label="Due Date" type="date" />
					</div>
					<BaseMultiSelect id="members" :assignees="form.assignees" label="Assign to" :options="teams" @update-assignees="form.assignees = [...$event]" />
					<BaseTextArea id="description" v-model="form.description" label="Task Description" />

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
