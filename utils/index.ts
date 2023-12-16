export const formatError = (error: any) => {
	const errorCode = error?.response?.status || 500;
	let errorMessage = "";

	switch (errorCode) {
		case 400:
			errorMessage = "We regret to inform you that our server is currently experiencing technical difficulties. Please kindly retry your request at a later time.";
			break;
		case 401:
			errorMessage = "Oops, you've reached the fun zone, but this one's members-only! 🎉🚫";
			break;
		case 404:
			errorMessage = "Regrettably, our digital expedition has taken an unexpected turn, and we find ourselves in uncharted territory!";
			break;
		case 500:
			errorMessage = "We regret to inform you that our server is currently experiencing technical difficulties. Please kindly retry your request at a later time.";
			break;
		case 502:
			errorMessage = "Our servers are currently in a reflective mood and taking a bit longer to respond. Kindly consider trying your request again later.";
			break;
		case 503:
			errorMessage = "We regret to inform you that our server is temporarily unavailable. Please accept our apologies and consider reattempting your request later.";
			break;
		case 504:
			errorMessage = "Our servers are currently in a reflective mood and taking a bit longer to respond. Kindly consider trying your request again later.";
			break;
		default:
			errorMessage = "We regret to inform you that our server is currently experiencing technical difficulties. Please kindly retry your request at a later time.";
			break;
	}

	return {
		code: errorCode,
		message: errorMessage,
	};
};

export const formatDate = (value: any) => {
	const date = new Date(value);
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const month = date.getMonth();
	const year = date.getFullYear();
	const day = date.getDate();

	const dt = `${months[month]} ${day}, ${year}`;

	return dt === "undefined NaN, NaN" ? "" : dt;
};
