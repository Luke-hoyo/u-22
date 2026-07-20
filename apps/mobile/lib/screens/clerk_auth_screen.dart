import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:flutter/material.dart';

import 'home_screen.dart';
import '../data/mock_data.dart';

class ClerkAuthScreen extends StatelessWidget {
  const ClerkAuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Clerkログイン')),
      body: SafeArea(
        child: ClerkErrorListener(
          child: ClerkAuthBuilder(
            signedInBuilder: (context, authState) {
              return ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  const _ClerkStatusCard(),
                  const SizedBox(height: 16),
                  const ClerkUserButton(),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: () {
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                          builder: (_) =>
                              HomeScreen(account: mockAccounts.first),
                        ),
                      );
                    },
                    icon: const Icon(Icons.dashboard_outlined),
                    label: const Text('デモダッシュボードへ進む'),
                  ),
                ],
              );
            },
            signedOutBuilder: (context, authState) {
              return ListView(
                padding: const EdgeInsets.all(20),
                children: const [
                  _ClerkStatusCard(),
                  SizedBox(height: 16),
                  ClerkAuthentication(),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _ClerkStatusCard extends StatelessWidget {
  const _ClerkStatusCard();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFBFC9C4)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Padding(
        padding: EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.verified_user_outlined, color: Color(0xFF004D40)),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Clerk認証',
                    style: TextStyle(
                      color: Color(0xFF00342B),
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Web版と同じClerkアプリのpublishable keyを使って、モバイル認証の入口を確認できます。',
                    style: TextStyle(color: Color(0xFF3F4945), height: 1.5),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
