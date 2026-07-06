import 'package:flutter/material.dart';

import '../models/demo_account.dart';
import '../models/job.dart';

class ExemptionDetailScreen extends StatelessWidget {
  const ExemptionDetailScreen({
    required this.account,
    required this.job,
    super.key,
  });

  final DemoAccount account;
  final Job job;

  int get localTaxRelief => (job.expectedExemptionAmount * 0.18).round();

  int get remainingBalance {
    return account.scholarshipBalance - job.expectedExemptionAmount;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('免税・免除詳細')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _HeroPanel(account: account, job: job),
          const SizedBox(height: 16),
          _AmountRow(
            label: '奨学金免除見込み',
            value: '${job.expectedExemptionAmount}円',
            icon: Icons.savings_outlined,
          ),
          _AmountRow(
            label: '住民税等の軽減見込み',
            value: '$localTaxRelief円',
            icon: Icons.receipt_long_outlined,
          ),
          _AmountRow(
            label: '免除後の返済残高',
            value: '${remainingBalance.clamp(0, account.scholarshipBalance)}円',
            icon: Icons.account_balance_wallet_outlined,
          ),
          const SizedBox(height: 16),
          _ReviewStatusCard(account: account),
          const SizedBox(height: 16),
          const _FlowCard(),
        ],
      ),
    );
  }
}

class _HeroPanel extends StatelessWidget {
  const _HeroPanel({required this.account, required this.job});

  final DemoAccount account;
  final Job job;

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
            Text(
              account.name,
              style: const TextStyle(
                color: Color(0xFF23422D),
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 8),
            Text(job.title),
            const SizedBox(height: 6),
            Text('${job.region} / ${job.workPeriodMonths}ヶ月勤務'),
            const SizedBox(height: 10),
            Text('税制ステータス: ${account.taxStatus}'),
          ],
        ),
      ),
    );
  }
}

class _ReviewStatusCard extends StatelessWidget {
  const _ReviewStatusCard({required this.account});

  final DemoAccount account;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFD8DED1)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '免税審査状況',
              style: TextStyle(
                color: Color(0xFF23422D),
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text('現在: ${account.taxStatus}'),
            const SizedBox(height: 14),
            const _ReviewStep(
              title: '本人確認',
              body: 'マイナンバー登録デモと本人情報を確認',
              done: true,
            ),
            const _ReviewStep(
              title: '勤務条件確認',
              body: '勤務期間・地域・職種が対象条件に合うか確認',
              done: true,
            ),
            _ReviewStep(
              title: '自治体確認',
              body: '税制軽減の対象として自治体側で確認',
              done: account.taxStatus.contains('あり'),
            ),
            _ReviewStep(
              title: '免税見込み確定',
              body: '勤務開始後の実績に応じて確定',
              done: account.taxStatus.contains('確定'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReviewStep extends StatelessWidget {
  const _ReviewStep({
    required this.title,
    required this.body,
    required this.done,
  });

  final String title;
  final String body;
  final bool done;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            done ? Icons.check_circle : Icons.radio_button_unchecked,
            color: done ? const Color(0xFF2F6F44) : const Color(0xFFB8C7B7),
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Color(0xFF23422D),
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  body,
                  style:
                      const TextStyle(color: Color(0xFF647067), fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AmountRow extends StatelessWidget {
  const _AmountRow({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFD8DED1)),
        ),
        child: ListTile(
          leading: Icon(icon, color: const Color(0xFF2F6F44)),
          title: Text(label),
          trailing: Text(
            value,
            style: const TextStyle(
              color: Color(0xFF23422D),
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ),
    );
  }
}

class _FlowCard extends StatelessWidget {
  const _FlowCard();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFD8DED1)),
      ),
      child: const Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '判定フロー',
              style: TextStyle(
                color: Color(0xFF23422D),
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: 12),
            _FlowItem(text: '本人確認・マイナンバー登録デモ'),
            _FlowItem(text: '勤務予定期間と地域条件を確認'),
            _FlowItem(text: '奨学金免除見込みを算出'),
            _FlowItem(text: '自治体の税制軽減対象として確認'),
          ],
        ),
      ),
    );
  }
}

class _FlowItem extends StatelessWidget {
  const _FlowItem({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          const Icon(Icons.check_circle, color: Color(0xFF2F6F44), size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }
}
