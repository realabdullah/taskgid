
import { render } from 'vue-email';
import WelcomeTemplate from '~/templates/Welcome.vue';

export const useEmail = () => {
    const sendWelcomeEmail = async (email: string, name: string) => {
        const template = await render(WelcomeTemplate, { name });
        await useFetch('/api/email', {
            method: 'POST',
            body: {
                template,
                email,
                subject: "Welcome to XYZ Task Management ",
            },
        });
    }

    return { sendWelcomeEmail };
};