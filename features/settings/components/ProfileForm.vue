<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { User } from "~/types";
import { useAvatarCrop } from "../composables/useAvatarCrop";

const props = withDefaults(
	defineProps<{
		closeOnSave?: boolean;
		silentSuccess?: boolean;
	}>(),
	{
		closeOnSave: true,
		silentSuccess: false,
	}
);

const emits = defineEmits<{
	(e: "close"): void;
}>();

const { user } = storeToRefs(useStore());

const formSchema = toTypedSchema(updateProfileSchema);

const { isFieldDirty, handleSubmit, values, setFieldValue, meta, resetForm } = useForm({
	validationSchema: formSchema,
	initialValues: {
		firstName: user.value?.firstName || "",
		lastName: user.value?.lastName || "",
		username: user.value?.username || "",
		profilePicture: user.value?.profilePicture || "",
		about: user.value?.about || "",
		title: user.value?.title || "",
		location: user.value?.location || "",
	},
});

const PROFILE_EDITABLE_KEYS = ["firstName", "lastName", "username", "profilePicture", "about", "title", "location"] as const;
const OPTIONAL_PROFILE_KEYS = new Set<keyof User>(["profilePicture", "about", "title", "location"]);

const normalizeForComparison = (key: keyof User, value: unknown) => {
	if (OPTIONAL_PROFILE_KEYS.has(key)) {
		return value ?? "";
	}
	return value;
};

const buildProfilePayload = () => {
	const payload = {} as Partial<User>;

	for (const key of PROFILE_EDITABLE_KEYS) {
		if (key === "profilePicture" && selectedFile.value) continue;

		const nextValue = values[key] as unknown;
		const currentValue = user.value?.[key] as unknown;

		if (normalizeForComparison(key, nextValue) !== normalizeForComparison(key, currentValue)) {
			(payload[key] as unknown) = nextValue as unknown;
		}
	}

	return payload;
};

const isSaving = ref(false);
const justSaved = ref(false);
let savedTimeout: ReturnType<typeof setTimeout> | null = null;
const {
	fileInput,
	selectedFile,
	fileDetails,
	isCropModalOpen,
	isPreparingImage,
	cropImageSrc,
	cropImageElement,
	cropState,
	cropImageStyle,
	isCropDragging,
	handleButtonClick,
	handleFileChange,
	onCropImageLoad,
	onCropImageError,
	onCropPointerDown,
	onCropZoomChange,
	applyCroppedImage,
	resetCropModal,
	resetSelection,
	takeSelectedFile,
	clearPreviewUrl,
} = useAvatarCrop((previewUrl) => setFieldValue("profilePicture", previewUrl));

const markSaved = () => {
	justSaved.value = true;
	if (savedTimeout) {
		clearTimeout(savedTimeout);
	}
	savedTimeout = setTimeout(() => {
		justSaved.value = false;
	}, 2000);
};

onBeforeUnmount(() => {
	if (savedTimeout) {
		clearTimeout(savedTimeout);
	}
});

const cancelChanges = () => {
	resetForm({
		values: {
			firstName: user.value?.firstName || "",
			lastName: user.value?.lastName || "",
			username: user.value?.username || "",
			profilePicture: user.value?.profilePicture || "",
			about: user.value?.about || "",
			title: user.value?.title || "",
			location: user.value?.location || "",
		},
	});
	resetSelection();
	justSaved.value = false;
	emits("close");
};

const uploadFile = async (file: File) => {
	try {
		const formData = new FormData();
		formData.append("file", file);

		const config = useRuntimeConfig();
		const authToken = useCookie<string | undefined>("TG-AUTHTOKEN");

		const result = await $fetch<any>(API_ENDPOINTS.media.upload, {
			baseURL: config.public.apiBaseUrl,
			method: "POST",
			body: formData,
			headers: {
				Accept: "application/json",
				...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
			},
		});

		const fileUrl = result?.file?.url;
		if (typeof fileUrl === "string" && fileUrl.trim()) return fileUrl;
		throw new Error("Unable to use the uploaded image. Choose another image and try again.");
	} catch (error) {
		// Raw $fetch puts the server error body in error.data — prefer that over the generic HTTP status message
		const apiMessage = error && typeof error === "object" && "data" in error ? ((error as { data?: { message?: string } }).data?.message ?? (error as { data?: string }).data) : undefined;
		const message = typeof apiMessage === "string" && apiMessage.trim() ? apiMessage : getServerError(error, "Unable to upload your profile image. Try again.");
		throw new Error(message);
	}
};

