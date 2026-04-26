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

const isSaving = ref(false);
const justSaved = ref(false);
let savedTimeout: ReturnType<typeof setTimeout> | null = null;

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
	fileDetails.value = null;
	selectedFile.value = null;
	justSaved.value = false;
	emits("close");
};

const uploadFile = async (file: File) => {
	try {
		const formData = new FormData();
		formData.append("file", file);

		const result = await $fetch<any>("/api/upload", { method: "POST", body: formData });
		if (result && result.url) return result.url as string;
		else throw new Error("Failed to upload file");
	} catch (error) {
		throw new Error(error as string);
	}
};

const onSubmit = handleSubmit(async () => {
	try {
		isSaving.value = true;
		const payload = Object.keys(values).reduce((acc, key) => {
			if (values[key as keyof typeof values] !== user.value?.[key as keyof User]) {
				acc[key as keyof typeof acc] = values[key as keyof typeof values] as any;
			}
			return acc;
		}, {} as Partial<User>);

		if (Object.keys(payload).length === 0) {
			isSaving.value = false;
			return;
		}

		if (selectedFile.value) {
			const fileUrl = await uploadFile(selectedFile.value);
			payload.profilePicture = fileUrl;
			setFieldValue("profilePicture", fileUrl);
			selectedFile.value = null;
			fileDetails.value = null;
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
		toast(String(error));
	} finally {
		isSaving.value = false;
	}
});

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const fileDetails = ref<{ name: string; size: string } | null>(null);

const handleButtonClick = () => {
	if (fileInput.value) fileInput.value.click();
};

const handleFileChange = async (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (!target.files?.length) return;

	const file = target.files[0];
	if (!file) return;

	if (file.size > 1024 * 1024) {
		toast("Please upload a file smaller than 1MB.");
		target.value = "";
		return;
	}

	if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
		toast("Please upload a JPG, PNG or WEBP file.");
		target.value = "";
		return;
	}

	fileDetails.value = {
		name: file.name,
		size: formatFileSize(file.size),
	};

	selectedFile.value = file;
	const objectUrl = URL.createObjectURL(file);
	setFieldValue("profilePicture", objectUrl);
};

watch(
	() => user.value,
	(nextUser) => {
		if (!nextUser) {
			return;
		}
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
				<Button type="button" variant="outline" size="sm" class="flex items-center gap-2" @click="handleButtonClick">
					<Icon name="hugeicons:camera-01" :size="16" />
					Change Avatar
				</Button>
				<p class="mt-2 text-xs text-gray-500">JPG or PNG. 1MB max.</p>
				<span v-if="fileDetails" class="text-sm text-gray-500"> {{ fileDetails?.name }} ({{ fileDetails?.size }}) </span>

				<input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
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
</template>
