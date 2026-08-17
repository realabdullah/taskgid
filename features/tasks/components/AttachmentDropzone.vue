<script setup lang="ts">
const props = defineProps<{ isUploading: boolean; validate: (file: File) => string }>();
const emit = defineEmits<{ select: [file: File] }>();

const input = ref<HTMLInputElement>();
const isDragging = ref(false);
const rejection = ref("");

const accept = (files: FileList | null) => {
	const file = files?.[0];
	if (!file) return;
	const reason = props.validate(file);
	rejection.value = reason;
	if (!reason) emit("select", file);
};

const onDrop = (event: DragEvent) => {
	isDragging.value = false;
	accept(event.dataTransfer?.files ?? null);
};

const onChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	accept(target.files);
	// Clearing lets the same file be picked twice in a row.
	target.value = "";
};
</script>

<template>
	<div class="space-y-2">
		<div
			class="border-border rounded-lg border border-dashed p-4 text-center transition-colors"
			:class="isDragging ? 'border-primary bg-primary/5' : ''"
			@dragover.prevent="isDragging = true"
			@dragleave.prevent="isDragging = false"
			@drop.prevent="onDrop"
		>
			<input ref="input" type="file" class="sr-only" @change="onChange" />
			<Icon name="lucide:paperclip" :size="18" class="text-text-tertiary mx-auto" />
			<p class="text-text-secondary mt-2 text-sm">
				Drop a file here, or
				<Button type="button" variant="link" static class="h-auto p-0 align-baseline" :disabled="isUploading" @click="input?.click()">browse</Button>
			</p>
			<p class="text-text-tertiary mt-1 text-xs">Images, PDFs and documents up to 5 MB.</p>
			<p v-if="isUploading" class="text-text-secondary mt-2 text-xs">Uploading…</p>
		</div>
		<p v-if="rejection" class="text-danger text-xs" role="alert">{{ rejection }}</p>
	</div>
</template>
