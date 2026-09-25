import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useCatalog } from "../../context/useCatalog";
import {
  createCustomizationOption,
  deleteCustomizationOption,
  fetchAdminCustomizationOptions,
  updateCustomizationOption,
  uploadImageToCloudinary,
} from "../../lib/api";
import { AdminPageIntro } from "../../components/admin/AdminPageIntro";
import type { CustomizationOption } from "../../types/catalog";
import "./AdminPages.css";

export function AdminOptionsPage() {
  const { customization, refresh } = useCatalog();
  const [groupId, setGroupId] = useState(customization.groups[0]?.id ?? "");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<CustomizationOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const groups = customization.groups;

  const loadOptions = useCallback(async (nextGroupId: string) => {
    if (!nextGroupId) {
      setOptions([]);
      return;
    }
    const rows = await fetchAdminCustomizationOptions(nextGroupId);
    setOptions(rows);
  }, []);

  useEffect(() => {
    if (!groupId && groups[0]?.id) {
      setGroupId(groups[0].id);
    }
  }, [groupId, groups]);

  useEffect(() => {
    if (!groupId) return;
    void loadOptions(groupId).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load options.");
    });
  }, [groupId, loadOptions]);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === groupId) ?? null,
    [groups, groupId],
  );

  async function handleGroupChange(nextGroupId: string) {
    setGroupId(nextGroupId);
    setError(null);
    try {
      await loadOptions(nextGroupId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load options.");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!groupId || !file) {
      setError("Choose a group and image.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const uploaded = await uploadImageToCloudinary(
        file,
        `fig-and-peach/customization/${groupId}`,
      );
      await createCustomizationOption({
        groupId,
        name: name.trim(),
        imageUrl: uploaded.imageUrl,
        cloudinaryPublicId: uploaded.publicId,
      });
      setName("");
      setFile(null);
      setMessage("Option saved.");
      await Promise.all([loadOptions(groupId), refresh()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save option.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(optionId: string) {
    setBusy(true);
    setError(null);
    try {
      await deleteCustomizationOption(optionId);
      await Promise.all([loadOptions(groupId), refresh()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete option.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageIntro
        title="Bead Options"
        lede="Upload each selectable photo (coral bead, gold clasp, sock pattern, etc.). First choose which Bead Type it belongs to, then pick the image file from your computer."
      />

      <div className="admin-split">
      <section className="admin-panel">
        <h3 className="admin-subheading">Add Bead Option</h3>

        <form className="admin-form admin-form--constrained" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Group</span>
            <select
              id="option-create-group"
              name="optionCreateGroup"
              value={groupId}
              onChange={(e) => void handleGroupChange(e.target.value)}
              required
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>

          {selectedGroup && (
            <p className="admin-muted">
              Type: <strong>{selectedGroup.kind.replaceAll("_", " ")}</strong>
            </p>
          )}

          <label className="admin-field">
            <span>Option name</span>
            <input
              id="option-create-name"
              name="optionCreateName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Coral, Gold toggle, etc."
              required
            />
          </label>

          <label className="admin-field">
            <span>Image</span>
            <input
              id="option-create-image"
              name="optionCreateImage"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </label>

          {error && <p className="admin-error">{error}</p>}
          {message && <p className="admin-success">{message}</p>}

          <button type="submit" className="admin-button admin-form__submit" disabled={busy || !groupId}>
            {busy ? "Saving…" : "Save Option"}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h3 className="admin-subheading">Options in This Group</h3>
        <button
          type="button"
          className="admin-button admin-button--ghost"
          onClick={() => void handleGroupChange(groupId)}
          disabled={!groupId || busy}
        >
          Refresh list
        </button>

        {options.length === 0 ? (
          <p className="admin-muted">No options in this group yet.</p>
        ) : (
          <ul className="admin-list admin-list--stacked">
            {options.map((option) => (
              <li key={option.id} className="admin-list__item admin-list__item--stacked">
                <OptionRow
                  option={option}
                  disabled={busy}
                  onSave={async (patch, file) => {
                    setBusy(true);
                    setError(null);
                    try {
                      let imageUrl = patch.imageUrl;
                      let cloudinaryPublicId = patch.cloudinaryPublicId;
                      if (file) {
                        const uploaded = await uploadImageToCloudinary(
                          file,
                          `fig-and-peach/customization/${groupId}`,
                        );
                        imageUrl = uploaded.imageUrl;
                        cloudinaryPublicId = uploaded.publicId;
                      }
                      await updateCustomizationOption(option.id, {
                        ...patch,
                        imageUrl,
                        cloudinaryPublicId,
                      });
                      await Promise.all([loadOptions(groupId), refresh()]);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Could not update option.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                  onDelete={() => void handleDelete(option.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
    </div>
  );
}

type OptionRowProps = {
  option: CustomizationOption;
  disabled: boolean;
  onSave: (
    patch: { name: string; sortOrder: number; imageUrl?: string; cloudinaryPublicId?: string },
    file: File | null,
  ) => Promise<void>;
  onDelete: () => void;
};

function OptionRow({ option, disabled, onSave, onDelete }: OptionRowProps) {
  const [name, setName] = useState(option.name);
  const [sortOrder, setSortOrder] = useState(String(option.sortOrder));
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="admin-row-form admin-row-form--with-thumb">
      <img src={option.imageUrl} alt="" className="admin-list__thumb" />
      <label className="admin-field">
        <span>Name</span>
        <input
          id={`option-${option.id}-name`}
          name={`option-${option.id}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="admin-field">
        <span>Sort</span>
        <input
          id={`option-${option.id}-sort`}
          name={`option-${option.id}-sort`}
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />
      </label>
      <label className="admin-field">
        <span>Replace image (optional)</span>
        <input
          id={`option-${option.id}-image`}
          name={`option-${option.id}-image`}
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <div className="admin-row-form__actions">
        <button
          type="button"
          className="admin-button admin-button--ghost"
          disabled={disabled}
          onClick={() => void onSave({ name: name.trim(), sortOrder: Number(sortOrder) }, file)}
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
