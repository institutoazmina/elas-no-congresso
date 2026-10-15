import { buildAst, type AlertSelection } from "./ast.ts";

export type DailySubscription = AlertSelection & {
    email: string;
    // The form only submits once the terms are accepted.
    acceptedTerms: true;
};

/** `sent`: the confirmation e-mail is on its way. `rate-limited`: try again in a few minutes. */
export type SubscriptionOutcome = "sent" | "rate-limited";

/** POSTs a daily-alert subscription. Throws when the request fails or the API rejects it. */
export async function requestDailySubscription(
    apiBase: string,
    { email, acceptedTerms, ...selection }: DailySubscription,
    signal: AbortSignal,
): Promise<SubscriptionOutcome> {
    const response = await fetch(`${apiBase}/subscriptions/`, {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            accepted_terms: acceptedTerms,
            alerts: [{ frequency: "daily", ast: buildAst(selection) }],
        }),
    });
    // 429 is either a burst from this device or a confirmation already sent to
    // this address in the last few minutes; both resolve by waiting.
    if (response.status === 429) { return "rate-limited"; }
    if (!response.ok) { throw new Error(`POST /subscriptions/ answered ${response.status}`); }
    return "sent";
}
