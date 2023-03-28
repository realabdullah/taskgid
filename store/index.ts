import { defineStore } from "pinia";

export const useStore = defineStore("store", () => {
    const user = ref(null);
    const profilePhoto = ref("");
    const tasks = ref([]);

    const setUser = (newUser: any) => {
        user.value = newUser;
        profilePhoto.value = newUser.profile_picture;
    }

    const fetchUserTasks = async () => {
        tasks.value = await useTasks().fetchUserTasks();
    };

    return {
        user,
        setUser,
        profilePhoto,
        fetchUserTasks,
        tasks,
    }
});