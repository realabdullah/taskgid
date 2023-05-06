import { defineStore } from "pinia";

export const useStore = defineStore("store", () => {
    const { fetchUserTasks } = useTasks();
    
    const user = ref({} as User);
    const profilePhoto = ref("");
    const tasks = ref<Task[]>();

    const setUser = (newUser: User) => {
        user.value = newUser;
        profilePhoto.value = newUser.profile_picture;
    }

    const fetchTasks = async () => {
        tasks.value = await fetchUserTasks();
    };

    const fetchUserInfo = async () => {
        try {
            const { data, error } = await useSupabaseClient()
                .from("users_info")
                .select("*")
                .eq("id", useSupabaseUser().value?.id);
    
            if (error) throw error;
            setUser(data[0]);
        } catch { }
    };

    return {
        user,
        profilePhoto,
        tasks,
        setUser,
        fetchTasks,
        fetchUserInfo,
    }
});