import { useCallback, useEffect, useRef, useState } from "react";
import { clientApiBase } from "../lib/client-api";
import { requestDailySubscription, type DailySubscription } from "../lib/alerts/subscription";

export type SignupState =
    | { status: "idle" }
    | { status: "sending" }
    | { status: "sent"; email: string }
    | { status: "rate-limited" }
    | { status: "failed" };

/**
 * Sends a daily-alert subscription, one request at a time. The request is
 * aborted on unmount; ``reset`` clears a finished attempt.
 */
export function useAlertsSignup() {
    const [state, setState] = useState<SignupState>({ status: "idle" });
    const requestRef = useRef<AbortController | null>(null);
    useEffect(() => () => requestRef.current?.abort(), []);

    const submit = useCallback(async (subscription: DailySubscription) => {
        if (requestRef.current) { return; }
        const controller = new AbortController();
        requestRef.current = controller;
        setState({ status: "sending" });
        try {
            const outcome = await requestDailySubscription(clientApiBase(), subscription, controller.signal);
            setState(outcome === "sent" ? { status: "sent", email: subscription.email } : { status: outcome });
        } catch {
            if (!controller.signal.aborted) { setState({ status: "failed" }); }
        } finally {
            requestRef.current = null;
        }
    }, []);

    const reset = useCallback(() => setState({ status: "idle" }), []);

    return { state, submit, reset };
}
