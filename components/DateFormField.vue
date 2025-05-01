<script setup lang="ts">
import { useField } from "vee-validate";
import type { DateValue } from "@internationalized/date";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { toDate } from "reka-ui/date";
import { cn } from "@/lib/utils";

const props = defineProps<{
	placeholder?: string;
	name: string;
}>();

const { value } = useField<Date | null>(() => props.name);

const modelValue = computed<DateValue | null>({
	get() {
		try {
			return value.value ? parseDate(String(value.value)) : null;
		} catch {
			return null;
		}
	},
	set(date) {
		if (date) value.value = toDate(date);
		else value.value = null;
	},
});

const setModelValue = (date?: DateValue) => {
	if (date) modelValue.value = date;
};

const minDate = computed(() => {
	return today(getLocalTimeZone());
});
</script>

<template>
	<Popover>
		<PopoverTrigger as-child>
			<FormControl>
				<Button variant="outline" :class="cn('!w-full ps-3 text-start font-normal', !value && 'text-muted-foreground')">
					<span>{{ value ? formatDate(value) : "Pick a date" }}</span>
					<Icon name="hugeicons:calendar-03" :size="16" class="ms-auto opacity-50" />
				</Button>
				<input hidden />
			</FormControl>
		</PopoverTrigger>
		<PopoverContent class="w-auto p-0">
			<Calendar :model-value="modelValue as DateValue" :model-value:placeholder="placeholder" :min-value="minDate" @update:model-value="setModelValue" />
		</PopoverContent>
	</Popover>
</template>
