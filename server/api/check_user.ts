"use strict";

import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const client = serverSupabaseClient(event);

	let userExists = false;
	try {
		const { data, error } = await client.from("users_email").select("*").eq("email", body.email);

		if (error) throw new Error(error.message);

		if (data.length > 0) userExists = true;
		return { userExists };
	} catch (error) {
		return { userExists };
	}
});
