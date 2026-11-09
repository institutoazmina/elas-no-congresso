import { useState } from "react";
import type { ActivityProposition } from "../../lib/activity-api";
import { Image } from "../shared/react-utils";
import thumbsUp from "../../assets/images/activity/thumbs-up.svg";
import thumbsDown from "../../assets/images/activity/thumbs-down.svg";
import arrowBack from "../../assets/images/parliamentarians/arrow-back.svg";
import arrowForward from "../../assets/images/parliamentarians/arrow-forward.svg";

export default function AssessmentCarousel({ activity }: { activity: ActivityProposition }) {
    const [active, setActive] = useState(0);
    // Keep the page usable while a previous API version is still cached.
    const assessments = activity.assessments ?? (
        activity.assessment_organization || activity.assessment_comments || activity.is_favorable !== null
            ? [{ organization: activity.assessment_organization || "Indisponível", comments: activity.assessment_comments, is_favorable: activity.is_favorable }]
            : []
    );

    if (!assessments.length) return <p className="tw:text-muted tw:text-lg">Sem avaliação</p>;

    return (
        <div role="region" aria-roledescription="carrossel" aria-label="Avaliações da proposição" data-assessment-carousel>
            <div aria-live="polite" aria-atomic="true">
                {assessments.map((assessment, index) => (
                    <div key={index} hidden={index !== active} role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${assessments.length}: ${assessment.organization}`}>
                        <div className="proposition-assessment__value tw:flex tw:min-h-8 tw:items-center tw:gap-2 tw:text-ink">
                            {assessment.is_favorable !== null && <Image src={assessment.is_favorable ? thumbsUp : thumbsDown} alt="" width={32} height={32} />}
                            <strong className="tw:font-display tw:text-lg tw:font-bold tw:leading-6 tw:uppercase">
                                {assessment.is_favorable === true ? "Favorável" : assessment.is_favorable === false ? "Desfavorável" : "Sem avaliação"}
                            </strong>
                        </div>
                        <p className="proposition-assessment__comment tw:text-ink tw:text-lg tw:leading-6 tw:mt-4 tw:mb-0 tw:whitespace-pre-line tw:break-words">
                            {assessment.comments?.trim() ? `“${assessment.comments}”` : "Comentário não informado."}
                        </p>
                        <p className="proposition-assessment__evaluator tw:text-ink tw:text-lg tw:leading-6 tw:mt-4 tw:mb-0 tw:break-words">
                            <strong>{assessment.organization?.trim() || "Indisponível"}</strong>
                        </p>
                    </div>
                ))}
            </div>
            {assessments.length > 1 && <div className="tw:mt-6 tw:flex tw:items-center tw:gap-3">
                <button type="button" aria-label="Avaliação anterior" onClick={() => setActive((active + assessments.length - 1) % assessments.length)} className="tw:flex tw:w-11 tw:h-11 tw:items-center tw:justify-center tw:border-2 tw:border-accent tw:bg-white tw:text-accent tw:cursor-pointer tw:hover:bg-[#eeeeff] tw:focus-visible:outline-2 tw:focus-visible:outline-ink tw:focus-visible:outline-offset-2">
                    <Image src={arrowBack} alt="" width={24} height={24} />
                </button>
                <span className="tw:text-ink tw:text-sm tw:tabular-nums" aria-hidden="true">{active + 1} de {assessments.length}</span>
                <button type="button" aria-label="Próxima avaliação" onClick={() => setActive((active + 1) % assessments.length)} className="tw:flex tw:w-11 tw:h-11 tw:items-center tw:justify-center tw:border-2 tw:border-accent tw:bg-white tw:text-accent tw:cursor-pointer tw:hover:bg-[#eeeeff] tw:focus-visible:outline-2 tw:focus-visible:outline-ink tw:focus-visible:outline-offset-2">
                    <Image src={arrowForward} alt="" width={24} height={24} />
                </button>
            </div>}
        </div>
    );
}
