import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:flutter/material.dart';

import '../models/demo_account.dart';
import 'launch_screen.dart';
import 'login_screen.dart';

class LogoutScreen extends StatefulWidget {
  const LogoutScreen({required this.account, super.key});

  final DemoAccount account;

  @override
  State<LogoutScreen> createState() => _LogoutScreenState();
}

class _LogoutScreenState extends State<LogoutScreen> {
  bool _busy = false;

  Future<void> logout() async {
    if (_busy) return;
    setState(() => _busy = true);

    var clerkEnabled = false;
    try {
      final authState = ClerkAuth.of(context, listen: false);
      await authState.signOut();
      clerkEnabled = true;
    } catch (_) {
      clerkEnabled = false;
    }

    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (_) => clerkEnabled
            ? const LaunchScreen(clerkEnabled: true, animate: false)
            : const LoginScreen(),
      ),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ログアウト')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              DecoratedBox(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFD8DED1)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.logout,
                        color: Color(0xFF2F6F44),
                        size: 44,
                      ),
                      const SizedBox(height: 14),
                      const Text(
                        'ログアウトしますか？',
                        style: TextStyle(
                          color: Color(0xFF23422D),
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${widget.account.name} としてログイン中です。',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Color(0xFF4F5F51)),
                      ),
                      const SizedBox(height: 20),
                      FilledButton.icon(
                        onPressed: _busy ? null : logout,
                        icon: const Icon(Icons.logout),
                        label: Text(_busy ? 'ログアウト中' : 'ログアウトする'),
                      ),
                      const SizedBox(height: 10),
                      OutlinedButton.icon(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.arrow_back),
                        label: const Text('戻る'),
                      ),
                    ],
                  ),
                ),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}
