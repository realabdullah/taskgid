<script lang="ts" setup>
import type { BaseUser } from "~/types";

/*
 * Workspaces can carry 20–30+ members, so the picker is search-first rather than
 * a scrolling checkbox list: the trigger summarises the selection, the popover
 * searches, and the chosen people stay visible as removable chips underneath.
 */
const props = defineProps<{
	members: BaseUser[];
	/** Rendered when the workspace member list is still loading. */
	loading?: boolean;
}>();

const selected = defineModel<string[]>({ default: () => [] });

const isOpen = ref(false);

const byUsername = computed(() => new Map(props.members.map((member) => [member.username, member])));
const selectedMembers = computed(() => selected.value.map((username) => byUsername.value.get(username)).filter((member): member is BaseUser => Boolean(member)));

const toggle = (username: string) => {
	selected.value = selected.value.includes(username) ? selected.value.filter((value) => value !== username) : [...selected.value, username];
};

const clearAll = () => {
	selected.value = [];
};

const summary = computed(() => {
	if (!selected.value.length) return "Anyone can pick this up";
	if (selectedMembers.value.length === 1) return `${selectedMembers.value[0]?.firstName} ${selectedMembers.value[0]?.lastName}`;
	return `${selected.value.length} people assigned`;
});
</script>

<template>
	<div class="space-y-2">
		<Popover v-model:open="isOpen">
			<PopoverTrigger as-child>
				<Button
					type="button"
					variant="outline"
					role="combobox"
					:aria-expanded="isOpen"
					class="h-9 w-full !justify-start active:!scale-100"
					content-class="grid w-full grid-cols-[auto_minmax(0,1fr)_1rem] items-center gap-2"
				>
					<span v-if="selectedMembers.length" class="flex -space-x-1.5">
						<Avatar v-for="member in selectedMembers.slice(0, 3)" :key="member.id" class="ring-surface-0 h-5 w-5 ring-2">
							<AvatarImage :src="member.profilePicture || ''" />
							<AvatarFallback class="bg-accent-subtle text-accent-text text-[9px]">{{ getInitials(member.firstName, member.lastName) }}</AvatarFallback>
						</Avatar>
					</span>
					<Icon v-else name="lucide:user-plus" :size="15" class="text-text-tertiary" />
					<span class="min-w-0 truncate text-start text-sm font-normal" :class="selected.length ? 'text-text-primary' : 'text-text-tertiary'">{{ summary }}</span>
					<Icon name="lucide:chevron-down" :size="15" class="text-text-tertiary justify-self-end" />
				</Button>
			</PopoverTrigger>

			<PopoverContent align="start" :side-offset="6" class="w-[min(22rem,calc(100vw-2rem))] p-0">
				<Command class="border-0 shadow-none">
					<CommandInput placeholder="Search people…" />
					<CommandList class="max-h-64">
						<div v-if="props.loading" class="space-y-2 p-3">
							<Skeleton class="h-9 w-full" />
							<Skeleton class="h-9 w-full" />
							<Skeleton class="h-9 w-full" />
						</div>
						<template v-else>
							<CommandEmpty>No matching people.</CommandEmpty>
							<CommandGroup>
								<CommandItem
									v-for="member in props.members"
									:key="member.id"
									:value="`${member.firstName} ${member.lastName} ${member.username}`"
									class="h-11 gap-3"
									@select="toggle(member.username)"
								>
									<Checkbox :model-value="selected.includes(member.username)" tabindex="-1" class="pointer-events-none" />
									<Avatar class="h-6 w-6">
										<AvatarImage :src="member.profilePicture || ''" />
										<AvatarFallback class="bg-accent-subtle text-accent-text text-[10px]">{{ getInitials(member.firstName, member.lastName) }}</AvatarFallback>
									</Avatar>
									<span class="min-w-0 flex-1">
										<span class="text-text-primary block truncate text-sm font-medium">{{ member.firstName }} {{ member.lastName }}</span>
										<span class="text-text-tertiary block truncate text-xs">@{{ member.username }}</span>
									</span>
								</CommandItem>
							</CommandGroup>
							<p v-if="!props.members.length" class="text-text-tertiary px-3 py-6 text-center text-sm">No workspace members yet.</p>
						</template>
					</CommandList>
				</Command>

				<div class="border-border bg-surface-1 flex items-center justify-between gap-2 border-t px-3 py-2">
					<span class="text-text-tertiary text-xs tabular-nums">{{ selected.length }} selected</span>
					<Button type="button" variant="ghost" size="sm" :disabled="!selected.length" class="h-7 text-xs" @click="clearAll">Clear</Button>
				</div>
			</PopoverContent>
		</Popover>

		<div v-if="selectedMembers.length" class="flex flex-wrap gap-1.5">
			<span v-for="member in selectedMembers" :key="member.id" class="border-border bg-surface-1 inline-flex items-center gap-1.5 rounded-full border py-0.5 ps-0.5 pe-1">
				<Avatar class="h-5 w-5">
					<AvatarImage :src="member.profilePicture || ''" />
					<AvatarFallback class="bg-accent-subtle text-accent-text text-[9px]">{{ getInitials(member.firstName, member.lastName) }}</AvatarFallback>
				</Avatar>
				<span class="text-text-primary max-w-32 truncate text-xs font-medium">{{ member.firstName }} {{ member.lastName }}</span>
				<Pressable static class="text-text-tertiary hover:text-text-primary flex h-4 w-4 items-center justify-center rounded-full" @click="toggle(member.username)">
					<Icon name="lucide:x" :size="11" />
					<span class="sr-only">Remove {{ member.firstName }} {{ member.lastName }}</span>
				</Pressable>
			</span>
		</div>
	</div>
</template>
