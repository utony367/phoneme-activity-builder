"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { requestJson } from "../lib/client-api";
import StatusMessage from "./StatusMessage";

const emptyActivity = {
  title: "",
  activityType: "WORDLE",
  difficulty: "EASY",
  hint: "",
  gridSize: 12,
  maxAttempts: 6,
};

function activityPayload(form) {
  return {
    ...form,
    title: form.title.trim(),
    hint: form.hint.trim(),
    gridSize: Number(form.gridSize),
    maxAttempts: Number(form.maxAttempts),
  };
}

function activityTypeLabel(activityType) {
  return activityType === "WORD_SEARCH" ? "Word Search" : "Wordle";
}

export default function ActivityDashboard() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState(emptyActivity);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  async function loadActivities() {
    setLoading(true);
    try {
      setActivities(await requestJson("/api/activities"));
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    requestJson("/api/activities")
      .then((saved) => {
        if (active) setActivities(saved);
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
  }, []);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(activity) {
    setEditingId(activity.id);
    setForm({
      title: activity.title,
      activityType: activity.activityType,
      difficulty: activity.difficulty,
      hint: activity.hint || "",
      gridSize: activity.gridSize,
      maxAttempts: activity.maxAttempts,
    });
    setStatus(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyActivity);
  }

  async function submitActivity(event) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const payload = JSON.stringify(activityPayload(form));
      const saved = await requestJson(
        editingId ? `/api/activities/${editingId}` : "/api/activities",
        { method: editingId ? "PUT" : "POST", body: payload },
      );

      setActivities((current) => {
        if (!editingId) return [saved, ...current];
        return current.map((activity) => (activity.id === saved.id ? { ...activity, ...saved } : activity));
      });
      setStatus({ type: "success", message: editingId ? "Activity settings saved." : "Activity created. Add words next." });
      cancelEdit();
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function deleteActivity(activity) {
    if (!window.confirm(`Delete “${activity.title}” and all of its words? This cannot be undone.`)) return;

    setStatus(null);
    try {
      await requestJson(`/api/activities/${activity.id}`, { method: "DELETE" });
      setActivities((current) => current.filter((item) => item.id !== activity.id));
      if (editingId === activity.id) cancelEdit();
      setStatus({ type: "success", message: "Activity deleted." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  return (
    <div className="saved-activities-layout">
      <section className="saved-panel" aria-labelledby="activity-form-title">
        <p className="eyebrow">Teacher workspace</p>
        <h2 id="activity-form-title">{editingId ? "Edit activity" : "Create a saved activity"}</h2>
        <p className="panel-copy">Store a reusable Wordle or Word Search configuration, then add its phoneme word list.</p>

        <form className="activity-form" onSubmit={submitActivity}>
          <label className="form-field">
            <span>Activity title</span>
            <input name="title" value={form.title} onChange={updateForm} required maxLength="100" placeholder="e.g. Short vowel review" />
          </label>
          <div className="field-row">
            <label className="form-field">
              <span>Activity type</span>
              <select name="activityType" value={form.activityType} onChange={updateForm}>
                <option value="WORDLE">Wordle</option>
                <option value="WORD_SEARCH">Word Search</option>
              </select>
            </label>
            <label className="form-field">
              <span>Difficulty</span>
              <select name="difficulty" value={form.difficulty} onChange={updateForm}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </label>
          </div>
          <label className="form-field">
            <span>Teacher hint <small>(optional)</small></span>
            <textarea name="hint" value={form.hint} onChange={updateForm} maxLength="240" rows="3" placeholder="A class-wide prompt or instruction" />
          </label>
          {form.activityType === "WORDLE" ? (
            <label className="form-field compact-field">
              <span>Maximum attempts</span>
              <input name="maxAttempts" type="number" min="3" max="10" value={form.maxAttempts} onChange={updateForm} required />
            </label>
          ) : (
            <label className="form-field compact-field">
              <span>Grid size</span>
              <input name="gridSize" type="number" min="8" max="20" value={form.gridSize} onChange={updateForm} required />
            </label>
          )}
          <div className="form-actions">
            <button className="primary-action" disabled={saving} type="submit">{saving ? "Saving…" : editingId ? "Save activity" : "Create activity"}</button>
            {editingId && <button className="secondary-action" type="button" onClick={cancelEdit}>Cancel edit</button>}
          </div>
        </form>
        <StatusMessage status={status} />
      </section>

      <section className="saved-panel activity-list-panel" aria-labelledby="saved-activity-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Stored data</p>
            <h2 id="saved-activity-title">Saved activities</h2>
          </div>
          <button className="text-button" type="button" onClick={loadActivities} disabled={loading}>Refresh</button>
        </div>

        {loading ? <p className="state-message" role="status">Loading saved activities…</p> : null}
        {!loading && activities.length === 0 ? <div className="empty-state"><h3>No activities saved yet</h3><p>Create your first configuration, then add words and phonemes from its management page.</p></div> : null}
        {!loading && activities.length > 0 ? (
          <ul className="activity-list">
            {activities.map((activity) => (
              <li className="saved-activity-card" key={activity.id}>
                <div>
                  <div className="card-meta"><span>{activityTypeLabel(activity.activityType)}</span><span>{activity.difficulty.toLowerCase()}</span><span>{activity.words?.length || 0} words</span></div>
                  <h3>{activity.title}</h3>
                  <p>{activity.hint || "No teacher hint added."}</p>
                </div>
                <div className="card-actions">
                  <Link className="primary-action small-action" href={`/activities/${activity.id}`}>Manage words</Link>
                  <button className="secondary-action small-action" type="button" onClick={() => startEdit(activity)}>Quick edit</button>
                  <button className="danger-button" type="button" onClick={() => deleteActivity(activity)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
