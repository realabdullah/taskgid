<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

interface Props extends PrimitiveProps {
	class?: HTMLAttributes["class"];
	disabled?: boolean;
	static?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	as: "button",
	disabled: false,
	static: false,
});
</script>

<template>
	<Primitive
		data-slot="pressable"
		:as="props.as"
		:as-child="props.asChild"
		:type="!props.asChild && props.as === 'button' ? 'button' : undefined"
		:disabled="props.disabled || undefined"
		:class="cn('focus-ring interactive disabled:pointer-events-none disabled:opacity-45', !props.static && 'active:scale-[0.96]', props.class)"
	>
		<slot />
	</Primitive>
</template>
