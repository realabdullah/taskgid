<script lang="ts" setup>
type SettingsSection = "profile" | "account" | "security" | "preferences";

const isOpen = useState<boolean>("settings-sheet-open", () => false);
const activeSection = useState<SettingsSection>("settings-sheet-section", () => "profile");

const sections: Array<{ key: SettingsSection; label: string; description: string; icon: string }> = [
	{ key: "profile", label: "Profile", description: "Name, bio and avatar", icon: "lucide:user" },
	{ key: "account", label: "Account", description: "Email and password", icon: "lucide:shield" },
	{ key: "security", label: "Security", description: "Passkeys and sign in", icon: "lucide:key-round" },
	{ key: "preferences", label: "Preferences", description: "Theme and notifications", icon: "lucide:sliders-horizontal" },
];

const { theme: currentTheme, setTheme } = useTheme();

const themeOptions = [
	{ value: "light" as const, label: "Light", icon: "lucide:sun", previewClass: "bg-white border border-border" },
	{ value: "dark" as const, label: "Dark", icon: "lucide:moon", previewClass: "bg-zinc-900 border border-zinc-700" },
	{ value: "system" as const, label: "System", icon: "lucide:monitor", previewClass: "bg-surface-2 border border-border" },
];

const close = () => {
	isOpen.value = false;
};

const openProfile = () => {
	activeSection.value = "profile";
	isOpen.value = true;
};

const openSettings = () => {
	activeSection.value = "account";
	isOpen.value = true;
};

onMounted(() => {
	window.addEventListener("taskgid:open-profile-intent", openProfile);
	window.addEventListener("taskgid:open-settings-intent", openSettings);
});

onBeforeUnmount(() => {
	window.removeEventListener("taskgid:open-profile-intent", openProfile);
	window.removeEventListener("taskgid:open-settings-intent", openSettings);
});
</script>

<template>
	<Sheet v-model:open="isOpen">
		<SheetContent side="right" class="border-border bg-surface-0 inset-y-0 w-full max-w-2xl border-l p-0 sm:max-w-2xl">
			<div class="flex h-full min-h-0">
				<aside class="border-border bg-surface-1 hidden w-56 border-r p-4 md:block">
					<p class="text-2xs text-text-tertiary mb-3 font-semibold tracking-widest uppercase">Settings</p>
					<nav class="space-y-1">
						<button
							v-for="section in sections"
							:key="section.key"
							type="button"
							class="interactive flex w-full items-start gap-2 rounded-md px-2 py-2 text-left"
							:class="activeSection === section.key ? 'bg-surface-2 text-text-primary' : 'text-text-secondary hover:bg-surface-2'"
							@click="activeSection = section.key"
						>
							<Icon :name="section.icon" :size="15" class="mt-0.5" />
							<span>
								<span class="block text-sm font-medium">{{ section.label }}</span>
								<span class="text-2xs text-text-tertiary block">{{ section.description }}</span>
							</span>
						</button>
					</nav>
				</aside>

				<div class="flex min-h-0 flex-1 flex-col">
					<header class="border-border border-b px-5 py-4">
						<div class="md:hidden">
							<Select v-model="activeSection">
								<SelectTrigger class="h-9 w-full">
									<SelectValue placeholder="Select section" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem v-for="section in sections" :key="section.key" :value="section.key">{{ section.label }}</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div class="hidden md:block">
							<p class="text-text-primary text-lg font-semibold">{{ sections.find((section) => section.key === activeSection)?.label }}</p>
							<p class="text-text-secondary text-sm">{{ sections.find((section) => section.key === activeSection)?.description }}</p>
						</div>
					</header>

					<div class="min-h-0 flex-1 overflow-y-auto px-5 py-5">
						<section v-if="activeSection === 'profile'" class="space-y-4">
							<UserUpdateProfile :close-on-save="false" :silent-success="true" @close="close">
								<template #default="{ cancel, isDirty, isSaving, justSaved }">
									<div class="border-border mt-6 flex items-center justify-end gap-2 border-t pt-4">
										<Button variant="secondary" type="button" @click="cancel">Cancel</Button>
										<Button type="submit" :disabled="!isDirty || isSaving" :loading="isSaving" loading-label="Saving profile">
											<span v-if="justSaved">✓ Saved</span>
											<span v-else>Save changes</span>
										</Button>
									</div>
								</template>
							</UserUpdateProfile>
						</section>

						<section v-else-if="activeSection === 'account'" class="space-y-4">
							<UserUpdateAccount @close="close">
								<template #default="{ cancel, isDirty, isSaving }">
									<div class="border-border mt-4 flex items-center justify-end gap-2 border-t pt-4">
										<Button variant="secondary" type="button" @click="cancel">Cancel</Button>
										<Button type="submit" :disabled="!isDirty || isSaving" :loading="isSaving" loading-label="Saving account">Save changes</Button>
									</div>
								</template>
							</UserUpdateAccount>
						</section>

						<section v-else-if="activeSection === 'security'" class="space-y-4">
							<UserPasskeys />
						</section>

						<section v-else class="space-y-5">
							<div>
								<p class="text-text-primary mb-1 text-sm font-semibold">Appearance</p>
								<p class="text-text-tertiary mb-4 text-xs">Choose how TaskGid looks to you.</p>
								<div class="grid grid-cols-3 gap-3">
									<button
										v-for="opt in themeOptions"
										:key="opt.value"
										type="button"
										class="interactive group flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-colors"
										:class="currentTheme === opt.value ? 'border-primary bg-accent-subtle' : 'border-border bg-surface-1 hover:bg-surface-2'"
										@click="setTheme(opt.value)"
									>
										<div
											class="flex h-10 w-full items-center justify-center rounded-md"
											:class="opt.previewClass"
										>
											<Icon :name="opt.icon" :size="20" :class="currentTheme === opt.value ? 'text-primary' : 'text-text-tertiary'" />
										</div>
										<span class="text-xs font-medium" :class="currentTheme === opt.value ? 'text-primary' : 'text-text-secondary'">{{ opt.label }}</span>
									</button>
								</div>
							</div>

							<div class="border-border rounded-lg border p-4">
								<p class="text-text-primary text-sm font-medium">Notification preferences</p>
								<p class="text-text-tertiary mt-1 text-xs">Granular notification controls are coming soon.</p>
								<div class="mt-3 space-y-2">
									<div class="flex items-center gap-2">
										<Checkbox id="notif-email" disabled />
										<label for="notif-email" class="text-text-secondary text-sm">Email summaries</label>
									</div>
									<div class="flex items-center gap-2">
										<Checkbox id="notif-mentions" disabled />
										<label for="notif-mentions" class="text-text-secondary text-sm">Mention alerts</label>
									</div>
								</div>
							</div>
						</section>
					</div>
				</div>
			</div>
		</SheetContent>
	</Sheet>
</template>
