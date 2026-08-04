import 'package:flutter/material.dart';

import '../models/demo_account.dart';
import '../services/hatarukun_api_service.dart';

class MyNumberDemoScreen extends StatefulWidget {
  const MyNumberDemoScreen({
    required this.account,
    this.sessionTokenProvider,
    this.onStatusChanged,
    super.key,
  });

  final DemoAccount account;
  final Future<String> Function()? sessionTokenProvider;
  final ValueChanged<String>? onStatusChanged;

  @override
  State<MyNumberDemoScreen> createState() => _MyNumberDemoScreenState();
}

class _MyNumberDemoScreenState extends State<MyNumberDemoScreen> {
  final _api = HatarukunApiService();
  bool consentChecked = false;
  bool imageUploaded = true;
  bool statusSubmitted = false;
  bool isSaving = false;
  late String currentStatus = widget.account.myNumberStatus;

  bool get completed => currentStatus == '登録済み';

  Future<void> submit() async {
    if (!consentChecked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('利用同意にチェックしてください')),
      );
      return;
    }

    if (!imageUploaded) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('個人番号カードの確認を完了してください')),
      );
      return;
    }

    final tokenProvider = widget.sessionTokenProvider;

    setState(() => isSaving = true);

    try {
      if (tokenProvider != null) {
        final token = await tokenProvider();
        final nextStatus =
            await _api.completeMyNumberRegistration(sessionToken: token);
        if (!mounted) return;
        setState(() {
          currentStatus = nextStatus;
          statusSubmitted = true;
        });
        widget.onStatusChanged?.call(nextStatus);
      } else {
        setState(() {
          currentStatus = '登録済み';
          statusSubmitted = true;
        });
        widget.onStatusChanged?.call('登録済み');
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('マイナンバー登録デモを完了しました')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) {
        setState(() => isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('マイナンバー登録デモ')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _NoticeCard(status: currentStatus),
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
            trailing: completed
                ? null
                : Switch(
                    value: imageUploaded,
                    onChanged: (value) => setState(() => imageUploaded = value),
                  ),
          ),
          const SizedBox(height: 12),
          if (!completed) ...[
            CheckboxListTile(
              value: consentChecked,
              onChanged: isSaving
                  ? null
                  : (value) {
                      setState(() => consentChecked = value ?? false);
                    },
              title: const Text('奨学金免除判定と自治体確認に利用することに同意する'),
              subtitle: const Text('個人番号そのものは保存しません。'),
              controlAffinity: ListTileControlAffinity.leading,
              tileColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: isSaving ? null : submit,
              icon: const Icon(Icons.verified_outlined),
              label: Text(
                isSaving
                    ? '保存中...'
                    : statusSubmitted
                        ? '登録デモ完了'
                        : '登録デモを完了する',
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _NoticeCard extends StatelessWidget {
  const _NoticeCard({required this.status});

  final String status;

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
            Text('現在の状態: $status'),
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
