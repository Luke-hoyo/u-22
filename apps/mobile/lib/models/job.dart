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

  factory Job.fromApiJson(Map<String, dynamic> json) {
    final periodMonths = json['periodMonths'];
    var workPeriodMonths = 6;

    if (periodMonths is List && periodMonths.isNotEmpty) {
      final values = periodMonths.whereType<num>().map((value) => value.toInt()).toList();
      workPeriodMonths = values.isNotEmpty ? values.last : 6;
    } else if (periodMonths is String) {
      final values = periodMonths
          .split(',')
          .map((value) => int.tryParse(value.trim()))
          .whereType<int>()
          .toList();
      workPeriodMonths = values.isNotEmpty ? values.last : 6;
    }

    final industryCode = json['industry'] is String ? json['industry'] as String : '';
    final tags = json['tags'];

    return Job(
      id: json['id'] is String ? json['id'] as String : '',
      title: json['title'] is String ? json['title'] as String : '地域のしごと',
      region: json['region'] is String ? json['region'] as String : '未設定',
      area: json['area'] is String ? json['area'] as String : '未設定',
      industry: _industryLabel(industryCode),
      organizationName:
          json['organization'] is String ? json['organization'] as String : '地域事業者',
      description: json['description'] is String
          ? json['description'] as String
          : (json['summary'] is String ? json['summary'] as String : ''),
      summary: json['summary'] is String ? json['summary'] as String : '',
      monthlySalary:
          json['monthlySalary'] is int ? json['monthlySalary'] as int : 0,
      monthlySupport:
          json['monthlySupport'] is int ? json['monthlySupport'] as int : 0,
      matchRate: json['matchRate'] is int ? json['matchRate'] as int : 70,
      workPeriodMonths: workPeriodMonths,
      expectedExemptionAmount: (json['monthlySupport'] is int
              ? json['monthlySupport'] as int
              : 0) *
          workPeriodMonths,
      housingSupport: json['housingSupport'] == true,
      training: json['training'] == true,
      tags: tags is List
          ? tags.whereType<String>().toList()
          : tags is String
              ? tags
                  .split(',')
                  .map((value) => value.trim())
                  .where((value) => value.isNotEmpty)
                  .toList()
              : const [],
      schedule: json['schedule'] is String ? json['schedule'] as String : '勤務時間は要確認',
    );
  }

  static String _industryLabel(String code) {
    return switch (code) {
      'forestry' => '林業',
      'fishery' => '水産業',
      _ => '農業',
    };
  }
}
