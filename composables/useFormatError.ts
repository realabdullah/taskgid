export const useFormatError = (message: string) => {
	let errorMsg = "An error occurred while performing this operation. Please try again!";

	const parts = String(message).split("Error: ");
	if (parts.length > 1) errorMsg = parts[1];
	else if (message.includes("Network Error")) errorMsg = "Network Error. Please check your internet connection and try again!";
	else if (message.includes("timeout")) errorMsg = "Request timed out. Please check your internet connection and try again!";

	return errorMsg;
};
