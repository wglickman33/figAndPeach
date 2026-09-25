import { useState, type FormEvent } from "react";
import { CUSTOMIZATION_GROUP_KINDS } from "../../constants/customizationGroupKinds";
import { useCatalog } from "../../context/useCatalog";
import {
  createCustomizationGroup,
  deleteCustomizationGroup,
  updateCustomizationGroup,
} from "../../lib/api";
import { slugify } from "../../lib/slugify";
import type { CustomizationGroup, CustomizationGroupKind } from "../../types/catalog";
import "./AdminPages.css";

export function AdminGroupsPage() {
  const { customization, refresh } = useCatalog();
  const groups = customization.groups;

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<CustomizationGroupKind>("bead_inventory");
  const [sortOrder, setSortOrder] = useState("20");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function syncIdFromName(nextName: string) {
    setName(nextName);
    if (!id || id === slugify(name)) {
      setId(slugify(nextName));
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createCustomizationGroup({
        id: slugify(id || name),
        name: name.trim(),
        kind,
        sortOrder: Number(sortOrder),
      });
      setName("");
      setId("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create group.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(group: CustomizationGroup, patch: Partial<CustomizationGroup>) {
    setBusy(true);
    setError(null);
    try {
      await updateCustomizationGroup(group.id, patch);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update group.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(groupId: string) {
    setBusy(true);
    setError(null);
    try {
      await deleteCustomizationGroup(groupId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete group.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-stack">
      <section className="admin-panel">
        <h2 className="admin-heading">Customization groups</h2>
        <p className="admin-muted">
          Bead sizes/types (8mm x 5mm rondelle beads), clasps, pony beads, socks, etc. Customers pick a
          group on detailed products, then choose options inside that group on the next step.
        </p>

        <form className="admin-form" onSubmit={handleCreate}>
          <label className="admin-field">
            <span>Display name</span>
            <input value={name} onChange={(e) => syncIdFromName(e.target.value)} required />
          </label>
          <label className="admin-field">
            <span>Group id (slug)</span>
            <input value={id} onChange={(e) => setId(slugify(e.target.value))} required />
          </label>
          <label className="admin-field">
            <span>Kind</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as CustomizationGroupKind)}>
              {CUSTOMIZATION_GROUP_KINDS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Sort order</span>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="admin-button" disabled={busy}>
            Add group
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h2 className="admin-heading">Current groups</h2>
        {error && <p className="admin-error">{error}</p>}

        <ul className="admin-list admin-list--stacked">
          {groups.map((group) => (
            <li key={group.id} className="admin-list__item admin-list__item--stacked">
              <GroupRow
                group={group}
                disabled={busy}
                onSave={(patch) => void handleUpdate(group, patch)}
                onDelete={() => void handleDelete(group.id)}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

type GroupRowProps = {
  group: CustomizationGroup;
  disabled: boolean;
  onSave: (patch: Partial<CustomizationGroup>) => void;
  onDelete: () => void;
};

function GroupRow({ group, disabled, onSave, onDelete }: GroupRowProps) {
  const [name, setName] = useState(group.name);
  const [kind, setKind] = useState(group.kind);
  const [sortOrder, setSortOrder] = useState(String(group.sortOrder));

  return (
    <div className="admin-row-form">
      <code className="admin-code">{group.id}</code>
      <label className="admin-field">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="admin-field">
        <span>Kind</span>
        <select value={kind} onChange={(e) => setKind(e.target.value as CustomizationGroupKind)}>
          {CUSTOMIZATION_GROUP_KINDS.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-field">
        <span>Sort</span>
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      </label>
      <div className="admin-row-form__actions">
        <button
          type="button"
          className="admin-button admin-button--ghost"
          disabled={disabled}
          onClick={() =>
            onSave({
              name: name.trim(),
              kind,
              sortOrder: Number(sortOrder),
            })
          }
        >
          Save
        </button>
        <button type="button" className="admin-button admin-button--danger" disabled={disabled} onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
