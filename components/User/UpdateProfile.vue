<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { User } from "~/types";

const emits = defineEmits<{
	(e: "close"): void;
}>();

const { user } = storeToRefs(useStore());

const formSchema = toTypedSchema(updateProfileSchema);

const { isFieldDirty, handleSubmit, values, setFieldValue } = useForm({
	validationSchema: formSchema,
	initialValues: {
		firstName: user.value?.firstName,
		lastName: user.value?.lastName,
		username: user.value?.username,
		profilePicture: user.value?.profilePicture,
		about: user.value?.about || "",
		title: user.value?.title || "",
		location: user.value?.location || "",
	},
});

const cancelChanges = () => {
	for (const key in values) {
		if (user.value?.[key as keyof User]) {
			// @ts-ignore
			setFieldValue(key as keyof typeof values, user.value?.[key as keyof User]);
		}
	}
	fileDetails.value = null;
	emits("close");
};

const uploadFile = async (file: File) => {
	try {
		const formData = new FormData();
		formData.append("file", file);

		const result = await $fetch<any>("/api/upload", { method: "POST", body: formData });

		if (result && result.url) return result.url as string;
		else throw new Error("Failed to upload file");
	} catch {
		throw new Error("API did not return a valid URL.");
	}
};

const onSubmit = handleSubmit(async () => {
	try {
		const payload = Object.keys(values).reduce((acc, key) => {
			if (values[key as keyof typeof values] !== user.value?.[key as keyof User]) {
				acc[key as keyof typeof acc] = values[key as keyof typeof values];
			}
			return acc;
		}, {} as Partial<User>);

		if (Object.keys(payload).length === 0) {
			toast("No changes detected");
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
		} = await useApiFetch<{ success: boolean; error?: string; message?: string; user: User }>("/users/profile", {
			method: "PATCH",
			body: { ...payload },
		});
		if (!success || !data) throw new Error(error || message || "Failed to update profile");
		toast(message || "Profile updated successfully");
		user.value = { ...data };
		emits("close");
	} catch (error) {
		toast(String(error));
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

		<slot :cancel="cancelChanges" />
	</form>
</template>
