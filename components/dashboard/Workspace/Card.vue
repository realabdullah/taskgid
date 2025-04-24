<script lang="ts" setup>
import type { Workspace } from "~/types";

defineProps<{
	workspace: Workspace;
}>();

const emits = defineEmits<{
	(event: "update-workspace" | "delete-workspace", workspace: Workspace): void;
}>();
</script>

<template>
	<Card class="overflow-hidden pb-0">
		<CardHeader class="pb-3">
			<div class="flex items-center justify-between">
				<CardTitle>{{ workspace.title }}</CardTitle>
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button variant="ghost" size="icon" class="h-8 w-8">
							<Icon name="hugeicons:more-horizontal-circle-01" :size="16" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>View Details</DropdownMenuItem>
						<DropdownMenuItem v-if="workspace.userRole === 'creator'" @select="emits('update-workspace', workspace)">Edit Workspace</DropdownMenuItem>
						<DropdownMenuItem v-if="workspace.userRole === 'creator'">Invite Members</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem v-if="workspace.userRole === 'creator'" class="text-destructive" @select="emits('delete-workspace', workspace)">Delete Workspace</DropdownMenuItem>
						<DropdownMenuItem v-else class="text-destructive">Leave Workspace</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<CardDescription>{{ workspace.description }}</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Icon name="hugeicons:user-multiple-02" :size="16" class="text-muted-foreground" />
					<span class="text-sm">{{ workspace.memberCount }} member{{ workspace.memberCount > 1 ? "s" : "" }}</span>
				</div>
				<Badge variant="outline" class="flex items-center gap-1 capitalize">
					<Icon v-if="workspace.userRole === 'creator'" name="hugeicons:crown" :size="12" />
					{{ workspace.userRole }}
				</Badge>
			</div>
		</CardContent>
		<CardFooter class="bg-muted/50 border-t px-6 py-3">
			<div class="text-muted-foreground flex w-full items-center justify-between text-xs">
				<span></span>
				<Button variant="ghost" size="sm" class="h-7 gap-1 text-xs"> Open </Button>
			</div>
		</CardFooter>
	</Card>
</template>
