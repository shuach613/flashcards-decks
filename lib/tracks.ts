export const DEFAULT_TRACKS = [
  {
    key: "IT_SUPPORT",
    name: "IT Support",
    order: 0,
    certificateNames: ["A+ Core 1", "A+ Core 2", "Network+"],
  },
  {
    key: "CYBERSECURITY",
    name: "Cybersecurity",
    order: 1,
    certificateNames: ["A+ Core 1", "A+ Core 2", "Security+"],
  },
  {
    key: "AI_CYBERSECURITY",
    name: "AI Cybersecurity",
    order: 2,
    certificateNames: ["A+ Core 1", "A+ Core 2", "Security+", "SecAI+"],
  },
] as const;

export type TrackKey = (typeof DEFAULT_TRACKS)[number]["key"];

export function isTrackKey(value: string): value is TrackKey {
  return DEFAULT_TRACKS.some((track) => track.key === value);
}
