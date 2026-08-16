<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import * as z from "zod";
import type { BaseUser } from "~/types";
import TaskPicker from "./TaskPicker.vue";

interface AssignmentResponse {
	success: true;
	message: string;
	data: { tasksAssigned: number; alreadyAssigned: number; invalidTasks: number };
}

const { member } = defineProps<{ member: BaseUser }>();
const route = useRoute();
const isOpen = defineModel<boolean>();
const tasks = reactive([]);
const isAssigningTasks = ref(false);

const formSchema = toTypedSchema(z.object({ tasks: z.array(z.string().uuid({ message: "Select a valid task" })) }));
const { handleSubmit } = useForm({
	validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
	try {
		isAssigningTasks.value = true;
		const url = API_ENDPOINTS.workspaces.batchAssignTasks(route.params.slug);
		const body = { taskIds: { ...values }, assigneeId: member.id };
		const res = await useApiFetch<AssignmentResponse>(url, {
			method: "POST",
			body,
		});
		if (!res || !res.data) throw new Error("Unable to assign these tasks. Try again.");
		notify(res);
	} catch (error) {
		toast.error(getServerError(error));
	} finally {
		isAssigningTasks.value = false;
	}
});

const notify = (res: AssignmentResponse) => {
	const { tasksAssigned, alreadyAssigned, invalidTasks } = res.data;
	toast.success(res.message);

	if (alreadyAssigned > 0) {
		toast.info(`${alreadyAssigned} task${alreadyAssigned === 1 ? " is" : "s are"} already assigned.`);
	}

	if (invalidTasks > 0) {
		toast.error(`${invalidTasks} task${invalidTasks === 1 ? " was" : "s were"} not assigned because the task information is invalid.`);
	}

	if (tasksAssigned > 0 && alreadyAssigned === 0 && invalidTasks === 0) {
		toast.success(`${tasksAssigned} task${tasksAssigned === 1 ? "" : "s"} assigned.`);
	}
};
</script>

<template>
	<Dialog v-model:open="isOpen">
		<DialogTrigger as-child>
			<slot />
		</DialogTrigger>
		<DialogContent class="border-border w-[calc(100vw-1rem)] max-w-[620px] overflow-hidden border p-0">
			<DialogHeader class="border-border bg-surface-1 border-b px-6 py-5 pe-14">
				<p class="text-text-tertiary font-mono text-xs tracking-[0.14em] uppercase">Assignment</p>
				<DialogTitle class="mt-2 text-2xl font-bold">Assign tasks.</DialogTitle>
				<DialogDescription class="text-text-secondary mt-2">{{
					member ? `Select tasks to assign to ${member.firstName}.` : "Select tasks and assign them to a team member."
				}}</DialogDescription>
			</DialogHeader>

			<form class="space-y-5 p-6" @submit="onSubmit">
				<FormField name="tasks">
					<FormItem>
						<FormLabel>Tasks</FormLabel>
						<FormControl>
							<TaskPicker v-model="tasks" placeholder="Select tasks to assign" />
						</FormControl>
						<FormDescription>Choose one or more tasks to assign.</FormDescription>
						<FormMessage />
					</FormItem>
				</FormField>

				<!-- TODO: SELECT TEAM MEMBER TO ASSIGN TO -->

				<!-- ASSIGN TO SELECTED TEAM MEMBER -->
				<div v-if="member" class="border-border bg-surface-1 flex items-center gap-3 border p-4">
					<Avatar class="h-10 w-10">
						<AvatarImage :src="member.profilePicture" :alt="member.firstName" />
						<AvatarFallback>{{ getInitials(member.firstName, member.lastName) }}</AvatarFallback>
					</Avatar>
					<div class="flex-1">
						<div class="font-medium">{{ member.firstName }} {{ member.lastName }}</div>
						<div class="flex items-center gap-2">
							<Badge variant="outline" class="text-xs">Selected assignee</Badge>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" :disabled="isAssigningTasks" @click="isOpen = false"> Cancel </Button>
					<Button type="submit" :disabled="isAssigningTasks">
						<AppSpinner v-if="isAssigningTasks" border-color="border-primary-foreground" />
						<template v-else>Assign tasks</template>
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
