import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_PROFILE, WORK_PROFILE } from "@/lib/defaults";
import type { FieldMapping, Profile, SavedForm, VaultField } from "@/lib/types";

type VaultState = {
  hydrated: boolean;
  setHydrated: () => void;
  profiles: Profile[];
  activeProfileId: string;
  savedForms: SavedForm[];
  welcomeSeen: boolean;
  setWelcomeSeen: () => void;
  setActiveProfile: (id: string) => void;
  updateField: (profileId: string, fieldId: string, value: string) => void;
  addField: (profileId: string, field: Omit<VaultField, "id">) => void;
  removeField: (profileId: string, fieldId: string) => void;
  upsertFromAsk: (input: {
    key: string;
    label: string;
    value: string;
    group?: VaultField["group"];
  }) => void;
  resetDemo: () => void;
  saveForm: (form: Omit<SavedForm, "id" | "savedAt" | "fillCount">) => SavedForm;
  recordFill: (formId: string, mappings: FieldMapping[]) => void;
  deleteForm: (formId: string) => void;
  formForSite: (siteId: string) => SavedForm | undefined;
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      profiles: [DEMO_PROFILE, WORK_PROFILE],
      activeProfileId: "personal",
      savedForms: [],
      welcomeSeen: false,
      setWelcomeSeen: () => set({ welcomeSeen: true }),
      setActiveProfile: (id) => set({ activeProfileId: id }),
      updateField: (profileId, fieldId, value) =>
        set({
          profiles: get().profiles.map((p) =>
            p.id === profileId
              ? {
                  ...p,
                  fields: p.fields.map((f) =>
                    f.id === fieldId ? { ...f, value } : f,
                  ),
                }
              : p,
          ),
        }),
      addField: (profileId, field) =>
        set({
          profiles: get().profiles.map((p) =>
            p.id === profileId
              ? {
                  ...p,
                  fields: [
                    ...p.fields,
                    { ...field, id: uid(field.key || "field") },
                  ],
                }
              : p,
          ),
        }),
      removeField: (profileId, fieldId) =>
        set({
          profiles: get().profiles.map((p) =>
            p.id === profileId
              ? { ...p, fields: p.fields.filter((f) => f.id !== fieldId) }
              : p,
          ),
        }),
      upsertFromAsk: ({ key, label, value, group = "custom" }) => {
        const profileId = get().activeProfileId;
        set({
          profiles: get().profiles.map((p) => {
            if (p.id !== profileId) return p;
            const existing = p.fields.find((f) => f.key === key);
            if (existing) {
              return {
                ...p,
                fields: p.fields.map((f) =>
                  f.key === key ? { ...f, value, label } : f,
                ),
              };
            }
            return {
              ...p,
              fields: [
                ...p.fields,
                { id: uid(key), key, label, value, group },
              ],
            };
          }),
        });
      },
      resetDemo: () =>
        set({
          profiles: [
            structuredClone(DEMO_PROFILE),
            structuredClone(WORK_PROFILE),
          ],
          activeProfileId: "personal",
        }),
      saveForm: (form) => {
        const existing = get().savedForms.find((f) => f.siteId === form.siteId);
        const saved: SavedForm = existing
          ? {
              ...existing,
              ...form,
              id: existing.id,
              savedAt: Date.now(),
              fillCount: existing.fillCount,
            }
          : {
              ...form,
              id: uid("form"),
              savedAt: Date.now(),
              fillCount: 0,
            };
        set({
          savedForms: [
            saved,
            ...get().savedForms.filter((f) => f.id !== saved.id),
          ],
        });
        return saved;
      },
      recordFill: (formId, mappings) =>
        set({
          savedForms: get().savedForms.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  mappings,
                  lastFilledAt: Date.now(),
                  fillCount: f.fillCount + 1,
                }
              : f,
          ),
        }),
      deleteForm: (formId) =>
        set({ savedForms: get().savedForms.filter((f) => f.id !== formId) }),
      formForSite: (siteId) => get().savedForms.find((f) => f.siteId === siteId),
    }),
    {
      name: "imprint-vault",
      skipHydration: true,
      partialize: (s) => ({
        profiles: s.profiles,
        activeProfileId: s.activeProfileId,
        savedForms: s.savedForms,
        welcomeSeen: s.welcomeSeen,
      }),
    },
  ),
);

export function activeProfile(state: VaultState) {
  return (
    state.profiles.find((p) => p.id === state.activeProfileId) ??
    state.profiles[0]
  );
}
