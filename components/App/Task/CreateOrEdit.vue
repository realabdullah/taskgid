<script lang="ts" setup>
import { useQueryClient } from "@tanstack/vue-query";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { Task, Team } from "~/types";

const props = defineProps<{ isCreating?: boolean; task?: Task }>();
const emits = defineEmits<(event: "close") => void>();

const isOpen = defineModel<boolean>();

const setOpen = (open: boolean) => {
	isOpen.value = open;
};

const formSchema = toTypedSchema(taskFormSchema);
const { isFieldDirty, handleSubmit, setValues } = useForm({
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
		const baseurl = `/workspaces/${useRoute().params.slug}/tasks`;
		const url = props.isCreating ? baseurl : `${baseurl}/${props.task?.id}`;
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
		if (!props.isCreating) emits("close");
	} catch (error) {
		toast(String(error));
	}
});

const fields = computed(() =>
	TaskFormFields.map((field) => {
		if (field.id === "assignees") {
			const teams = client.getQueryData(["workspace-teams", useRoute().params.slug]) as Team[];
			return {
				...field,
				options: teams.map((member) => ({
					label: `${member.firstName} ${member.lastName}`,
					value: member.username,
				})),
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
		fullWidth?: boolean;
		isMultiple?: boolean;
		options?: { label: string; value: string }[];
	}[]
>;

watch(
	() => props.task,
	(task) => {
		if (task) {
			setValues({
				title: task.title,
				description: task.description,
				dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
				priority: task.priority,
				assignees: task.assignees.map((user) => user.username),
				status: task.status,
			});
		}
	}
	// { once: true }
);
</script>

<template>
	<Dialog :open="isOpen" @update:open="setOpen">
		<DialogTrigger v-if="isCreating" as-child>
			<Button class="rounded-md bg-black px-4 py-2 text-white hover:bg-black/90">
				<Icon name="hugeicons:plus-sign" :size="16" class="mr-2" />
				Create Task
			</Button>
		</DialogTrigger>

		<DialogContent class="max-h-[90vh] space-y-6 overflow-y-auto rounded-lg bg-white p-6 shadow-xl sm:max-w-[500px]">
			<DialogHeader class="space-y-1">
				<DialogTitle class="text-xl font-semibold text-gray-900">
					{{ isCreating ? "Create New Task" : "Update Task" }}
				</DialogTitle>
				<DialogDescription class="text-sm text-gray-500">
					{{ isCreating ? "Add a new task to your workspace. Fill out the details below." : "Edit your task details below to update it in your workspace." }}
				</DialogDescription>
			</DialogHeader>

			<form class="space-y-6" @submit="onSubmit">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<AuthFormField
						v-for="field in fields"
						:key="field.id"
						:label="field.label"
						:name="field.id"
						:placeholder="field.placeholder"
						:type="field.type"
						:is-field-dirty="!isFieldDirty"
						:options="field.options"
						:is-multiple="field.isMultiple"
						:class-name="['w-full', field.type === 'textarea' || field.fullWidth ? 'sm:col-span-2' : '']"
					/>
				</div>

				<DialogFooter class="flex justify-between pt-2">
					<Button type="button" variant="outline" class="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100" @click="setOpen(false)"> Cancel </Button>
					<Button type="submit" class="rounded-md bg-black px-5 py-2 text-white hover:bg-black/90">
						{{ isCreating ? "Create Task" : "Update Task" }}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
