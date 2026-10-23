import type { SignupState } from "../../../hooks/useAlertsSignup";

function message(state: SignupState): string {
    switch (state.status) {
        case "idle":
            return "";
        case "sending":
            return "Enviando…";
        case "sent":
            return `Quase lá! Enviamos um e-mail para ${state.email}. Confira sua caixa de entrada e clique no link de confirmação para ativar sua assinatura. Se não encontrar, verifique também a pasta de spam.`;
        case "rate-limited":
            return "Já recebemos um pedido recente para este e-mail ou deste dispositivo. Confira sua caixa de entrada (e o spam) ou tente de novo em alguns minutos.";
        case "failed":
            return "Não conseguimos concluir a inscrição. Tente novamente em alguns minutos.";
    }
}

const tones: Record<SignupState["status"], string> = {
    idle: "",
    sending: "tw:mt-6 tw:bg-[#f4f2f4] tw:text-navy",
    sent: "tw:bg-lime tw:text-ink",
    "rate-limited": "tw:mt-6 tw:bg-[#ffe3e3] tw:text-[#8a1f1f]",
    failed: "tw:mt-6 tw:bg-[#ffe3e3] tw:text-[#8a1f1f]",
};

export default function SignupStatus({ state }: { state: SignupState }) {
    return (
        <p
            className={`tw:w-full tw:px-4 tw:py-3 tw:font-sans tw:text-base tw:leading-5.5 ${tones[state.status]}`}
            role="status"
            aria-live="polite"
            hidden={state.status === "idle"}
        >
            {message(state)}
        </p>
    );
}
