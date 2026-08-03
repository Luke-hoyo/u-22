import 'package:flutter/material.dart';

import '../data/mock_data.dart';
import '../models/demo_account.dart';
import '../models/job.dart';
import 'access_guide_screen.dart';
import 'exemption_detail_screen.dart';
import 'job_list_screen.dart';
import 'logout_screen.dart';
import 'my_page_screen.dart';
import 'my_number_demo_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({required this.account, super.key});

  final DemoAccount account;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Job selectedJob = mockJobs.first;

  int get totalPoints {
    return mockEventPoints.fold(0, (sum, point) => sum + point.points);
  }

  void openAccessGuide() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const AccessGuideScreen()),
    );
  }

  void openJobs() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => JobListScreen(
          account: widget.account,
          initialJob: selectedJob,
          onJobSelected: (job) => setState(() => selectedJob = job),
        ),
      ),
    );
  }

  void openMyPage() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => MyPageScreen(
          account: widget.account,
          selectedJob: selectedJob,
        ),
      ),
    );
  }

  void openMyNumberDemo() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => MyNumberDemoScreen(account: widget.account),
      ),
    );
  }

  void openExemptionDetail() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ExemptionDetailScreen(
          account: widget.account,
          job: selectedJob,
        ),
      ),
    );
  }

  void openLogout() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => LogoutScreen(account: widget.account)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ダッシュボード'),
      ),
      drawer: _DashboardDrawer(
        account: widget.account,
        onJobsTap: openJobs,
        onGuideTap: openAccessGuide,
        onMyPageTap: openMyPage,
        onMyNumberTap: openMyNumberDemo,
        onExemptionTap: openExemptionDetail,
        onLogoutTap: openLogout,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text(
              'はたるくん',
              style: TextStyle(
                color: Color(0xFF23422D),
                fontSize: 32,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              '奨学金返済免除 × 第一次産業マッチング',
              style: TextStyle(color: Color(0xFF4F5F51), fontSize: 14),
            ),
            const SizedBox(height: 14),
            _AccountBanner(
              account: widget.account,
              onTap: openMyPage,
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _SummaryCard(
                    label: '免除見込み',
                    value: '${selectedJob.expectedExemptionAmount}円',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _SummaryCard(
                    label: '地域ポイント',
                    value: '${totalPoints}pt',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const _SectionTitle('制度デモ'),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _ActionCard(
                    icon: Icons.work_outline,
                    label: '求人を見る',
                    color: const Color(0xFF2F6F44),
                    onTap: openJobs,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _ActionCard(
                    icon: Icons.person_outline,
                    label: 'マイページ',
                    color: const Color(0xFF2F6B7F),
                    onTap: openMyPage,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _ActionCard(
                    icon: Icons.badge_outlined,
                    label: 'マイナンバー登録',
                    color: const Color(0xFF2F6F44),
                    onTap: openMyNumberDemo,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _ActionCard(
                    icon: Icons.receipt_long_outlined,
                    label: '返済支援・免除詳細',
                    color: const Color(0xFFD9853B),
                    onTap: openExemptionDetail,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const _SectionTitle('通知'),
            const SizedBox(height: 10),
            const _NotificationPreview(),
          ],
        ),
      ),
    );
  }
}

class _DashboardDrawer extends StatelessWidget {
  const _DashboardDrawer({
    required this.account,
    required this.onJobsTap,
    required this.onGuideTap,
    required this.onMyPageTap,
    required this.onMyNumberTap,
    required this.onExemptionTap,
    required this.onLogoutTap,
  });

  final DemoAccount account;
  final VoidCallback onJobsTap;
  final VoidCallback onGuideTap;
  final VoidCallback onMyPageTap;
  final VoidCallback onMyNumberTap;
  final VoidCallback onExemptionTap;
  final VoidCallback onLogoutTap;

  void _closeAndOpen(BuildContext context, VoidCallback callback) {
    Navigator.of(context).pop();
    callback();
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SafeArea(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'はたるくん',
                    style: TextStyle(
                      color: Color(0xFF23422D),
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    account.name,
                    style: const TextStyle(
                      color: Color(0xFF4F5F51),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    account.email,
                    style: const TextStyle(color: Color(0xFF647067)),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            const ListTile(
              leading: Icon(Icons.dashboard_outlined),
              title: Text('ダッシュボード'),
              selected: true,
            ),
            ListTile(
              leading: const Icon(Icons.work_outline),
              title: const Text('求人一覧'),
              onTap: () => _closeAndOpen(context, onJobsTap),
            ),
            ListTile(
              leading: const Icon(Icons.route_outlined),
              title: const Text('アクセスガイド'),
              onTap: () => _closeAndOpen(context, onGuideTap),
            ),
            ListTile(
              leading: const Icon(Icons.person_outline),
              title: const Text('マイページ'),
              onTap: () => _closeAndOpen(context, onMyPageTap),
            ),
            ListTile(
              leading: const Icon(Icons.badge_outlined),
              title: const Text('マイナンバー登録'),
              onTap: () => _closeAndOpen(context, onMyNumberTap),
            ),
            ListTile(
              leading: const Icon(Icons.receipt_long_outlined),
              title: const Text('返済支援・免除詳細'),
              onTap: () => _closeAndOpen(context, onExemptionTap),
            ),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('ログアウト'),
              onTap: () => _closeAndOpen(context, onLogoutTap),
            ),
            const Divider(height: 24),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                '応募の流れ: 求人を選ぶ → 応募内容を入力 → 免除見込みを確認',
                style: TextStyle(color: Color(0xFF647067), fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AccountBanner extends StatelessWidget {
  const _AccountBanner({required this.account, required this.onTap});

  final DemoAccount account;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFE9F2E5),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              const Icon(Icons.person_outline, color: Color(0xFF2F6F44)),
              const SizedBox(width: 10),
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
                    Text(
                      '${account.verificationStatus} / ${account.myNumberStatus}',
                      style: const TextStyle(
                        color: Color(0xFF4F5F51),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Color(0xFF647067)),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
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
          height: 104,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFD8DED1)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color),
              Text(
                label,
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

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(color: Color(0xFF647067), fontSize: 12),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(
                color: Color(0xFF23422D),
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),
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

class _NotificationPreview extends StatelessWidget {
  const _NotificationPreview();

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
        child: Text('マッチング結果や応募ステータス更新をここで受け取ります。'),
      ),
    );
  }
}
