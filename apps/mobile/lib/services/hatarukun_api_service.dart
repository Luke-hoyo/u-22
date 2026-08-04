import 'dart:convert';
import 'dart:io';

import '../data/admin_mock_data.dart';
import '../models/job.dart';

const _defaultApiBaseUrl = 'https://hatarukun.jp';

class ApiApplication {
  const ApiApplication({
    required this.id,
    required this.jobId,
    required this.status,
    required this.appliedAt,
    required this.nextAction,
    required this.expectedSupport,
  });

  final String id;
  final String jobId;
  final String status;
  final String appliedAt;
  final String nextAction;
  final int expectedSupport;

  factory ApiApplication.fromJson(Map<String, dynamic> json) {
    return ApiApplication(
      id: json['id'] is String ? json['id'] as String : '',
      jobId: json['jobId'] is String ? json['jobId'] as String : '',
      status: json['status'] is String ? json['status'] as String : 'applied',
      appliedAt: json['appliedAt'] is String ? json['appliedAt'] as String : '',
      nextAction:
          json['nextAction'] is String ? json['nextAction'] as String : '',
      expectedSupport: json['expectedSupport'] is int
          ? json['expectedSupport'] as int
          : 0,
    );
  }
}

class ApiCommunityEvent {
  const ApiCommunityEvent({
    required this.id,
    required this.title,
    required this.region,
    required this.date,
    required this.points,
    required this.category,
  });

  final String id;
  final String title;
  final String region;
  final String date;
  final int points;
  final String category;

  factory ApiCommunityEvent.fromJson(Map<String, dynamic> json) {
    return ApiCommunityEvent(
      id: json['id'] is String ? json['id'] as String : '',
      title: json['title'] is String ? json['title'] as String : '',
      region: json['region'] is String ? json['region'] as String : '',
      date: json['date'] is String ? json['date'] as String : '',
      points: json['points'] is int ? json['points'] as int : 0,
      category: json['category'] is String ? json['category'] as String : '',
    );
  }
}

class ApiPointTransaction {
  const ApiPointTransaction({
    required this.id,
    required this.label,
    required this.date,
    required this.amount,
  });

  final String id;
  final String label;
  final String date;
  final int amount;

  factory ApiPointTransaction.fromJson(Map<String, dynamic> json) {
    return ApiPointTransaction(
      id: json['id'] is String ? json['id'] as String : '',
      label: json['label'] is String ? json['label'] as String : 'ポイント変動',
      date: json['date'] is String ? json['date'] as String : '',
      amount: json['amount'] is int ? json['amount'] as int : 0,
    );
  }
}

class ApiPointsSnapshot {
  const ApiPointsSnapshot({
    required this.balance,
    required this.transactions,
    required this.participatedEventIds,
    required this.exchangedRewardIds,
  });

  final int balance;
  final List<ApiPointTransaction> transactions;
  final List<String> participatedEventIds;
  final List<String> exchangedRewardIds;
}

class ApiProfilePreferences {
  const ApiProfilePreferences({
    required this.birthDate,
    required this.address,
    required this.workStyle,
    required this.industries,
    required this.regions,
    required this.period,
    required this.housingSupport,
    required this.scholarshipBalance,
  });

  final String birthDate;
  final String address;
  final String workStyle;
  final String industries;
  final String regions;
  final String period;
  final bool housingSupport;
  final int scholarshipBalance;

  factory ApiProfilePreferences.fromJson(Map<String, dynamic> json) {
    return ApiProfilePreferences(
      birthDate: json['birthDate'] is String ? json['birthDate'] as String : '',
      address: json['address'] is String ? json['address'] as String : '',
      workStyle: json['workStyle'] is String ? json['workStyle'] as String : '',
      industries:
          json['industries'] is String ? json['industries'] as String : '',
      regions: json['regions'] is String ? json['regions'] as String : '',
      period: json['period'] is String ? json['period'] as String : '',
      housingSupport: json['housingSupport'] == true,
      scholarshipBalance: json['scholarshipBalance'] is int
          ? json['scholarshipBalance'] as int
          : 0,
    );
  }
}

