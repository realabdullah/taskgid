<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { User } from "~/types";

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

const MAX_RAW_IMAGE_BYTES = 1024 * 1024;
const TARGET_UPLOAD_BYTES = 1024 * 1024;
const CROP_VIEWPORT_SIZE = 280;
const CROPPED_OUTPUT_SIZE = 640;

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

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const fileDetails = ref<{ name: string; size: string } | null>(null);
const currentPreviewUrl = ref<string | null>(null);

const isCropModalOpen = ref(false);
const isPreparingImage = ref(false);
const pendingImageFile = ref<File | null>(null);
const cropImageSrc = ref("");
const cropImageElement = ref<HTMLImageElement | null>(null);
const cropNaturalSize = reactive({ width: 0, height: 0 });
const cropState = reactive({ zoom: 1, offsetX: 0, offsetY: 0 });
const isCropDragging = ref(false);
const cropDragStart = reactive({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

const baseCropScale = computed(() => {
	if (!cropNaturalSize.width || !cropNaturalSize.height) return 1;
	return Math.max(CROP_VIEWPORT_SIZE / cropNaturalSize.width, CROP_VIEWPORT_SIZE / cropNaturalSize.height);
});

const cropRenderedWidth = computed(() => cropNaturalSize.width * baseCropScale.value);
const cropRenderedHeight = computed(() => cropNaturalSize.height * baseCropScale.value);

const minOffsetX = computed(() => CROP_VIEWPORT_SIZE - cropRenderedWidth.value * cropState.zoom);
const minOffsetY = computed(() => CROP_VIEWPORT_SIZE - cropRenderedHeight.value * cropState.zoom);

const cropImageStyle = computed(() => ({
	width: `${cropRenderedWidth.value}px`,
	height: `${cropRenderedHeight.value}px`,
	transform: `translate(${cropState.offsetX}px, ${cropState.offsetY}px) scale(${cropState.zoom})`,
	transformOrigin: "top left",
}));

const clearPreviewUrl = () => {
	if (!currentPreviewUrl.value) return;
	URL.revokeObjectURL(currentPreviewUrl.value);
	currentPreviewUrl.value = null;
};

const clampCropOffsets = () => {
	cropState.offsetX = Math.min(0, Math.max(minOffsetX.value, cropState.offsetX));
	cropState.offsetY = Math.min(0, Math.max(minOffsetY.value, cropState.offsetY));
};

const resetCropState = () => {
	cropState.zoom = 1;
	cropState.offsetX = (CROP_VIEWPORT_SIZE - cropRenderedWidth.value) / 2;
	cropState.offsetY = (CROP_VIEWPORT_SIZE - cropRenderedHeight.value) / 2;
	clampCropOffsets();
};

const resetCropModal = () => {
	isCropModalOpen.value = false;
	isPreparingImage.value = false;
	pendingImageFile.value = null;
	cropImageSrc.value = "";
	cropImageElement.value = null;
	cropNaturalSize.width = 0;
	cropNaturalSize.height = 0;
	isCropDragging.value = false;
};

const onCropZoomChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const zoom = Number(target.value);
	if (Number.isNaN(zoom)) return;
	cropState.zoom = zoom;
	clampCropOffsets();
};

const onCropImageLoad = () => {
	if (!cropImageElement.value) return;
	cropNaturalSize.width = cropImageElement.value.naturalWidth;
	cropNaturalSize.height = cropImageElement.value.naturalHeight;
	resetCropState();
};

const onCropImageError = () => {
	toast.error("This image could not be loaded for cropping. Try converting it to JPEG or PNG first.");
	resetCropModal();
};

const onCropPointerMove = (event: PointerEvent) => {
	if (!isCropDragging.value) return;
	cropState.offsetX = cropDragStart.offsetX + (event.clientX - cropDragStart.x);
	cropState.offsetY = cropDragStart.offsetY + (event.clientY - cropDragStart.y);
	clampCropOffsets();
};

const stopCropDragging = () => {
	isCropDragging.value = false;
	window.removeEventListener("pointermove", onCropPointerMove);
	window.removeEventListener("pointerup", stopCropDragging);
};

const onCropPointerDown = (event: PointerEvent) => {
	if (!cropImageElement.value) return;
	event.preventDefault();
	isCropDragging.value = true;
	cropDragStart.x = event.clientX;
	cropDragStart.y = event.clientY;
	cropDragStart.offsetX = cropState.offsetX;
	cropDragStart.offsetY = cropState.offsetY;
	window.addEventListener("pointermove", onCropPointerMove);
	window.addEventListener("pointerup", stopCropDragging);
};

const readAsDataUrl = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ""));
		reader.onerror = () => reject(new Error("Failed to read selected file."));
		reader.readAsDataURL(file);
	});

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
	new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error("Failed to process image."));
					return;
				}
				resolve(blob);
			},
			type,
			quality
		);
	});

