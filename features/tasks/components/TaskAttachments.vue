<script lang="ts" setup>
import { useTaskAttachments } from "../composables/useTaskAttachments";
import AttachmentDropzone from "./AttachmentDropzone.vue";
import AttachmentList from "./AttachmentList.vue";

const props = defineProps<{ workspaceSlug: string; taskId: string }>();

const { attachments, isError, isLoading, refetch, rejectionReason, remove, upload } = useTaskAttachments(
	() => props.workspaceSlug,
	() => props.taskId
);
</script>

<template>
	<section class="space-y-3">
		<h3 class="text-text-primary text-sm font-bold">
			Attachments
			<span v-if="attachments.length" class="text-text-tertiary ms-1 font-mono text-xs tabular-nums">{{ attachments.length }}</span>
		</h3>

		<div v-if="isLoading" class="space-y-2"><Skeleton class="h-10 w-full" /></div>

		<AppEmptyState
			v-else-if="isError"
			heading="Unable to load attachments"
			body="Check your connection and try again."
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
		/>

		<template v-else>
			<AttachmentList :attachments="attachments" can-remove @remove="(attachment) => remove.mutate(attachment.id)" />
			<AttachmentDropzone :is-uploading="upload.isPending.value" :validate="rejectionReason" @select="(file) => upload.mutate(file)" />
		</template>
	</section>
</template>
