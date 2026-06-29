import { useEffect, useState, useCallback } from 'react';
import { Search, Heart, ThumbsDown, Music, Mic, Clock, ChevronDown } from 'lucide-react';
import api from '../api';
import './Artists.css';

const STATIC_ARTISTS = [
  { name: 'Taylor Swift' }, { name: 'Bad Bunny' }, { name: 'The Weeknd' },
  { name: 'Drake' }, { name: 'Beyoncé' }, { name: 'Dua Lipa' },
  { name: 'Harry Styles' }, { name: 'Billie Eilish' }, { name: 'Stromae' },
  { name: 'Aya Nakamura' }, { name: 'Jul' }, { name: 'Angèle' },
  { name: 'Nicki Minaj' }, { name: 'Kendrick Lamar' }, { name: 'Post Malone' },
  { name: 'Ariana Grande' }, { name: 'Rihanna' }, { name: 'Ed Sheeran' },
  { name: 'Coldplay' }, { name: 'Orelsan' }, { name: 'PNL' },
  { name: 'SCH' }, { name: 'Tiakola' }, { name: 'Naps' },
  { name: 'Freeze Corleone' }, { name: 'Lomepal' }, { name: 'Damso' },
  { name: 'Hamza' }, { name: 'Sabrina Carpenter' }, { name: 'Olivia Rodrigo' },
];

