type ClerkErrorShape = {
  errors?: Array<{ code?: string; message?: string; longMessage?: string }>;
  code?: string;
  message?: string;
};

export function getClerkAuthErrorMessage(error: unknown, mode: "signIn" | "signUp") {
  const payload = error as ClerkErrorShape;
  const firstCode = payload.errors?.[0]?.code ?? payload.code ?? "";
  const firstMessage = payload.errors?.[0]?.longMessage ?? payload.errors?.[0]?.message ?? payload.message;
  const normalized = `${firstCode} ${firstMessage ?? ""}`.toLowerCase();

  if (normalized.includes("not found") || firstCode === "form_identifier_not_found") {
    return mode === "signIn"
      ? "メールアドレスまたはユーザーIDが見つかりません。新規登録をお試しください。"
      : "このメールアドレスは登録できません。入力内容を確認してください。";
  }

  if (normalized.includes("already") || firstCode === "form_identifier_exists") {
    return "このメールアドレスは登録済みです。ログインをお試しください。";
  }

  if (normalized.includes("code") || firstCode === "form_code_incorrect") {
    return "認証コードが正しくないか、有効期限が切れています。";
  }

  if (firstMessage) {
    return firstMessage;
  }

  return "認証に失敗しました。入力内容を確認して、もう一度お試しください。";
}
