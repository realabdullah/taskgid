<script lang="ts" setup>
import type { Workspace } from "~/types";

const props = defineProps<{ workspace: Workspace }>();
defineEmits<(event: "edit", value: Workspace) => void>();

const isOpen = defineModel<boolean>();

const data = computed(() => [
	{ title: "Slug", value: props.workspace.slug },
	{ title: "Created", value: formatDate(props.workspace.createdAt, "Do MMM, YYYY"), icon: "hugeicons:calendar-03" },
	{ title: "Members", value: `${props.workspace.memberCount} member${props.workspace.memberCount > 1 ? "s" : ""}`, icon: "hugeicons:user-multiple-02" },
	{ title: "Your Role", value: props.workspace.userRole || "Member", icon: props.workspace.userRole === "creator" ? "hugeicons:crown" : undefined },
]);
</script>

<template>
	<Dialog :open="isOpen" @update:open="isOpen = $event">
		<DialogContent class="sm:max-w-[500px]">
			<DialogHeader>
				<DialogTitle class="text-xl">Workspace Details</DialogTitle>
				<DialogDescription>Detailed information about this workspace.</DialogDescription>
			</DialogHeader>

			<div class="space-y-6 py-4">
				<div class="space-y-2">
					<h3 class="text-lg font-semibold">{{ workspace.title }}</h3>
					<p class="text-muted-foreground text-sm">{{ workspace.description }}</p>
				</div>

				<Separator />

				<div class="grid grid-cols-2 gap-4">
					<div v-for="(item, index) in data" :key="index" class="space-y-1">
						<p class="text-muted-foreground text-sm font-medium">{{ item.title }}</p>
						<Badge v-if="item.title === 'Your Role'" variant="outline" class="flex w-fit items-center gap-1">
							<Icon v-if="item.icon" :name="item.icon" :size="12" />
							{{ item.value }}
						</Badge>
						<div v-else class="flex items-center gap-2">
							<Icon v-if="item.icon" :name="item.icon" :size="16" class="text-muted-foreground" />
							<p class="text-sm" :class="{ 'font-mono': item.title === 'Slug' }">{{ item.value }}</p>
						</div>
					</div>
				</div>

				<Separator />

				<div class="space-y-2">
					<p class="text-muted-foreground text-sm font-medium">Created by</p>
					<div class="flex items-center gap-3">
						<Avatar class="h-10 w-10 border">
							<AvatarImage :src="workspace.user.profilePicture" />
							<AvatarFallback>
								{{
									workspace.owner
										.split(" ")
										.map((n) => n[0])
										.join("")
								}}
							</AvatarFallback>
						</Avatar>
						<div>
							<p class="font-medium">{{ workspace.owner }}</p>
							<p class="text-muted-foreground text-sm">{{ workspace.user.email }}</p>
						</div>
					</div>
				</div>
			</div>

			<DialogFooter class="flex items-center justify-between sm:justify-between">
				<Button variant="outline" @click="isOpen = false">Close</Button>
				<Button v-if="workspace.userRole === 'creator'" class="bg-black text-white hover:bg-black/90" @click="$emit('edit', workspace)">Edit Workspace</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
