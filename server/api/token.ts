/* eslint-disable import/no-named-as-default-member */
"use strict";

import jwt from "jsonwebtoken";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const client = serverSupabaseClient(event);

	try {
		const payload = {
			workspace: body.workspace,
			email: body.email,
		};

		const secretKey = process.env.INVITE_TOKEN_SECRET as string;

		const token = jwt.sign(payload, secretKey, { expiresIn: "24h" });

		const { error } = await client.from("invite_tokens").insert([{ token }] as any);
		if (error) throw new Error(error.message);

		return { ok: true, token };
	} catch (error) {
		return { ok: false, token: "" };
	}
});
