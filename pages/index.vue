<script lang="ts" setup>
definePageMeta({ layout: "marketing", name: "home" });

useHead({
	title: "Taskgid — Task, get it done.",
	meta: [
		{
			name: "description",
			content: "Taskgid gives product teams one focused place to decide, assign, and complete the tasks that matter.",
		},
	],
});
</script>

<template>
	<div class="overflow-hidden">
		<header class="border-border mx-auto flex h-18 max-w-[1440px] items-center justify-between border-b px-5 sm:px-8 lg:px-12">
			<NuxtLink to="/" class="font-mono text-sm font-bold tracking-[0.12em] uppercase">Taskgid</NuxtLink>
			<div class="flex items-center gap-3">
				<NuxtLink to="/login" class="text-text-secondary hover:text-text-primary hidden text-sm font-semibold sm:block">Sign in</NuxtLink>
				<Button as-child class="h-10 px-4"
					><NuxtLink to="/signup" class="inline-flex items-center gap-2">Start free <Icon name="lucide:arrow-up-right" :size="15" class="shrink-0" /></NuxtLink
				></Button>
			</div>
		</header>

		<main>
			<section
				class="relative mx-auto grid max-w-[1440px] overflow-hidden px-5 pt-16 pb-20 sm:px-8 sm:pt-24 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.8fr)] lg:gap-16 lg:px-12 lg:pt-30 lg:pb-28"
			>
				<svg
					aria-hidden="true"
					class="text-primary pointer-events-none absolute top-1/2 left-[-13%] h-[142%] w-[92%] -translate-y-1/2 opacity-[0.045] dark:opacity-[0.08]"
					viewBox="0 0 960 780"
					fill="none"
				>
					<path
						d="M-40 142H193L287 236H492L598 130H1010M-80 326H121L243 204H430L566 340H1006M-20 532H186L310 408H512L643 539H992M164 0v780M448 0v780M736 0v780"
						stroke="currentColor"
						stroke-width="2"
					/>
					<circle cx="287" cy="236" r="8" fill="currentColor" />
					<circle cx="566" cy="340" r="8" fill="currentColor" />
					<circle cx="643" cy="539" r="8" fill="currentColor" />
				</svg>

				<div class="relative z-10 max-w-2xl">
					<p class="text-primary font-mono text-[11px] font-bold tracking-[0.16em] uppercase">Task, get it done.</p>
					<h1 class="mt-5 text-5xl leading-[0.92] font-extrabold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
						The shortest path from <span class="text-primary">task</span> to done.
					</h1>
					<p class="text-text-secondary mt-7 max-w-xl text-lg leading-8">
						Taskgid makes priorities, ownership, and progress unmistakable—so your team spends less time coordinating and more time completing.
					</p>
					<div class="mt-9 flex flex-col gap-3 sm:flex-row">
						<Button as-child size="lg" class="h-12 px-5"
							><NuxtLink to="/signup" class="inline-flex items-center gap-2">Start free <Icon name="lucide:arrow-right" :size="16" class="shrink-0" /></NuxtLink
						></Button>
					</div>
				</div>

				<div class="relative z-10 mt-14 lg:mt-0 lg:self-center">
					<div
						class="border-border bg-rail relative min-h-[420px] overflow-hidden border shadow-[10px_10px_0_var(--color-primary)] sm:min-h-[470px]"
						role="img"
						aria-label="Tasks moving through Taskgid from capture to done"
					>
						<div class="border-sidebar-border absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b px-4 py-3">
							<span class="text-sidebar-foreground/55 font-mono text-[10px] font-bold tracking-[0.14em] uppercase">Task current</span>
							<span class="text-primary font-mono text-[10px]">LIVE FLOW</span>
						</div>
						<svg aria-hidden="true" class="absolute inset-0 h-full w-full" viewBox="0 0 620 470" fill="none" preserveAspectRatio="none">
							<path class="hero-flow-base" d="M130 105H275L350 235H492M130 235H350M130 365H275L350 235" />
							<path class="hero-flow-surge hero-flow-delay-1" d="M130 105H275L350 235H492" />
							<path class="hero-flow-surge hero-flow-delay-2" d="M130 235H350H492" />
							<path class="hero-flow-surge hero-flow-delay-3" d="M130 365H275L350 235H492" />
							<circle class="hero-flow-core" cx="350" cy="235" r="11" />
						</svg>
						<div class="absolute top-[18%] left-4 w-[min(11rem,32%)] border border-white/15 bg-black/25 px-3 py-2.5 sm:left-6">
							<p class="text-sidebar-foreground/45 font-mono text-[9px] tracking-[0.12em] uppercase">Task 01</p>
							<p class="mt-1 text-xs font-semibold text-white">Scope release</p>
						</div>
						<div class="absolute top-[45%] left-4 w-[min(11rem,32%)] border border-white/15 bg-black/25 px-3 py-2.5 sm:left-6">
							<p class="text-sidebar-foreground/45 font-mono text-[9px] tracking-[0.12em] uppercase">Task 02</p>
							<p class="mt-1 text-xs font-semibold text-white">Review feedback</p>
						</div>
						<div class="absolute top-[72%] left-4 w-[min(11rem,32%)] border border-white/15 bg-black/25 px-3 py-2.5 sm:left-6">
							<p class="text-sidebar-foreground/45 font-mono text-[9px] tracking-[0.12em] uppercase">Task 03</p>
							<p class="mt-1 text-xs font-semibold text-white">Share notes</p>
						</div>
						<div class="border-primary bg-rail absolute top-1/2 left-[56%] w-20 -translate-x-1/2 -translate-y-1/2 border px-2 py-3 text-center">
							<Icon name="lucide:zap" :size="16" class="text-primary mx-auto" />
							<p class="mt-1 font-mono text-[9px] font-bold tracking-[0.1em] text-white uppercase">Decide</p>
						</div>
						<div class="border-primary bg-primary text-primary-foreground absolute top-1/2 right-4 w-[min(7.25rem,22%)] -translate-y-1/2 border px-2 py-4 text-center sm:right-6">
							<Icon name="lucide:check" :size="18" class="mx-auto" />
							<p class="mt-2 font-mono text-[9px] font-bold tracking-[0.1em] uppercase">Done</p>
						</div>
					</div>
				</div>
			</section>

			<section id="method" class="border-border border-y">
				<div class="mx-auto grid max-w-[1440px] lg:grid-cols-[0.75fr_1.25fr] lg:px-12">
					<div class="border-border px-5 py-12 sm:px-8 lg:border-r lg:px-0 lg:py-16 lg:pr-16">
						<p class="text-primary font-mono text-[11px] font-bold tracking-[0.16em] uppercase">One operating rhythm</p>
						<h2 class="mt-4 text-3xl leading-tight font-extrabold tracking-[-0.03em]">Make the next action obvious.</h2>
					</div>
					<div class="divide-border grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
						<div class="px-5 py-10 sm:px-7 lg:py-16">
							<span class="text-primary font-mono text-sm">01</span>
							<h3 class="mt-8 text-lg font-bold">Capture</h3>
							<p class="text-text-secondary mt-3 text-sm leading-6">Turn requests and loose ideas into clear, actionable tasks.</p>
						</div>
						<div class="px-5 py-10 sm:px-7 lg:py-16">
							<span class="text-primary font-mono text-sm">02</span>
							<h3 class="mt-8 text-lg font-bold">Assign</h3>
							<p class="text-text-secondary mt-3 text-sm leading-6">Make ownership visible before a task becomes a blocker.</p>
						</div>
						<div class="px-5 py-10 sm:px-7 lg:py-16">
							<span class="text-primary font-mono text-sm">03</span>
							<h3 class="mt-8 text-lg font-bold">Finish</h3>
							<p class="text-text-secondary mt-3 text-sm leading-6">Keep progress, discussion, and decisions connected to the task.</p>
						</div>
					</div>
				</div>
			</section>

			<section id="product" class="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
				<div class="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
					<div>
						<p class="text-primary font-mono text-[11px] font-bold tracking-[0.16em] uppercase">Designed for momentum</p>
						<h2 class="mt-4 max-w-md text-4xl leading-[0.98] font-extrabold tracking-[-0.035em]">Less status chasing. More meaningful progress.</h2>
					</div>
					<p class="text-text-secondary max-w-xl text-lg leading-8">
						Use the task ledger to see what is overdue, who owns it, and what needs attention—without turning task management into another meeting.
					</p>
				</div>
				<div class="border-border mt-14 grid border-y lg:grid-cols-3">
					<div class="border-border p-6 lg:border-r">
						<Icon name="lucide:target" :size="20" class="text-primary" />
						<h3 class="mt-12 text-xl font-bold">A sharper daily view</h3>
						<p class="text-text-secondary mt-3 text-sm leading-6">Priorities and due dates are visible at a glance.</p>
					</div>
					<div class="border-border p-6 lg:border-r">
						<Icon name="lucide:users" :size="20" class="text-primary" />
						<h3 class="mt-12 text-xl font-bold">Ownership without ambiguity</h3>
						<p class="text-text-secondary mt-3 text-sm leading-6">Every task has a clear owner and context for the team.</p>
					</div>
					<div class="p-6">
						<Icon name="lucide:message-square-text" :size="20" class="text-primary" />
						<h3 class="mt-12 text-xl font-bold">Decisions stay attached</h3>
						<p class="text-text-secondary mt-3 text-sm leading-6">Comments and activity live exactly where the work happens.</p>
					</div>
				</div>
			</section>

			<section id="teams" class="bg-rail text-white">
				<div class="mx-auto flex max-w-[1440px] flex-col justify-between gap-10 px-5 py-16 sm:px-8 lg:flex-row lg:items-end lg:px-12 lg:py-22">
					<div class="max-w-2xl">
						<p class="text-primary font-mono text-[11px] font-bold tracking-[0.16em] uppercase">Ready when you are</p>
						<h2 class="mt-4 text-4xl leading-[0.95] font-extrabold tracking-[-0.035em] sm:text-5xl">Give your team a clearer way to finish.</h2>
					</div>
					<Button as-child size="lg" class="bg-primary text-primary-foreground hover:bg-accent-hover h-12 px-5"
						><NuxtLink to="/signup" class="inline-flex items-center gap-2">Start free <Icon name="lucide:arrow-up-right" :size="16" class="shrink-0" /></NuxtLink
					></Button>
				</div>
			</section>
		</main>

		<footer class="bg-rail text-sidebar-foreground/55 border-t border-white/10 px-5 py-5 sm:px-8 lg:px-12">
			<div class="mx-auto flex max-w-[1440px] items-center justify-between gap-4 text-xs"><span class="font-mono tracking-[0.12em] uppercase">Taskgid</span><span>Task, get it done.</span></div>
		</footer>
	</div>
</template>

<style scoped>
.hero-flow-base {
	stroke: color-mix(in srgb, var(--color-primary) 32%, transparent);
	stroke-width: 3;
}

.hero-flow-surge {
	stroke: var(--color-primary);
	stroke-dasharray: 10 190;
	stroke-dashoffset: 200;
	stroke-linecap: square;
	stroke-width: 4;
	filter: drop-shadow(0 0 6px color-mix(in srgb, var(--color-primary) 80%, transparent));
	animation: task-current 3.4s linear infinite;
}

.hero-flow-delay-2 {
	animation-delay: -1.15s;
}

.hero-flow-delay-3 {
	animation-delay: -2.3s;
}

.hero-flow-core {
	fill: var(--color-primary);
	filter: drop-shadow(0 0 8px color-mix(in srgb, var(--color-primary) 85%, transparent));
	animation: task-core 2.6s ease-in-out infinite;
}

@keyframes task-current {
	to {
		stroke-dashoffset: 0;
	}
}

@keyframes task-core {
	50% {
		opacity: 0.55;
	}
}

@media (prefers-reduced-motion: reduce) {
	.hero-flow-surge,
	.hero-flow-core {
		animation: none;
	}
}
</style>
