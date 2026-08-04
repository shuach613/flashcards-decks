import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_TRACKS, isTrackKey } from "../lib/tracks.ts";

const certificatesByTrack = new Map(
  DEFAULT_TRACKS.map((track) => [track.key, [...track.certificateNames]])
);

test("IT Support exposes only its three certificate categories", () => {
  assert.deepEqual(certificatesByTrack.get("IT_SUPPORT"), [
    "A+ Core 1",
    "A+ Core 2",
    "Network+",
  ]);
});

test("Cybersecurity exposes Security+ but not Network+", () => {
  assert.deepEqual(certificatesByTrack.get("CYBERSECURITY"), [
    "A+ Core 1",
    "A+ Core 2",
    "Security+",
  ]);
});

test("AI Cybersecurity adds SecAI+ to the cybersecurity categories", () => {
  assert.deepEqual(certificatesByTrack.get("AI_CYBERSECURITY"), [
    "A+ Core 1",
    "A+ Core 2",
    "Security+",
    "SecAI+",
  ]);
});

test("only the predefined track keys are accepted", () => {
  assert.equal(isTrackKey("IT_SUPPORT"), true);
  assert.equal(isTrackKey("CYBERSECURITY"), true);
  assert.equal(isTrackKey("AI_CYBERSECURITY"), true);
  assert.equal(isTrackKey("NETWORK_PLUS"), false);
  assert.equal(isTrackKey(""), false);
});
