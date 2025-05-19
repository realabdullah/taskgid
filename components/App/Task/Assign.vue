<script lang="ts" setup>
import * as z from "zod";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import type { BaseUser } from "~/types";

defineProps<{ member: BaseUser }>();

const isOpen = defineModel<boolean>();
const tasks = reactive([]);

const formSchema = toTypedSchema(z.object({ tasks: z.array(z.string().uuid({ message: "Invalid task ID" })) }));
const { handleSubmit } = useForm({
	validationSchema: formSchema,
});
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

			<form class="space-y-6 pt-4">
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
					<Button type="button" variant="outline" @click="isOpen = false"> Cancel </Button>
					<Button type="submit"> Assign Tasks </Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
