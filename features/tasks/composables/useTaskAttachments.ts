import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Attachment } from "~/types";

/** Mirrors the server's multer config, so a doomed upload is rejected locally. */
export const ACCEPTED_UPLOAD_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"text/plain",
	"text/csv",
];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

type AttachmentListResponse = { success: boolean; attachments: Attachment[] };

/** Task attachments: list, upload and remove. */
export const useTaskAttachments = (workspaceSlug: MaybeRefOrGetter<string>, taskId: MaybeRefOrGetter<string>) => {
	const client = useQueryClient();
	const slug = computed(() => toValue(workspaceSlug));
	const task = computed(() => toValue(taskId));
	const key = computed(() => ["task-attachments", slug.value, task.value]);

	const query = useQuery({
		queryKey: key,
		queryFn: async () => {
			const response = await useApiFetch<AttachmentListResponse>(API_ENDPOINTS.attachments.forTask(slug.value, task.value));
			if (!response?.success) throw new Error("Unable to load attachments. Try again.");
			return response.attachments ?? [];
		},
		enabled: computed(() => Boolean(slug.value && task.value)),
	});

	const rejectionReason = (file: File) => {
		if (file.size > MAX_UPLOAD_BYTES) return `${file.name} is larger than ${formatFileSize(MAX_UPLOAD_BYTES)}.`;
		if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) return `${file.name} is not a supported file type.`;
		return "";
	};

	const upload = useMutation({
		mutationFn: async (file: File) => {
			const reason = rejectionReason(file);
			if (reason) throw new Error(reason);

			const body = new FormData();
			body.append("file", file);
			const response = await useApiFetch<{ success: boolean; attachment?: Attachment; error?: string }>(API_ENDPOINTS.attachments.forTask(slug.value, task.value), {
				method: "POST",
				body,
			});
			if (!response?.success) throw new Error(response?.error || "Unable to upload the file. Try again.");
			return response.attachment;
		},
		onSuccess: async () => {
			await client.invalidateQueries({ queryKey: key.value });
			toast.success("File attached.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	const remove = useMutation({
		mutationFn: async (attachmentId: string) => {
			const response = await useApiFetch<{ success: boolean; error?: string }>(API_ENDPOINTS.attachments.byId(attachmentId), { method: "DELETE" });
			if (!response?.success) throw new Error(response?.error || "Unable to remove the attachment. Try again.");
			return attachmentId;
		},
		onMutate: async (attachmentId) => {
			await client.cancelQueries({ queryKey: key.value });
			const previous = client.getQueryData<Attachment[]>(key.value) ?? [];
			client.setQueryData<Attachment[]>(
				key.value,
				previous.filter((item) => item.id !== attachmentId)
			);
			return { previous };
		},
		onError: (error, _id, context) => {
			if (context?.previous) client.setQueryData(key.value, context.previous);
			toast.error(getServerError(error));
		},
		onSettled: () => client.invalidateQueries({ queryKey: key.value }),
	});

	return {
		attachments: computed(() => query.data.value ?? []),
		error: query.error,
		isError: query.isError,
		isLoading: query.isPending,
		refetch: query.refetch,
		rejectionReason,
		remove,
		upload,
	};
};
