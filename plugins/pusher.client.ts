// /* eslint-disable @typescript-eslint/no-explicit-any */
// import Pusher from "pusher-js";
// // import { toast } from "vue-sonner";
// // import { useQueryClient } from "@tanstack/vue-query";

// export default defineNuxtPlugin(() => {
// 	const authToken = useCookie("TG-AUTHTOKEN");
// 	const authStore = useStore();
// 	const pusherKey = import.meta.env.VITE_PUSHER_KEY;
// 	const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;
// 	const baseUrl = import.meta.env.VITE_API_URL;

// 	watchOnce(
// 		() => authStore.user?.id,
// 		(userId) => {
// 			console.log(pusherKey, pusherCluster);

// 			const pusher = new Pusher(pusherKey, {
// 				cluster: pusherCluster,
// 				authEndpoint: baseUrl + "/api/pusher/auth",
// 				auth: { headers: { Authorization: `Bearer ${authToken.value}` } },
// 			});

// 			const channel = pusher.subscribe(`private-user-${userId}`);

// 			channel.bind_global((eventName: string, data: any) => {
// 				// const queryClient = useQueryClient();
// 				console.log(eventName, data);
// 				// if (eventName === "notification") {
// 				// 	toast.success(data.message ?? "🔔 New notification");
// 				// 	queryClient.invalidateQueries({ queryKey: ["notifications"] });
// 				// }
// 			});
// 		}
// 	);
// });
