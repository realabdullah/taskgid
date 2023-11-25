import Pusher from "pusher-js";

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const push = usePush();
	const { userId, workspaces, teams } = storeToRefs(useStore());

	const pusher = new Pusher(config.public.pusherKey, {
		cluster: config.public.pusherCluster,
	});

	const userChannel = pusher.subscribe(`user-${userId.value}`);
	userChannel.bind("workspace-invite", (data: any) => {
		push.info({
			message: `You have been invited to ${data.workspace} by ${data.sender}!`,
			props: {
				type: "accept",
				url: data.url,
			},
		});
	});

	const workspaceChannel = pusher.subscribe(`workspace-${userId.value}`);
	workspaceChannel.bind("workspace-accepted", (data: any) => {
		push.success(`${data.user.firstName} has accepted your invitation to ${data.title}!`);
		const workspaceIndex = workspaces.value.findIndex((w) => w.slug === data.slug);
		if (workspaceIndex !== -1) {
			const payload = {
				email: data.user.email,
				name: data.user.firstName + " " + data.user.lastName,
				profile_picture: data.user.profile_picture,
				username: data.user.username,
			};
			workspaces.value[workspaceIndex].team.push(payload);
			teams.value.push(payload);
		}
	});
});
