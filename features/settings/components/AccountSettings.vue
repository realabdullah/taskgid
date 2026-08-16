<script lang="ts" setup>
import PasskeySettings from "./PasskeySettings.vue";
import PasswordForm from "./PasswordForm.vue";
import ProfileForm from "./ProfileForm.vue";

type SettingsSection = "profile" | "account" | "security" | "preferences";

const route = useRoute();
const router = useRouter();
const { user } = storeToRefs(useStore());
const validSections: SettingsSection[] = ["profile", "account", "security", "preferences"];
const activeSection = computed<SettingsSection>({
	get: () => {
		const value = String(route.query.section ?? "profile") as SettingsSection;
		return validSections.includes(value) ? value : "profile";
	},
	set: (section) => void router.replace({ query: { ...route.query, section } }),
});

const sections: Array<{ key: SettingsSection; label: string; description: string; icon: string }> = [
	{ key: "profile", label: "Profile", description: "Your name, avatar, and how teammates see you.", icon: "lucide:user-round" },
	{ key: "account", label: "Password", description: "Change the password you sign in with.", icon: "lucide:shield-check" },
	{ key: "security", label: "Passkeys", description: "Passkeys and the devices you trust.", icon: "lucide:key-round" },
	{ key: "preferences", label: "Preferences", description: "How Taskgid notifies you about work.", icon: "lucide:sliders-horizontal" },
];
</script>

<template>
	<div class="product-page">
		<header class="product-header">
			<div>
				<p class="product-eyebrow">Personal settings</p>
				<h1 class="product-title">Your account.</h1>
				<p class="product-description">Manage how you appear, sign in, and use Taskgid.</p>
			</div>
			<div class="flex items-center gap-3">
				<Avatar class="h-10 w-10"
					><AvatarImage :src="user?.profilePicture || ''" /><AvatarFallback>{{ getInitials(user?.firstName, user?.lastName) }}</AvatarFallback></Avatar
				>
				<div class="hidden sm:block">
					<p class="text-sm font-medium">{{ user?.firstName }} {{ user?.lastName }}</p>
					<p class="text-text-tertiary text-xs">{{ user?.email }}</p>
				</div>
			</div>
		</header>

		<nav class="no-scrollbar flex overflow-x-auto border-b" aria-label="Account settings">
			<Pressable
				v-for="section in sections"
				:key="section.key"
				static
				class="relative flex min-w-max items-center gap-2 px-4 py-3 text-sm transition-colors"
				:class="activeSection === section.key ? 'text-text-primary font-medium' : 'text-text-tertiary hover:text-text-primary'"
				@click="activeSection = section.key"
			>
				<Icon :name="section.icon" :size="16" /> {{ section.label }}
				<span v-if="activeSection === section.key" class="bg-text-primary absolute inset-x-3 bottom-0 h-0.5"></span>
			</Pressable>
		</nav>

		<div class="grid gap-8 lg:grid-cols-[260px_minmax(0,680px)]">
			<div>
				<p class="text-lg font-semibold">{{ sections.find((item) => item.key === activeSection)?.label }}</p>
				<p class="text-text-secondary mt-1 text-sm leading-6">{{ sections.find((item) => item.key === activeSection)?.description }}</p>
			</div>
			<section class="product-panel p-5 sm:p-7">
				<ProfileForm v-if="activeSection === 'profile'" :close-on-save="false" :silent-success="true">
					<template #default="{ cancel, isDirty, isSaving, justSaved }"
						><div class="border-border mt-6 flex justify-end gap-2 border-t pt-5">
							<Button variant="ghost" type="button" @click="cancel">Discard changes</Button
							><Button type="submit" :disabled="!isDirty || isSaving" :loading="isSaving">{{ justSaved ? "Saved" : "Save profile" }}</Button>
						</div></template
					>
				</ProfileForm>
				<PasswordForm v-else-if="activeSection === 'account'">
					<template #default="{ cancel, isDirty, isSaving }"
						><div class="border-border mt-6 flex justify-end gap-2 border-t pt-5">
							<Button variant="ghost" type="button" @click="cancel">Discard changes</Button
							><Button type="submit" :disabled="!isDirty || isSaving" :loading="isSaving">Update password</Button>
						</div></template
					>
				</PasswordForm>
				<PasskeySettings v-else-if="activeSection === 'security'" />
				<!--
					The old "Consistent light appearance" card explained an internal design
					decision rather than offering a setting. Preferences now lists only things
					the user can actually act on.
				-->
				<div v-else class="space-y-4">
					<div class="divide-border border-border overflow-hidden rounded-md border">
						<div class="flex items-center justify-between gap-4 p-4">
							<div>
								<p class="text-sm font-medium">Mention notifications</p>
								<p class="text-text-tertiary mt-1 text-xs">Receive an alert when a teammate mentions you.</p>
							</div>
							<Switch disabled />
						</div>
						<div class="border-border flex items-center justify-between gap-4 border-t p-4">
							<div>
								<p class="text-sm font-medium">Weekly summary</p>
								<p class="text-text-tertiary mt-1 text-xs">A concise email about unfinished work.</p>
							</div>
							<Switch disabled />
						</div>
					</div>
					<p class="text-text-tertiary text-xs">Notification delivery is not editable yet. These controls turn on once the API accepts preference changes.</p>
				</div>
			</section>
		</div>
	</div>
</template>
