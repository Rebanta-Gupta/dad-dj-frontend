import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../services/api.js";

export default function Connect() {
  const { user, signOut } = useAuth();
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSpotify = async () => {
      try {
        await apiFetch("/spotify/me");
        setSpotifyConnected(true);
      } catch {
        setSpotifyConnected(false);
      } finally {
        setChecking(false);
      }
    };
    checkSpotify();
  }, []);

  const handleConnectSpotify = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/spotify/login?state=${user.id}`;
  };

  const handleContinue = () => {
    window.location.href = "/dj";
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎵</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Connect Spotify</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Dad DJ needs access to your Spotify to build playlists just for you.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-6">

          {checking ? (
            <p className="text-zinc-400 text-sm text-center">Checking Spotify connection...</p>
          ) : spotifyConnected ? (
            <>
              <div className="flex items-center gap-3 bg-green-950 border border-green-800 rounded-lg px-4 py-3">
                <span className="text-green-400 text-lg">✓</span>
                <p className="text-green-400 text-sm font-medium">Spotify is connected</p>
              </div>
              <button
                onClick={handleContinue}
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg px-4 py-3 transition"
              >
                Continue to Dad DJ →
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3">
                <span className="text-zinc-400 text-lg">○</span>
                <p className="text-zinc-400 text-sm">Spotify not connected yet</p>
              </div>
              <button
                onClick={handleConnectSpotify}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg px-4 py-3 transition flex items-center justify-center gap-2"
              >
                <span>Connect Spotify</span>
              </button>
            </>
          )}

          <button
            onClick={signOut}
            className="text-zinc-600 hover:text-zinc-400 text-sm text-center transition"
          >
            Sign out
          </button>

        </div>
      </div>
    </div>
  );
}