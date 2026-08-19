<script lang="ts" setup>
import getCaretCoordinates from "textarea-caret";
import { useWorkspaceStore } from "~/features/workspaces/stores";

const props = withDefaults(defineProps<{ placeholder?: string }>(), { placeholder: "Write a comment. Use @ to mention someone." });
const emit = defineEmits<{ submit: [] }>();

const { teams } = storeToRefs(useWorkspaceStore());
const comment = defineModel<string>({ required: true });

const wrapper = ref<HTMLDivElement>();
const textarea = ref<HTMLTextAreaElement>();
const showList = ref(false);
const popupStyle = ref<Record<string, string>>({});
const queryText = ref("");
const index = ref(0);

const filteredTeams = computed(() => {
	return teams.value?.filter((team) => team.username.toLowerCase().includes(queryText.value.toLowerCase()));
});

const onInput = () => {
	const pos = textarea.value!.selectionStart;
	const text = comment.value.slice(0, pos);
	const match = /(?:\s|^)@(\w*)$/.exec(text);
	if (match) {
		queryText.value = match[1];
		showList.value = true;
		positionPopup();
	} else {
		showList.value = false;
	}
};

const positionPopup = () => {
	nextTick(() => {
		const coords = getCaretCoordinates(textarea.value!, textarea.value!.selectionStart);
		popupStyle.value = { top: `${coords.top + 20}px`, left: `${coords.left}px` };
	});
};

const onKeydown = (e: KeyboardEvent) => {
	// Plain Enter is a newline in a comment, so sending needs a modifier. The
	// mention list claims Enter first, to pick the highlighted name.
	if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !showList.value) {
		e.preventDefault();
		emit("submit");
		return;
	}
	if (!showList.value) return;
	if (e.key === "ArrowDown") {
		e.preventDefault();
		const teamsLength = filteredTeams.value?.length || 0;
		index.value = Math.min(index.value + 1, teamsLength - 1);
	} else if (e.key === "ArrowUp") {
		e.preventDefault();
		index.value = Math.max(index.value - 1, 0);
	} else if (e.key === "Enter") {
		e.preventDefault();
		select(index.value);
	} else if (e.key === "Escape") {
		showList.value = false;
	}
};

const select = (i: number) => {
	const user = filteredTeams.value?.[i];
	if (!user) return;
	const ta = textarea.value!;
	const pos = ta.selectionStart;
	const text = comment.value;

	const before = text.slice(0, pos).replace(/@\w*$/, `@${user.username} `);
	const after = text.slice(pos);
	const newText = before + after;
	comment.value = newText;
	showList.value = false;
	nextTick(() => ta.focus());
};

/** Lets the composer drop an emoji where the caret is instead of at the end. */
const insertAtCaret = (text: string) => {
	const ta = textarea.value;
	if (!ta) {
		comment.value += text;
		return;
	}
	const start = ta.selectionStart;
	const end = ta.selectionEnd;
	comment.value = comment.value.slice(0, start) + text + comment.value.slice(end);
	nextTick(() => {
		ta.focus();
		ta.setSelectionRange(start + text.length, start + text.length);
	});
};

const focus = () => textarea.value?.focus();

defineExpose({ focus, insertAtCaret });
</script>

<template>
	<div ref="wrapper" class="relative">
		<textarea
			ref="textarea"
			v-model="comment"
			class="border-input bg-background ring-offset-background placeholder:text-muted-foreground text-md min-h-[100px] w-full rounded-md border px-3 pt-4 pb-10 transition-[border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
			:placeholder="props.placeholder"
			@input="onInput"
			@keydown="onKeydown"
		></textarea>

		<transition name="fade">
			<div v-if="showList" :style="popupStyle" class="mention-popup border-border bg-surface-0 absolute z-10 overflow-hidden rounded-lg border shadow-lg">
				<div class="border-border bg-surface-1 text-text-tertiary border-b px-3 py-2 text-xs">Mentioning users</div>
				<ul class="max-h-48 overflow-y-auto">
					<li
						v-for="(user, idx) in filteredTeams"
						:key="user.id"
						:class="['mention-item flex cursor-pointer items-center px-3 py-2 transition-colors duration-150', idx === index ? 'bg-surface-1' : 'hover:bg-surface-1']"
						@mousedown.prevent="select(idx)"
					>
						<Avatar class="me-2 h-6 w-6">
							<AvatarImage :src="user.profilePicture" :alt="user.firstName" />
							<AvatarFallback>{{ getInitials(user.firstName, user.lastName) }}</AvatarFallback>
						</Avatar>
						<div>
							<div class="text-sm font-medium">{{ user.firstName }} {{ user.lastName }}</div>
							<div class="text-text-tertiary text-xs">@{{ user.username }}</div>
						</div>
					</li>
					<li v-if="filteredTeams?.length === 0" class="text-text-tertiary px-3 py-2 text-sm italic">No users found</li>
				</ul>
			</div>
		</transition>
	</div>
</template>

<style scoped>
.mention-popup {
	width: 240px;
	transform-origin: top left;
	box-shadow: var(--shadow-sm);
}

.mention-item {
	border-bottom: 1px solid var(--color-border);
}

.mention-item:last-child {
	border-bottom: none;
}

.fade-enter-active,
.fade-leave-active {
	transition:
		opacity 0.2s ease,
		transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: scale(0.95);
}
</style>
