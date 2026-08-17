<script setup lang="ts">
import type { Attachment } from "~/types";

defineProps<{ attachments: Attachment[]; canRemove: boolean }>();
defineEmits<{ remove: [attachment: Attachment] }>();

const lightbox = ref<Attachment | null>(null);
const isImage = (attachment: Attachment) => attachment.mimetype?.startsWith("image/");
</script>

<template>
	<div v-if="attachments.length" class="space-y-3">
		<div v-if="attachments.some(isImage)" class="grid grid-cols-2 gap-2 sm:grid-cols-3">
			<template v-for="attachment in attachments" :key="attachment.id">
				<Pressable v-if="isImage(attachment)" class="border-border bg-surface-0 group relative aspect-square overflow-hidden rounded-lg border" @click="lightbox = attachment">
					<NuxtImg :src="attachment.url" :alt="attachment.filename" class="size-full object-cover" loading="lazy" />
					<Button
						v-if="canRemove"
						type="button"
						variant="secondary"
						size="icon"
						static
						class="absolute end-1 top-1 size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
						@click.stop="$emit('remove', attachment)"
					>
						<Icon name="lucide:x" :size="12" /><span class="sr-only">Remove {{ attachment.filename }}</span>
					</Button>
				</Pressable>
			</template>
		</div>

		<ul class="divide-border divide-y">
			<template v-for="attachment in attachments" :key="attachment.id">
				<li v-if="!isImage(attachment)" class="flex items-center gap-3 py-2">
					<Icon name="lucide:file" :size="16" class="text-text-tertiary shrink-0" />
					<a :href="attachment.url" target="_blank" rel="noopener noreferrer" class="min-w-0 flex-1 truncate text-sm font-medium hover:underline">{{ attachment.filename }}</a>
					<span class="text-text-tertiary shrink-0 font-mono text-xs tabular-nums">{{ formatFileSize(attachment.size) }}</span>
					<span class="text-text-tertiary shrink-0 text-xs max-sm:hidden">{{ attachment.user?.firstName || attachment.user?.username }}</span>
					<Button v-if="canRemove" type="button" variant="ghost" size="icon" class="shrink-0" @click="$emit('remove', attachment)">
						<Icon name="lucide:trash-2" :size="14" /><span class="sr-only">Remove {{ attachment.filename }}</span>
					</Button>
				</li>
			</template>
		</ul>

		<Dialog :open="Boolean(lightbox)" @update:open="(open: boolean) => !open && (lightbox = null)">
			<DialogContent class="max-w-3xl">
				<DialogHeader>
					<DialogTitle class="truncate">{{ lightbox?.filename }}</DialogTitle>
					<DialogDescription>{{ lightbox ? formatFileSize(lightbox.size) : "" }}</DialogDescription>
				</DialogHeader>
				<NuxtImg v-if="lightbox" :src="lightbox.url" :alt="lightbox.filename" class="max-h-[70vh] w-full rounded-lg object-contain" />
			</DialogContent>
		</Dialog>
	</div>
</template>
