"use client";

import { useState } from "react";

import { requestJson } from "../lib/client-api";

const emptyWord = { text: "", phonemes: "", hint: "" };

export default function WordManager({ activityId, words, onChange, onStatus }) {
  const [form, setForm] = useState(emptyWord);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyWord);
  }

  function beginEdit(word) {
    setEditingId(word.id);
    setForm({ text: word.text, phonemes: word.phonemes, hint: word.hint || "" });
    onStatus(null);
  }

  async function submitWord(event) {
    event.preventDefault();
    setSaving(true);
    onStatus(null);

    try {
      await requestJson(
        editingId ? `/api/words/${editingId}` : `/api/activities/${activityId}/words`,
        { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) },
      );
      cancelEdit();
      await onChange();
      onStatus({ type: "success", message: editingId ? "Word saved." : "Word added to this activity." });
    } catch (error) {
      onStatus({ type: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function deleteWord(word) {
    if (!window.confirm(`Delete “${word.text}” from this activity?`)) return;

    onStatus(null);
    try {
      await requestJson(`/api/words/${word.id}`, { method: "DELETE" });
      if (editingId === word.id) cancelEdit();
      await onChange();
      onStatus({ type: "success", message: "Word deleted." });
    } catch (error) {
      onStatus({ type: "error", message: error.message });
    }
  }

  return (
    <section className="editor-section" aria-labelledby="word-manager-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Stored word list</p>
          <h2 id="word-manager-title">Words and phonemes</h2>
        </div>
        <span className="count-badge">{words.length} saved</span>
      </div>
      <p className="panel-copy">Word text uses letters A–Z only. Phonemes accept Unicode IPA, including multi-character values such as <strong>/tʃ eə/</strong>.</p>

      <form className="word-form" onSubmit={submitWord}>
        <label className="form-field">
          <span>Word</span>
          <input name="text" value={form.text} onChange={updateForm} required maxLength="100" pattern="[A-Za-z]+" title="Use letters A–Z only" placeholder="chair" />
        </label>
        <label className="form-field">
          <span>Phonemes</span>
          <input name="phonemes" value={form.phonemes} onChange={updateForm} required maxLength="200" lang="en" placeholder="/tʃ eə/" />
        </label>
        <label className="form-field">
          <span>Word hint <small>(optional)</small></span>
          <input name="hint" value={form.hint} onChange={updateForm} maxLength="240" placeholder="Furniture" />
        </label>
        <div className="form-actions">
          <button className="primary-action" disabled={saving} type="submit">{saving ? "Saving…" : editingId ? "Save word" : "Add word"}</button>
          {editingId && <button className="secondary-action" type="button" onClick={cancelEdit}>Cancel edit</button>}
        </div>
      </form>

      {words.length === 0 ? <p className="state-message">No words yet. Add at least one before generating an activity.</p> : (
        <ul className="word-list">
          {words.map((word) => (
            <li key={word.id} className="word-row">
              <div><strong>{word.text}</strong><span className="phoneme-value">{word.phonemes}</span>{word.hint ? <small>{word.hint}</small> : null}</div>
              <div className="card-actions"><button className="secondary-action small-action" type="button" onClick={() => beginEdit(word)}>Edit</button><button className="danger-button" type="button" onClick={() => deleteWord(word)}>Delete</button></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
