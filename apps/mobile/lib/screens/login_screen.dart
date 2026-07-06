import 'package:flutter/material.dart';

import '../data/mock_data.dart';
import '../models/demo_account.dart';
import 'access_guide_screen.dart';
import 'home_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController(text: 'demo@hatarukun.jp');
  final passwordController = TextEditingController(text: 'password');
  DemoAccount selectedAccount = mockAccounts.first;
  bool obscurePassword = true;

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  void login() {
    if (emailController.text.trim().isEmpty ||
        passwordController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('メールアドレスとパスワードを入力してください')),
      );
      return;
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => HomeScreen(account: selectedAccount),
      ),
    );
  }

  void selectAccount(DemoAccount account) {
    setState(() {
      selectedAccount = account;
      emailController.text = account.email;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const SizedBox(height: 18),
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFF23422D),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.handshake_outlined,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'はたるくん',
                        style: TextStyle(
                          color: Color(0xFF23422D),
                          fontSize: 34,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(
                        '奨学金返済免除 × 地域の仕事',
                        style: TextStyle(
                          color: Color(0xFF4F5F51),
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Text(
              '信頼できる地域の求人を探しながら、免除見込みと地域ポイントをまとめて確認できます。',
              style: TextStyle(color: Color(0xFF4F5F51), fontSize: 15),
            ),
            const SizedBox(height: 18),
            const Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _FeatureChip(
                  icon: Icons.search,
                  label: '求人を探す',
                  color: Color(0xFF2F6F44),
                ),
                _FeatureChip(
                  icon: Icons.savings_outlined,
                  label: '免除見込み',
                  color: Color(0xFFD9853B),
                ),
                _FeatureChip(
                  icon: Icons.stars_outlined,
                  label: '地域ポイント',
                  color: Color(0xFF2F6B7F),
                ),
              ],
            ),
            const SizedBox(height: 14),
            OutlinedButton.icon(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const AccessGuideScreen()),
                );
              },
              icon: const Icon(Icons.route_outlined),
              label: const Text('アクセスガイドを見る'),
            ),
            const SizedBox(height: 28),
            const Text(
              'デモアカウント',
              style: TextStyle(
                color: Color(0xFF23422D),
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 10),
            for (final account in mockAccounts) ...[
              _AccountTile(
                account: account,
                selected: account.id == selectedAccount.id,
                onTap: () => selectAccount(account),
              ),
              const SizedBox(height: 10),
            ],
            const SizedBox(height: 18),
            DecoratedBox(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFE1E6DC)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 18,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Row(
                      children: [
                        Icon(
                          Icons.verified_user_outlined,
                          color: Color(0xFF2F6F44),
                        ),
                        SizedBox(width: 8),
                        Text(
                          'ログイン',
                          style: TextStyle(
                            color: Color(0xFF23422D),
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'デモでは入力済みのアカウントでそのまま入れます。',
                      style: TextStyle(color: Color(0xFF647067), fontSize: 13),
                    ),
                    const SizedBox(height: 18),
                    TextField(
                      controller: emailController,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        labelText: 'メールアドレス',
                        prefixIcon: Icon(Icons.mail_outline),
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: passwordController,
                      obscureText: obscurePassword,
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) => login(),
                      decoration: InputDecoration(
                        labelText: 'パスワード',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          tooltip: obscurePassword ? '表示' : '非表示',
                          onPressed: () {
                            setState(() => obscurePassword = !obscurePassword);
                          },
                          icon: Icon(
                            obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                          ),
                        ),
                        border: const OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 18),
                    FilledButton.icon(
                      onPressed: login,
                      icon: const Icon(Icons.login),
                      label: const Text('ログインする'),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: login,
                      icon: const Icon(Icons.play_circle_outline),
                      label: const Text('デモで入る'),
                    ),
                    const SizedBox(height: 10),
                    TextButton.icon(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const RegisterScreen(),
                          ),
                        );
                      },
                      icon: const Icon(Icons.person_add_alt_outlined),
                      label: const Text('新規登録する'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            const _StatusStrip(),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class _AccountTile extends StatelessWidget {
  const _AccountTile({
    required this.account,
    required this.selected,
    required this.onTap,
  });

  final DemoAccount account;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(
              color:
                  selected ? const Color(0xFF2F6F44) : const Color(0xFFE1E6DC),
              width: selected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: selected
                    ? const Color(0xFF2F6F44)
                    : const Color(0xFFE9F2E5),
                child: Text(
                  account.name.substring(0, 1),
                  style: TextStyle(
                    color: selected ? Colors.white : const Color(0xFF23422D),
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      account.name,
                      style: const TextStyle(
                        color: Color(0xFF23422D),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      account.profile,
                      style: const TextStyle(
                        color: Color(0xFF647067),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              if (selected)
                const Icon(Icons.check_circle, color: Color(0xFF2F6F44)),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  const _FeatureChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE1E6DC)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 17),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                color: Color(0xFF2F3B32),
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusStrip extends StatelessWidget {
  const _StatusStrip();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFE9F2E5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Padding(
        padding: EdgeInsets.all(14),
        child: Row(
          children: [
            Icon(Icons.verified_user_outlined, color: Color(0xFF2F6F44)),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                '本人確認・奨学金情報はコンテスト用モックで再現します',
                style: TextStyle(color: Color(0xFF2F3B32), fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
