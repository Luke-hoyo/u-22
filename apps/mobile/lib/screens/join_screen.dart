import 'package:flutter/material.dart';

import '../models/demo_account.dart';
import '../models/user_role.dart';
import 'admin/admin_app_screen.dart';
import 'home_screen.dart';

const _primaryDark = Color(0xFF003F35);
const _textSub = Color(0xFF4E5D58);

class JoinScreen extends StatefulWidget {
  const JoinScreen({super.key});

  @override
  State<JoinScreen> createState() => _JoinScreenState();
}

class _JoinScreenState extends State<JoinScreen> {
  final _codeController = TextEditingController();
  String? _errorMessage;

  static const _inviteRoles = {
    'FARM-AGRI-2026': AppUserRole.farmer,
    'FARM-FOR-2026': AppUserRole.farmer,
    'FARM-FISH-2026': AppUserRole.farmer,
    'EVENT-CHUGOKU-2026': AppUserRole.operator,
    'MUNI-CHUGOKU-2026': AppUserRole.municipality,
  };

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  void _submit() {
    final code = _codeController.text.trim().toUpperCase();
    final role = _inviteRoles[code];

    if (role == null) {
      setState(() => _errorMessage = '招待コードが見つかりません。入力内容を確認してください。');
      return;
    }

    final account = DemoAccount(
      id: 'invite-$code',
      name: switch (role) {
        AppUserRole.farmer => 'デモ事業者アカウント',
        AppUserRole.municipality => 'デモ自治体アカウント',
        AppUserRole.operator => 'デモ運営アカウント',
        AppUserRole.youngUser => 'デモユーザー',
      },
      email: 'demo@hatarukun.jp',
      profile: '${role.label} / 招待コード利用',
      scholarshipBalance: 0,
      verificationStatus: '確認済み',
      myNumberStatus: '不要',
      taxStatus: '確認済み',
    );

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => role.isAdmin
            ? AdminAppScreen(role: role, account: account)
            : HomeScreen(account: account),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('招待コード', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
        children: [
          const Text(
            '招待コードで参加',
            style: TextStyle(
              color: _primaryDark,
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            '事業者・自治体・運営アカウントは招待制です。届いたコードを入力してください。',
            style: TextStyle(color: _textSub, height: 1.55),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _codeController,
            textCapitalization: TextCapitalization.characters,
            decoration: const InputDecoration(
              labelText: '招待コード',
              hintText: 'FARM-AGRI-2026',
            ),
          ),
          if (_errorMessage != null) ...[
            const SizedBox(height: 12),
            Text(_errorMessage!,
                style: const TextStyle(color: Color(0xFFB3261E), fontSize: 13)),
          ],
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _submit,
            child: const Text('参加する'),
          ),
          const SizedBox(height: 20),
          const Text(
            'デモ用コード例: FARM-AGRI-2026（事業者）, MUNI-CHUGOKU-2026（自治体）, EVENT-CHUGOKU-2026（運営）',
            style: TextStyle(color: _textSub, fontSize: 12, height: 1.45),
          ),
        ],
      ),
    );
  }
}