class HatarukunApiService {
  HatarukunApiService({
    String baseUrl = const String.fromEnvironment(
      'HATARAKUN_API_BASE_URL',
      defaultValue: _defaultApiBaseUrl,
    ),
    HttpClient? client,
  })  : _baseUrl = baseUrl.replaceFirst(RegExp(r'/$'), ''),
        _client = client ?? HttpClient();

  final String _baseUrl;
  final HttpClient _client;

  Future<Map<String, dynamic>> _get(
    String path, {
    String? sessionToken,
  }) async {
    final request = await _client.getUrl(Uri.parse('$_baseUrl$path'));
    if (sessionToken != null) {
      request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $sessionToken');
    }

    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    final json = body.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(body) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw HttpException(
        json['message'] is String ? json['message'] as String : 'API request failed',
        uri: Uri.parse('$_baseUrl$path'),
      );
    }

    return json;
  }

  Future<Map<String, dynamic>> _post(
    String path, {
    required String sessionToken,
    Map<String, dynamic>? body,
  }) async {
    final request = await _client.postUrl(Uri.parse('$_baseUrl$path'));
    request.headers
      ..contentType = ContentType.json
      ..set(HttpHeaders.authorizationHeader, 'Bearer $sessionToken');
    if (body != null) {
      request.write(jsonEncode(body));
    }

    final response = await request.close();
    final responseBody = await response.transform(utf8.decoder).join();
    final json = responseBody.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(responseBody) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw HttpException(
        json['message'] is String ? json['message'] as String : 'API request failed',
        uri: Uri.parse('$_baseUrl$path'),
      );
    }

    return json;
  }

  Future<List<Job>> fetchJobs({required String sessionToken}) async {
    final json = await _get('/api/appwrite/jobs', sessionToken: sessionToken);
    final jobs = json['jobs'];

    if (jobs is! List) return const [];

    return jobs
        .whereType<Map<String, dynamic>>()
        .map(Job.fromApiJson)
        .toList();
  }

  Future<List<ApiCommunityEvent>> fetchEvents() async {
    final json = await _get('/api/events');
    final events = json['events'];

    if (events is! List) return const [];

    return events
        .whereType<Map<String, dynamic>>()
        .map(ApiCommunityEvent.fromJson)
        .toList();
  }

  Future<List<ApiApplication>> fetchApplications({
    required String sessionToken,
  }) async {
    final json =
        await _get('/api/applications', sessionToken: sessionToken);
    final applications = json['applications'];

    if (applications is! List) return const [];

    return applications
        .whereType<Map<String, dynamic>>()
        .map(ApiApplication.fromJson)
        .toList();
  }

  Future<ApiApplication> createApplication({
    required String sessionToken,
    required String jobId,
    required int expectedSupport,
  }) async {
    final json = await _post(
      '/api/applications',
      sessionToken: sessionToken,
      body: {
        'jobId': jobId,
        'expectedSupport': expectedSupport,
      },
    );

    final application = json['application'];
    if (application is Map<String, dynamic>) {
      return ApiApplication.fromJson(application);
    }

    throw const HttpException('応募内容を保存できませんでした。');
  }

  Future<ApiPointsSnapshot> fetchPoints({required String sessionToken}) async {
    final json = await _get('/api/points', sessionToken: sessionToken);
    final transactions = json['transactions'];

    return ApiPointsSnapshot(
      balance: json['balance'] is int ? json['balance'] as int : 0,
      transactions: transactions is List
          ? transactions
              .whereType<Map<String, dynamic>>()
              .map(ApiPointTransaction.fromJson)
              .toList()
          : const [],
      participatedEventIds: json['participatedEventIds'] is List
          ? (json['participatedEventIds'] as List)
              .whereType<String>()
              .toList()
          : const [],
      exchangedRewardIds: json['exchangedRewardIds'] is List
          ? (json['exchangedRewardIds'] as List).whereType<String>().toList()
          : const [],
    );
  }

  Future<void> participateInEvent({
    required String sessionToken,
    required String eventId,
  }) async {
    await _post(
      '/api/points/events',
      sessionToken: sessionToken,
      body: {'eventId': eventId},
    );
  }

  Future<int> exchangeReward({
    required String sessionToken,
    required String rewardId,
  }) async {
    final json = await _post(
      '/api/points/rewards',
      sessionToken: sessionToken,
      body: {'rewardId': rewardId},
    );

    return json['balance'] is int ? json['balance'] as int : 0;
  }

  Future<ApiProfilePreferences?> fetchProfilePreferences({
    required String sessionToken,
  }) async {
    final json = await _get('/api/profile', sessionToken: sessionToken);
    final preferences = json['preferences'];

    if (preferences is! Map<String, dynamic>) return null;

    return ApiProfilePreferences.fromJson(preferences);
  }

  Future<ApiProfilePreferences> saveProfilePreferences({
    required String sessionToken,
    required ApiProfilePreferences preferences,
  }) async {
    final request = await _client.openUrl('patch', Uri.parse('$_baseUrl/api/profile'));
    request.headers
      ..contentType = ContentType.json
      ..set(HttpHeaders.authorizationHeader, 'Bearer $sessionToken');
    request.write(
      jsonEncode({
        'birthDate': preferences.birthDate,
        'address': preferences.address,
        'workStyle': preferences.workStyle,
        'industries': preferences.industries,
        'regions': preferences.regions,
        'period': preferences.period,
        'housingSupport': preferences.housingSupport,
        'scholarshipBalance': preferences.scholarshipBalance,
      }),
    );

    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    final json = body.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(body) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw HttpException(
        json['message'] is String ? json['message'] as String : 'プロフィールを保存できませんでした。',
      );
    }

    final saved = json['preferences'];
    if (saved is Map<String, dynamic>) {
      return ApiProfilePreferences.fromJson(saved);
    }

    return preferences;
  }

  Future<Map<String, dynamic>> _patch(
    String path, {
    required String sessionToken,
    Map<String, dynamic>? body,
  }) async {
    final request = await _client.openUrl('patch', Uri.parse('$_baseUrl$path'));
    request.headers
      ..contentType = ContentType.json
      ..set(HttpHeaders.authorizationHeader, 'Bearer $sessionToken');
    if (body != null) {
      request.write(jsonEncode(body));
    }

    final response = await request.close();
    final responseBody = await response.transform(utf8.decoder).join();
    final json = responseBody.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(responseBody) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw HttpException(
        json['message'] is String ? json['message'] as String : 'API request failed',
        uri: Uri.parse('$_baseUrl$path'),
      );
    }

    return json;
  }

  Future<List<AdminManagedJob>> fetchManagedJobs({
    required String sessionToken,
  }) async {
    final json = await _get('/api/admin/jobs', sessionToken: sessionToken);
    final jobs = json['jobs'];
    if (jobs is! List) return const [];

    return jobs
        .whereType<Map<String, dynamic>>()
        .map(_parseManagedJob)
        .whereType<AdminManagedJob>()
        .toList();
  }

  Future<AdminManagedJob> saveManagedJob({
    required String sessionToken,
    required AdminManagedJob job,
  }) async {
    final json = await _post(
      '/api/admin/jobs',
      sessionToken: sessionToken,
      body: {
        'id': job.id,
        'title': job.title,
        'organization': job.organization,
        'area': job.area,
        'industry': job.industry,
        'status': _adminJobStatusToApi(job.status),
        'capacity': job.capacity,
        'applicants': job.applicants,
      },
    );

    final saved = json['job'];
    if (saved is Map<String, dynamic>) {
      return _parseManagedJob(saved) ?? job;
    }

    return job;
  }

  Future<void> updateManagedJobStatus({
    required String sessionToken,
    required String jobId,
    required AdminJobStatus status,
  }) async {
    await _patch(
      '/api/admin/jobs',
      sessionToken: sessionToken,
      body: {
        'jobId': jobId,
        'status': _adminJobStatusToApi(status),
      },
    );
  }

  Future<List<AdminApplicant>> fetchAdminApplicants({
    required String sessionToken,
  }) async {
    final json = await _get('/api/admin/applicants', sessionToken: sessionToken);
    final applicants = json['applicants'];
    if (applicants is! List) return const [];

    return applicants
        .whereType<Map<String, dynamic>>()
        .map(_parseAdminApplicant)
        .whereType<AdminApplicant>()
        .toList();
  }

  Future<void> updateAdminApplicantStatus({
    required String sessionToken,
    required String applicationId,
    required AdminApplicantStatus status,
  }) async {
    await _patch(
      '/api/admin/applicants',
      sessionToken: sessionToken,
      body: {
        'applicationId': applicationId,
        'status': _adminApplicantStatusToApi(status),
      },
    );
  }

  Future<List<AdminPointRequest>> fetchPointRequests({
    required String sessionToken,
  }) async {
    final json = await _get('/api/admin/point-requests', sessionToken: sessionToken);
    final requests = json['pointRequests'];
    if (requests is! List) return const [];

    return requests
        .whereType<Map<String, dynamic>>()
        .map(_parsePointRequest)
        .whereType<AdminPointRequest>()
        .toList();
  }

  Future<void> updatePointRequestStatus({
    required String sessionToken,
    required String requestId,
    required AdminPointRequestStatus status,
  }) async {
    await _patch(
      '/api/admin/point-requests',
      sessionToken: sessionToken,
      body: {
        'requestId': requestId,
        'status': _adminPointRequestStatusToApi(status),
      },
    );
  }

  Future<List<FarmerApplication>> fetchFarmerApplications({
    required String sessionToken,
  }) async {
    final json = await _get('/api/farmer/applications', sessionToken: sessionToken);
    final applications = json['applications'];
    if (applications is! List) return const [];

    return applications
        .whereType<Map<String, dynamic>>()
        .map(_parseFarmerApplication)
        .whereType<FarmerApplication>()
        .toList();
  }

  Future<void> updateFarmerApplicationStatus({
    required String sessionToken,
    required String applicationId,
    required FarmerApplicationStatus status,
  }) async {
    await _patch(
      '/api/farmer/applications',
      sessionToken: sessionToken,
      body: {
        'applicationId': applicationId,
        'status': _farmerApplicationStatusToApi(status),
      },
    );
  }

  Future<OperatorFocus> fetchOperatorFocus({
    required String sessionToken,
  }) async {
    final json = await _get('/api/profile/operator-focus', sessionToken: sessionToken);
    final focus = json['focus'];
    return _parseOperatorFocus(focus is String ? focus : null);
  }

  Future<void> saveOperatorFocus({
    required String sessionToken,
    required OperatorFocus focus,
  }) async {
    await _patch(
      '/api/profile/operator-focus',
      sessionToken: sessionToken,
      body: {'focus': _operatorFocusToApi(focus)},
    );
  }
}

