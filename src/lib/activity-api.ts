import { fetchPublicData } from "./public-data-fetch.ts";

type ActivityAuthor = {
  id: number | null;
  name: string;
  party: string | null;
  state: string | null;
  gender: string | null;
  religion?: string | null;
  photo_url: string | null;
  role: string | null;
};

type ActivityEvent = {
  event_at: string;
  title: string | null;
  description: string | null;
  url: string | null;
  situation: string | null;
  committee_acronym: string | null;
  committee_name: string | null;
  source_house?: string | null;
};

export type ActivityProposition = {
  id: number;
  house: string;
  current_house?: string | null;
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

export type ActivityDashboardRow = {
  key: string;
  label: string;
  favorable: number;
  unfavorable: number;
  photo: string | null;
  meta: string | null;
  favorable_width: number;
  unfavorable_width: number;
  favorable_percent: number | null;
  color: string | null;
};

export type ActivityExplorerResponse = {
  items: ActivityProposition[];
  total: number;
  page: number;
  page_count: number;
  options: Record<string, Array<{ value: string; label: string }>>;
  summary: {
    favorable: number;
    unfavorable: number;
    favorable_share: number;
    active_filter_count: number;
  };
  dashboard: Record<"gender" | "house" | "party" | "author" | "state" | "category" | "status", ActivityDashboardRow[]>;
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
  const response = await fetchPublicData(`${baseUrl.replace(/\/$/, "")}/activity?limit=5000`, signal);
  if (!response.ok) throw new Error(`API respondeu com status ${response.status}`);
  return response.json() as Promise<ActivityProposition[]>;
}

export async function fetchFastUnfavorable(baseUrl: string, signal?: AbortSignal): Promise<ActivityProposition[]> {
  const response = await fetchPublicData(`${baseUrl.replace(/\/$/, "")}/activity/fast-unfavorable`, signal);
  if (!response.ok) throw new Error(`API respondeu com status ${response.status}`);
  return response.json() as Promise<ActivityProposition[]>;
}

export async function fetchSlowFavorable(baseUrl: string, signal?: AbortSignal): Promise<ActivityProposition[]> {
  const response = await fetchPublicData(`${baseUrl.replace(/\/$/, "")}/activity/slow-favorable`, signal);
  if (!response.ok) throw new Error(`API respondeu com status ${response.status}`);
  return response.json() as Promise<ActivityProposition[]>;
}

export async function fetchEnactedProjects(baseUrl: string, signal?: AbortSignal): Promise<EnactedProject[]> {
  const response = await fetchPublicData(`${baseUrl.replace(/\/$/, "")}/activity/enacted-projects?limit=50`, signal);
  if (!response.ok) throw new Error(`API respondeu com status ${response.status}`);
  return response.json() as Promise<EnactedProject[]>;
}
