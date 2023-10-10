"use strict";

import formData from "form-data";
import Mailgun from "mailgun.js";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	const mailgun = new Mailgun(formData);
	const mg = mailgun.client({
		username: "api",
		key: process.env.MAILGUN_API_KEY!,
	});

	const data = {
		from: `ErgoSphere <${process.env.EMAIL}>`,
		to: body.email,
		subject: body.subject,
		html: body.template,
	};

	await mg.messages.create(process.env.MAILGUN_DOMAIN!, data);
});
