import mitt from "mitt";

const emitter = mitt();

export const useEvent = () => {
    // Emit an event
    const emit = (event: string, data: any) => {
        emitter.emit(event, data);
    };

    // Listen to an event
    const on = (event: string, handler: (data: any) => void) => {
        emitter.on(event, handler);
    };

    return { emit, on };
};