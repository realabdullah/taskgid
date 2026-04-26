<script lang="ts" setup>
import type { HTMLAttributes } from "vue";
import { Primitive, type PrimitiveProps } from "reka-ui";
import { cn } from "@/lib/utils";

const { as = "a", ...props } = defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>();
</script>

<template>
	<Primitive data-slot="breadcrumb-link" :as="as" :as-child="props.asChild" :class="cn('hover:text-foreground transition-colors', props.class)">
		<slot />
	</Primitive>
</template>
