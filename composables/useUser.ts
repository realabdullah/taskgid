import { openDB } from "idb";
import bcrypt from 'bcryptjs';

export const useUser = () => {
    const dbPromise = openDB('users', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('usersDB')) {
                db.createObjectStore('usersDB', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('workspacesDB')) {
                db.createObjectStore('workspacesDB', { keyPath: 'id' });
            }
        },
    });

    // register a user
    const addUser = async (user: User) => {
        try {
            const db = await dbPromise;
            db.add('usersDB', user);

            return true;
        } catch (error) {
            console.log("sign up error => ", error);
            return false;
        }
    };

    const userDBtransaction = async () => {
        try {
            const db = await dbPromise;
            const tx = db.transaction('usersDB', 'readonly');
            const store = tx.objectStore('usersDB');
            const users = await store.getAll();
            await tx.done;

            return users;
        } catch (error) {
            console.log("user transaction error => ", error);
        }
    };

    // login a user
    const loginUser = async (email: string, password: string) => {
        try {
            const users = await userDBtransaction() || [];

            return users.find((user: User) => user.email === email && bcrypt.compareSync(password, user.password));
        } catch (error) {
            console.log("login error => ", error);
        }
    };

    const getUser = async (userId: String) => {
        try {
            if (!userId) return null;

            const users = await userDBtransaction() || [];

            return users.find((u: User) => u.id === userId);
        } catch (error) {
            console.log("get user error => ", error);
        }
    };

    // edit a user info
    const editUser = async (user: User) => {
        try {
            const db = await dbPromise;
            const tx = db.transaction('usersDB', 'readwrite');
            const store = tx.objectStore('usersDB');
            await store.put(user);
            await tx.done;
        } catch (error) {
            console.log("edit user error => ", error);
        }
    };

    const addWorkspace = async (workspace: Workspace) => {
        try {
            const db = await dbPromise;
            db.add('workspacesDB', workspace);
            return true;
        } catch (error) {
            console.log("add workspace error => ", error);
            return false;
        }
    };

    const getUserWorkspaces = async (userId: String) => {
        try {
            if (!userId) return null;

            const db = await dbPromise;
            const tx = db.transaction('workspacesDB', 'readonly');
            const store = tx.objectStore('workspacesDB');
            const workspaces = await store.getAll();
            await tx.done;

            return workspaces.filter((w: Workspace) => w.user_id === userId) || [] as Workspace[];
        } catch (error) {
            console.log("get user workspaces error => ", error);
        }
    };

    return { addUser, loginUser, getUser, editUser, addWorkspace, getUserWorkspaces };
};