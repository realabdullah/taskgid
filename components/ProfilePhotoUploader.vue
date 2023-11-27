<script lang="ts" setup>
const { profilePicture } = defineProps<{
	profilePicture: string;
}>();

const { user } = storeToRefs(useStore());
const push = usePush();
const { $axios } = useNuxtApp();
const { uploadImageToCloudinary, readFileAsDataURL } = useImage();
const photoUploaded = ref(false);
const pictureSelected = ref(false);
const uploading = ref(false);
const pictureFile = ref(profilePicture);
const pictureUrl = ref(profilePicture);

const emit = defineEmits<{
	(event: "success", value: string): void;
	(event: "close"): void;
}>();

const uploadProfilePicture = async () => {
	try {
		uploading.value = true;
		const imageUrl = await uploadImageToCloudinary(pictureFile.value, "profile-picture");
		const { data } = await $axios.post<{ success: boolean }>(`/users/update-profile-picture`, {
			profile_picture: imageUrl,
		});
		if (data.success) {
			photoUploaded.value = true;
			pictureUrl.value = imageUrl;
			push.success("Profile picture uploaded successfully.");
			user.value.profile_picture = imageUrl;
		} else throw new Error("An error occurred while uploading your profile picture.");
		uploading.value = false;
		setTimeout(() => {
			emit("close");
		}, 1000);
	} catch (error) {
		uploading.value = false;
		push.error("An error occurred while uploading your profile picture.");
	}
};
const previewImage = async (e: Event) => {
	const file = (e.target as HTMLInputElement)?.files?.[0];

	if (!file) return alert("No file selected.");

	pictureSelected.value = true;
	const result = await readFileAsDataURL(file);
	pictureFile.value = result;
};
</script>

<template>
	<BaseModal width="46rem" @close-modal="$emit('close')">
		<template #default>
			<div class="profile-uploader flex flex-column">
				<h3 class="weight-bold">{{ photoUploaded ? "Profile picture taken" : !!pictureUrl ? "Change your profile picture" : "Upload your profile picture" }}</h3>
				<label class="profile-container block position-relative w-100 cursor-pointer" for="profilePicture">
					<img class="w-100 h-100" :src="pictureFile" alt="photo" />
					<span v-if="!photoUploaded" class="position-absolute block weight-regular col-white text-nowrap">Tap to {{ !!pictureUrl ? "change" : "select" }} picture</span>
					<IconsCheck v-if="photoUploaded" class="uploaded position-absolute" variant="large" />

					<input id="profilePicture" class="none" type="file" accept="image/png, image/jpg, image/jpeg" @change="previewImage" />
				</label>
				<BaseButton v-if="!photoUploaded" usage="button" :value="uploading ? 'loading' : 'Upload Picture'" @click="uploadProfilePicture" />
			</div>
		</template>
	</BaseModal>
</template>

<style lang="scss" scoped>
.profile-uploader {
	padding: 5rem;
	@include gap(2.4rem);

	h3 {
		@include font(2.4rem, 3.2rem);
	}

	.profile-container {
		height: 34rem;
		border-radius: 2.4rem;
		box-shadow: #110c2e26 0 4.8rem 10rem 0;

		.uploaded {
			bottom: -3rem;
			left: 50%;
			transform: translate(-50%, 0);
		}

		img {
			object-fit: cover;
			border: 1.5px solid #e2e2e8;
			border-radius: 2.4rem;
		}

		span {
			left: 50%;
			transform: translate(-50%, 0);
			bottom: 2.2rem;
			max-width: 18.9rem;
			background: #87838361;
			border-radius: 1.2rem;
			padding: 1.2rem;
			@include font(1.6rem, 1.9rem);
		}
	}
}
</style>