AdminManagedJob? _parseManagedJob(Map<String, dynamic> json) {
  final id = json['id'];
  final title = json['title'];
  if (id is! String || title is! String) return null;

  return AdminManagedJob(
    id: id,
    title: title,
    organization: json['organization'] is String ? json['organization'] as String : '',
    area: json['area'] is String ? json['area'] as String : '',
    industry: json['industry'] is String ? json['industry'] as String : 'agriculture',
    status: _parseAdminJobStatus(json['status']),
    applicants: json['applicants'] is int ? json['applicants'] as int : 0,
    capacity: json['capacity'] is int ? json['capacity'] as int : 1,
    updatedAt: json['updatedAt'] is String ? json['updatedAt'] as String : '',
  );
}

AdminApplicant? _parseAdminApplicant(Map<String, dynamic> json) {
  final id = json['id'];
  final name = json['name'];
  if (id is! String || name is! String) return null;

  return AdminApplicant(
    id: id,
    name: name,
    birthDate: json['birthDate'] is String ? json['birthDate'] as String : '',
    address: json['address'] is String ? json['address'] as String : '',
    myNumberStatus:
        json['myNumberStatus'] is String ? json['myNumberStatus'] as String : '未登録',
    region: json['region'] is String ? json['region'] as String : '',
    jobTitle: json['jobTitle'] is String ? json['jobTitle'] as String : '',
    status: _parseAdminApplicantStatus(json['status']),
    nextAction: json['nextAction'] is String ? json['nextAction'] as String : '',
  );
}

