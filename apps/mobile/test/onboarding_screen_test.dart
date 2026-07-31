import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hatarukun_mobile/models/onboarding_profile.dart';
import 'package:hatarukun_mobile/screens/onboarding_screen.dart';
import 'package:hatarukun_mobile/services/profile_service.dart';

class _FakeProfileRepository implements ProfileRepository {
  OnboardingProfile? savedProfile;

  @override
  Future<SavedProfile?> fetchCurrent({required String sessionToken}) async {
    expect(sessionToken, 'test-session-token');
    return null;
  }

  @override
  Future<ProfileSaveResult> save({
    required String sessionToken,
    required OnboardingProfile profile,
  }) async {
    expect(sessionToken, 'test-session-token');
    savedProfile = profile;
    return ProfileSaveResult(
      savedToAppwrite: true,
      status: profile.role == HatarukunUserRole.farmer
          ? 'pending_review'
          : 'active',
    );
  }
}

Widget _testApp(_FakeProfileRepository repository) {
  return MaterialApp(
    home: OnboardingScreen(
      initialName: '佐藤 みのり',
      email: 'minori@example.com',
      sessionTokenProvider: () async => 'test-session-token',
      profileRepository: repository,
    ),
  );
}

void main() {
  testWidgets('young user completes onboarding and opens dashboard',
      (tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 932));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    final repository = _FakeProfileRepository();

    await tester.pumpWidget(_testApp(repository));

    expect(find.text('奨学金を返済している方'), findsOneWidget);
    expect(find.text('受け入れ事業者の方'), findsOneWidget);

    await tester.tap(find.text('利用者として進む'));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const ValueKey('profile-city')),
      '東広島市',
    );
    await tester.enterText(
      find.byKey(const ValueKey('scholarship-balance')),
      '1500000',
    );
    await tester.ensureVisible(find.byKey(const ValueKey('profile-consent')));
    await tester.tap(find.byKey(const ValueKey('profile-consent')));
    tester.testTextInput.hide();
    await tester.drag(find.byType(ListView), const Offset(0, -420));
    await tester.pumpAndSettle();
    await tester.tap(find.text('登録してはじめる'));
    await tester.pumpAndSettle();

    expect(repository.savedProfile?.role, HatarukunUserRole.youngUser);
    expect(repository.savedProfile?.city, '東広島市');
    expect(repository.savedProfile?.scholarshipBalance, 1500000);
    expect(find.text('まずは、面談の準備から。'), findsOneWidget);
  });

  testWidgets('farmer application remains pending review', (tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 932));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    final repository = _FakeProfileRepository();

    await tester.pumpWidget(_testApp(repository));
    await tester.tap(find.text('事業者として申請'));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const ValueKey('organization-name')),
      '東広島みのりファーム',
    );
    await tester.enterText(
      find.byKey(const ValueKey('profile-city')),
      '東広島市',
    );
    await tester.ensureVisible(find.byKey(const ValueKey('profile-consent')));
    await tester.tap(find.byKey(const ValueKey('profile-consent')));
    await tester.ensureVisible(find.text('事業者申請を送信'));
    await tester.tap(find.text('事業者申請を送信'));
    await tester.pumpAndSettle();

    expect(repository.savedProfile?.role, HatarukunUserRole.farmer);
    expect(find.text('申請を受け付けました'), findsOneWidget);
    expect(find.text('運営確認待ち'), findsOneWidget);
    expect(find.text('Appwriteへ安全に保存しました'), findsOneWidget);
  });
}
