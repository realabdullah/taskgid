<script lang="ts" setup>
import { useQueryClient } from "@tanstack/vue-query";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { Task, Team } from "~/types";

const props = defineProps<{ isCreating?: boolean; task?: Task; hideTrigger?: boolean }>();
const emits = defineEmits<(event: "close") => void>();
const route = useRoute();
const workspaceSlug = computed(() => (typeof route.params.slug === "string" ? route.params.slug : ""));
const isCreatingMode = computed(() => props.isCreating ?? !props.task);

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
		if (!workspaceSlug.value) {
			throw new Error("Select a workspace before creating tasks.");
		}
		const baseurl = `/workspaces/${workspaceSlug.value}/tasks`;
		const url = isCreatingMode.value ? baseurl : `${baseurl}/${props.task?.id}`;
		const payload = {
			...values,
			dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
			status: values.status ? taskKeyMap[values.status] || values.status : values.status,
			priority: values.priority ? taskKeyMap[values.priority] || values.priority : values.priority,
		};
		const { data, success, error } = await useApiFetch<{ success: boolean; data: Task; error?: string }>(url, {
			method: isCreatingMode.value ? "POST" : "PUT",
			body: { ...payload },
		});
		if (!data || !success) throw new Error(error || (isCreatingMode.value ? "Failed to create task" : "Failed to update task"));
		setOpen(false);
		client.invalidateQueries({ queryKey: ["workspace-recent-tasks", workspaceSlug.value] });
		client.invalidateQueries({ queryKey: ["workspace-tasks", workspaceSlug.value] });
		toast(isCreatingMode.value ? "Task created successfully" : "Task updated successfully.");
		if (!isCreatingMode.value) emits("close");
	} catch (error) {
		toast(String(error));
	}
});

const fields = computed(() =>
	TaskFormFields.map((field) => {
		if (field.id === "assignees") {
			const teams = (client.getQueryData(["workspace-teams", workspaceSlug.value]) as Team[] | undefined) ?? [];
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
		<DialogTrigger v-if="isCreatingMode && !hideTrigger" as-child>
			<Button>
				<Icon name="hugeicons:plus-sign" :size="16" />
				Create Task
			</Button>
		</DialogTrigger>

		<DialogContent class="border-border bg-surface-0 max-h-[90vh] space-y-6 overflow-y-auto rounded-lg border p-6 shadow-md sm:max-w-[500px]">
			<DialogHeader class="space-y-1">
				<DialogTitle class="text-text-primary text-xl font-semibold">
					{{ isCreatingMode ? "Create New Task" : "Update Task" }}
				</DialogTitle>
				<DialogDescription class="text-text-secondary text-sm">
					{{ isCreatingMode ? "Add a new task to your workspace. Fill out the details below." : "Edit your task details below to update it in your workspace." }}
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
					<Button type="button" variant="outline" @click="setOpen(false)"> Cancel </Button>
					<Button type="submit">
						{{ isCreatingMode ? "Create Task" : "Update Task" }}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
