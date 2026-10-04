import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ThreeSixtyViewer from '../components/ThreeSixtyViewer';

const mediaUrl = (filePath) => `/uploads/media/${filePath}`;

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState([]);
  const [groups360, setGroups360] = useState([]);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  const [uploading, setUploading] = useState(false);
  const [viewingGroup, setViewingGroup] = useState(null);

  const load = () => api.get('/media', { params: { search: search || undefined, kind: kind || undefined } }).then((r) => setAssets(r.data));
  const loadGroups = () => api.get('/media/groups/360').then((r) => setGroups360(r.data));
  useEffect(() => { load(); loadGroups(); }, [search, kind]);

  // ---- Regular upload (images/videos/documents, no 360 grouping) ----
  const handleUpload = (files) => {
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    [...files].forEach((f) => fd.append('files', f));
    api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => { load(); loadGroups(); })
      .finally(() => setUploading(false));
  };

  // ---- 360 sequence upload: pick multiple photos taken around an object ----
  const handle360Upload = (files) => {
    if (!files.length) return;
    const groupKey = prompt('Name this 360° set (e.g. "Gate Design CNC #1"):');
    if (!groupKey) return;
    setUploading(true);
    const fd = new FormData();
    [...files].forEach((f) => fd.append('files', f));
    fd.append('group_key', groupKey);
    fd.append('title', groupKey);
    api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => { load(); loadGroups(); })
      .finally(() => setUploading(false));
  };

  const deleteAsset = (id) => { if (confirm('Delete this file?')) api.delete(`/media/${id}`).then(() => { load(); loadGroups(); }); };

  const viewGroupFrames = (groupKey) => {
    api.get('/media', { params: { group_key: groupKey } }).then((r) => setViewingGroup({ key: groupKey, frames: r.data.sort((a, b) => a.frame_index - b.frame_index).map((f) => mediaUrl(f.file_path)) }));
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Media Library</h1>
      <p className="text-text-secondary text-sm mb-4">Images, videos, documents, and real 360° photo sets — searchable and assignable to any project, service, or gallery item.</p>

      <div className="card mb-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="btn-outline text-center cursor-pointer">
            {uploading ? 'Uploading...' : '+ Upload Images/Videos'}
            <input type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          </label>
          <label className="btn-outline text-center cursor-pointer">
            + Upload a 360° Photo Set (select all angle photos)
            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handle360Upload(e.target.files)} />
          </label>
        </div>
        <div className="flex gap-2">
          <input className="input-field flex-1" placeholder="Search by title/tags..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input-field w-40" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">All types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
            <option value="360_frame">360° frames</option>
          </select>
        </div>
      </div>

      {groups360.length > 0 && (
        <div className="card mb-4">
          <h2 className="font-semibold mb-2">360° Photo Sets</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {groups360.map((g) => {
              const cover = assets.find((a) => a.id === g.cover_id);
              return (
                <button key={g.group_key} onClick={() => viewGroupFrames(g.group_key)} className="border border-border rounded-card overflow-hidden hover:border-brand text-left">
                  {cover && <img src={mediaUrl(cover.file_path)} alt={g.group_key} className="w-full h-24 object-cover" />}
                  <div className="p-2 text-xs">
                    <div className="font-medium truncate">{g.group_key}</div>
                    <div className="text-text-secondary">{g.frame_count} frames</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewingGroup && (
        <div className="mb-4">
          <ThreeSixtyViewer frames={viewingGroup.frames} title={viewingGroup.key} />
          <button className="btn-ghost text-xs mt-2" onClick={() => setViewingGroup(null)}>Close viewer</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {assets.filter((a) => a.kind !== '360_frame').map((a) => (
          <div key={a.id} className="border border-border rounded-card overflow-hidden">
            {a.kind === 'image' ? (
              <img src={mediaUrl(a.file_path)} alt={a.title} className="w-full h-24 object-cover" />
            ) : (
              <div className="w-full h-24 flex items-center justify-center bg-gray-100 text-xs text-text-secondary">{a.kind}</div>
            )}
            <div className="p-2">
              <div className="text-xs font-medium truncate">{a.title}</div>
              <button className="text-danger text-xs mt-1" onClick={() => deleteAsset(a.id)}>Delete</button>
            </div>
          </div>
        ))}
        {!assets.filter((a) => a.kind !== '360_frame').length && <div className="text-text-secondary col-span-full">No media uploaded yet.</div>}
      </div>
    </div>
  );
}
