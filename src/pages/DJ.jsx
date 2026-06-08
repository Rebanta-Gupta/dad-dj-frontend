import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../services/api.js";

const MOODS = [
  {
    id: "nostalgia",
    label: "Nostalgia",
    emoji: "🌅",
    description: "Warm, memory-triggering tracks",
  },
  {
    id: "vibe_boost",
    label: "Vibe Boost",
    emoji: "🔥",
    description: "High-energy feel-good bangers",
  },
  {
    id: "emotional_close",
    label: "Emotional Close",
    emoji: "🌙",
    description: "Soft tracks for winding down",
  },
];

export default function DJ() {
  const { signOut } = useAuth();

  const [selectedMood, setSelectedMood] = useState(null);
  const [segment, setSegment] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedUrl, setSavedUrl] = useState("");

  const handleGenerate = async () => {
    if (!selectedMood) return;
    setError("");
    setSegment(null);
    setSavedUrl("");
    setGenerating(true);
    try {
      await apiFetch("/preferences", {
        method: "POST",
        body: JSON.stringify({ default_mood: selectedMood }),
      });
      const data = await apiFetch("/segments/generate", { method: "POST" });
      setSegment(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!segment) return;
    setError("");
    setSaving(true);
    try {
      const tracks = segment.segment.tracks.map((t) => ({ uri: t.uri }));
      const name = `Dad DJ — ${segment.segment.mood} mix`;
      const data = await apiFetch("/playlist/create", {
        method: "POST",
        body: JSON.stringify({ name, tracks }),
      });
      setSavedUrl(data.playlist.url);
    } catch (err) {
      setError(err.message || "Failed to save playlist.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-10">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">🎧 Dad DJ</h1>
            <p className="text-zinc-400 text-sm mt-1">Pick a mood. Get your playlist.</p>
          </div>
          <button
            onClick={signOut}
            className="text-zinc-600 hover:text-zinc-400 text-sm transition"
          >
            Sign out
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-zinc-300 font-medium text-sm uppercase tracking-widest">
            Choose a mood
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`rounded-xl border p-5 text-left transition flex flex-col gap-2 ${
                  selectedMood === mood.id
                    ? "border-violet-500 bg-violet-950"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="font-semibold text-white">{mood.label}</span>
                <span className="text-zinc-400 text-xs">{mood.description}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selectedMood || generating}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-4 transition text-lg"
        >
          {generating ? "Building your set..." : "Generate playlist"}
        </button>

        {error && (
          <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {segment && (
          <div className="flex flex-col gap-6">

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                DJ says
              </p>
              <p className="text-white text-lg italic">
                "{segment.segment.intro}"
              </p>
              <p className="text-zinc-500 text-xs mt-3">
                Seeded by {segment.segment.seed_artist} · {segment.segment.mood} mood
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-zinc-300 font-medium text-sm uppercase tracking-widest">
                Tracks
              </h2>
              {segment.segment.tracks.map((track, i) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
                >
                  <span className="text-zinc-600 text-sm w-5 text-right">{i + 1}</span>
                  {track.album?.images?.[0]?.url && (
                    <img
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-white text-sm font-medium truncate">
                      {track.name}
                    </span>
                    <span className="text-zinc-400 text-xs truncate">
                      {track.artists.map((a) => a.name).join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {savedUrl ? (
              
                <a href={savedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl px-6 py-4 transition text-center block"
              >
                Open in Spotify →
              </a>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-4 transition"
              >
                {saving ? "Saving to Spotify..." : "Save to Spotify"}
              </button>
            )}

          </div>
        )}

      </div>
    </div>
  );
}