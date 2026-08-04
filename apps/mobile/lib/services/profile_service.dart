import 'dart:convert';
import 'dart:io';

import '../models/onboarding_profile.dart';
import '../models/user_role.dart';

const _defaultApiBaseUrl = 'https://hatarukun.jp';

class ProfileSaveResult {
  const ProfileSaveResult({
    required this.savedToAppwrite,
    required this.status,
  });

  final bool savedToAppwrite;
  final String status;
}

class SavedProfile {
  const SavedProfile({
    required this.role,
    required this.status,
    required this.displayName,
    required this.email,
    required this.prefecture,
    required this.city,
    required this.desiredIndustry,
    required this.desiredStartMonth,
    required this.workPeriodMonths,
    required this.scholarshipBalance,
    required this.organizationName,
    required this.organizationType,
  });

  final HatarukunUserRole role;
  final String status;
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

  factory SavedProfile.fromJson(Map<String, dynamic> json) {
    return SavedProfile(
      role: _roleFromApiValue(json['role']),
      status: json['status'] is String ? json['status'] as String : 'active',
      displayName:
          json['displayName'] is String ? json['displayName'] as String : '',
      email: json['email'] is String ? json['email'] as String : '',
      prefecture:
          json['prefecture'] is String ? json['prefecture'] as String : '',
      city: json['city'] is String ? json['city'] as String : '',
      desiredIndustry: json['desiredIndustry'] is String
          ? json['desiredIndustry'] as String
          : '',
      desiredStartMonth: json['desiredStartMonth'] is String
          ? json['desiredStartMonth'] as String
          : '',
      workPeriodMonths:
          json['workPeriodMonths'] is int ? json['workPeriodMonths'] as int : 0,
      scholarshipBalance: json['scholarshipBalance'] is int
          ? json['scholarshipBalance'] as int
          : 0,
      organizationName: json['organizationName'] is String
          ? json['organizationName'] as String
          : '',
      organizationType: json['organizationType'] is String
          ? json['organizationType'] as String
          : '',
    );
  }

  static HatarukunUserRole _roleFromApiValue(Object? value) {
    for (final role in HatarukunUserRole.values) {
      if (role.apiValue == value) return role;
    }
    return HatarukunUserRole.youngUser;
  }
}

class ClerkSession {
  const ClerkSession({
    required this.clerkRole,
    required this.canAccessAdmin,
    required this.displayName,
    required this.email,
    this.profile,
  });

  final AppUserRole clerkRole;
  final bool canAccessAdmin;
  final String displayName;
  final String email;
  final SavedProfile? profile;

  factory ClerkSession.fromJson(Map<String, dynamic> json) {
    final session = json['session'];
    if (session is! Map<String, dynamic>) {
      throw ProfileSaveException('セッション情報を取得できませんでした。');
    }

    final profileJson = session['profile'];

    return ClerkSession(
      clerkRole: AppUserRole.fromApiValue(
        session['clerkRole'] is String ? session['clerkRole'] as String : null,
      ),
      canAccessAdmin: session['canAccessAdmin'] == true,
      displayName: session['displayName'] is String
          ? session['displayName'] as String
          : '',
      email: session['email'] is String ? session['email'] as String : '',
      profile: profileJson is Map<String, dynamic>
          ? SavedProfile.fromJson(profileJson)
          : null,
    );
  }
}

abstract interface class ProfileRepository {
  Future<ClerkSession> fetchSession({required String sessionToken});

  Future<SavedProfile?> fetchCurrent({required String sessionToken});

  Future<ProfileSaveResult> save({
    required String sessionToken,
    required OnboardingProfile profile,
  });
}

class ApiProfileRepository implements ProfileRepository {
  ApiProfileRepository({
    String baseUrl = const String.fromEnvironment(
      'HATARAKUN_API_BASE_URL',
      defaultValue: _defaultApiBaseUrl,
    ),
    HttpClient? client,
  })  : _baseUrl = baseUrl.replaceFirst(RegExp(r'/$'), ''),
        _client = client ?? HttpClient();

  final String _baseUrl;
  final HttpClient _client;

  @override
  Future<ClerkSession> fetchSession({required String sessionToken}) async {
    final request = await _client.getUrl(
      Uri.parse('$_baseUrl/api/mobile/session'),
    );
    request.headers.set(
      HttpHeaders.authorizationHeader,
      'Bearer $sessionToken',
    );

    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    final json = body.isEmpty
        ? const <String, dynamic>{}
        : jsonDecode(body) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = json['message'];
      throw ProfileSaveException(
        message is String ? message : 'セッション情報を取得できませんでした。',
      );
    }

    return ClerkSession.fromJson(json);
  }

  @override
  Future<SavedProfile?> fetchCurrent({required String sessionToken}) async {
    final request = await _client.getUrl(
      Uri.parse('$_baseUrl/api/mobile/profile'),
    );
    request.headers.set(
      HttpHeaders.authorizationHeader,
      'Bearer $sessionToken',
    );

    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    final json = body.isEmpty
        ? const <String, dynamic>{}
        : jsonDecode(body) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = json['message'];
      throw ProfileSaveException(
        message is String ? message : 'プロフィールを取得できませんでした。',
      );
    }

    final profile = json['profile'];
    if (profile is! Map<String, dynamic>) return null;
    return SavedProfile.fromJson(profile);
  }

  @override
  Future<ProfileSaveResult> save({
    required String sessionToken,
    required OnboardingProfile profile,
  }) async {
    final request = await _client.postUrl(
      Uri.parse('$_baseUrl/api/mobile/profile'),
    );
    request.headers
      ..contentType = ContentType.json
      ..set(HttpHeaders.authorizationHeader, 'Bearer $sessionToken');
    request.write(jsonEncode(profile.toJson()));

    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    final json = body.isEmpty
        ? const <String, dynamic>{}
        : jsonDecode(body) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = json['message'];
      throw ProfileSaveException(
        message is String ? message : 'プロフィールを保存できませんでした。',
      );
    }

    return ProfileSaveResult(
      savedToAppwrite: json['savedToAppwrite'] == true,
      status: json['status'] is String ? json['status'] as String : 'active',
    );
  }
}

class ProfileSaveException implements Exception {
  const ProfileSaveException(this.message);

  final String message;

  @override
  String toString() => message;
}
