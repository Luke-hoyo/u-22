class Job {
  const Job({
    required this.id,
    required this.title,
    required this.region,
    required this.area,
    required this.industry,
    required this.organizationName,
    required this.description,
    required this.summary,
    required this.monthlySalary,
    required this.monthlySupport,
    required this.matchRate,
    required this.workPeriodMonths,
    required this.expectedExemptionAmount,
    required this.housingSupport,
    required this.training,
    required this.tags,
    required this.schedule,
  });

  final String id;
  final String title;
  final String region;
  final String area;
  final String industry;
  final String organizationName;
  final String description;
  final String summary;
  final int monthlySalary;
  final int monthlySupport;
  final int matchRate;
  final int workPeriodMonths;
  final int expectedExemptionAmount;
  final bool housingSupport;
  final bool training;
  final List<String> tags;
  final String schedule;
}
