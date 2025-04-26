<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import UpdateProfile from "./UpdateProfile.vue";
import UpdateAccount from "./UpdateAccount.vue";

const tabs = [
	{ value: "profile", label: "Profile" },
	{ value: "account", label: "Account" },
];

const isOpen = defineModel<boolean>();
const activeTab = ref(tabs[0].value);

const components: Record<string, any> = {
	profile: UpdateProfile,
	account: UpdateAccount,
};
</script>

<template>
	<Dialog :open="isOpen" @update:open="isOpen = $event">
		<DialogContent class="max-h-[90vh] overflow-hidden overflow-y-auto bg-white p-0 sm:max-w-[600px]">
			<DialogHeader class="sticky top-0 z-10 bg-white px-6 pt-6 pb-2">
				<DialogTitle class="text-2xl">Settings</DialogTitle>
				<DialogDescription>Manage your account settings and preferences</DialogDescription>
			</DialogHeader>

			<Tabs v-model="activeTab" class="px-6">
				<TabsList class="mb-4 w-full justify-start">
					<TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}</TabsTrigger>
				</TabsList>

				<TabsContent :value="activeTab" class="space-y-6">
					<component :is="components[activeTab]" v-slot="{ cancel }" class="space-y-4" @close="isOpen = false">
						<DialogFooter class="sticky bottom-0 mt-6 border-t bg-white px-6 py-4">
							<Button type="button" variant="outline" @click="cancel ? cancel() : (isOpen = false)"> Cancel </Button>
							<Button type="submit" class="bg-black text-white hover:bg-black/90"> Save Changes </Button>
						</DialogFooter>
					</component>
				</TabsContent>
			</Tabs>
		</DialogContent>
	</Dialog>
</template>
