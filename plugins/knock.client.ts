import Knock from "@knocklabs/client";

export default defineNuxtPlugin(async () => {
	const config = useRuntimeConfig();
	const { user, notifications } = storeToRefs(useStore());

	const knock = new Knock(config.public.knockKey);
	knock.authenticate(user.value.email);

	const feedClient = knock.feeds.initialize(config.public.knockChannelId);

	feedClient.listenForUpdates();

	const { data }: any = await feedClient.fetch({
		status: "all",
	});

	notifications.value = data.entries.map((entry: any) => {
		return {
			id: entry.id,
			message: entry.blocks[0].rendered,
			date: entry.inserted_at,
			read: entry.read_at !== null,
		};
	});

	feedClient.on("items.received.*", ({ items }: any) => {
		notifications.value = items.map((entry: any) => {
			return {
				id: entry.id,
				message: entry.blocks[0].rendered,
				date: entry.inserted_at,
				read: entry.read_at !== null,
			};
		});
	});
});
