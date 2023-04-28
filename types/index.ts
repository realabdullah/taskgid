interface Task {
    id: string;
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
}