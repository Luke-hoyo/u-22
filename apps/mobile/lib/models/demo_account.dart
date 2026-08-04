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

  DemoAccount copyWith({
    String? id,
    String? name,
    String? email,
    String? profile,
    int? scholarshipBalance,
    String? verificationStatus,
    String? myNumberStatus,
    String? taxStatus,
  }) {
    return DemoAccount(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      profile: profile ?? this.profile,
      scholarshipBalance: scholarshipBalance ?? this.scholarshipBalance,
      verificationStatus: verificationStatus ?? this.verificationStatus,
      myNumberStatus: myNumberStatus ?? this.myNumberStatus,
      taxStatus: taxStatus ?? this.taxStatus,
    );
  }
}
