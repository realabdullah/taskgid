<script lang="ts" setup>
const envKeys = useRuntimeConfig();
const { getUser, editUser } = useUser();
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
        uploading.value = true;
        const uploadUrl = envKeys.public.imageUploadUrl;
        const apiKey = envKeys.public. imageUploadKey;
        const formData = new FormData();
        formData.append("image", pictureFile.value);
        formData.append("key", apiKey);

        const response = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log(data);
        if (data.status === 200 && data.success) {
            pictureUrl.value = data.data.url;
            store.profilePhoto = data.data.url;

            // update user in db
            const userId = useCookie("user_id") as Ref<string>;
            const user: User = await getUser(userId.value);
            user.profile_picture = data.data.url;
            await editUser(user);

            uploading.value = false;
            photoUploaded.value = true;

            setTimeout(() => {
                emit("close");
            }, 3000);
        } else {
            uploading.value = false;
        }    
    } catch {
        uploading.value = false;
    }
};

const previewImage = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        pictureUrl.value = e?.target.result as string;
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
                <h3>{{ photoUploaded ? "Profile picture taken" : !!pictureUrl ? "Change your profile picture" : "Upload your profile picture" }}</h3>
                <label class="profile-container" for="profilePicture">
                    <img :src="pictureUrl" alt="photo">
                    <span v-if="!photoUploaded">Tap to {{ !!pictureUrl ? "change" : "select" }} picture</span>
                    <IconsCheck v-if="photoUploaded" class="uploaded" variant="large" />

                    <input id="profilePicture" type="file" accept="image/png, image/jpg, image/jpeg" @change="previewImage" />
                </label>
                <BaseButton v-if="!photoUploaded" width="100%" :value="uploading ? 'loading' : 'Upload Picture'" background="#3754DB" color="#FFFFFF" :disabled="!pictureSelected" @click="uploadProfilePicture" />
            </div>
        </template>
    </BaseModal>
</template>

<style lang="scss" scoped>
.profile-uploader {
    padding: 50px;

    h3 {
        font-weight: 700;
        font-size: 24px;
        line-height: 32px;
    }

    .profile-container {
        display: block;
        margin-top: 50px;
        position: relative;
        width: 100%;
        height: 340px;
        border-radius: 24px;
        cursor: pointer;
        box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;

        .uploaded {
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translate(-50%, 0);
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 24px;
        }

        span {
            position: absolute;
            left: 50%;
            transform: translate(-50%, 0);
            bottom: 22px;
            display: block;
            max-width: 189px;
            background: #87838361;
            border-radius: 12px;
            padding: 12px;
            font-weight: 400;
            font-size: 16px;
            line-height: 19px;
            color: #FFFFFF;
            white-space: nowrap;
        }

        input[type="file"] {
            display: none;
        }
    }

    button {
        margin-top: 40px;
        width: 100%;
        background: #3754DB;
        border: none;
        border-radius: 12px;
        padding: 20px;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: #FFFFFF;

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
}
</style>
