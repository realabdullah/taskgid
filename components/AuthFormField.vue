<script lang="ts" setup>
import TipTapEditor from "@/components/ui/tiptap/TipTapEditor.vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

interface AuthFormFieldProps {
	name: string;
	label: string;
	type?: string;
	placeholder?: string;
	isFieldDirty?: boolean;
	extra?: string;
	options?: { label: string; value: string }[];
	className?: string | string[];
	isMultiple?: boolean;
}

const props = defineProps<AuthFormFieldProps>();

const showPassword = ref(false);
const isPasswordField = computed(() => props.type === "password");
const inputType = computed(() => {
	if (!isPasswordField.value) return props.type;
	return showPassword.value ? "text" : "password";
});

const togglePasswordVisibility = () => {
	showPassword.value = !showPassword.value;
};
</script>

<template>
	<FormField v-slot="{ componentField }" :name="name" :validate-on-blur="isFieldDirty">
		<FormItem v-auto-animate :class="[className]">
			<FormLabel>{{ label }}</FormLabel>

			<DateFormField v-if="type === 'date'" :placeholder="placeholder" v-bind="componentField" class="w-full" />

			<TipTapEditor v-else-if="type === 'wysiwyg'" :placeholder="placeholder" v-bind="componentField" class="w-full" />

			<Select v-else-if="type === 'select'" v-bind="componentField" :multiple="isMultiple">
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
				<div v-else-if="isPasswordField" class="relative">
					<Input :type="inputType" :placeholder="placeholder" v-bind="componentField" class="w-full pr-10" />
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
						:aria-label="showPassword ? 'Hide password' : 'Show password'"
						@click="togglePasswordVisibility"
					>
						<Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" :size="16" />
					</Button>
				</div>
				<Input v-else :type="type" :placeholder="placeholder" v-bind="componentField" class="w-full" />
			</FormControl>
			<FormDescription v-if="extra">{{ extra }}</FormDescription>
			<FormMessage />
		</FormItem>
	</FormField>
</template>
