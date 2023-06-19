import { defineStore } from "pinia";

export const useStore = defineStore("store", () => {
    const { fetchUserTasks } = useTasks();
    const { getUser } = useUser();
    
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
            const userId = useCookie("user_id") as Ref<string>;
            const user = await getUser(userId.value);
            setUser(user);
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