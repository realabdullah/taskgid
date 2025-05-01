<script lang="ts" setup>
import { vAutoAnimate } from "@formkit/auto-animate/vue";

interface AuthFormFieldProps {
	name: string;
	label: string;
	type?: string;
	placeholder?: string;
	isFieldDirty?: boolean;
	extra?: string;
	options?: { label: string; value: string }[];
	className?: string;
}

defineProps<AuthFormFieldProps>();
</script>

<template>
	<FormField v-slot="{ componentField }" :name="name" :validate-on-blur="isFieldDirty">
		<FormItem v-auto-animate :class="[className]">
			<FormLabel>{{ label }}</FormLabel>

			<DateFormField v-if="type === 'date'" :placeholder="placeholder" v-bind="componentField" class="w-full" />

			<Select v-else-if="type === 'select'" v-bind="componentField">
				<FormControl>
					<SelectTrigger class="w-full">
						<SelectValue :placeholder="placeholder" />
					</SelectTrigger>
				</FormControl>
				<SelectContent>
					<SelectGroup>
						<template v-if="options">
							<SelectItem v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
						</template>
					</SelectGroup>
				</SelectContent>
			</Select>

			<FormControl v-else>
				<Textarea v-if="type === 'textarea'" :placeholder="placeholder" v-bind="componentField" class="w-full resize-none" />
				<Input v-else :type="type" :placeholder="placeholder" v-bind="componentField" class="w-full" />
			</FormControl>
			<FormDescription v-if="extra">{{ extra }}</FormDescription>
			<FormMessage />
		</FormItem>
	</FormField>
</template>
