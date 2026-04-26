<script setup lang="ts">
import type { ListboxGroupProps } from "reka-ui";
import { reactiveOmit } from "@vueuse/core";
import { ListboxGroup, ListboxGroupLabel, useId } from "reka-ui";
import { computed, type HTMLAttributes, onMounted, onUnmounted } from "vue";
import { provideCommandGroupContext, useCommand } from ".";
import { cn } from "@/lib/utils";

const props = defineProps<
	ListboxGroupProps & {
		class?: HTMLAttributes["class"];
		heading?: string;
	}
>();

const delegatedProps = reactiveOmit(props, "class");

const { allGroups, filterState } = useCommand();
const id = useId();

const isRender = computed(() => (!filterState.search ? true : filterState.filtered.groups.has(id)));

provideCommandGroupContext({ id });
onMounted(() => {
	if (!allGroups.value.has(id)) allGroups.value.set(id, new Set());
});
onUnmounted(() => {
	allGroups.value.delete(id);
});
</script>

<template>
	<ListboxGroup v-bind="delegatedProps" :id="id" data-slot="command-group" :class="cn('text-foreground overflow-hidden p-1', props.class)" :hidden="isRender ? undefined : true">
		<ListboxGroupLabel v-if="heading" class="text-2xs text-text-tertiary px-3 py-1 font-semibold tracking-widest uppercase">
			{{ heading }}
		</ListboxGroupLabel>
		<slot />
	</ListboxGroup>
</template>
