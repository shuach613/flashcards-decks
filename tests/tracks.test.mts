import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_TRACKS, isTrackKey } from "../lib/tracks.ts";

const certificatesByTrack = new Map(
  DEFAULT_TRACKS.map((track) => [track.key, [...track.certificateNames]])
);

test("the foundations track exposes its three certificate categories", () => {
  assert.deepEqual(certificatesByTrack.get("IT_SUPPORT"), [
    "General Basics 1",
    "General Basics 2",
    "Connections Basics",
  ]);
});

test("the core knowledge track exposes safety basics", () => {
  assert.deepEqual(certificatesByTrack.get("CYBERSECURITY"), [
    "General Basics 1",
    "General Basics 2",
    "Safety Basics",
  ]);
});

test("the applied knowledge track adds applied concepts", () => {
  assert.deepEqual(certificatesByTrack.get("AI_CYBERSECURITY"), [
    "General Basics 1",
    "General Basics 2",
    "Safety Basics",
    "Applied Concepts",
  ]);
});

test("only the predefined track keys are accepted", () => {
  assert.equal(isTrackKey("IT_SUPPORT"), true);
  assert.equal(isTrackKey("CYBERSECURITY"), true);
  assert.equal(isTrackKey("AI_CYBERSECURITY"), true);
  assert.equal(isTrackKey("NETWORK_PLUS"), false);
  assert.equal(isTrackKey(""), false);
});
