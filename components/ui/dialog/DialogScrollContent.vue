<script setup lang="ts">
import { X } from "lucide-vue-next";
import { DialogClose, DialogContent, type DialogContentEmits, type DialogContentProps, DialogOverlay, DialogPortal, useForwardPropsEmits } from "reka-ui";
import { computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<DialogContentProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<DialogPortal>
		<DialogOverlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-scrim/20 fixed inset-0 z-50 grid place-items-center overflow-y-auto"
		>
			<DialogContent
				:class="cn('border-border bg-background relative z-50 my-8 grid w-full max-w-lg gap-4 rounded-xl border p-6 shadow-lg duration-200 md:w-full', props.class)"
				v-bind="forwarded"
				@pointer-down-outside="
					(event) => {
						const originalEvent = event.detail.originalEvent;
						const target = originalEvent.target as HTMLElement;
						if (originalEvent.offsetX > target.clientWidth || originalEvent.offsetY > target.clientHeight) {
							event.preventDefault();
						}
					}
				"
			>
				<slot />

				<DialogClose class="text-text-secondary hover:bg-surface-2 hover:text-text-primary absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-sm transition-colors">
					<X class="h-4 w-4" />
					<span class="sr-only">Close</span>
				</DialogClose>
			</DialogContent>
		</DialogOverlay>
	</DialogPortal>
</template>
