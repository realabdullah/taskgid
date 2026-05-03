<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { Workspace } from "~/types";
import { BulkInviteSchema } from "~/utils/validations";

const props = defineProps<{ workspace: Workspace }>();
const isOpen = defineModel<boolean>();

type InviteResult = { email: string; success: boolean; error?: string };
type BulkInviteResponse = {
	message?: string;
	results: Array<{ email: string; status: "success" | "failed"; message?: string; error?: string }>;
};

const formSchema = toTypedSchema(BulkInviteSchema);

const { handleSubmit, resetForm, values } = useForm({
	validationSchema: formSchema,
	initialValues: { emails: "" },
});

const results = ref<InviteResult[]>([]);
const isSending = ref(false);
const progress = ref(0);
const isDone = ref(false);

const parseEmails = (raw: string) =>
	raw
		.split(/[\n,]+/)
		.map((e: string) => e.trim())
		.filter(Boolean);

const parsedEmails = computed(() => parseEmails(values.emails ?? ""));

const reset = () => {
	results.value = [];
	progress.value = 0;
	isDone.value = false;
	resetForm();
};

const onClose = (open: boolean) => {
	if (!open) reset();
	isOpen.value = open;
};

const onSubmit = handleSubmit(async (values) => {
	const emails = parseEmails(values.emails as string);

	if (emails.length > 10) {
		toast.error("You can send at most 10 invites at a time.");
		return;
	}

	isSending.value = true;
	results.value = [];
	progress.value = 0;

	try {
		const response = await useApiFetch<BulkInviteResponse>(API_ENDPOINTS.invites.bulk, {
			method: "POST",
			body: {
				emails,
				workspaceId: props.workspace.id,
			},
		});

		if (!response?.results || !Array.isArray(response.results)) {
			throw new Error("Invalid bulk invitation response");
		}

		results.value = response.results.map((result) => ({
			email: result.email,
			success: result.status === "success",
			error: result.status === "failed" ? result.error || result.message || "Failed" : undefined,
		}));
	} catch (err) {
		const errorMessage = getServerError(err);
		results.value = emails.map((email) => ({ email, success: false, error: errorMessage }));
	}
	progress.value = 100;

	isSending.value = false;
	isDone.value = true;

	const successCount = results.value.filter((r) => r.success).length;
	const failCount = results.value.filter((r) => !r.success).length;

	if (failCount === 0) {
		toast(`${successCount} invitation${successCount !== 1 ? "s" : ""} sent successfully.`);
	} else {
		toast.warning(`${successCount} sent, ${failCount} failed. See details below.`);
	}
});
</script>

<template>
	<Dialog :open="isOpen" @update:open="onClose">
		<DialogContent class="max-h-[90vh] w-[calc(100vw-1rem)] overflow-y-auto sm:max-w-[520px]">
			<DialogHeader>
				<DialogTitle>Bulk Invite Members</DialogTitle>
				<DialogDescription> Invite multiple people to "{{ workspace.title }}" at once. Enter one email per line or separate with commas. </DialogDescription>
			</DialogHeader>

			<div v-if="!isDone" class="space-y-5 py-2">
				<form class="space-y-4" @submit="onSubmit">
					<FormField v-slot="{ componentField }" name="emails">
						<FormItem>
							<FormLabel>Email Addresses</FormLabel>
							<FormControl>
								<Textarea v-bind="componentField" placeholder="alice@example.com&#10;bob@example.com&#10;carol@example.com" class="min-h-[120px] resize-none font-mono text-sm" />
							</FormControl>
							<FormDescription>{{ parsedEmails.length }} email{{ parsedEmails.length !== 1 ? "s" : "" }} detected</FormDescription>
							<FormMessage />
						</FormItem>
					</FormField>

					<p class="text-muted-foreground text-xs">Maximum 10 email addresses per bulk invite request.</p>

					<div v-if="isSending" class="space-y-2">
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Sending invitations…</span>
							<span class="font-medium">{{ progress }}%</span>
						</div>
						<div class="bg-muted h-2 w-full overflow-hidden rounded-full">
							<div class="bg-primary h-full transition-all duration-300" :style="{ width: `${progress}%` }" />
						</div>
					</div>

					<DialogFooter class="flex-col gap-2 sm:flex-row sm:justify-end">
						<Button type="button" variant="outline" class="w-full sm:w-auto" :disabled="isSending" @click="onClose(false)">Cancel</Button>
						<Button type="submit" class="w-full sm:w-auto" :disabled="isSending || parsedEmails.length === 0" :loading="isSending" loading-label="Sending…">
							Send {{ parsedEmails.length > 0 ? `${parsedEmails.length} ` : "" }}Invitation{{ parsedEmails.length !== 1 ? "s" : "" }}
						</Button>
					</DialogFooter>
				</form>
			</div>

			<div v-else class="space-y-4 py-2">
				<div class="flex items-center gap-3">
					<div class="flex gap-4 text-sm">
						<span class="font-medium text-green-600">
							<Icon name="hugeicons:checkmark-circle-01" :size="14" class="mr-1 inline" />
							{{ results.filter((r) => r.success).length }} sent
						</span>
						<span v-if="results.some((r) => !r.success)" class="text-destructive font-medium">
							<Icon name="hugeicons:alert-circle" :size="14" class="mr-1 inline" />
							{{ results.filter((r) => !r.success).length }} failed
						</span>
					</div>
				</div>

				<div class="border-border max-h-[50vh] divide-y overflow-y-auto rounded-md border text-sm">
					<div v-for="result in results" :key="result.email" class="flex items-start justify-between gap-3 px-3 py-2">
						<span class="text-text-primary truncate font-mono">{{ result.email }}</span>
						<span v-if="result.success" class="shrink-0 font-medium text-green-600">Sent</span>
						<span v-else class="text-destructive shrink-0 text-right">{{ result.error || "Failed" }}</span>
					</div>
				</div>

				<DialogFooter class="flex-col gap-2 sm:flex-row sm:justify-end">
					<Button variant="outline" class="w-full sm:w-auto" @click="reset">Send More</Button>
					<Button class="w-full sm:w-auto" @click="onClose(false)">Done</Button>
				</DialogFooter>
			</div>
		</DialogContent>
	</Dialog>
</template>
