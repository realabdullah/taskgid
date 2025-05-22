<script lang="ts" setup>
import * as z from "zod";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from "vue-sonner";
import type { BaseUser } from "~/types";

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

const formSchema = toTypedSchema(z.object({ tasks: z.array(z.string().uuid({ message: "Invalid task ID" })) }));
const { handleSubmit } = useForm({
	validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
	try {
		isAssigningTasks.value = true;
		const url = `/workspaces/${route.params.slug}/tasks/batch-assign`;
		const body = { taskIds: { ...values }, assigneeId: member.id };
		const res = await useApiFetch<AssignmentResponse>(url, {
			method: "POST",
			body,
		});
		if (!res || !res.data) throw new Error("Failed to assign tasks");
		notify(res);
	} catch (error) {
		toast(String(error));
	} finally {
		isAssigningTasks.value = false;
	}
});

const notify = (res: AssignmentResponse) => {
	const { tasksAssigned, alreadyAssigned, invalidTasks } = res.data;
	toast.success(res.message);

	if (alreadyAssigned > 0) {
		toast(`⚠️ ${alreadyAssigned} task${alreadyAssigned > 1 ? "s were" : " was"} already assigned.`);
	}

	if (invalidTasks > 0) {
		toast.error(`❌ ${invalidTasks} invalid task ID${invalidTasks > 1 ? "s" : ""} were ignored.`);
	}

	if (tasksAssigned > 0 && alreadyAssigned === 0 && invalidTasks === 0) {
		toast.success(`🎉 All ${tasksAssigned} new task${tasksAssigned > 1 ? "s" : ""} assigned!`);
	}
};
</script>

<template>
	<Dialog v-model:open="isOpen">
		<DialogTrigger as-child>
			<slot />
		</DialogTrigger>
		<DialogContent class="sm:max-w-[550px]">
			<DialogHeader>
				<DialogTitle>Assign Tasks</DialogTitle>
				<DialogDescription>
					{{ member ? `Assign tasks to ${member.firstName} ${member.lastName}` : "Select tasks and assign them to a team member" }}
				</DialogDescription>
			</DialogHeader>

			<form class="space-y-6 pt-4" @submit="onSubmit">
				<FormField name="tasks">
					<FormItem>
						<FormLabel>Select Tasks</FormLabel>
						<FormControl>
							<AppTaskSelect v-model="tasks" placeholder="Select tasks to assign" />
						</FormControl>
						<FormDescription>Choose one or more tasks to assign</FormDescription>
						<FormMessage />
					</FormItem>
				</FormField>

				<!-- TODO: SELECT TEAM MEMBER TO ASSIGN TO -->

				<!-- ASSIGN TO SELECTED TEAM MEMBER -->
				<div v-if="member" class="flex items-center gap-3 rounded-md border p-4">
					<Avatar class="h-10 w-10">
						<AvatarImage :src="member.profilePicture" :alt="member.firstName" />
						<AvatarFallback>{{ getInitials(member.firstName, member.lastName) }}</AvatarFallback>
					</Avatar>
					<div class="flex-1">
						<div class="font-medium">{{ member.firstName }} {{ member.lastName }}</div>
						<div class="flex items-center gap-2">
							<Badge variant="outline" class="text-xs"> Selected Assignee </Badge>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" :disabled="isAssigningTasks" @click="isOpen = false"> Cancel </Button>
					<Button type="submit" :disabled="isAssigningTasks">
						<AppSpinner v-if="isAssigningTasks" border-color="border-gray-100" />
						<template v-else> Assign Tasks </template>
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
