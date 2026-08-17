<script lang="ts" setup>
import { TagChip } from "~/features/tags";
import { useMyWork } from "../composables/useMyWork";

const { buckets, completedCount, error, hasWorkspaces, includeDone, isError, isLoading, openCount, refetch } = useMyWork();

const openTask = (workspaceSlug: string, taskId: string) => navigateTo(`/app/workspaces/${workspaceSlug}/tasks?taskId=${taskId}`);
const triggerCreateWorkspace = () => globalThis.window.dispatchEvent(new globalThis.CustomEvent("taskgid:add-workspace-intent"));
</script>

<template>
	<div class="product-page">
		<header class="product-header">
			<div>
				<p class="product-eyebrow">My work</p>
				<h1 class="product-title">Everything on you, in one queue.</h1>
				<p class="product-description">Tasks assigned to you across every workspace, ordered by when they are due.</p>
			</div>
			<div class="flex items-center gap-3">
				<label class="text-text-secondary flex cursor-pointer items-center gap-2 text-sm">
					<Switch :model-value="includeDone" @update:model-value="includeDone = $event" />
					Show completed
				</label>
			</div>
		</header>

		<AppEmptyState
			v-if="!hasWorkspaces"
			heading="Create a workspace first"
			body="Your queue fills up once you belong to a workspace with tasks assigned to you."
			icon="lucide:folder-plus"
			:action="{ label: 'Create workspace', onClick: triggerCreateWorkspace }"
		/>

		<div v-else-if="isLoading" class="space-y-3"><Skeleton v-for="index in 6" :key="index" class="h-16 w-full" /></div>

		<AppEmptyState
			v-else-if="isError"
			heading="Unable to load your tasks"
			:body="String(error || 'Check your connection and try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
		/>

		<template v-else-if="buckets.length">
			<p class="text-text-tertiary text-xs tabular-nums">{{ openCount }} open · {{ completedCount }} completed</p>

			<section v-for="bucket in buckets" :key="bucket.id" class="product-panel overflow-hidden">
				<header class="border-border flex items-baseline justify-between gap-3 border-b px-4 py-3">
					<div>
						<h2 class="text-sm font-bold" :class="bucket.id === 'overdue' ? 'text-danger' : 'text-text-primary'">{{ bucket.label }}</h2>
						<p class="text-text-tertiary mt-0.5 text-xs">{{ bucket.description }}</p>
					</div>
					<span class="text-text-tertiary font-mono text-xs tabular-nums">{{ bucket.tasks.length }}</span>
				</header>

				<Pressable
					v-for="task in bucket.tasks"
					:key="task.id"
					class="product-row grid w-full grid-cols-[minmax(0,1fr)_140px_110px_120px] items-center gap-4 text-start max-md:grid-cols-[minmax(0,1fr)_auto]"
					@click="openTask(task.workspaceSlug, task.id)"
				>
					<div class="min-w-0">
						<p class="truncate text-sm font-medium">{{ task.title }}</p>
						<div class="mt-1 flex min-w-0 items-center gap-2">
							<p class="text-text-tertiary truncate text-xs">{{ task.workspaceTitle }}</p>
							<TagChip v-for="tag in (task.tags ?? []).slice(0, 2)" :key="tag.id" :tag="tag" />
						</div>
					</div>
					<BadgeStatus class="max-md:row-start-1" :status="task.status" />
					<BadgePriority class="max-md:hidden" :priority="task.priority" />
					<span class="text-sm max-md:hidden" :class="bucket.id === 'overdue' ? 'text-danger font-medium' : 'text-text-secondary'">
						{{ task.dueDate ? formatDate(task.dueDate, "MMM D") : "No date" }}
					</span>
				</Pressable>
			</section>
		</template>

		<AppEmptyState v-else heading="Nothing assigned to you" body="When a teammate assigns you a task, it lands here." icon="lucide:check-square" />
	</div>
</template>
