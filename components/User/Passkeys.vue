<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import type { Passkey } from "~/types";

const { passkeys, addingPasskey, handleAddPasskey, handleRemovePasskey } = usePasskeys();

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
</script>

<template>
	<div class="space-y-4 pb-6">
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
					<div v-for="passkey in passkeys" :key="passkey.id" class="bg-muted flex items-center justify-between rounded-md p-3">
						<div class="flex items-center gap-3">
							<Icon :name="passkey.device.type === 'mobile' ? 'hugeicons:smart-phone-01' : 'hugeicons:computer'" :size="20" class="text-muted-foreground" />
							<div>
								<p class="font-medium">{{ passkey.device.vendor }} {{ passkey.device.model }}</p>
								<p class="text-muted-foreground text-xs">Added on {{ formatDate(passkey.createdAt, "Do MMM, YYYY") }}</p>
							</div>
						</div>
						<Button variant="ghost" size="sm" class="cursor-pointer text-red-500 hover:bg-red-100 hover:text-red-600" @click="handleRemovePasskey(passkey)">
							<Icon name="hugeicons:waste" :size="16" class="mr-1" />
							Remove
						</Button>
					</div>
				</template>

				<div v-else class="bg-muted rounded-md p-4 text-center">
					<p class="text-muted-foreground">No passkeys registered yet</p>
				</div>
			</div>

			<Button class="bg-black text-white hover:bg-black/90" :disabled="addingPasskey" @click="handleAddPasskey">
				<template v-if="addingPasskey">
					<span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
					Registering...
				</template>
				<template v-else>
					<Icon name="hugeicons:plus-sign" :size="16" class="mr-2" />
					Add New Passkey
				</template>
			</Button>
		</div>
	</div>
</template>