AdminPointRequest? _parsePointRequest(Map<String, dynamic> json) {
  final id = json['id'];
  if (id is! String) return null;

  return AdminPointRequest(
    id: id,
    applicantName:
        json['applicantName'] is String ? json['applicantName'] as String : '',
    eventTitle: json['eventTitle'] is String ? json['eventTitle'] as String : '',
    points: json['points'] is int ? json['points'] as int : 0,
    status: _parsePointRequestStatus(json['status']),
    submittedAt: json['submittedAt'] is String ? json['submittedAt'] as String : '',
  );
}

FarmerApplication? _parseFarmerApplication(Map<String, dynamic> json) {
  final id = json['id'];
  final farmName = json['farmName'];
  if (id is! String || farmName is! String) return null;

  return FarmerApplication(
    id: id,
    farmName: farmName,
    representativeName:
        json['representativeName'] is String ? json['representativeName'] as String : '',
    email: json['email'] is String ? json['email'] as String : '',
    region: json['region'] is String ? json['region'] as String : '',
    area: json['area'] is String ? json['area'] as String : '',
    industry: json['industry'] is String ? json['industry'] as String : 'agriculture',
    capacity: json['capacity'] is int ? json['capacity'] as int : 1,
    desiredStartMonth:
        json['desiredStartMonth'] is String ? json['desiredStartMonth'] as String : '',
    housingSupport: json['housingSupport'] == true,
    status: _parseFarmerApplicationStatus(json['status']),
    submittedAt: json['submittedAt'] is String ? json['submittedAt'] as String : '',
    note: json['note'] is String ? json['note'] as String : '',
  );
}