const compressCanvas = async (canvas: HTMLCanvasElement, targetBytes: number) => {
	let quality = 0.92;
	let blob = await canvasToBlob(canvas, "image/webp", quality);

	while (blob.size > targetBytes && quality > 0.5) {
		quality -= 0.08;
		blob = await canvasToBlob(canvas, "image/webp", quality);
	}

	if (blob.size <= targetBytes) return blob;

	quality = 0.9;
	blob = await canvasToBlob(canvas, "image/jpeg", quality);
	while (blob.size > targetBytes && quality > 0.5) {
		quality -= 0.08;
		blob = await canvasToBlob(canvas, "image/jpeg", quality);
	}

	return blob;
};

const openCropModal = async (file: File) => {
	if (file.size > MAX_RAW_IMAGE_BYTES) {
		toast.error("Please upload an image smaller than 1MB.");
		isPreparingImage.value = false;
		return;
	}

	try {
		pendingImageFile.value = file;
		cropImageSrc.value = await readAsDataUrl(file);
		isCropModalOpen.value = true;
	} catch (error) {
		toast.error(getServerError(error, "Could not open image for cropping."));
		resetCropModal();
	} finally {
		isPreparingImage.value = false;
	}
};

const applyCroppedImage = async () => {
	if (!cropImageElement.value || !pendingImageFile.value || !cropNaturalSize.width || !cropNaturalSize.height) {
		toast.error("Please select a valid image.");
		return;
	}

	try {
		isPreparingImage.value = true;
		const canvas = document.createElement("canvas");
		canvas.width = CROPPED_OUTPUT_SIZE;
		canvas.height = CROPPED_OUTPUT_SIZE;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Could not initialize canvas.");

		const scale = baseCropScale.value * cropState.zoom;
		const sourceWidth = CROP_VIEWPORT_SIZE / scale;
		const sourceHeight = CROP_VIEWPORT_SIZE / scale;
		let sourceX = -cropState.offsetX / scale;
		let sourceY = -cropState.offsetY / scale;

		sourceX = Math.min(Math.max(0, sourceX), cropNaturalSize.width - sourceWidth);
		sourceY = Math.min(Math.max(0, sourceY), cropNaturalSize.height - sourceHeight);

		ctx.drawImage(cropImageElement.value, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, CROPPED_OUTPUT_SIZE, CROPPED_OUTPUT_SIZE);

		const blob = await compressCanvas(canvas, TARGET_UPLOAD_BYTES);
		const outputExtension = blob.type === "image/jpeg" ? "jpg" : "webp";
		const fileNameBase = pendingImageFile.value.name.replace(/\.[^/.]+$/, "");
		const croppedFile = new File([blob], `${fileNameBase}-avatar.${outputExtension}`, {
			type: blob.type,
			lastModified: Date.now(),
		});

		clearPreviewUrl();
		const previewUrl = URL.createObjectURL(croppedFile);
		currentPreviewUrl.value = previewUrl;
		selectedFile.value = croppedFile;
		fileDetails.value = { name: croppedFile.name, size: formatFileSize(croppedFile.size) };
		setFieldValue("profilePicture", previewUrl);
		resetCropModal();
		toast.success("Avatar ready — save your profile to apply it.");
	} catch (error) {
		toast.error(getServerError(error, "Failed to process avatar image."));
	} finally {
		isPreparingImage.value = false;
	}
};

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
	stopCropDragging();
	clearPreviewUrl();
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
	fileDetails.value = null;
	selectedFile.value = null;
	clearPreviewUrl();
	resetCropModal();
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
		throw new Error("Upload succeeded but no file URL was returned.");
	} catch (error) {
		// Raw $fetch puts the server error body in error.data — prefer that over the generic HTTP status message
		const apiMessage = error && typeof error === "object" && "data" in error ? ((error as { data?: { message?: string } }).data?.message ?? (error as { data?: string }).data) : undefined;
		const message = typeof apiMessage === "string" && apiMessage.trim() ? apiMessage : getServerError(error, "Failed to upload avatar.");
		throw new Error(message);
	}
};

