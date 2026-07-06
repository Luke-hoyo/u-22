class DemoAccount {
  const DemoAccount({
    required this.id,
    required this.name,
    required this.email,
    required this.profile,
    required this.scholarshipBalance,
    required this.verificationStatus,
    required this.myNumberStatus,
    required this.taxStatus,
  });

  final String id;
  final String name;
  final String email;
  final String profile;
  final int scholarshipBalance;
  final String verificationStatus;
  final String myNumberStatus;
  final String taxStatus;
}
