export const DEFAULT_TRACKS = [
  {
    key: "IT_SUPPORT",
    name: "Foundations Track",
    order: 0,
    certificateNames: ["General Basics 1", "General Basics 2", "Connections Basics"],
  },
  {
    key: "CYBERSECURITY",
    name: "Core Knowledge Track",
    order: 1,
    certificateNames: ["General Basics 1", "General Basics 2", "Safety Basics"],
  },
  {
    key: "AI_CYBERSECURITY",
    name: "Applied Knowledge Track",
    order: 2,
    certificateNames: [
      "General Basics 1",
      "General Basics 2",
      "Safety Basics",
      "Applied Concepts",
    ],
  },
] as const;

export type TrackKey = (typeof DEFAULT_TRACKS)[number]["key"];

export function isTrackKey(value: string): value is TrackKey {
  return DEFAULT_TRACKS.some((track) => track.key === value);
}
