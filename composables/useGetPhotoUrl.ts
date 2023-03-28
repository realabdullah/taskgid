export const useGetPhotoUrl = () => {
    const client = useSupabaseClient();

    const photoUrl = (path: string, bucket: string) => {
        try {
            const { data } = client.storage
                .from(bucket)
                .getPublicUrl(path);

            return data.publicUrl;
        } catch (error) {
            throw error;
        }
    }

    return { photoUrl };
};