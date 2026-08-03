enum AppUserRole {
  youngUser('young_user', '若者ユーザー'),
  farmer('farmer', '農家・事業者'),
  municipality('municipality', '自治体'),
  operator('operator', '運営');

  const AppUserRole(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static AppUserRole fromApiValue(String? value) {
    return AppUserRole.values.firstWhere(
      (role) => role.apiValue == value,
      orElse: () => AppUserRole.youngUser,
    );
  }

  bool get isAdmin =>
      this == AppUserRole.farmer ||
      this == AppUserRole.municipality ||
      this == AppUserRole.operator;
}

String adminHomeLabel(AppUserRole role) {
  return switch (role) {
    AppUserRole.operator => '運営ダッシュボード',
    AppUserRole.municipality => '自治体ダッシュボード',
    AppUserRole.farmer => '農家ホーム',
    AppUserRole.youngUser => 'ホーム',
  };
}
