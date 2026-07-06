import 'package:flutter/material.dart';

import '../models/demo_account.dart';

class MyNumberDemoScreen extends StatefulWidget {
  const MyNumberDemoScreen({required this.account, super.key});

  final DemoAccount account;

  @override
  State<MyNumberDemoScreen> createState() => _MyNumberDemoScreenState();
}

class _MyNumberDemoScreenState extends State<MyNumberDemoScreen> {
  bool consentChecked = false;
  bool imageUploaded = true;
  bool statusSubmitted = false;

  void submit() {
    if (!consentChecked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('利用同意にチェックしてください')),
      );
      return;
    }
    setState(() => statusSubmitted = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('マイナンバー登録デモを完了しました')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('マイナンバー登録デモ')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _NoticeCard(account: widget.account),
          const SizedBox(height: 16),
          _StepCard(
            icon: Icons.badge_outlined,
            title: '1. 本人情報',
            body: '${widget.account.name} / ${widget.account.email}',
            done: true,
          ),
          const SizedBox(height: 12),
          _StepCard(
            icon: Icons.credit_card_outlined,
            title: '2. 個人番号カード',
            body: imageUploaded ? 'カード画像アップロード済み（デモ）' : '未アップロード',
            done: imageUploaded,
            trailing: Switch(
              value: imageUploaded,
              onChanged: (value) => setState(() => imageUploaded = value),
            ),
          ),
          const SizedBox(height: 12),
          CheckboxListTile(
            value: consentChecked,
            onChanged: (value) {
              setState(() => consentChecked = value ?? false);
            },
            title: const Text('奨学金免除判定と自治体確認に利用することに同意する'),
            subtitle: const Text('コンテスト段階では実データ送信を行わないモックです。'),
            controlAffinity: ListTileControlAffinity.leading,
            tileColor: Colors.white,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: submit,
            icon: const Icon(Icons.verified_outlined),
            label: Text(statusSubmitted ? '登録デモ完了' : '登録デモを完了する'),
          ),
        ],
      ),
    );
  }
}

class _NoticeCard extends StatelessWidget {
  const _NoticeCard({required this.account});

  final DemoAccount account;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFE9F2E5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '登録状況',
              style: TextStyle(
                color: Color(0xFF23422D),
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text('現在の状態: ${account.myNumberStatus}'),
            const SizedBox(height: 6),
            const Text('この画面は審査員に連携イメージを見せるためのデモです。'),
          ],
        ),
      ),
    );
  }
}

class _StepCard extends StatelessWidget {
  const _StepCard({
    required this.icon,
    required this.title,
    required this.body,
    required this.done,
    this.trailing,
  });

  final IconData icon;
  final String title;
  final String body;
  final bool done;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFD8DED1)),
      ),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF2F6F44)),
        title: Text(title),
        subtitle: Text(body),
        trailing: trailing ??
            Icon(done ? Icons.check_circle : Icons.radio_button_unchecked),
      ),
    );
  }
}
