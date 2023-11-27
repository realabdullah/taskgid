export const useImage = () => {
	const readFileAsDataURL = (file: File): Promise<string> => {
		return new Promise<string>((resolve) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				resolve(result);
			};
			reader.readAsDataURL(file);
		});
	};

	const uploadImageToCloudinary = async (image: string, folder: string) => {
		const { data, error } = await useFetch("/api/upload-image", {
			method: "post",
			body: JSON.stringify({ image, folder }),
		});

		const res = data.value as { ok: boolean; response: string };

		if (!res.ok || error.value) throw new Error(res.response);

		return res.response;
	};

	return { readFileAsDataURL, uploadImageToCloudinary };
};
