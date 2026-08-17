<template>
	<footer class="ledger-footer">
		<div class="ledger-container">
			<div class="flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<AppBrandMark show-name size="sm" />
					<p class="text-text-secondary mt-3 max-w-xs text-sm leading-6">A task workspace that keeps the record with the work.</p>
				</div>

				<nav class="flex flex-wrap gap-x-8 gap-y-2.5" aria-label="Footer navigation">
					<NuxtLink to="/login" class="ledger-link">Sign in</NuxtLink>
					<NuxtLink to="/signup" class="ledger-link">Create an account</NuxtLink>
				</nav>
			</div>

			<div class="border-t py-5" :style="{ borderColor: 'var(--rule)' }">
				<div class="ledger-meta flex flex-wrap items-center justify-between gap-3">
					<span>© {{ new Date().getFullYear() }} Taskgid</span>
					<span>Task, get it done.</span>
				</div>
			</div>
		</div>
	</footer>
</template>

<style scoped>
.ledger-footer {
	border-top: 1px solid var(--rule);
}
</style>
