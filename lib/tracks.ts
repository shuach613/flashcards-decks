export const DEFAULT_TRACKS = [
  {
    key: "FOUNDATIONS",
    name: "Foundations Track",
    order: 0,
    categoryNames: ["General Basics 1", "General Basics 2", "Connections Basics"],
  },
  {
    key: "CORE_KNOWLEDGE",
    name: "Core Knowledge Track",
    order: 1,
    categoryNames: ["General Basics 1", "General Basics 2", "Safety Basics"],
  },
  {
    key: "APPLIED_KNOWLEDGE",
    name: "Applied Knowledge Track",
    order: 2,
    categoryNames: [
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
