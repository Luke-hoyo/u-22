import 'package:flutter/material.dart';

import '../data/mock_data.dart';
import '../models/demo_account.dart';
import '../models/job.dart';
import 'exemption_detail_screen.dart';
import 'my_number_demo_screen.dart';

class MyPageScreen extends StatefulWidget {
  const MyPageScreen({
    required this.account,
    required this.selectedJob,
    super.key,
  });

  final DemoAccount account;
  final Job selectedJob;

  @override
  State<MyPageScreen> createState() => _MyPageScreenState();
}

class _MyPageScreenState extends State<MyPageScreen> {
  bool googleLinked = false;

  int get totalPoints {
    return mockEventPoints.fold(0, (sum, point) => sum + point.points);
  }

  int get exemptionProgress {
    final reduced = widget.selectedJob.expectedExemptionAmount;
    return ((reduced / widget.account.scholarshipBalance) * 100).round();
  }

  void toggleGoogleLink() {
    setState(() => googleLinked = !googleLinked);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          googleLinked ? 'Googleアカウントを連携しました' : 'Google連携を解除しました',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('マイページ')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _ProfileHeader(account: widget.account),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _MetricCard(
                  label: '返済残高',
                  value: '${widget.account.scholarshipBalance}円',
                  icon: Icons.account_balance_wallet_outlined,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _MetricCard(
                  label: 'ポイント',
                  value: '${totalPoints}pt',
                  icon: Icons.stars_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _ProgressCard(
            job: widget.selectedJob,
            progress: exemptionProgress.clamp(0, 100),
          ),
          const SizedBox(height: 16),
          const _SectionTitle('外部連携'),
          const SizedBox(height: 10),
          _GoogleLinkCard(
            linked: googleLinked,
            email: widget.account.email,
            onTap: toggleGoogleLink,
          ),
          const SizedBox(height: 16),
          const _SectionTitle('登録状況'),
          const SizedBox(height: 10),
          _StatusTile(
            icon: Icons.verified_user_outlined,
            label: '本人確認',
            value: widget.account.verificationStatus,
          ),
          _StatusTile(
            icon: Icons.badge_outlined,
            label: 'マイナンバー',
            value: widget.account.myNumberStatus,
          ),
          _StatusTile(
            icon: Icons.receipt_long_outlined,
            label: '返済支援ステータス',
            value: widget.account.taxStatus,
          ),
          const SizedBox(height: 16),
          const _SectionTitle('手続き'),
          const SizedBox(height: 10),
          _MenuTile(
            icon: Icons.badge_outlined,
            title: 'マイナンバー登録デモ',
            subtitle: '本人確認と行政連携のデモを確認',
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => MyNumberDemoScreen(account: widget.account),
                ),
              );
            },
          ),
          _MenuTile(
            icon: Icons.receipt_long_outlined,
            title: '返済支援・免除詳細',
            subtitle: '選択中求人での免除見込みを確認',
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ExemptionDetailScreen(
                    account: widget.account,
                    job: widget.selectedJob,
                  ),
                ),
              );
            },
          ),
          _MenuTile(
            icon: Icons.fact_check_outlined,
            title: '返済支援の審査状況',
            subtitle: '本人確認から自治体確認までの進捗を確認',
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ExemptionDetailScreen(
                    account: widget.account,
                    job: widget.selectedJob,
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 16),
          const _SectionTitle('ポイント履歴'),
          const SizedBox(height: 10),
          for (final point in mockEventPoints) ...[
            _PointTile(
              eventName: point.eventName,
              region: point.region,
              points: point.points,
            ),
            const SizedBox(height: 8),
          ],
        ],
      ),
    );
  }
}

class _GoogleLinkCard extends StatelessWidget {
  const _GoogleLinkCard({
    required this.linked,
    required this.email,
    required this.onTap,
  });

  final bool linked;
  final String email;
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
            border: Border.all(color: const Color(0xFFD8DED1)),
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: linked
                      ? const Color(0xFFE9F2E5)
                      : const Color(0xFFFFF5E8),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.g_mobiledata,
                  color: linked
                      ? const Color(0xFF2F6F44)
                      : const Color(0xFFD9853B),
                  size: 34,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Googleアカウント連携',
                      style: TextStyle(
                        color: Color(0xFF23422D),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      linked ? '$email と連携済み' : 'カレンダー通知・ログイン補助に利用',
                      style: const TextStyle(
                        color: Color(0xFF647067),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                linked ? '解除' : '連携',
                style: const TextStyle(
                  color: Color(0xFF23422D),
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.account});

  final DemoAccount account;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFE9F2E5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            CircleAvatar(
              radius: 30,
              backgroundColor: const Color(0xFF23422D),
              child: Text(
                account.name.substring(0, 1),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    account.name,
                    style: const TextStyle(
                      color: Color(0xFF23422D),
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(account.email),
                  const SizedBox(height: 4),
                  Text(
                    account.profile,
                    style: const TextStyle(color: Color(0xFF4F5F51)),
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

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFD8DED1)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: const Color(0xFF2F6F44)),
            const SizedBox(height: 10),
            Text(label, style: const TextStyle(color: Color(0xFF647067))),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                color: Color(0xFF23422D),
                fontSize: 17,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProgressCard extends StatelessWidget {
  const _ProgressCard({required this.job, required this.progress});

  final Job job;
  final int progress;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFFFF5E8),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE8C89F)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '免除見込み進捗',
              style: TextStyle(
                color: Color(0xFF23422D),
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(job.title),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: progress / 100,
              minHeight: 8,
              borderRadius: BorderRadius.circular(8),
            ),
            const SizedBox(height: 8),
            Text('現在の選択求人で返済残高の約$progress%を軽減見込み'),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        color: Color(0xFF23422D),
        fontSize: 18,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}

class _StatusTile extends StatelessWidget {
  const _StatusTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return _PlainTile(
      icon: icon,
      title: label,
      trailing: value,
    );
  }
}

class _MenuTile extends StatelessWidget {
  const _MenuTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return _PlainTile(
      icon: icon,
      title: title,
      subtitle: subtitle,
      trailing: '開く',
      onTap: onTap,
    );
  }
}

class _PointTile extends StatelessWidget {
  const _PointTile({
    required this.eventName,
    required this.region,
    required this.points,
  });

  final String eventName;
  final String region;
  final int points;

  @override
  Widget build(BuildContext context) {
    return _PlainTile(
      icon: Icons.add_circle_outline,
      title: eventName,
      subtitle: region,
      trailing: '+$points',
    );
  }
}

class _PlainTile extends StatelessWidget {
  const _PlainTile({
    required this.icon,
    required this.title,
    required this.trailing,
    this.subtitle,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String trailing;
  final String? subtitle;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: onTap,
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFFD8DED1)),
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                Icon(icon, color: const Color(0xFF2F6F44)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 3),
                        Text(
                          subtitle!,
                          style: const TextStyle(
                            color: Color(0xFF647067),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Text(
                  trailing,
                  style: const TextStyle(
                    color: Color(0xFF23422D),
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
