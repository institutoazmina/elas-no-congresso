export type ActivityAssessment = "favorable" | "unfavorable" | "unrated" | "";

export type ActivityFilterState = {
    search: string;
    house: string;
    year: string;
    party: string;
    category: string;
    assessment: ActivityAssessment;
    celerity: string;
    movements: "" | "with" | "without";
    gender: string;
    state: string;
    comments: string;
    evaluator: string;
};

export function activityAssessment(value: number): Exclude<ActivityAssessment, ""> {
    if (value > 0) return "favorable";
    if (value < 0) return "unfavorable";
    return "unrated";
}
