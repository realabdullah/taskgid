<script lang="ts" setup>
import { vAutoAnimate } from "@formkit/auto-animate/vue";

interface AuthFormFieldProps {
	name: string;
	label: string;
	type?: string;
	placeholder?: string;
	isFieldDirty?: boolean;
}

defineProps<AuthFormFieldProps>();
</script>

<template>
	<FormField v-slot="{ componentField }" :name="name" :validate-on-blur="isFieldDirty">
		<FormItem v-auto-animate>
			<FormLabel>{{ label }}</FormLabel>
			<FormControl>
				<Input :type="type" :placeholder="placeholder" v-bind="componentField" />
			</FormControl>
			<FormMessage />
		</FormItem>
	</FormField>
</template>
