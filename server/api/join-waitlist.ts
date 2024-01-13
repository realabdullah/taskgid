export default defineEventHandler(async (event) => {
    const { email } = await readBody(event);
    let status: "success" | "fail" | "exists" | null = null;

    try {
        const url = process.env.API_URL;

        const response = await fetch(`${url}/join-waitlist`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();

        if (data?.error === "Email already on the waitlist.") status = "exists"
        else status = data.success ? "success" : "fail";
    } catch (error) { status = "fail" }

    return { status };
});