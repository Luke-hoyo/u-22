bool isEmailAddress(String value) {
  return RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value.trim());
}

String? validateAuthIdentifier(String value, {required bool isSignUp}) {
  final trimmed = value.trim();

  if (trimmed.isEmpty) {
    return isSignUp
        ? 'メールアドレスを入力してください。'
        : 'メールアドレスまたはユーザーIDを入力してください。';
  }

  if (isSignUp && !isEmailAddress(trimmed)) {
    return '正しいメールアドレスを入力してください。';
  }

  return null;
}

/// Email OTP needs a real mailbox; username/ID alone is not enough.
String? validateEmailForAuthCode(String value) {
  final trimmed = value.trim();

  if (trimmed.isEmpty) {
    return '認証コードを送るには、メールアドレスを入力してください。';
  }

  if (!isEmailAddress(trimmed)) {
    return '認証コードを送るには、メールアドレスを入力してください。ユーザーIDの場合はパスワードでログインしてください。';
  }

  return null;
}

String getAuthCodeDeliveryMessage(String identifier) {
  final trimmed = identifier.trim();

  if (isEmailAddress(trimmed)) {
    return '$trimmed に届いた6桁のコードを入力してください。';
  }

  return '登録メールアドレスに届いた6桁のコードを入力してください。';
}

String formatAgeGroupFromBirthDate(String birthDate) {
  if (birthDate.trim().isEmpty) {
    return '未設定';
  }

  final parsed = DateTime.tryParse(birthDate.trim());
  if (parsed == null) {
    return '未設定';
  }

  final today = DateTime.now();
  var age = today.year - parsed.year;
  final hadBirthdayThisYear = today.month > parsed.month ||
      (today.month == parsed.month && today.day >= parsed.day);
  if (!hadBirthdayThisYear) {
    age -= 1;
  }

  if (age < 20) return '10代';
  if (age < 30) return '20代';
  if (age < 40) return '30代';
  return '40代以上';
}

String profileRegionLabel({
  required String regions,
  required String birthDate,
}) {
  final region = regions.split('、').first.trim();
  final ageGroup = formatAgeGroupFromBirthDate(birthDate);
  final regionLabel = region.isEmpty ? '未設定' : region;
  return '$regionLabel / $ageGroup';
}
