export type ActivityAssessment = "favorable" | "unfavorable" | "unrated" | "";

export function activityAssessment(value: number): Exclude<ActivityAssessment, ""> {
    if (value > 0) return "favorable";
    if (value < 0) return "unfavorable";
    return "unrated";
}
