/* eslint-disable import/no-named-as-default-member */
"use strict";

import jwt from "jsonwebtoken";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const client = serverSupabaseClient(event);

	const token = body.token;
	const secret = process.env.INVITE_TOKEN_SECRET as string;

	try {
		const decoded = jwt.verify(token, secret) as { workspace: string; email: string };

		if (!decoded) throw new Error("Invalid token!");

		const { data, error } = await client.from("invite_tokens").select("token").eq("token", body.token);

		if (data?.length === 0 || error) throw new Error(error?.message);

		return {
			ok: true,
			workspace: decoded.workspace,
			email: decoded.email,
		};
	} catch {
		return {
			ok: false,
			workspace: "",
			email: "",
		};
	}
});
