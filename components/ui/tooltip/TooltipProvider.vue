<script setup lang="ts">
import { TooltipProvider, type TooltipProviderProps } from "reka-ui";

const { delayDuration = 0, ...props } = defineProps<TooltipProviderProps>();
</script>

<template>
	<TooltipProvider :delay-duration="delayDuration" v-bind="props">
		<slot />
	</TooltipProvider>
</template>
