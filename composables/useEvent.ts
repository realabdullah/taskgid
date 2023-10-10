import mitt from "mitt";

const emitter = mitt<{
	toast: string;
	profilePic: boolean;
}>();

export const useEvent = emitter.emit;
export const useListen = emitter.on;
