import { toast } from "vue-sonner";

const MAX_IMAGE_BYTES = 1024 * 1024;
const CROP_VIEWPORT_SIZE = 280;
const CROPPED_OUTPUT_SIZE = 640;

const readAsDataUrl = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ""));
		reader.onerror = () => reject(new Error("Unable to read this image. Choose another image and try again."));
		reader.readAsDataURL(file);
	});

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
	new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Unable to process this image. Choose another image and try again."))), type, quality);
	});

const compressCanvas = async (canvas: HTMLCanvasElement) => {
	let quality = 0.92;
	let blob = await canvasToBlob(canvas, "image/webp", quality);
	while (blob.size > MAX_IMAGE_BYTES && quality > 0.5) {
		quality -= 0.08;
		blob = await canvasToBlob(canvas, "image/webp", quality);
	}
	if (blob.size <= MAX_IMAGE_BYTES) return blob;

	quality = 0.9;
	blob = await canvasToBlob(canvas, "image/jpeg", quality);
	while (blob.size > MAX_IMAGE_BYTES && quality > 0.5) {
		quality -= 0.08;
		blob = await canvasToBlob(canvas, "image/jpeg", quality);
	}
	return blob;
};

export const useAvatarCrop = (onPreviewReady: (url: string) => void) => {
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
	const dragStart = reactive({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

	const baseScale = computed(() => (cropNaturalSize.width && cropNaturalSize.height ? Math.max(CROP_VIEWPORT_SIZE / cropNaturalSize.width, CROP_VIEWPORT_SIZE / cropNaturalSize.height) : 1));
	const renderedWidth = computed(() => cropNaturalSize.width * baseScale.value);
	const renderedHeight = computed(() => cropNaturalSize.height * baseScale.value);
	const minOffsetX = computed(() => CROP_VIEWPORT_SIZE - renderedWidth.value * cropState.zoom);
	const minOffsetY = computed(() => CROP_VIEWPORT_SIZE - renderedHeight.value * cropState.zoom);
	const cropImageStyle = computed(() => ({
		width: `${renderedWidth.value}px`,
		height: `${renderedHeight.value}px`,
		transform: `translate(${cropState.offsetX}px, ${cropState.offsetY}px) scale(${cropState.zoom})`,
		transformOrigin: "top left",
	}));

	const clearPreviewUrl = () => {
		if (!currentPreviewUrl.value) return;
		URL.revokeObjectURL(currentPreviewUrl.value);
		currentPreviewUrl.value = null;
	};
	const clampOffsets = () => {
		cropState.offsetX = Math.min(0, Math.max(minOffsetX.value, cropState.offsetX));
		cropState.offsetY = Math.min(0, Math.max(minOffsetY.value, cropState.offsetY));
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
	const stopDragging = () => {
		isCropDragging.value = false;
		window.removeEventListener("pointermove", onCropPointerMove);
		window.removeEventListener("pointerup", stopDragging);
	};
	const onCropPointerMove = (event: PointerEvent) => {
		if (!isCropDragging.value) return;
		cropState.offsetX = dragStart.offsetX + event.clientX - dragStart.x;
		cropState.offsetY = dragStart.offsetY + event.clientY - dragStart.y;
		clampOffsets();
	};
	const onCropPointerDown = (event: PointerEvent) => {
		if (!cropImageElement.value) return;
		event.preventDefault();
		isCropDragging.value = true;
		Object.assign(dragStart, { x: event.clientX, y: event.clientY, offsetX: cropState.offsetX, offsetY: cropState.offsetY });
		window.addEventListener("pointermove", onCropPointerMove);
		window.addEventListener("pointerup", stopDragging);
	};
	const onCropImageLoad = () => {
		if (!cropImageElement.value) return;
		cropNaturalSize.width = cropImageElement.value.naturalWidth;
		cropNaturalSize.height = cropImageElement.value.naturalHeight;
		cropState.zoom = 1;
		cropState.offsetX = (CROP_VIEWPORT_SIZE - renderedWidth.value) / 2;
		cropState.offsetY = (CROP_VIEWPORT_SIZE - renderedHeight.value) / 2;
		clampOffsets();
	};
	const onCropZoomChange = (event: Event) => {
		const zoom = Number((event.target as HTMLInputElement).value);
		if (!Number.isNaN(zoom)) {
			cropState.zoom = zoom;
			clampOffsets();
		}
	};
	const onCropImageError = () => {
		toast.error("Unable to crop this image. Convert it to JPEG or PNG, then try again.");
		resetCropModal();
	};

	const handleButtonClick = () => fileInput.value?.click();
	const handleFileChange = async (event: Event) => {
		isPreparingImage.value = true;
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		input.value = "";
		if (!file) {
			isPreparingImage.value = false;
			return;
		}
		if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
			toast.error("Choose a JPG, PNG, or WebP image.");
			isPreparingImage.value = false;
			return;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			toast.error("Choose an image smaller than 1 MB.");
			isPreparingImage.value = false;
			return;
		}
		try {
			pendingImageFile.value = file;
			cropImageSrc.value = await readAsDataUrl(file);
			isCropModalOpen.value = true;
		} catch (error) {
			toast.error(getServerError(error, "Unable to open this image. Choose another image and try again."));
			resetCropModal();
		} finally {
			isPreparingImage.value = false;
		}
	};

	const applyCroppedImage = async () => {
		if (!cropImageElement.value || !pendingImageFile.value || !cropNaturalSize.width || !cropNaturalSize.height) return;
		try {
			isPreparingImage.value = true;
			const canvas = document.createElement("canvas");
			canvas.width = CROPPED_OUTPUT_SIZE;
			canvas.height = CROPPED_OUTPUT_SIZE;
			const context = canvas.getContext("2d");
			if (!context) throw new Error("Unable to prepare the image editor. Try again.");
			const scale = baseScale.value * cropState.zoom;
			const sourceSize = CROP_VIEWPORT_SIZE / scale;
			const sourceX = Math.min(Math.max(0, -cropState.offsetX / scale), cropNaturalSize.width - sourceSize);
			const sourceY = Math.min(Math.max(0, -cropState.offsetY / scale), cropNaturalSize.height - sourceSize);
			context.drawImage(cropImageElement.value, sourceX, sourceY, sourceSize, sourceSize, 0, 0, CROPPED_OUTPUT_SIZE, CROPPED_OUTPUT_SIZE);

			const blob = await compressCanvas(canvas);
			const extension = blob.type === "image/jpeg" ? "jpg" : "webp";
			const baseName = pendingImageFile.value.name.replace(/\.[^/.]+$/, "");
			const croppedFile = new File([blob], `${baseName}-avatar.${extension}`, { type: blob.type, lastModified: Date.now() });
			clearPreviewUrl();
			const previewUrl = URL.createObjectURL(croppedFile);
			currentPreviewUrl.value = previewUrl;
			selectedFile.value = croppedFile;
			fileDetails.value = { name: croppedFile.name, size: formatFileSize(croppedFile.size) };
			onPreviewReady(previewUrl);
			resetCropModal();
			toast.success("Profile image ready. Save your profile to apply it.");
		} catch (error) {
			toast.error(getServerError(error, "Unable to process your profile image. Choose another image and try again."));
		} finally {
			isPreparingImage.value = false;
		}
	};

	const resetSelection = () => {
		selectedFile.value = null;
		fileDetails.value = null;
		clearPreviewUrl();
		resetCropModal();
	};
	const takeSelectedFile = () => {
		const file = selectedFile.value;
		selectedFile.value = null;
		fileDetails.value = null;
		return file;
	};

	onBeforeUnmount(() => {
		stopDragging();
		clearPreviewUrl();
	});

	return {
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
	};
};
