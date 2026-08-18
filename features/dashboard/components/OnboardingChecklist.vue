<script lang="ts" setup>
import { useOnboarding } from "../composables/useOnboarding";

const { completedCount, dismiss, isVisible, nextStep, steps, totalSteps } = useOnboarding();
</script>

<template>
	<section v-if="isVisible" class="product-panel overflow-hidden" aria-labelledby="onboarding-heading">
		<header class="border-border flex items-start justify-between gap-4 border-b px-5 py-4">
			<div>
				<h2 id="onboarding-heading" class="text-sm font-bold">Get set up</h2>
				<p class="text-text-secondary mt-1 text-sm">
					<template v-if="nextStep">Next: {{ nextStep.label.toLowerCase() }}.</template>
					<template v-else>You are all set.</template>
				</p>
			</div>
			<div class="flex shrink-0 items-center gap-3">
				<span class="text-text-tertiary font-mono text-xs tabular-nums">{{ completedCount }}/{{ totalSteps }}</span>
				<Button variant="ghost" size="icon" aria-label="Dismiss the setup checklist" @click="dismiss"><Icon name="lucide:x" :size="15" /></Button>
			</div>
		</header>

		<ol class="divide-border divide-y">
			<li v-for="step in steps" :key="step.id" class="flex items-center gap-4 px-5 py-4">
				<Icon :name="step.done ? 'lucide:check-circle-2' : 'lucide:circle'" :size="18" class="shrink-0" :class="step.done ? 'text-success' : 'text-text-tertiary'" aria-hidden="true" />
				<div class="min-w-0 flex-1">
					<p class="text-sm font-medium" :class="step.done ? 'text-text-tertiary line-through' : 'text-text-primary'">{{ step.label }}</p>
					<p class="text-text-secondary mt-0.5 text-xs">{{ step.description }}</p>
				</div>
				<Button v-if="!step.done" variant="secondary" size="sm" class="shrink-0" @click="step.run()">{{ step.action }}</Button>
				<span v-else class="sr-only">Completed</span>
			</li>
		</ol>
	</section>
</template>
