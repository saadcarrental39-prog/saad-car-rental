// Home page block: tells visitors that /posts has photos, videos (reels) and full details of every trip and tourist spot.
// The button is plain HTML in the prerendered page (Google sees the link). The newest posts are loaded after the page is shown.
import { useEffect, useState } from "react";

export default function HomePosts() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { let off = false; fetch("/api/posts?limit=6").then((r) => (r.ok ? r.json() : null)).then((j) => { if (!off && j && Array.isArray(j.posts)) setPosts(j.posts); }).catch(() => {}); return () => { off = true; }; }, []);
  return (
    <section className="sec hp" aria-labelledby="hp-h">
      <div className="hp__box">
        <div><p className="eyebrow">Trips · Spots · Reels</p>
          <h2 className="h2" id="hp-h">Choose your spots: photos, videos and full details</h2>
          <p className="lead">Murree, Patriata, Ayubia chairlift, Naran, Hunza, Skardu and more. Every trip page has pictures, reels that play by themselves and what to see, so you can plan before you book.</p></div>
        <a className="btn btn--dark hp__btn" href="/posts">See all trips, photos &amp; videos →</a>
      </div>
      {posts.length > 0 && <div className="hp__grid">{posts.map((p) => (
        <a className="hp__card" href={`/posts/${p.slug}`} key={p.slug}>
          {p.image ? <img src={p.image} alt={p.title} width="640" height="400" loading="lazy" decoding="async" referrerPolicy="no-referrer" /> : <span className="hp__ph" />}
          <span><small>{p.location || p.category}</small><b>{p.title}</b></span>
        </a>))}</div>}
    </section>
  );
}
