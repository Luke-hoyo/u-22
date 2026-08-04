import { Messaging, ID } from "node-appwrite";
import { createNotification, notifyRole } from "./notifications-store";
import { createAppwriteServerClient } from "./server";
import { getAppwriteConfig } from "./config";

export async function notifyJobPublished(input: {
  title: string;
  organization: string;
}) {
  await Promise.all([
    notifyRole("farmer", {
      title: "募集が公開されました",
      body: `${input.organization} / ${input.title}`,
      href: "/farmer/dashboard",
      tone: "success"
    }),
    notifyRole("operator", {
      title: "募集が公開されました",
      body: `${input.organization} / ${input.title}`,
      href: "/operator/dashboard",
      tone: "default"
    })
  ]);

  await trySendRolePush("farmer", {
    title: "募集が公開されました",
    body: `${input.organization} / ${input.title}`
  });
}

export async function notifyNewApplication(input: {
  jobTitle: string;
}) {
  await notifyRole("farmer", {
    title: "新着応募があります",
    body: `${input.jobTitle} への応募を確認してください。`,
    href: "/farmer/applicants",
    tone: "action"
  });

  await trySendRolePush("farmer", {
    title: "新着応募があります",
    body: `${input.jobTitle} への応募を確認してください。`
  });
}

export async function notifyUserDirect(input: {
  clerkUserId: string;
  title: string;
  body: string;
  href: string;
}) {
  await createNotification({
    clerkUserId: input.clerkUserId,
    title: input.title,
    body: input.body,
    href: input.href,
    tone: "default"
  });
}

async function trySendRolePush(role: string, message: { title: string; body: string }) {
  const providerId = process.env.APPWRITE_MESSAGING_PROVIDER_ID?.trim();

  if (!providerId) {
    return;
  }

  const config = getAppwriteConfig();

  if (!config.endpoint || !config.projectId || !config.apiKey) {
    return;
  }

  try {
    const { client } = createAppwriteServerClient();
    const messaging = new Messaging(client);

    await messaging.createPush({
      messageId: ID.unique(),
      title: message.title,
      body: message.body,
      topics: [role]
    });
  } catch (error) {
    console.warn("Appwrite Messaging push skipped", error);
  }
}
