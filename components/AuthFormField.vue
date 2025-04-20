<script lang="ts" setup>
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form";

interface AuthFormFieldProps {
	id: string;
	label: string;
	type?: string;
	placeholder?: string;
	required?: boolean;
	error?: string;
}

const props = defineProps<AuthFormFieldProps>();
</script>

<template>
	<div class="space-y-2">
		<div class="space-y-1">
			<Label :htmlFor="id">
				{{ label }}
				<span v-if="required" class="text-destructive"> *</span>
			</Label>

			<slot>
				<Input :id="id" :type="type" :placeholder="placeholder" :required="required" :class="[error ? 'border-destructive' : '']" />
			</slot>
			<FormMessage v-if="error">{{ error }}</FormMessage>
		</div>
	</div>
</template>
