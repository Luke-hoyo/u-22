export function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateAuthIdentifier(value: string, mode: "signIn" | "signUp") {
  const trimmed = value.trim();

  if (!trimmed) {
    return mode === "signUp"
      ? "メールアドレスを入力してください。"
      : "メールアドレスまたはユーザーIDを入力してください。";
  }

  if (mode === "signUp" && !isEmailAddress(trimmed)) {
    return "正しいメールアドレスを入力してください。";
  }

  return null;
}

/** Email OTP needs a real mailbox; username/ID alone is not enough. */
export function validateEmailForAuthCode(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "認証コードを送るには、メールアドレスを入力してください。";
  }

  if (!isEmailAddress(trimmed)) {
    return "認証コードを送るには、メールアドレスを入力してください。ユーザーIDの場合はパスワードでログインしてください。";
  }

  return null;
}

export function getAuthCodeDeliveryMessage(identifier: string) {
  const trimmed = identifier.trim();

  if (isEmailAddress(trimmed)) {
    return `${trimmed} に届いた6桁のコードを入力してください。`;
  }

  return "登録メールアドレスに届いた6桁のコードを入力してください。";
}
