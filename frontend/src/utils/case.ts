import { Case, CaseFormData, ThermalReactivity } from "@/types";

// A blank form. Every field is a present string so the inputs stay controlled.
export const emptyCaseFormData = (): CaseFormData => ({
  chiefComplaint: "",
  interrogation: {
    presentingComplaint: {
      locationExtension: "",
      sensation: "",
      modalities: "",
      concomitants: "",
    },
    historyOfPresentIllness: "",
    pastHistory: "",
    personalHistory: {
      thermalReactivity: "",
      appetite: "",
      desires: "",
      aversion: "",
      intolerance: "",
      thirst: "",
      bowel: "",
      urine: "",
      sleep: "",
      dream: "",
      perspiration: "",
      addiction: "",
      menses: "",
      mentals: "",
    },
  },
});

// Saved cases omit the fields that were left blank, so filling the edit form
// means layering what was stored back onto a complete blank form.
export const toCaseFormData = (existing: Case): CaseFormData => {
  const blank = emptyCaseFormData();
  const interrogation = existing.interrogation ?? {};

  return {
    chiefComplaint: existing.chiefComplaint ?? "",
    interrogation: {
      presentingComplaint: {
        ...blank.interrogation.presentingComplaint,
        ...interrogation.presentingComplaint,
      },
      historyOfPresentIllness: interrogation.historyOfPresentIllness ?? "",
      pastHistory: interrogation.pastHistory ?? "",
      personalHistory: {
        ...blank.interrogation.personalHistory,
        ...interrogation.personalHistory,
      },
    },
  };
};

// Drops blank fields so an untouched interrogation is left off the request
// entirely rather than saved as a tree of empty strings.
const pruneEmpty = (source: Record<string, string>) => {
  const filled = Object.entries(source).filter(([, value]) => value.trim());
  return filled.length ? Object.fromEntries(filled) : undefined;
};

const buildInterrogation = (data: CaseFormData["interrogation"]) => {
  const interrogation: Record<string, unknown> = {
    ...pruneEmpty({
      historyOfPresentIllness: data.historyOfPresentIllness,
      pastHistory: data.pastHistory,
    }),
  };

  const presentingComplaint = pruneEmpty(data.presentingComplaint);
  if (presentingComplaint) interrogation.presentingComplaint = presentingComplaint;

  const personalHistory = pruneEmpty(data.personalHistory as Record<string, string>);
  if (personalHistory) interrogation.personalHistory = personalHistory;

  return Object.keys(interrogation).length ? interrogation : undefined;
};

export const buildCasePayload = (data: CaseFormData) => ({
  chiefComplaint: data.chiefComplaint,
  interrogation: buildInterrogation(data.interrogation),
});

// True once anything beyond the chief complaint has been recorded — used to
// decide whether the Personal History section starts open when editing.
export const hasPersonalHistory = (existing?: Case) =>
  Boolean(
    existing?.interrogation?.personalHistory &&
    Object.keys(existing.interrogation.personalHistory).length,
  );

export const THERMAL_LABELS: Record<ThermalReactivity, string> = {
  HOT: "Hot",
  CHILLY: "Chilly",
  AMBITHERMAL: "Ambithermal",
};
