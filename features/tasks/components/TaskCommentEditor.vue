<script lang="ts" setup>
import { EMOJI_GROUPS } from "../emoji";
import { MAX_COMMENT_LENGTH, useTaskCommentComposer } from "../composables/useTaskCommentComposer";
import TaskMentionTextarea from "./TaskMentionTextarea.vue";

const props = withDefaults(defineProps<{ workspaceSlug: string; taskId: string; parentId?: string; placeholder?: string; autofocus?: boolean }>(), {
	parentId: undefined,
	placeholder: "Write a comment. Use @ to mention someone.",
	autofocus: false,
});
const emit = defineEmits<{ sent: [] }>();

const { canSubmit, draft, isTooLong, remaining, submit } = useTaskCommentComposer(
	() => props.workspaceSlug,
	() => props.taskId,
	() => props.parentId
);

const editor = ref<InstanceType<typeof TaskMentionTextarea>>();
const isEmojiOpen = ref(false);

const addEmoji = (emoji: string) => {
	editor.value?.insertAtCaret(emoji);
	isEmojiOpen.value = false;
};

const sendComment = () => {
	if (!canSubmit.value) return;
	submit.mutate(draft.value.trim(), { onSuccess: () => emit("sent") });
};

// The counter is noise until the limit is close enough to matter.
const showCounter = computed(() => remaining.value <= 200);

onMounted(() => {
	if (props.autofocus) editor.value?.focus();
});
</script>

<template>
	<div class="space-y-2">
		<TaskMentionTextarea ref="editor" v-model="draft" :placeholder="props.placeholder" @submit="sendComment" />

		<div class="flex flex-wrap items-center gap-2">
			<Popover v-model:open="isEmojiOpen">
				<PopoverTrigger as-child>
					<Button type="button" variant="ghost" size="icon" class="size-8" aria-label="Add an emoji"><Icon name="lucide:smile" :size="16" /></Button>
				</PopoverTrigger>
				<PopoverContent align="start" :side-offset="8" class="w-[min(20rem,calc(100vw-2rem))] p-2">
					<div v-for="group in EMOJI_GROUPS" :key="group.label" class="mb-2 last:mb-0">
						<p class="text-text-tertiary px-1 pb-1 text-xs font-semibold">{{ group.label }}</p>
						<div class="grid grid-cols-8 gap-0.5">
							<Pressable
								v-for="emoji in group.emoji"
								:key="`${group.label}-${emoji}`"
								static
								class="hover:bg-surface-1 flex size-8 items-center justify-center rounded-md text-lg leading-none"
								:aria-label="`Insert ${emoji}`"
								@click="addEmoji(emoji)"
								>{{ emoji }}</Pressable
							>
						</div>
					</div>
				</PopoverContent>
			</Popover>

			<p class="text-text-tertiary text-xs"><kbd class="font-mono">⌘</kbd><span aria-hidden="true">/</span><kbd class="font-mono">Ctrl</kbd> + <kbd class="font-mono">Enter</kbd> to send</p>

			<span v-if="showCounter" class="font-mono text-xs tabular-nums" :class="isTooLong ? 'text-danger' : 'text-text-tertiary'" role="status">
				{{ remaining }}
			</span>

			<Button type="button" class="ms-auto" :disabled="!canSubmit" :loading="submit.isPending.value" loading-label="Sending" @click="sendComment">
				<Icon name="hugeicons:arrow-right-04" :size="16" /> Send
			</Button>
		</div>

		<p v-if="isTooLong" class="text-danger text-xs" role="alert">A comment can be at most {{ MAX_COMMENT_LENGTH.toLocaleString() }} characters.</p>
	</div>
</template>
