"use client";

import {
  farmerApplicationStorageKey,
  farmerApplications,
  type FarmerApplication
} from "@/lib/app-data";

function isFarmerApplication(value: unknown): value is FarmerApplication {
  if (!value || typeof value !== "object") {
    return false;
  }

  const application = value as Partial<FarmerApplication>;

  return (
    typeof application.id === "string" &&
    typeof application.farmName === "string" &&
    typeof application.representativeName === "string" &&
    typeof application.email === "string" &&
    typeof application.region === "string" &&
    typeof application.area === "string" &&
    typeof application.industry === "string" &&
    typeof application.capacity === "number" &&
    typeof application.desiredStartMonth === "string" &&
    typeof application.housingSupport === "boolean" &&
    typeof application.status === "string" &&
    typeof application.submittedAt === "string" &&
    typeof application.note === "string"
  );
}

export function readStoredFarmerApplications() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawApplications = window.localStorage.getItem(farmerApplicationStorageKey);
    if (!rawApplications) {
      return [];
    }

    const parsedApplications: unknown = JSON.parse(rawApplications);
    return Array.isArray(parsedApplications)
      ? parsedApplications.filter(isFarmerApplication)
      : [];
  } catch {
    return [];
  }
}

export function readDemoFarmerApplications() {
  const mergedApplications = new Map(
    farmerApplications.map((application) => [application.id, application])
  );

  for (const application of readStoredFarmerApplications()) {
    mergedApplications.set(application.id, application);
  }

  return Array.from(mergedApplications.values());
}

export function writeDemoFarmerApplications(applications: FarmerApplication[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(farmerApplicationStorageKey, JSON.stringify(applications));
}

export function addDemoFarmerApplication(application: FarmerApplication) {
  const currentApplications = readDemoFarmerApplications();
  writeDemoFarmerApplications([
    application,
    ...currentApplications.filter((currentApplication) => currentApplication.id !== application.id)
  ]);
}
