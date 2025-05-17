<script lang="ts" setup>
import getCaretCoordinates from "textarea-caret";

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
</script>

<template>
	<div ref="wrapper" class="relative">
		<textarea
			ref="textarea"
			v-model="comment"
			class="border-input bg-background ring-offset-background placeholder:text-muted-foreground min-h-[100px] w-full rounded-md border px-3 pt-4 pb-10 text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			placeholder="Write a comment... (use @ to mention)"
			@input="onInput"
			@keydown="onKeydown"
		></textarea>

		<transition name="fade">
			<div v-if="showList" :style="popupStyle" class="mention-popup absolute z-10 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
				<div class="border-b border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">Mentioning users</div>
				<ul class="max-h-48 overflow-y-auto">
					<li
						v-for="(user, idx) in filteredTeams"
						:key="user.id"
						:class="['mention-item flex cursor-pointer items-center px-3 py-2 transition-colors duration-150', idx === index ? 'bg-gray-50' : 'hover:bg-gray-50']"
						@mousedown.prevent="select(idx)"
					>
						<Avatar class="mr-2 h-6 w-6">
							<AvatarImage :src="user.profilePicture" :alt="user.firstName" />
							<AvatarFallback>{{ getInitials(user.firstName, user.lastName) }}</AvatarFallback>
						</Avatar>
						<div>
							<div class="text-sm font-medium">{{ user.firstName }} {{ user.lastName }}</div>
							<div class="text-xs text-gray-500">@{{ user.username }}</div>
						</div>
					</li>
					<li v-if="filteredTeams?.length === 0" class="px-3 py-2 text-sm text-gray-500 italic">No users found</li>
				</ul>
			</div>
		</transition>
	</div>
</template>

<style scoped>
.mention-popup {
	width: 240px;
	transform-origin: top left;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.mention-item {
	border-bottom: 1px solid rgba(0, 0, 0, 0.03);
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
