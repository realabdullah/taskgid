export const useTasks = () => {
    const client = useSupabaseClient();
    const user = useSupabaseUser();

    const fetchUserTasks = async () => {
        try {
            const { data, error } = await client
                .from("tasks")
                .select("*")
                .eq("user_id", user.value?.id);
    
            if (error) throw error;

            return data as Task[];
        } catch (error) {
            console.log(error);
        }
    };

    return { fetchUserTasks };
};