const onSubmit = handleSubmit(async () => {
	try {
		isSaving.value = true;
		const payload = buildProfilePayload();
		let uploadedAvatarUrl: string | null = null;

		if (selectedFile.value) {
			const fileToUpload = takeSelectedFile();
			if (!fileToUpload) return;

			try {
				uploadedAvatarUrl = await uploadFile(fileToUpload);
			} catch (uploadError) {
				toast.error(getServerError(uploadError, "Unable to upload your profile image. Try again."));
				return;
			}

			payload.profilePicture = uploadedAvatarUrl;
			setFieldValue("profilePicture", uploadedAvatarUrl);
			clearPreviewUrl();
		}

		const hasPayloadChanges = Object.keys(payload).length > 0;
		if (!hasPayloadChanges && !uploadedAvatarUrl) {
			return;
		}

		const {
			success,
			user: data,
			error,
			message,
		} = await useApiFetch<{ success: boolean; error?: string; message?: string; user: User }>(API_ENDPOINTS.users.profile, {
			method: "PATCH",
			body: { ...payload },
		});
		if (!success || !data) throw new Error(error || message || "Unable to update your profile. Try again.");
		if (!props.silentSuccess) {
			toast.success(message || "Profile updated.");
		}
		user.value = { ...data };
		resetForm({
			values: {
				firstName: data.firstName,
				lastName: data.lastName,
				username: data.username,
				profilePicture: data.profilePicture,
				about: data.about || "",
				title: data.title || "",
				location: data.location || "",
			},
		});

		if (props.closeOnSave) {
			emits("close");
		} else {
			markSaved();
		}
	} catch (error) {
		toast.error(getServerError(error, "Unable to update your profile. Try again."));
	} finally {
		isSaving.value = false;
	}
});

watch(
	() => user.value,
	(nextUser) => {
		if (!nextUser) {
			return;
		}
		clearPreviewUrl();
		resetForm({
			values: {
				firstName: nextUser.firstName || "",
				lastName: nextUser.lastName || "",
				username: nextUser.username || "",
				profilePicture: nextUser.profilePicture || "",
				about: nextUser.about || "",
				title: nextUser.title || "",
				location: nextUser.location || "",
			},
		});
		resetSelection();
	},
	{ immediate: true }
);
</script>

<template>
	<form @submit="onSubmit">
		<div class="flex items-center gap-4">
			<Avatar class="h-20 w-20">
				<AvatarImage :src="values.profilePicture || ''" :alt="values?.username" />
				<AvatarFallback class="bg-text-primary text-primary-foreground text-xl"> {{ getInitials(values?.firstName, values?.lastName) }} </AvatarFallback>
			</Avatar>
			<div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					class="flex items-center gap-2"
					:disabled="isPreparingImage"
					:loading="isPreparingImage"
					loading-label="Preparing image…"
					@click="handleButtonClick"
				>
					<Icon name="hugeicons:camera-01" :size="16" />
					Change Avatar
				</Button>
				<p class="text-text-tertiary mt-2 text-xs">JPG, PNG or WEBP. 1MB max.</p>
				<span v-if="fileDetails" class="text-text-tertiary text-sm"> {{ fileDetails?.name }} ({{ fileDetails?.size }}) </span>

				<input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleFileChange" />
			</div>
		</div>

		<div class="border-border mt-6 grid gap-4 border-t pt-6">
			<FormFieldRenderer
				v-for="(field, index) in profileUpdateFields"
				:key="index"
				:name="field.id"
				:label="field.label"
				:type="field.type"
				:placeholder="field.placeholder"
				:is-field-dirty="!isFieldDirty"
			/>
		</div>

		<slot :cancel="cancelChanges" :is-dirty="meta.dirty || !!selectedFile" :is-saving="isSaving" :just-saved="justSaved" />
	</form>

	<Dialog :open="isCropModalOpen" @update:open="(open) => (!open ? resetCropModal() : null)">
		<DialogContent class="sm:max-w-[560px]">
			<DialogHeader>
				<DialogTitle>Crop profile image</DialogTitle>
				<DialogDescription>Drag to position your image, then apply the crop.</DialogDescription>
			</DialogHeader>

			<div class="space-y-4 py-2">
				<div class="bg-scrim/5 mx-auto h-[280px] w-[280px] overflow-hidden rounded-md border">
					<img
						v-if="cropImageSrc"
						ref="cropImageElement"
						:src="cropImageSrc"
						alt="Avatar crop preview"
						class="crop-image-preview select-none"
						:class="isCropDragging ? 'cursor-grabbing' : 'cursor-grab'"
						:style="cropImageStyle"
						draggable="false"
						@load="onCropImageLoad"
						@error="onCropImageError"
						@pointerdown="onCropPointerDown"
					/>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span>Zoom</span>
						<span>{{ cropState.zoom.toFixed(2) }}x</span>
					</div>
					<input type="range" min="1" max="3" step="0.01" :value="cropState.zoom" class="w-full" @input="onCropZoomChange" />
				</div>
			</div>

			<DialogFooter>
				<Button type="button" variant="outline" :disabled="isPreparingImage" @click="resetCropModal">Cancel</Button>
				<Button type="button" :disabled="isPreparingImage" :loading="isPreparingImage" loading-label="Processing image" @click="applyCroppedImage">Apply crop</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>

<style scoped>
.crop-image-preview {
	outline: 1px solid oklch(0 0 0 / 0.1);
	outline-offset: -1px;
}
</style>