function formatDuration(ms) {
  if (!ms) return '';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Artists() {
  const [activeTab, setActiveTab] = useState('artists');
  const [artistVotes, setArtistVotes] = useState({});
  const [trackVotes, setTrackVotes] = useState({});
  const [likedArtistData, setLikedArtistData] = useState([]);
  const [likedTrackData, setLikedTrackData] = useState([]);
  const [search, setSearch] = useState('');
  const [artistResults, setArtistResults] = useState([]);
  const [trackResults, setTrackResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistTracks, setArtistTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [spotifyError, setSpotifyError] = useState('');

  function loadVotes() {
    api.get('/artists/votes').then(r => {
      const map = {};
      r.data.forEach(v => { map[v.artist_name] = v.vote; });
      setArtistVotes(map);
      setLikedArtistData(r.data.filter(v => v.vote === 'like'));
    });
    api.get('/artists/tracks/votes').then(r => {
      const map = {};
      r.data.forEach(v => { map[v.spotify_id] = v.vote; });
      setTrackVotes(map);
      setLikedTrackData(r.data.filter(v => v.vote === 'like'));
    });
  }

  useEffect(() => { loadVotes(); }, []);

  async function voteArtist(artist, voteType) {
    if (artistVotes[artist.name] === voteType) {
      await api.delete(`/artists/vote/${encodeURIComponent(artist.name)}`);
    } else {
      await api.post('/artists/vote', { artist_name: artist.name, artist_image: artist.image || null, spotify_id: artist.spotify_id || null, vote: voteType });
    }
    loadVotes();
  }

  async function voteTrack(track, voteType) {
    if (trackVotes[track.spotify_id] === voteType) {
      await api.delete(`/artists/tracks/vote/${encodeURIComponent(track.spotify_id)}`);
    } else {
      await api.post('/artists/tracks/vote', { track_name: track.track_name, artist_name: track.artist_name, album_image: track.album_image, spotify_id: track.spotify_id, vote: voteType });
    }
    loadVotes();
  }

  async function selectArtist(artist) {
    if (selectedArtist?.spotify_id === artist.spotify_id) {
      setSelectedArtist(null);
      setArtistTracks([]);
      return;
    }
    setSelectedArtist(artist);
    setArtistTracks([]);
    if (!artist.spotify_id) return;
    setLoadingTracks(true);
    try {
      const r = await api.get(`/artists/top-tracks/${artist.spotify_id}`);
      setArtistTracks(r.data);
    } catch {
      setArtistTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  }

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setArtistResults([]);
      setTrackResults([]);
      setSelectedArtist(null);
      setArtistTracks([]);
      setSpotifyError('');
      return;
    }
    setSearching(true);
    setSpotifyError('');
    try {
      if (activeTab === 'artists') {
        const r = await api.get(`/artists/search?q=${encodeURIComponent(q)}`);
        setArtistResults(r.data);
        setSelectedArtist(null);
        setArtistTracks([]);
      } else {
        const r = await api.get(`/artists/tracks/search?q=${encodeURIComponent(q)}`);
        setTrackResults(r.data);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur Spotify';
      setSpotifyError(msg);
    } finally {
      setSearching(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const t = setTimeout(() => doSearch(search), 500);
    return () => clearTimeout(t);
  }, [search, doSearch]);

  // Reset search quand on change d'onglet
  useEffect(() => {
    setSearch('');
    setArtistResults([]);
    setTrackResults([]);
    setSelectedArtist(null);
    setArtistTracks([]);
    setSpotifyError('');
  }, [activeTab]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Musique</h1>
        <p>Vote pour tes artistes et musiques préférés</p>
      </div>

      {/* ONGLETS */}
      <div className="music-tabs">
        <button className={`music-tab ${activeTab === 'artists' ? 'active' : ''}`} onClick={() => setActiveTab('artists')}>
          <Mic size={16} /> Artistes
        </button>
        <button className={`music-tab ${activeTab === 'tracks' ? 'active' : ''}`} onClick={() => setActiveTab('tracks')}>
          <Music size={16} /> Musiques
        </button>
      </div>

      {/* RECHERCHE */}
      <div className="search-section">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            placeholder={activeTab === 'artists' ? 'Rechercher un artiste...' : 'Rechercher une musique...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        {spotifyError && <p className="error-msg" style={{ marginTop: 8 }}>{spotifyError}</p>}
        {searching && <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '0.9rem' }}>Recherche en cours...</p>}
      </div>

      {/* ── ARTISTES ── */}
      {activeTab === 'artists' && (
        <>
          {/* Résultats recherche */}
          {artistResults.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p className="results-hint">Clique sur un artiste pour voir ses musiques</p>
              <div className="artists-grid">
                {artistResults.map(a => (
                  <ArtistCard
                    key={a.spotify_id || a.name}
                    artist={a}
                    vote={artistVotes[a.name]}
                    onVote={voteArtist}
                    selected={selectedArtist?.spotify_id === a.spotify_id}
                    onSelect={selectArtist}
                  />
                ))}
              </div>

              {/* Top tracks de l'artiste sélectionné */}
              {selectedArtist && (
                <div className="artist-tracks-panel">
                  <div className="artist-tracks-header">
                    <div className="artist-tracks-title">
                      {selectedArtist.image && <img src={selectedArtist.image} alt={selectedArtist.name} className="artist-tracks-img" />}
                      <span>Musiques populaires de <strong>{selectedArtist.name}</strong></span>
                    </div>
                  </div>
                  {loadingTracks ? (
                    <p style={{ color: 'var(--text-muted)', padding: '12px 0', fontSize: '0.9rem' }}>Chargement...</p>
                  ) : artistTracks.length > 0 ? (
                    <div className="tracks-list">
                      {artistTracks.map(t => (
                        <TrackCard key={t.spotify_id} track={t} vote={trackVotes[t.spotify_id]} onVote={voteTrack} suggestion />
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucune musique trouvée.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mes artistes likés */}
          {likedArtistData.length > 0 && (
            <div className="liked-banner card">
              <h3>Tes artistes préférés ({likedArtistData.length})</h3>
              <div className="liked-list">
                {likedArtistData.map(a => (
                  <div key={a.artist_name} className="liked-artist-chip">
                    {a.artist_image && <img src={a.artist_image} alt={a.artist_name} />}
                    <span>{a.artist_name}</span>
                    <button className="chip-remove" onClick={() => voteArtist({ name: a.artist_name, image: a.artist_image }, 'like')}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className="section-label">Artistes populaires</h2>
          <div className="artists-grid">
            {STATIC_ARTISTS.map(a => (
              <ArtistCard key={a.name} artist={a} vote={artistVotes[a.name]} onVote={voteArtist} />
            ))}
          </div>
        </>
      )}

      {/* ── MUSIQUES ── */}
      {activeTab === 'tracks' && (
        <>
          {trackResults.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p className="results-hint">Tu aimes ces musiques ? Like pour les ajouter à la playlist</p>
              <div className="tracks-list">
                {trackResults.map(t => (
                  <TrackCard key={t.spotify_id} track={t} vote={trackVotes[t.spotify_id]} onVote={voteTrack} suggestion />
                ))}
              </div>
            </div>
          )}

          {likedTrackData.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 className="section-label">Mes musiques aimées ({likedTrackData.length})</h2>
              <div className="tracks-list">
                {likedTrackData.map(t => (
                  <TrackCard key={t.spotify_id} track={t} vote="like" onVote={voteTrack} />
                ))}
              </div>
            </div>
          )}

          {!search && likedTrackData.length === 0 && (
            <div className="tracks-empty">
              <Music size={40} color="var(--pink)" />
              <p>Recherche une musique pour l'ajouter à la playlist</p>
              <span>Ex: "Bohemian Rhapsody", "Blinding Lights"...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ArtistCard({ artist, vote, onVote, selected, onSelect }) {
  return (
    <div
      className={`artist-card ${vote ? 'voted-' + vote : ''} ${selected ? 'selected' : ''}`}
      onClick={() => onSelect?.(artist)}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      <div className="artist-img">
        {artist.image ? <img src={artist.image} alt={artist.name} /> : <Mic size={26} color="var(--pink)" />}
      </div>
      <div className="artist-name">{artist.name}</div>
      {artist.genres?.length > 0 && <div className="artist-genres">{artist.genres.slice(0, 2).join(' · ')}</div>}
      {selected && <div className="selected-indicator"><ChevronDown size={14} /> Musiques</div>}
      <div className="artist-votes" onClick={e => e.stopPropagation()}>
        <button className={`vote-btn like ${vote === 'like' ? 'active' : ''}`} onClick={() => onVote(artist, 'like')}><Heart size={15} /></button>
        <button className={`vote-btn dislike ${vote === 'dislike' ? 'active' : ''}`} onClick={() => onVote(artist, 'dislike')}><ThumbsDown size={15} /></button>
      </div>
    </div>
  );
}

function TrackCard({ track, vote, onVote, suggestion }) {
  return (
    <div className={`track-card ${vote ? 'voted-' + vote : ''} ${suggestion ? 'suggestion' : ''}`}>
      {track.album_image
        ? <img src={track.album_image} alt={track.track_name} className="track-img" />
        : <div className="track-img-placeholder"><Music size={20} color="var(--pink)" /></div>
      }
      <div className="track-info">
        <div className="track-name">{track.track_name}</div>
        <div className="track-artist">{track.artist_name}</div>
        {track.duration_ms && (
          <div className="track-duration"><Clock size={11} /> {formatDuration(track.duration_ms)}</div>
        )}
      </div>
      <div className="track-votes">
        <button className={`vote-btn like ${vote === 'like' ? 'active' : ''}`} onClick={() => onVote(track, 'like')}><Heart size={15} /></button>
        <button className={`vote-btn dislike ${vote === 'dislike' ? 'active' : ''}`} onClick={() => onVote(track, 'dislike')}><ThumbsDown size={15} /></button>
      </div>
    </div>
  );
}
