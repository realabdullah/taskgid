export const useGetPhotoUrl = () => {
	const client = useSupabaseClient();

	const photoUrl = (path: string, bucket: string) => {
		const { data } = client.storage.from(bucket).getPublicUrl(path);

		return data.publicUrl;
	};

	return { photoUrl };
};
