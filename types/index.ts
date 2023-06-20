interface Task {
    id: string;
    workspace_id: string;
    user_id: string;
    title: string;
    description: string;
    priority: string;
    dateAdded: string;
    dueDate: string;
    status: string;
    task_no: number;
}

interface User {
    id: string;
    name: string;
    email: string;
    profile_picture: string;
    username: string;
    password: string;
}

interface Toast {
    toastStyle: string;
    type: string;
    message: string;
    description: string;
}

interface Workspace {
    id: string;
    user_id: string;
    created_at: string;
    title: string;
    description: string;
    dispay_picture: string;
}