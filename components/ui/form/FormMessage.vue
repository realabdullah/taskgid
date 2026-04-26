<script lang="ts" setup>
import { ErrorMessage } from "vee-validate";
import { type HTMLAttributes, toValue } from "vue";
import { useFormField } from "./useFormField";
import { cn } from "@/lib/utils";

const props = defineProps<{
	class?: HTMLAttributes["class"];
}>();

const { name, formMessageId } = useFormField();
</script>

<template>
	<ErrorMessage :id="formMessageId" data-slot="form-message" as="p" :name="toValue(name)" :class="cn('text-danger text-sm font-medium', props.class)" />
</template>
