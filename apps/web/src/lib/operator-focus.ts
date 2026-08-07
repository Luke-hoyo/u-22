import type { Industry } from "@/lib/app-data";

export type OperatorFocus = "community" | Industry;

export const operatorFocusOptions: Array<{ value: OperatorFocus; label: string; description: string }> =
  [
    {
      value: "community",
      label: "地域イベント",
      description: "若者向けの地域イベントとポイント付与を管理します。"
    },
    {
      value: "agriculture",
      label: "農業",
      description: "農業分野の募集審査と事業者向け招待を管理します。"
    },
    {
      value: "forestry",
      label: "林業",
      description: "林業分野の募集審査と事業者向け招待を管理します。"
    },
    {
      value: "fishery",
      label: "水産業",
      description: "水産業分野の募集審査と事業者向け招待を管理します。"
    }
  ];

const storageKey = "hatarukun:operator-focus";

export function readOperatorFocus(): OperatorFocus {
  if (typeof window === "undefined") {
    return "agriculture";
  }

  const value = window.localStorage.getItem(storageKey);

  if (
    value === "community" ||
    value === "agriculture" ||
    value === "forestry" ||
    value === "fishery"
  ) {
    return value;
  }

  return "agriculture";
}

export function writeOperatorFocus(focus: OperatorFocus) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, focus);
  }
}

export function getOperatorFocusLabel(focus: OperatorFocus) {
  return operatorFocusOptions.find((option) => option.value === focus)?.label ?? "農業";
}

export function getOperatorInviteCodePreview(focus: OperatorFocus) {
  switch (focus) {
    case "community":
      return "EVT-HIROSHIMA-2026";
    case "agriculture":
      return "FARM-AGRI-MINORI";
    case "forestry":
      return "FARM-FOR-HITA";
    case "fishery":
      return "FARM-FISH-UWA";
    default:
      return "FARM-AGRI-MINORI";
  }
}
