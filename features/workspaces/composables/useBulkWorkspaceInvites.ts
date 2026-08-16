import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import { BulkInviteSchema } from "~/utils/validations";

type InviteResult = { email: string; success: boolean; error?: string };
type BulkInviteResponse = {
	results: Array<{ email: string; status: "success" | "failed"; message?: string; error?: string }>;
};

const parseEmails = (raw: string) =>
	raw
		.split(/[\n,]+/)
		.map((email) => email.trim())
		.filter(Boolean);

export const useBulkWorkspaceInvites = (workspaceId: MaybeRefOrGetter<string>) => {
	const { handleSubmit, resetForm, values } = useForm({
		validationSchema: toTypedSchema(BulkInviteSchema),
		initialValues: { emails: "" },
	});
	const results = ref<InviteResult[]>([]);
	const isSending = ref(false);
	const isDone = ref(false);
	const parsedEmails = computed(() => parseEmails(values.emails ?? ""));
	const progress = computed(() => (isSending.value ? 50 : isDone.value ? 100 : 0));

	const reset = () => {
		results.value = [];
		isDone.value = false;
		resetForm();
	};

	const submit = handleSubmit(async ({ emails: rawEmails }) => {
		const emails = parseEmails(rawEmails);
		if (emails.length > 10) {
			toast.error("You can send up to 10 invitations at a time.");
			return;
		}

		isSending.value = true;
		results.value = [];
		try {
			const response = await useApiFetch<BulkInviteResponse>(API_ENDPOINTS.invites.bulk, {
				method: "POST",
				body: { emails, workspaceId: toValue(workspaceId) },
			});
			if (!Array.isArray(response?.results)) throw new Error("Unable to read the invitation results. Try again.");
			results.value = response.results.map((result) => ({
				email: result.email,
				success: result.status === "success",
				error: result.status === "failed" ? result.error || result.message || "Failed" : undefined,
			}));
		} catch (error) {
			const message = getServerError(error);
			results.value = emails.map((email) => ({ email, success: false, error: message }));
		} finally {
			isSending.value = false;
			isDone.value = true;
		}

		const sent = results.value.filter((result) => result.success).length;
		const failed = results.value.length - sent;
		if (failed === 0) toast.success(`${sent} invitation${sent === 1 ? "" : "s"} sent.`);
		else toast.warning(`${sent} sent; ${failed} failed. Review the details below.`);
	});

	return { results, isSending, isDone, parsedEmails, progress, reset, submit };
};
