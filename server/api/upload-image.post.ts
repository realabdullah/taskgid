// eslint-disable-next-line import/named
import { v2 as cloudinary } from "cloudinary";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	let data;

	try {
		const apiSecret = process.env.CLOUDINARY_API_SECRET!;

		const timestamp = Math.round(new Date().getTime() / 1000).toString();
		const signature = cloudinary.utils.api_sign_request({ timestamp, folder: body.folder }, apiSecret);

		const url = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

		const formData = new FormData();
		formData.append("file", body.image);
		formData.append("api_key", process.env.CLOUDINARY_API_KEY!);
		formData.append("timestamp", timestamp);
		formData.append("folder", body.folder);
		formData.append("signature", signature);

		const response = await fetch(url, {
			method: "POST",
			body: formData,
		});

		data = await response.json();
		if (data.error) throw new Error(data.error.message);
	} catch (error) {
		data = { error };
	}

	return {
		ok: !data.error,
		response: data.error ? data.error.message : data.secure_url,
	};
});
