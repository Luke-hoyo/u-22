import 'package:flutter/material.dart';

import '../models/demo_account.dart';
import '../models/job.dart';

class ApplicationFormScreen extends StatefulWidget {
  const ApplicationFormScreen({
    required this.account,
    required this.job,
    super.key,
  });

  final DemoAccount account;
  final Job job;

  @override
  State<ApplicationFormScreen> createState() => _ApplicationFormScreenState();
}

class _ApplicationFormScreenState extends State<ApplicationFormScreen> {
  final motivationController = TextEditingController();
  final healthNoteController = TextEditingController();
  late int months = widget.job.workPeriodMonths;
  late bool needsHousing = widget.job.housingSupport;
  String startMonth = '2026年8月';
  bool verified = true;

  int get exemptionEstimate {
    final monthlyBase =
        widget.job.expectedExemptionAmount / widget.job.workPeriodMonths;
    return (monthlyBase * months).round();
  }

  @override
  void initState() {
    super.initState();
    motivationController.text = _defaultMotivation(widget.job);
  }

  @override
  void dispose() {
    motivationController.dispose();
    healthNoteController.dispose();
    super.dispose();
  }

  String _defaultMotivation(Job job) {
    if (job.industry == '農業') {
      return '地域の農業を学びながら、収穫や出荷作業に継続して関わりたいです。';
    }
    if (job.industry == '林業') {
      return '森林整備を通じて山間部の保全と地域の安全に貢献したいです。';
    }
    return '地域産業の現場で経験を積み、長く関われる働き方を探したいです。';
  }

  void submit() {
    if (!verified) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('本人確認ステータスを確認してください')),
      );
      return;
    }
    if (motivationController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('応募理由を入力してください')),
      );
      return;
    }

    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${widget.job.title} に応募しました')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('応募フォーム')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _JobHeader(job: widget.job, account: widget.account),
          const SizedBox(height: 16),
          _SectionCard(
            title: '希望条件',
            children: [
              DropdownButtonFormField<String>(
                initialValue: startMonth,
                decoration: const InputDecoration(
                  labelText: '勤務開始希望',
                  prefixIcon: Icon(Icons.calendar_month_outlined),
                ),
                items: const [
                  DropdownMenuItem(value: '2026年8月', child: Text('2026年8月')),
                  DropdownMenuItem(value: '2026年9月', child: Text('2026年9月')),
                  DropdownMenuItem(value: '2026年10月', child: Text('2026年10月')),
                ],
                onChanged: (value) {
                  if (value != null) setState(() => startMonth = value);
                },
              ),
              const SizedBox(height: 14),
              Text('勤務期間: $monthsヶ月'),
              Slider(
                value: months.toDouble(),
                min: 3,
                max: 12,
                divisions: 9,
                label: '$monthsヶ月',
                onChanged: (value) {
                  setState(() => months = value.round());
                },
              ),
              SwitchListTile(
                value: needsHousing,
                onChanged: widget.job.housingSupport
                    ? (value) => setState(() => needsHousing = value)
                    : null,
                title: const Text('住居支援を希望する'),
                subtitle: Text(
                  widget.job.housingSupport
                      ? 'この求人は住居支援に対応しています'
                      : 'この求人は住居支援なしです',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _SectionCard(
            title: '応募者情報',
            children: [
              _InfoRow(label: '応募者', value: widget.account.name),
              _InfoRow(label: '本人確認', value: widget.account.verificationStatus),
              _InfoRow(label: 'マイナンバー', value: widget.account.myNumberStatus),
              CheckboxListTile(
                value: verified,
                onChanged: (value) => setState(() => verified = value ?? false),
                title: const Text('登録情報を応募先に共有する'),
                controlAffinity: ListTileControlAffinity.leading,
                contentPadding: EdgeInsets.zero,
              ),
            ],
          ),
          const SizedBox(height: 12),
          _SectionCard(
            title: '応募理由',
            children: [
              TextField(
                controller: motivationController,
                minLines: 4,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: '志望理由・地域でやってみたいこと',
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: healthNoteController,
                minLines: 2,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: '配慮事項・連絡メモ（任意）',
                  alignLabelWithHint: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _EstimatePanel(amount: exemptionEstimate),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: submit,
            icon: const Icon(Icons.send_outlined),
            label: const Text('応募内容を送信する'),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _JobHeader extends StatelessWidget {
  const _JobHeader({required this.job, required this.account});

  final Job job;
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
            Text(
              job.title,
              style: const TextStyle(
                color: Color(0xFF23422D),
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 8),
            Text('${job.region} / ${job.industry} / ${job.organizationName}'),
            const SizedBox(height: 6),
            Text('応募アカウント: ${account.name}'),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFD8DED1)),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: Color(0xFF23422D),
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 14),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(
            width: 96,
            child: Text(
              label,
              style: const TextStyle(color: Color(0xFF647067)),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _EstimatePanel extends StatelessWidget {
  const _EstimatePanel({required this.amount});

  final int amount;

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
        child: Row(
          children: [
            const Icon(Icons.savings_outlined, color: Color(0xFFD9853B)),
            const SizedBox(width: 10),
            const Expanded(child: Text('この応募条件での免除見込み')),
            Text(
              '$amount円',
              style: const TextStyle(
                color: Color(0xFF23422D),
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
