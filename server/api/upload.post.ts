/* eslint-disable @typescript-eslint/no-explicit-any */
import { Readable } from "stream";
import { defineEventHandler, readMultipartFormData } from "h3";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.VITE_CLOUDINARY_API_KEY,
	api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
	secure: true,
});

async function uploadToCloudinary(buffer: Buffer, options = {}): Promise<any> {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(options, (error: any, result: any) => {
			if (error) return reject(new Error("Failed to upload file to Cloudinary."));
			resolve(result);
		});

		const readableStream = new Readable();
		readableStream.push(buffer);
		readableStream.push(null);
		readableStream.pipe(uploadStream);
	});
}

export default defineEventHandler(async (event) => {
	try {
		if (!process.env.VITE_CLOUDINARY_CLOUD_NAME || !process.env.VITE_CLOUDINARY_API_KEY || !process.env.VITE_CLOUDINARY_API_SECRET) {
			throw createError({ statusCode: 500, statusMessage: "Server Error: Cloudinary configuration is missing." });
		}

		const formData = await readMultipartFormData(event);
		const fileData = formData?.find((item) => item.name === "file");

		if (!fileData || !fileData.data || fileData.data.length === 0) {
			throw createError({ statusCode: 400, statusMessage: "Bad Request: No file found in the request or file is empty." });
		}

		const fileBuffer = fileData.data;
		const uploadOptions = { folder: "taskgid_uploads", resource_type: "auto" as const };
		const uploadResult = await uploadToCloudinary(fileBuffer, uploadOptions);

		if (!uploadResult?.secure_url) {
			throw createError({ statusCode: 500, statusMessage: "Server Error: Cloudinary did not return a secure URL." });
		}

		return { url: uploadResult.secure_url };
	} catch (error: any) {
		if (error.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage: `Server Error: ${error.message || "An unexpected error occurred."}`,
		});
	}
});
