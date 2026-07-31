enum HatarukunUserRole {
  youngUser('young_user'),
  farmer('farmer');

  const HatarukunUserRole(this.apiValue);

  final String apiValue;
}

class OnboardingProfile {
  const OnboardingProfile({
    required this.role,
    required this.displayName,
    required this.email,
    required this.prefecture,
    required this.city,
    required this.consentedAt,
    this.desiredIndustry = '',
    this.desiredStartMonth = '',
    this.workPeriodMonths = 12,
    this.scholarshipBalance = 0,
    this.organizationName = '',
    this.organizationType = '',
  });

  final HatarukunUserRole role;
  final String displayName;
  final String email;
  final String prefecture;
  final String city;
  final String desiredIndustry;
  final String desiredStartMonth;
  final int workPeriodMonths;
  final int scholarshipBalance;
  final String organizationName;
  final String organizationType;
  final DateTime consentedAt;

  Map<String, Object> toJson() {
    return {
      'role': role.apiValue,
      'displayName': displayName,
      'email': email,
      'prefecture': prefecture,
      'city': city,
      'desiredIndustry': desiredIndustry,
      'desiredStartMonth': desiredStartMonth,
      'workPeriodMonths': workPeriodMonths,
      'scholarshipBalance': scholarshipBalance,
      'organizationName': organizationName,
      'organizationType': organizationType,
      'consentedAt': consentedAt.toUtc().toIso8601String(),
    };
  }
}
