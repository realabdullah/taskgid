<script lang="ts" setup>
const isOpen = useState<boolean>("keyboard-shortcuts-open", () => false);
const groups = computed(() => [...new Set(SHORTCUTS.map((shortcut) => shortcut.group))]);
</script>

<template>
	<Dialog v-model:open="isOpen">
		<DialogContent class="max-w-lg">
			<DialogHeader>
				<DialogTitle>Keyboard shortcuts</DialogTitle>
				<DialogDescription>Single-letter shortcuts are ignored while you are typing in a field.</DialogDescription>
			</DialogHeader>
			<div class="space-y-5">
				<section v-for="group in groups" :key="group">
					<h3 class="text-text-tertiary text-xs font-semibold uppercase">{{ group }}</h3>
					<dl class="divide-border mt-2 divide-y">
						<div v-for="shortcut in SHORTCUTS.filter((item) => item.group === group)" :key="shortcut.keys" class="flex items-center justify-between py-2">
							<dt class="text-text-secondary text-sm">{{ shortcut.label }}</dt>
							<dd>
								<kbd class="border-border bg-surface-1 rounded border px-2 py-1 font-mono text-xs">{{ shortcut.keys }}</kbd>
							</dd>
						</div>
					</dl>
				</section>
			</div>
		</DialogContent>
	</Dialog>
</template>
