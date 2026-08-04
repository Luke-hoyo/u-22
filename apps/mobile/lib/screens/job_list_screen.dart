import 'package:flutter/material.dart';

import '../data/mock_data.dart';
import '../models/demo_account.dart';
import '../models/job.dart';
import '../services/hatarukun_api_service.dart';
import 'application_form_screen.dart';

class JobListScreen extends StatefulWidget {
  const JobListScreen({
    required this.account,
    required this.initialJob,
    required this.onJobSelected,
    this.sessionTokenProvider,
    super.key,
  });

  final DemoAccount account;
  final Job initialJob;
  final ValueChanged<Job> onJobSelected;
  final Future<String> Function()? sessionTokenProvider;

  @override
  State<JobListScreen> createState() => _JobListScreenState();
}

class _JobListScreenState extends State<JobListScreen> {
  final _api = HatarukunApiService();
  late Job selectedJob = widget.initialJob;
  List<Job> jobs = [];
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.sessionTokenProvider != null) {
      _loadJobs();
      return;
    }

    jobs = mockJobs;
  }

  Future<void> _loadJobs() async {
    final provider = widget.sessionTokenProvider;
    if (provider == null) return;

    setState(() => isLoading = true);

    try {
      final token = await provider();
      final loadedJobs = await _api.fetchJobs(sessionToken: token);
      if (!mounted) return;

      setState(() {
        jobs = loadedJobs;
        if (jobs.isNotEmpty && !jobs.any((job) => job.id == selectedJob.id)) {
          selectedJob = jobs.first;
        }
      });
    } catch {
      if (!mounted) return;
      setState(() => jobs = []);
    } finally {
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  void selectJob(Job job) {
    setState(() => selectedJob = job);
    widget.onJobSelected(job);
  }

  void applyForJob(Job job) {
    selectJob(job);

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ApplicationFormScreen(
          account: widget.account,
          job: job,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('求人一覧')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text(
              '地域の仕事を探す',
              style: TextStyle(
                color: Color(0xFF23422D),
                fontSize: 26,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              '農業・漁業・林業など、奨学金免除見込みと一緒に確認できます。',
              style: TextStyle(color: Color(0xFF4F5F51), fontSize: 13),
            ),
            const SizedBox(height: 18),
            if (isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: CircularProgressIndicator()),
              )
            else
              for (final job in jobs) ...[
                _JobCard(
                  job: job,
                  selected: job.id == selectedJob.id,
                  onTap: () => selectJob(job),
                  onApply: () => applyForJob(job),
                ),
                const SizedBox(height: 12),
              ],
          ],
        ),
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  const _JobCard({
    required this.job,
    required this.selected,
    required this.onTap,
    required this.onApply,
  });

  final Job job;
  final bool selected;
  final VoidCallback onTap;
  final VoidCallback onApply;

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
            border: Border.all(
              color:
                  selected ? const Color(0xFF3D7A4D) : const Color(0xFFD8DED1),
              width: selected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                job.title,
                style: const TextStyle(
                  color: Color(0xFF1F2E22),
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                '${job.region} / ${job.industry}',
                style: const TextStyle(
                  color: Color(0xFF3D7A4D),
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                job.organizationName,
                style: const TextStyle(color: Color(0xFF4F5F51), fontSize: 13),
              ),
              const SizedBox(height: 8),
              Text(
                job.description,
                style: const TextStyle(color: Color(0xFF4F5F51), fontSize: 13),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _InfoChip(
                    icon: Icons.payments_outlined,
                    label: '月給${job.monthlySalary}円',
                  ),
                  _InfoChip(
                    icon: Icons.calendar_month_outlined,
                    label: '${job.workPeriodMonths}ヶ月',
                  ),
                  _InfoChip(
                    icon: Icons.home_work_outlined,
                    label: '住居支援${job.housingSupport ? 'あり' : 'なし'}',
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '免除見込み ${job.expectedExemptionAmount}円',
                      style: const TextStyle(
                        color: Color(0xFFD9853B),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  FilledButton.tonalIcon(
                    onPressed: onApply,
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(0, 44),
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                    ),
                    icon: const Icon(Icons.send_outlined, size: 18),
                    label: const Text('応募する'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFF4F7F1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFD8DED1)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 15, color: const Color(0xFF2F6F44)),
            const SizedBox(width: 5),
            Text(
              label,
              style: const TextStyle(color: Color(0xFF4F5F51), fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
