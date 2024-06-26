import Knock from "@knocklabs/client";

export default defineNuxtPlugin(async () => {
	const { user, notifications } = storeToRefs(useStore());

	try {
		const knock = new Knock(import.meta.env.VITE_KNOCK_API_KEY);
		knock.authenticate(user.value.email);

		const feedClient = knock.feeds.initialize(import.meta.env.VITE_KNOCK_CHANNEL_ID);

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
	} catch (error) {}
});
