<script lang="ts" setup>
import { cn } from "@/lib/utils";

const comment = shallowRef("");
const showMentionPopup = shallowRef(false);
const isBold = shallowRef(false);
const isItalic = shallowRef(false);
</script>

<template>
	<Card class="mt-10">
		<div class="p-4">
			<div class="flex items-start gap-3">
				<Avatar class="mt-1">
					<AvatarImage src="/placeholder.svg?height=40&width=40" alt="Current user" />
					<AvatarFallback>CU</AvatarFallback>
				</Avatar>

				<div class="flex-1">
					<div class="mb-2 flex items-center gap-2">
						<Button type="button" size="icon" variant="ghost" :class="cn('h-8 w-8', isBold && 'bg-muted')">
							<Icon name="hugeicons:text-bold" :size="16" />
						</Button>
						<Button type="button" size="icon" variant="ghost" :class="cn('h-8 w-8', isItalic && 'bg-muted')">
							<Icon name="hugeicons:text-italic" :size="16" />
						</Button>
					</div>

					<div class="relative">
						<Textarea
							v-model="comment"
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>

					<div class="mt-3 flex justify-end">
						<Button type="button" :disabled="!comment.trim()" class-name="flex items-center gap-2">
							<Icon name="hugeicons:arrow-right-04" :size="16" />
							<span>Submit</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	</Card>
</template>
