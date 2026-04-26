<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { toast } from "vue-sonner";
import type { Passkey } from "~/types";

const { passkeys, addingPasskey, handleAddPasskey } = usePasskeys();

const { status } = useAsyncData(
	"passkeys",
	async () => {
		const data = await useApiFetch<{ authns: Passkey[] }>("/users/authn", { method: "GET" });
		return data?.authns?.length > 0 ? data.authns : [];
	},
	{
		transform: (data) => {
			passkeys.value = [...data];
		},
	}
);

const removeCandidate = ref<Passkey | null>(null);

const requestRemove = (passkey: Passkey) => {
	removeCandidate.value = passkey;
};

const confirmRemove = () => {
	if (!removeCandidate.value) return;
	toast.info("Passkey removal is coming soon.");
	removeCandidate.value = null;
};
</script>

<template>
	<div class="space-y-4 pb-4">
		<h3 class="flex items-center gap-2 text-lg font-medium">
			<Icon name="hugeicons:finger-print" :size="20" />
			Passkeys (WebAuthn)
		</h3>

		<div class="space-y-4">
			<div class="space-y-0.5">
				<Label class="text-base">Registered Passkeys</Label>
				<p class="text-muted-foreground text-sm">Passkeys are a more secure alternative to passwords that use biometrics or device PINs</p>
			</div>

			<div class="mt-4 space-y-3">
				<template v-if="status === 'pending'">
					<div v-for="item in 2" :key="item" class="bg-muted flex items-center justify-between rounded-md p-3">
						<div class="flex items-center gap-3">
							<Skeleton class="h-5 w-5" />
							<div class="w-[200px]">
								<Skeleton class="h-6 w-full max-w-[138px]" />
								<Skeleton class="mt-1 h-4 w-full max-w-[138px]" />
							</div>
						</div>
						<Skeleton class="h-8 w-full max-w-[100px]" />
					</div>
				</template>
				<template v-else-if="passkeys && passkeys.length > 0">
					<div v-for="passkey in passkeys" :key="passkey.id" class="bg-muted border-border flex items-center justify-between rounded-md border p-3">
						<div class="flex items-center gap-3">
							<Icon :name="passkey.device.type === 'mobile' ? 'hugeicons:smart-phone-01' : 'hugeicons:computer'" :size="20" class="text-muted-foreground" />
							<div>
								<p class="font-medium">{{ passkey.device.vendor }} {{ passkey.device.model }}</p>
								<p class="text-muted-foreground text-xs">Added on {{ formatDate(passkey.createdAt, "Do MMM, YYYY") }}</p>
							</div>
						</div>

						<Popover>
							<PopoverTrigger as-child>
								<Button variant="ghost" size="icon" class="text-text-tertiary hover:text-danger h-8 w-8" aria-label="Remove passkey" @click="requestRemove(passkey)">
									<Icon name="hugeicons:waste" :size="16" />
								</Button>
							</PopoverTrigger>
							<PopoverContent align="end" class="border-border bg-surface-0 w-64 border p-3">
								<p class="text-text-primary text-sm font-medium">Remove this passkey?</p>
								<p class="text-text-tertiary mt-1 text-xs">This action is not available yet and will be added in a future update.</p>
								<div class="mt-3 flex justify-end gap-2">
									<Button variant="secondary" size="sm" @click="removeCandidate = null">Cancel</Button>
									<Button variant="destructive" size="sm" @click="confirmRemove">Remove</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</template>

				<div v-else class="bg-muted rounded-md p-4 text-center">
					<p class="text-muted-foreground">No passkeys registered yet</p>
				</div>
			</div>

			<Button :loading="addingPasskey" loading-label="Registering passkey" class="min-w-[170px]" :disabled="addingPasskey" @click="handleAddPasskey">
				<template v-if="addingPasskey"> Registering... </template>
				<template v-else>
					<Icon name="hugeicons:plus-sign" :size="16" class="mr-2" />
					Add New Passkey
				</template>
			</Button>
		</div>
	</div>
</template>
