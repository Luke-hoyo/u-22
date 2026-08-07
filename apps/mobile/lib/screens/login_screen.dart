import 'package:flutter/material.dart';

import '../data/mock_data.dart';
import 'clerk_auth_screen.dart';
import 'home_screen.dart';
import 'join_screen.dart';
import '../models/demo_account.dart';
import '../models/user_role.dart';
import 'admin/admin_app_screen.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key, this.clerkEnabled = false});

  final bool clerkEnabled;

  void _openDemo(BuildContext context) {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => HomeScreen(account: mockAccounts.first),
      ),
    );
  }

  void _openAdminDemo(BuildContext context, AppUserRole role) {
    final account = DemoAccount(
      id: 'demo-${role.apiValue}',
      name: switch (role) {
        AppUserRole.farmer => 'デモ農家',
        AppUserRole.municipality => 'デモ自治体',
        AppUserRole.operator => 'デモ運営',
        AppUserRole.youngUser => mockAccounts.first.name,
      },
      email: 'demo@hatarukun.jp',
      profile: '${role.label}デモ',
      scholarshipBalance: 0,
      verificationStatus: '確認済み',
      myNumberStatus: '登録済み',
      taxStatus: '確認済み',
    );
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => AdminAppScreen(role: role, account: account),
      ),
    );
  }

  void _openJoin(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const JoinScreen()),
    );
  }

  void _openAuthentication(BuildContext context) {
    if (!clerkEnabled) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'このビルドでは認証が無効です。Clerkキー付きで再ビルドしてください。',
          ),
        ),
      );
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const ClerkAuthScreen()),
    );
  }

  void _showPolicy(
    BuildContext context, {
    required String title,
    required String body,
  }) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 4, 24, 28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: const Color(0xFF003F35),
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 12),
                Text(
                  body,
                  style: const TextStyle(
                    color: Color(0xFF44534E),
                    height: 1.6,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          const _RegionalHero(),
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 26, 24, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  '地域で働くことを、\n返済の力に。',
                  style: TextStyle(
                    color: Color(0xFF003F35),
                    fontSize: 30,
                    fontWeight: FontWeight.w800,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  '地域の仕事、奨学金の返済支援、暮らしの手続きをひとつに。',
                  style: TextStyle(
                    color: Color(0xFF4E5D58),
                    fontSize: 15,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 24),
                FilledButton.icon(
                  onPressed: () => _openAuthentication(context),
                  icon: const Icon(Icons.account_circle_outlined),
                  label: const Text('Google・LINE・パスワードで続ける'),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: () => _openDemo(context),
                  icon: const Icon(Icons.visibility_outlined),
                  label: const Text('デモを見る'),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: () => _openJoin(context),
                  icon: const Icon(Icons.key_outlined),
                  label: const Text('招待コードで参加'),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    ActionChip(
                      label: const Text('農家デモ'),
                      onPressed: () =>
                          _openAdminDemo(context, AppUserRole.farmer),
                    ),
                    ActionChip(
                      label: const Text('自治体デモ'),
                      onPressed: () =>
                          _openAdminDemo(context, AppUserRole.municipality),
                    ),
                    ActionChip(
                      label: const Text('運営デモ'),
                      onPressed: () =>
                          _openAdminDemo(context, AppUserRole.operator),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const _TrustMessage(),
                const SizedBox(height: 22),
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 2,
                  children: [
                    TextButton(
                      onPressed: () => _showPolicy(
                        context,
                        title: '利用規約',
                        body:
                            '本アプリはU-22プログラミング・コンテスト向けのプロトタイプです。制度や給付内容は企画段階で、実際の利用条件を確定するものではありません。',
                      ),
                      child: const Text('利用規約'),
                    ),
                    TextButton(
                      onPressed: () => _showPolicy(
                        context,
                        title: 'プライバシー',
                        body:
                            '本人確認情報や奨学金情報は、利用目的を明示したうえで必要な範囲のみ取得し、閲覧権限と保存期間を制限する設計を想定しています。',
                      ),
                      child: const Text('プライバシー'),
                    ),
                    TextButton(
                      onPressed: () => _showPolicy(
                        context,
                        title: '本人確認について',
                        body:
                            '本人確認は認証後、応募や制度申請など必要な場面でのみ案内します。ログイン前に身分証の提出を求めることはありません。',
                      ),
                      child: const Text('本人確認'),
                    ),
                  ],
                ),
                const Center(
                  child: Text(
                    '© u.r.ki',
                    style: TextStyle(
                      color: Color(0xFF7A8782),
                      fontSize: 12,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RegionalHero extends StatelessWidget {
  const _RegionalHero();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 286,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            'assets/brand/higashihiroshima.jpg',
            fit: BoxFit.cover,
            alignment: const Alignment(0, 0.15),
          ),
          const ColoredBox(color: Color(0x3000241E)),
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
              child: Align(
                alignment: Alignment.topLeft,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      padding: const EdgeInsets.all(3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FCFA),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Image.asset(
                        'assets/brand/hatarukun-icon-1024.png',
                      ),
                    ),
                    const SizedBox(width: 11),
                    const Text(
                      'はたるくん',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        shadows: [
                          Shadow(
                            color: Color(0x66000000),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const Positioned(
            left: 20,
            right: 20,
            bottom: 18,
            child: Row(
              children: [
                Icon(Icons.location_on_outlined, color: Colors.white, size: 18),
                SizedBox(width: 5),
                Text(
                  '広島県 東広島市',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    shadows: [
                      Shadow(color: Color(0x99000000), blurRadius: 8),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TrustMessage extends StatelessWidget {
  const _TrustMessage();

  @override
  Widget build(BuildContext context) {
    return const Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          Icons.shield_outlined,
          size: 20,
          color: Color(0xFF16745F),
        ),
        SizedBox(width: 9),
        Expanded(
          child: Text(
            '本人確認情報は、応募や制度申請に必要な場面でのみ案内します。',
            style: TextStyle(
              color: Color(0xFF51605B),
              fontSize: 13,
              height: 1.45,
            ),
          ),
        ),
      ],
    );
  }
}
