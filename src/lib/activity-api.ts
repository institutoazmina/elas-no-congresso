export type ActivityAuthor = {
  id: number | null;
  name: string;
  party: string | null;
  state: string | null;
  gender: string | null;
  photo_url: string | null;
  role: string | null;
};

export type ActivityEvent = {
  event_at: string;
  title: string | null;
  description: string | null;
  url: string | null;
  situation: string | null;
  committee_acronym: string | null;
  committee_name: string | null;
};

export type ActivityProposition = {
  id: number;
  house: string;
  number_label: string;
  ementa: string;
  presented_at: string;
  current_status: string | null;
  tramitation_url: string | null;
  category: string | null;
  category_label?: string | null;
  themes?: string[];
  is_favorable: boolean | null;
  assessment_organization: string | null;
  assessment_comments: string | null;
  relevance: string | null;
  authors: ActivityAuthor[];
  celerity: {
    label: string;
    days_without_movement: number;
    movements_last_90_days: number;
    last_event_at?: string | null;
  };
  events: ActivityEvent[];
};

export type EnactedProject = ActivityProposition & {
  assessment_label: "favorável" | "desfavorável";
  enactment: {
    status_code: number;
    status: string;
    law_label: string;
    law_type: string;
    law_number: number;
    law_year: number;
    enacted_at: string;
  };
};

export async function fetchActivity(baseUrl: string, signal?: AbortSignal): Promise<ActivityProposition[]> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/activity?limit=5000`, { signal });
  if (!response.ok) throw new Error(`API respondeu com status ${response.status}`);
  return response.json() as Promise<ActivityProposition[]>;
}

export async function fetchFastUnfavorable(baseUrl: string, signal?: AbortSignal): Promise<ActivityProposition[]> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/activity/fast-unfavorable`, { signal });
  if (!response.ok) throw new Error(`API respondeu com status ${response.status}`);
  return response.json() as Promise<ActivityProposition[]>;
}

export async function fetchSlowFavorable(baseUrl: string, signal?: AbortSignal): Promise<ActivityProposition[]> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/activity/slow-favorable`, { signal });
  if (!response.ok) throw new Error(`API respondeu com status ${response.status}`);
  return response.json() as Promise<ActivityProposition[]>;
}

export async function fetchEnactedProjects(baseUrl: string, signal?: AbortSignal): Promise<EnactedProject[]> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/activity/enacted-projects?limit=50`, { signal });
  if (!response.ok) throw new Error(`API respondeu com status ${response.status}`);
  return response.json() as Promise<EnactedProject[]>;
}
