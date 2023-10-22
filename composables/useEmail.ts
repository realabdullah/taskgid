import { render } from "vue-email";
import WelcomeTemplate from "@/templates/Welcome.vue";
import InviteTemplate from "@/templates/Invite.vue";

export const useEmail = () => {
	const sendWelcomeEmail = async (email: string, name: string) => {
		const template = await render(WelcomeTemplate, { name });
		await useFetch("/api/email", {
			method: "POST",
			body: {
				template,
				email,
				subject: "Welcome to ErgoSphere",
			},
		});
	};

	const sendInviteEmail = async (email: string, name: string, token: string) => {
		const template = await render(InviteTemplate, { name, token });
		await useFetch("/api/email", {
			method: "POST",
			body: {
				template,
				email,
				subject: "Welcome to ErgoSphere",
			},
		});
	};

	return { sendWelcomeEmail, sendInviteEmail };
};