AdminJobStatus _parseAdminJobStatus(Object? value) {
  return switch (value) {
    'review' => AdminJobStatus.review,
    'approved' => AdminJobStatus.approved,
    'published' => AdminJobStatus.published,
    'rejected' => AdminJobStatus.rejected,
    'paused' => AdminJobStatus.paused,
    _ => AdminJobStatus.draft,
  };
}

String _adminJobStatusToApi(AdminJobStatus status) {
  return switch (status) {
    AdminJobStatus.review => 'review',
    AdminJobStatus.approved => 'approved',
    AdminJobStatus.published => 'published',
    AdminJobStatus.rejected => 'rejected',
    AdminJobStatus.paused => 'paused',
    AdminJobStatus.draft => 'draft',
  };
}

AdminApplicantStatus _parseAdminApplicantStatus(Object? value) {
  return switch (value) {
    'screening' => AdminApplicantStatus.screening,
    'interview' => AdminApplicantStatus.interview,
    'accepted' => AdminApplicantStatus.accepted,
    _ => AdminApplicantStatus.newApplicant,
  };
}

String _adminApplicantStatusToApi(AdminApplicantStatus status) {
  return switch (status) {
    AdminApplicantStatus.screening => 'screening',
    AdminApplicantStatus.interview => 'interview',
    AdminApplicantStatus.accepted => 'accepted',
    AdminApplicantStatus.newApplicant => 'new',
  };
}

AdminPointRequestStatus _parsePointRequestStatus(Object? value) {
  return switch (value) {
    'approved' => AdminPointRequestStatus.approved,
    'hold' => AdminPointRequestStatus.hold,
    _ => AdminPointRequestStatus.pending,
  };
}

String _adminPointRequestStatusToApi(AdminPointRequestStatus status) {
  return switch (status) {
    AdminPointRequestStatus.approved => 'approved',
    AdminPointRequestStatus.hold => 'hold',
    AdminPointRequestStatus.pending => 'pending',
  };
}

FarmerApplicationStatus _parseFarmerApplicationStatus(Object? value) {
  return switch (value) {
    'approved' => FarmerApplicationStatus.approved,
    'rejected' => FarmerApplicationStatus.rejected,
    _ => FarmerApplicationStatus.pending,
  };
}

String _farmerApplicationStatusToApi(FarmerApplicationStatus status) {
  return switch (status) {
    FarmerApplicationStatus.approved => 'approved',
    FarmerApplicationStatus.rejected => 'rejected',
    FarmerApplicationStatus.pending => 'pending',
  };
}

OperatorFocus _parseOperatorFocus(String? value) {
  return switch (value) {
    'forestry' => OperatorFocus.forestry,
    'fishery' => OperatorFocus.fishery,
    'community' => OperatorFocus.community,
    _ => OperatorFocus.agriculture,
  };
}

String _operatorFocusToApi(OperatorFocus focus) {
  return switch (focus) {
    OperatorFocus.forestry => 'forestry',
    OperatorFocus.fishery => 'fishery',
    OperatorFocus.community => 'community',
    OperatorFocus.agriculture => 'agriculture',
  };
}
