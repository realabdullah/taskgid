<script lang="ts" setup>
import { useQueryClient } from "@tanstack/vue-query";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { Task } from "~/types";

const props = defineProps<{ isCreating?: boolean; task?: Task }>();
// const emits = defineEmits<(event: "update", value: Task) => void>();

const isOpen = defineModel<boolean>();

const setOpen = (open: boolean) => {
	isOpen.value = open;
};

const formSchema = toTypedSchema(taskFormSchema);
const { isFieldDirty, handleSubmit } = useForm({
	validationSchema: formSchema,
	initialValues: {
		title: props.task?.title,
		description: props.task?.description,
		dueDate: props.task?.dueDate ? new Date(props.task.dueDate) : undefined,
		priority: props.task?.priority,
		assignees: props.task?.assignees.map((user) => user.username) || [],
		status: props.task?.status,
	},
});

const taskKeyMap: { [key: string]: string } = {
	Todo: "todo",
	"In Progress": "in_progress",
	Done: "done",
	Low: "low",
	Medium: "medium",
	High: "high",
};

const client = useQueryClient();
const onSubmit = handleSubmit(async (values) => {
	try {
		const url = `/workspaces/${useRoute().params.slug}/tasks`;
		const payload = {
			...values,
			dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
			status: values.status ? taskKeyMap[values.status] || values.status : values.status,
			priority: values.priority ? taskKeyMap[values.priority] || values.priority : values.priority,
		};
		const { data, success, error } = await useApiFetch<{ success: boolean; data: Task; error?: string }>(url, {
			method: props.isCreating ? "POST" : "PUT",
			body: { ...payload },
		});
		if (!data || !success) throw new Error(error || (props.isCreating ? "Failed to create task" : "Failed to update task"));
		setOpen(false);
		client.invalidateQueries({ queryKey: ["workspace-recent-tasks"] });
		toast(props.isCreating ? "Task created successfully" : "Task updated successfully.");
	} catch (error) {
		toast(String(error));
	}
});

const fields = computed(() =>
	TaskFormFields.map((field) => {
		if (field.id === "assignees") {
			return {
				...field,
				options: props.task?.assignees.map((user) => user.username) || [],
			};
		} else if (field.id === "status")
			return {
				...field,
				options: [
					{ label: "Todo", value: "todo" },
					{ label: "In Progress", value: "in_progress" },
					{ label: "Done", value: "done" },
				],
			};
		else if (field.id === "priority")
			return {
				...field,
				options: [
					{ label: "Low", value: "low" },
					{ label: "Medium", value: "medium" },
					{ label: "High", value: "high" },
				],
			};
		return field;
	})
) as Ref<
	{
		id: string;
		label: string;
		type?: string;
		placeholder?: string;
		isFieldDirty?: boolean;
		extra?: string;
		options?: { label: string; value: string }[];
	}[]
>;
</script>

<template>
	<Dialog :open="isOpen" @update:open="setOpen">
		<DialogTrigger v-if="isCreating" as-child>
			<Button class="bg-black text-white hover:bg-black/90">
				<Icon name="hugeicons:plus-sign" :size="16" class="mr-2" />
				Create Task
			</Button>
		</DialogTrigger>
		<DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
			<DialogHeader>
				<DialogTitle>{{ isCreating ? "Create New Task" : "Update task" }}</DialogTitle>
				<DialogDescription>
					{{ isCreating ? "Add a new task to your workspace. Fill out the details below." : "Edit your task details below to update it in your workspace." }}
				</DialogDescription>
			</DialogHeader>

			<form class="" @submit="onSubmit">
				<div class="grid gap-4 py-4">
					<AuthFormField
						v-for="field in fields"
						:key="field.id"
						:label="field.label"
						:name="field.id"
						:placeholder="field.placeholder"
						:type="field.type"
						:is-field-dirty="!isFieldDirty"
						:options="field.options"
					/>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" @click="setOpen(false)"> Cancel </Button>
					<Button type="submit">{{ isCreating ? "Create Task" : "Update Task" }}</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
