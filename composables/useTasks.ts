import { openDB } from "idb";

export const useTasks = () => {
    const userId = useCookie("user_id") as Ref<string>;

    const dbPromise = openDB('userTasks', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(userId.value)) {
                db.createObjectStore(userId.value, { keyPath: 'id' });
            }
        },
    });

    const fetchUserTasks = async () => {
        try {
            const db = await dbPromise;
            const tx = db.transaction(userId.value, 'readonly');
            const store = tx.objectStore(userId.value);
            const tasks = await store.getAll();
            await tx.done;

            return tasks;
        } catch (error) {
            console.log("fetch user tasks error => ", error);
        }
    };

    const addUserTask = async (task: Task) => {
        try {
            const db = await dbPromise;
            db.add(userId.value, task);
        } catch (error) {
            console.log("add task error => ", error);
        }
    };

    // update a task in the db
    const updateUserTask = async (task: Task) => {
        try {
            const db = await dbPromise;
            const tx = db.transaction(userId.value, 'readwrite');
            const store = tx.objectStore(userId.value);
            await store.put(task);
            await tx.done;
        } catch (error) {
            console.log("update task error => ", error);
        }
    };

    const deleteUserTask = async (task: Task) => {
        try {
            const db = await dbPromise;
            const tx = db.transaction(userId.value, 'readwrite');
            const store = tx.objectStore(userId.value);
            await store.delete(task.id);
            await tx.done;
        } catch (error) {
            console.log("delete task error => ", error);
        }
    };

    return { fetchUserTasks, addUserTask, updateUserTask, deleteUserTask };
};