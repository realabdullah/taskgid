<script lang="ts" setup>
import { useStore } from "@/store/index";

const store = useStore();
const photoUploaded = ref(false);
const pictureSelected = ref(false);
const pictureFile = ref("");
const uploading = ref(false);
const pictureUrl = ref("");

const props = defineProps<{
	profilePicture: string;
}>();
pictureUrl.value = props.profilePicture;

const emit = defineEmits(["close"]);

const uploadProfilePicture = async () => {
	try {
		const userId = useSupabaseUser().value?.id;
		uploading.value = true;
		const { error } = await useSupabaseClient().storage.from("images").upload(`profilePhotos/profile-${userId}.png`, pictureFile.value, {
			upsert: true,
		});

		if (error) throw new Error(error.message);

		pictureUrl.value = useGetPhotoUrl().photoUrl(`profilePhotos/profile-${userId}.png`, "images");
		await useSupabaseClient()
			.from("users")
			.update({ profile_picture: pictureUrl.value } as never)
			.eq("id", userId);
		store.profilePhoto = pictureUrl.value;
		uploading.value = false;
		photoUploaded.value = true;

		setTimeout(() => {
			emit("close");
		}, 3000);
	} catch (error) {
		uploading.value = false;
	}
};
const previewImage = (e: any) => {
	const file = e.target.files[0];
	const reader = new FileReader();

	reader.onload = (e) => {
		pictureUrl.value = e.target.result as string;
		pictureSelected.value = true;
	};

	reader.readAsDataURL(file);
	pictureFile.value = file;
};
</script>

<template>
	<BaseModal width="460px" @close-modal="$emit('close')">
		<template #default>
			<div class="profile-uploader">
				<h3 class="fw-bold">{{ photoUploaded ? "Profile picture taken" : !!pictureUrl ? "Change your profile picture" : "Upload your profile picture" }}</h3>
				<label class="profile-container d-block pos-relative w-100 cursor-pointer" for="profilePicture">
					<img class="w-100 h-100" :src="pictureUrl || 'https://i.ibb.co/kBGCJnQ/Group-67.png'" alt="photo" />
					<span v-if="!photoUploaded" class="pos-absolute d-block fw-regular col-white text-nowrap">Tap to {{ !!pictureUrl ? "change" : "select" }} picture</span>
					<IconsCheck v-if="photoUploaded" class="uploaded pos-absolute" variant="large" />

					<input id="profilePicture" class="d-none" type="file" accept="image/png, image/jpg, image/jpeg" @change="previewImage" />
				</label>
				<BaseButton
					v-if="!photoUploaded"
					width="100%"
					:value="uploading ? 'loading' : 'Upload Picture'"
					background="#3754DB"
					color="#FFFFFF"
					:disabled="!pictureSelected"
					@click="uploadProfilePicture" />
			</div>
		</template>
	</BaseModal>
</template>

<style lang="scss" scoped>
.profile-uploader {
	padding: 5rem;

	h3 {
		@include font(2.4rem, 3.2rem);
	}

	.profile-container {
		margin-top: 5rem;
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
