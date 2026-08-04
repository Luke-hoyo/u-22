import 'package:flutter/material.dart';

import '../models/job.dart';

const _primary = Color(0xFF004D40);
const _primaryDark = Color(0xFF003F35);
const _textMain = Color(0xFF1A1C1E);
const _textSub = Color(0xFF4E5D58);
const _surfaceLow = Color(0xFFF1F4F3);

class JobDetailScreen extends StatelessWidget {
  const JobDetailScreen({
    required this.job,
    required this.applied,
    required this.onApply,
    super.key,
  });

  final Job job;
  final bool applied;
  final VoidCallback onApply;

  static Future<void> open(
    BuildContext context, {
    required Job job,
    required bool applied,
    required VoidCallback onApply,
  }) {
    return Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => JobDetailScreen(
          job: job,
          applied: applied,
          onApply: onApply,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final supportForSixMonths = job.monthlySupport * 6;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('求人詳細', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          Container(
            height: 180,
            decoration: BoxDecoration(
              color: _surfaceLow,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Icon(
                _industryIcon(job.industry),
                size: 56,
                color: _primary,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Chip(job.industry),
              _Chip('マッチ度 ${job.matchRate}%'),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 16, color: _textSub),
              const SizedBox(width: 4),
              Text('${job.region} ${job.area}',
                  style: const TextStyle(color: _textSub, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          Text(job.title,
              style: const TextStyle(
                  fontSize: 26, fontWeight: FontWeight.w900, color: _textMain)),
          const SizedBox(height: 6),
          Text(job.organizationName,
              style: const TextStyle(color: _textSub, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          Text(job.description,
              style: const TextStyle(color: _textSub, height: 1.55)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [for (final tag in job.tags) _Chip(tag)],
          ),
          const SizedBox(height: 20),
          const _SectionTitle('主な仕事内容'),
          const SizedBox(height: 8),
          Text(job.summary, style: const TextStyle(color: _textSub, height: 1.55)),
          const SizedBox(height: 20),
          const _SectionTitle('この地域で働くこと'),
          const SizedBox(height: 8),
          const Text(
            '仕事だけでなく、地域イベントや暮らしの相談窓口にも参加できます。働く期間中は地域担当者が定期的にサポートします。',
            style: TextStyle(color: _textSub, height: 1.55),
          ),
          const SizedBox(height: 20),
          _Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('募集条件',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                const SizedBox(height: 12),
                _FactRow('月給', _yen(job.monthlySalary)),
                _FactRow('就業期間', '${job.workPeriodMonths}か月'),
                _FactRow('勤務時間', job.schedule),
                _FactRow('住まい支援', job.housingSupport ? 'あり' : '相談可能'),
                _FactRow('研修', job.training ? 'あり' : '現場で案内'),
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEEF8F5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      const Text('6か月働いた場合',
                          style: TextStyle(color: _textSub)),
                      const SizedBox(height: 4),
                      Text(_yen(supportForSixMonths),
                          style: const TextStyle(
                              color: _primaryDark,
                              fontSize: 28,
                              fontWeight: FontWeight.w900)),
                      const Text('返済支援の見込み',
                          style: TextStyle(color: _textSub)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: applied ? null : onApply,
                  icon: Icon(applied ? Icons.check : Icons.send_outlined),
                  label: Text(applied ? '応募済み' : 'この求人に応募する'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static IconData _industryIcon(String industry) {
    return switch (industry) {
      '林業' => Icons.forest_outlined,
      '水産業' => Icons.set_meal_outlined,
      _ => Icons.eco_outlined,
    };
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900));
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFDCE3E0)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(padding: const EdgeInsets.all(16), child: child),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip(this.label);
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: _surfaceLow,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
    );
  }
}

class _FactRow extends StatelessWidget {
  const _FactRow(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(child: Text(label, style: const TextStyle(color: _textSub))),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

String _yen(int value) => '${value.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}円';

Job? jobById(String id, List<Job> jobs) {
  for (final job in jobs) {
    if (job.id == id) return job;
  }
  return null;
}