const onSubmit = handleSubmit(async () => {
	try {
		isSaving.value = true;
		const payload = buildProfilePayload();
		let uploadedAvatarUrl: string | null = null;

		if (selectedFile.value) {
			const fileToUpload = selectedFile.value;
			// Clear immediately so a failed upload never causes a re-upload loop.
			selectedFile.value = null;
			fileDetails.value = null;

			try {
				uploadedAvatarUrl = await uploadFile(fileToUpload);
			} catch (uploadError) {
				toast.error(getServerError(uploadError, "Failed to upload avatar."));
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
		if (!success || !data) throw new Error(error || message || "Failed to update profile");
		if (!props.silentSuccess) {
			toast(message || "Profile updated successfully");
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
		toast.error(getServerError(error, "Failed to update profile."));
	} finally {
		isSaving.value = false;
	}
});

const handleButtonClick = () => {
	if (fileInput.value) fileInput.value.click();
};

const handleFileChange = async (event: Event) => {
	isPreparingImage.value = true;
	const target = event.target as HTMLInputElement;

	if (!target.files?.length) {
		isPreparingImage.value = false;
		return;
	}

	const file = target.files[0];
	if (!file) {
		isPreparingImage.value = false;
		return;
	}

	if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
		toast.error("Please upload a JPG, PNG or WEBP file.");
		target.value = "";
		isPreparingImage.value = false;
		return;
	}

	await openCropModal(file);
	target.value = "";
};

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
		selectedFile.value = null;
		fileDetails.value = null;
	},
	{ immediate: true }
);
</script>

<template>
	<form @submit="onSubmit">
		<div class="flex items-center gap-4">
			<Avatar class="h-20 w-20">
				<AvatarImage :src="values.profilePicture || ''" :alt="values?.username" />
				<AvatarFallback class="bg-zinc-800 text-xl text-white"> {{ getInitials(values?.firstName, values?.lastName) }} </AvatarFallback>
			</Avatar>
			<div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					class="flex items-center gap-2"
					:disabled="isPreparingImage"
					:loading="isPreparingImage"
					loading-label="Preparing..."
					@click="handleButtonClick"
				>
					<Icon name="hugeicons:camera-01" :size="16" />
					Change Avatar
				</Button>
				<p class="mt-2 text-xs text-gray-500">JPG, PNG or WEBP. 1MB max.</p>
				<span v-if="fileDetails" class="text-sm text-gray-500"> {{ fileDetails?.name }} ({{ fileDetails?.size }}) </span>

				<input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleFileChange" />
			</div>
		</div>

		<div class="grid gap-4">
			<AuthFormField
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
				<DialogTitle>Crop Avatar</DialogTitle>
				<DialogDescription>Drag to position your image, then choose Apply to save avatar.</DialogDescription>
			</DialogHeader>

			<div class="space-y-4 py-2">
				<div class="mx-auto h-[280px] w-[280px] overflow-hidden rounded-md border bg-black/5">
					<img
						v-if="cropImageSrc"
						ref="cropImageElement"
						:src="cropImageSrc"
						alt="Avatar crop preview"
						class="select-none"
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
				<Button type="button" :disabled="isPreparingImage" :loading="isPreparingImage" loading-label="Processing image" @click="applyCroppedImage">Apply</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
