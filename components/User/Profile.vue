<script lang="ts" setup>
const emit = defineEmits<(event: "edit") => void>();

const isOpen = defineModel<boolean>();
const { user } = storeToRefs(useStore());
</script>

<template>
	<Dialog :open="isOpen" @update:open="isOpen = $event">
		<DialogContent class="overflow-hidden bg-white p-0 sm:max-w-[500px]">
			<div class="relative h-32 bg-black">
				<div class="absolute -bottom-16 left-6">
					<Avatar class="h-32 w-32 border-4 border-white">
						<AvatarImage :src="user?.profilePicture || ''" :alt="user?.username" />
						<AvatarFallback class="bg-zinc-800 text-3xl text-white">
							{{ getInitials(user?.firstName, user?.lastName) }}
						</AvatarFallback>
					</Avatar>
				</div>
			</div>

			<div class="px-6 pt-20">
				<div class="flex items-start justify-between">
					<div>
						<h2 class="text-2xl font-bold">{{ user?.firstName }} {{ user?.lastName }}</h2>
						<div class="mt-1 flex items-center gap-2 text-gray-500">
							<Icon name="hugeicons:mail-02" :size="16" />
							<span class="text-sm">{{ user?.email }}</span>
						</div>
					</div>
				</div>

				<div class="mt-6 grid grid-cols-2 gap-4">
					<div class="flex items-center gap-2 text-sm text-gray-600">
						<Icon name="hugeicons:calendar-03" :size="16" />
						<span>Joined {{ formatDate(user?.createdAt, "Do MMM, YYYY") }}</span>
					</div>
					<div class="flex items-center gap-2 text-sm text-gray-600">
						<Icon name="hugeicons:location-04" :size="16" />
						<span>{{ user?.location || "Location not provided" }}</span>
					</div>
					<div class="flex items-center gap-2 text-sm text-gray-600">
						<Icon name="hugeicons:briefcase-09" :size="16" />
						<span>{{ user?.title || "Nil" }}</span>
					</div>
					<div class="flex items-center gap-2 text-sm text-gray-600">
						<Icon name="hugeicons:user-multiple-02" :size="16" />
						<span>4 Workspaces</span>
					</div>
				</div>

				<Separator class="my-6" />

				<div v-if="user?.about">
					<h3 class="mb-2 font-medium">About</h3>
					<p class="text-sm text-gray-600">{{ user?.about }}</p>
				</div>

				<DialogFooter class="mt-8 pb-2">
					<Button variant="outline" @click="isOpen = false"> Close </Button>
					<Button class="bg-black text-white hover:bg-black/90" @click="emit('edit')"> Edit Profile </Button>
				</DialogFooter>
			</div>
		</DialogContent>
	</Dialog>
</template>
