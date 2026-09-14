"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { downloadActivity, fetchActivityHtml, requestJson } from "../lib/client-api";
import StatusMessage from "./StatusMessage";
import WordManager from "./WordManager";

export default function ActivityEditor({ activityId }) {
  const [activity, setActivity] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [status, setStatus] = useState(null);

  async function loadActivity() {
    setLoading(true);
    try {
      const saved = await requestJson(`/api/activities/${activityId}`);
      setActivity(saved);
      setForm({ ...saved, hint: saved.hint || "" });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    requestJson(`/api/activities/${activityId}`)
      .then((saved) => {
        if (!active) return;
        setActivity(saved);
        setForm({ ...saved, hint: saved.hint || "" });
      })
      .catch((error) => {
        if (active) setStatus({ type: "error", message: error.message });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activityId]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveActivity(event) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const saved = await requestJson(`/api/activities/${activityId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: form.title.trim(), activityType: form.activityType, difficulty: form.difficulty,
          hint: form.hint.trim(), gridSize: Number(form.gridSize), maxAttempts: Number(form.maxAttempts),
        }),
      });
      setActivity((current) => ({ ...current, ...saved }));
      setForm((current) => ({ ...current, ...saved, hint: saved.hint || "" }));
      setStatus({ type: "success", message: "Activity settings saved." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function download() {
    if (!activity?.words?.length) return;
    setGenerating(true);
    setStatus(null);
    try {
      await downloadActivity(activityId, activity.title);
      setStatus({ type: "success", message: "Your HTML download has started." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setGenerating(false);
    }
  }

  async function preview() {
    if (!activity?.words?.length) return;
    setGenerating(true);
    setStatus(null);
    try {
      setPreviewHtml(await fetchActivityHtml(activityId));
      setStatus({ type: "success", message: "Preview ready below." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <p className="state-message standard-page" role="status">Loading this saved activity…</p>;
  if (!activity || !form) return <section className="standard-page editor-page"><Link className="secondary-button" href="/activities">Back to saved activities</Link><StatusMessage status={status} /></section>;

  return (
    <div className="standard-page editor-page">
      <Link className="back-link" href="/activities">← Back to saved activities</Link>
      <div className="editor-title-row"><div><p className="eyebrow">Activity #{activity.id}</p><h2>{activity.title}</h2></div><div className="generation-actions"><button className="secondary-action" type="button" disabled={!activity.words.length || generating} onClick={preview}>Preview HTML</button><button className="primary-action" type="button" disabled={!activity.words.length || generating} onClick={download}>{generating ? "Preparing…" : "Download HTML"}</button></div></div>
      {!activity.words.length ? <p className="generation-note">Add a word before previewing or downloading the stored activity.</p> : null}
      <StatusMessage status={status} />

      {previewHtml ? (
        <section className="saved-panel preview-panel" aria-labelledby="preview-title">
          <div className="panel-heading">
            <div><p className="eyebrow">Generated from stored data</p><h2 id="preview-title">Activity preview</h2></div>
            <button className="text-button" type="button" onClick={() => setPreviewHtml("")}>Close preview</button>
          </div>
          <iframe className="activity-preview" title={`${activity.title} preview`} sandbox="allow-scripts" srcDoc={previewHtml} />
        </section>
      ) : null}

      <section className="saved-panel editor-section" aria-labelledby="activity-settings-title">
        <p className="eyebrow">Saved configuration</p><h2 id="activity-settings-title">Activity settings</h2>
        <form className="activity-form" onSubmit={saveActivity}>
          <div className="field-row"><label className="form-field"><span>Activity title</span><input name="title" value={form.title} onChange={updateForm} required maxLength="100" /></label><label className="form-field"><span>Activity type</span><select name="activityType" value={form.activityType} onChange={updateForm}><option value="WORDLE">Wordle</option><option value="WORD_SEARCH">Word Search</option></select></label></div>
          <div className="field-row"><label className="form-field"><span>Difficulty</span><select name="difficulty" value={form.difficulty} onChange={updateForm}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></label>{form.activityType === "WORDLE" ? <label className="form-field"><span>Maximum attempts</span><input name="maxAttempts" type="number" min="3" max="10" value={form.maxAttempts} onChange={updateForm} required /></label> : <label className="form-field"><span>Grid size</span><input name="gridSize" type="number" min="8" max="20" value={form.gridSize} onChange={updateForm} required /></label>}</div>
          <label className="form-field"><span>Teacher hint <small>(optional)</small></span><textarea name="hint" value={form.hint} onChange={updateForm} maxLength="240" rows="3" /></label>
          <button className="primary-action" disabled={saving} type="submit">{saving ? "Saving…" : "Save settings"}</button>
        </form>
      </section>
      <div className="saved-panel"><WordManager activityId={activity.id} words={activity.words || []} onChange={loadActivity} onStatus={setStatus} /></div>
    </div>
  );
}
