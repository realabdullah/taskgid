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

            const workspaceId = useCookie("workspaceId") as Ref<string>;

            return tasks.filter((task: Task) => task.workspace_id === workspaceId.value) || [];
        } catch (error) {
            console.log("fetch user tasks error => ", error);
        }
    };

    // fecth a task from the db
    const fetchUserTask = async (taskId: string) => {
        try {
            let task: Task = {} as Task;
            const db = await dbPromise;
            const tx = db.transaction(userId.value, 'readonly');
            const store = tx.objectStore(userId.value);
            task = await store.get(taskId);
            await tx.done;
            return task || {} as Task;
        } catch (error) {
            console.log("fetch user task error => ", error);
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

            return true;
        } catch (error) {
            console.log("update task error => ", error);
            return false;
        }
    };

    const deleteUserTask = async (id: string) => {
        try {
            const db = await dbPromise;
            const tx = db.transaction(userId.value, 'readwrite');
            const store = tx.objectStore(userId.value);
            await store.delete(id);
            await tx.done;

            return true;
        } catch (error) {
            console.log("delete task error => ", error);
            return false;
        }
    };

    return { fetchUserTasks, fetchUserTask, addUserTask, updateUserTask, deleteUserTask };
};