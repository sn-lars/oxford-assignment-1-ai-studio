export interface AgendaItem {
  time: string;
  topic: string;
  duration: string;
  notes: string;
}

export interface ParticipantBio {
  name: string;
  role: string;
  background: string;
  strategic_guidance: string;
}

export interface KeyMetric {
  metric: string;
  value: string;
  source: string;
  context: string;
}

export interface BriefingData {
  meeting_summary: string;
  risks: string[];
  key_talking_points: string[];
  next_steps: string[];
  cover_image_prompt: string;
  meeting_agenda: AgendaItem[];
  participant_bios: ParticipantBio[];
  historical_context: string;
  key_metrics: KeyMetric[];
}

export interface BriefingFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  content: string;
  status: "Processed" | "Scanned";
}

export interface BriefingPackage {
  id: string;
  title: string;
  time: string;
  notes: string;
  files: BriefingFile[];
}
