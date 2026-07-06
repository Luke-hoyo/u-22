class Job {
  const Job({
    required this.id,
    required this.title,
    required this.region,
    required this.industry,
    required this.organizationName,
    required this.description,
    required this.monthlySalary,
    required this.workPeriodMonths,
    required this.expectedExemptionAmount,
    required this.housingSupport,
  });

  final String id;
  final String title;
  final String region;
  final String industry;
  final String organizationName;
  final String description;
  final int monthlySalary;
  final int workPeriodMonths;
  final int expectedExemptionAmount;
  final bool housingSupport;
}
