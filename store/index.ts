import { defineStore } from "pinia";

export const useStore = defineStore("store", () => {
    const { fetchUserTasks } = useTasks();
    
    const user = ref({} as User);
    const profilePhoto = ref("");
    const tasks = ref<Task[]>([]);

    const setUser = (newUser: any) => {
        user.value = newUser;
        profilePhoto.value = newUser.profile_picture;
    }

    const fetchTasks = async () => {
        tasks.value = await fetchUserTasks();
    };

    return {
        user,
        profilePhoto,
        tasks,
        setUser,
        fetchTasks,
    }
});