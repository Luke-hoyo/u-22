import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../data/admin_mock_data.dart';
import '../../models/demo_account.dart';
import '../../models/user_role.dart';
import '../logout_screen.dart';

const _primary = Color(0xFF004D40);
const _primaryDark = Color(0xFF003F35);
const _textMain = Color(0xFF1A1C1E);
const _textSub = Color(0xFF4E5D58);
const _surfaceLow = Color(0xFFF1F4F3);

class AdminAppScreen extends StatefulWidget {
  const AdminAppScreen({
    required this.role,
    required this.account,
    super.key,
  });

  final AppUserRole role;
  final DemoAccount account;

  @override
  State<AdminAppScreen> createState() => _AdminAppScreenState();
}

class _AdminAppScreenState extends State<AdminAppScreen> {
  int currentIndex = 0;
  OperatorFocus operatorFocus = OperatorFocus.agriculture;
  String jobMessage = '';
  String inviteMessage = '';

  late List<AdminManagedJob> managedJobs = initialManagedJobs();
  late List<AdminApplicant> applicants = initialApplicants();
  late List<FarmerApplication> farmerApplications = initialFarmerApplications();
  late List<AdminPointRequest> pointRequests = initialPointRequests();
  final inviteCodes = <String, String>{};

  void _showSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  void _setJobReviewStatus(String jobId, AdminJobStatus status) {
    setState(() {
      managedJobs = managedJobs
          .map((job) => job.id == jobId ? job.copyWith(status: status) : job)
          .toList();
      jobMessage = switch (status) {
        AdminJobStatus.approved => '審査を完了しました。公開できます。',
        AdminJobStatus.published => '募集を公開しました。',
        AdminJobStatus.rejected => '募集を差し戻しました。',
        AdminJobStatus.review => '再審査に戻しました。',
        _ => '募集状態を更新しました。',
      };
    });
  }

  void _toggleJobStatus(String jobId) {
    setState(() {
      managedJobs = managedJobs.map((job) {
        if (job.id != jobId) return job;
        final next = job.status == AdminJobStatus.published
            ? AdminJobStatus.paused
            : AdminJobStatus.published;
        return job.copyWith(status: next);
      }).toList();
      jobMessage = '募集の公開状態を更新しました。';
    });
  }

  void _moveApplicant(String id, AdminApplicantStatus status) {
    setState(() {
      applicants = applicants
          .map((item) => item.id == id ? item.copyWith(status: status) : item)
          .toList();
      jobMessage = '応募者の状態を更新しました。';
    });
  }

  void _decideFarmerApplication(String id, FarmerApplicationStatus status) {
    setState(() {
      farmerApplications = farmerApplications
          .map((item) => item.id == id ? item.copyWith(status: status) : item)
          .toList();
      inviteMessage = status == FarmerApplicationStatus.approved
          ? '申請を承認しました。招待コードを発行できます。'
          : '申請を差し戻しました。';
    });
  }

  void _issueInvite(FarmerApplication application) {
    final code = operatorInvitePreview(operatorFocus);
    setState(() {
      inviteCodes[application.id] = code;
      inviteMessage = '${application.farmName} 向けの招待コードを発行しました。';
    });
  }

  void _copyInvite(String code) {
    Clipboard.setData(ClipboardData(text: code));
    _showSnack('招待コードをコピーしました');
  }

  void _decidePointRequest(String id, AdminPointRequestStatus status) {
    setState(() {
      pointRequests = pointRequests
          .map((item) => item.id == id ? item.copyWith(status: status) : item)
          .toList();
      jobMessage = 'ポイント申請を更新しました。';
    });
  }

  @override
  Widget build(BuildContext context) {
    final pages = _buildPages();
    final destinations = _destinations();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text(
          adminHomeLabel(widget.role),
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        actions: [
          IconButton(
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => LogoutScreen(account: widget.account),
              ),
            ),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: SafeArea(child: pages[currentIndex.clamp(0, pages.length - 1)]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex.clamp(0, destinations.length - 1),
        height: 74,
        onDestinationSelected: (index) => setState(() => currentIndex = index),
        destinations: destinations,
      ),
    );
  }

  List<NavigationDestination> _destinations() {
    return switch (widget.role) {
      AppUserRole.farmer => const [
          NavigationDestination(
              icon: Icon(Icons.spa_outlined),
              selectedIcon: Icon(Icons.spa),
              label: 'ホーム'),
          NavigationDestination(
              icon: Icon(Icons.people_outline),
              selectedIcon: Icon(Icons.people),
              label: '応募'),
          NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'マイページ'),
        ],
      AppUserRole.municipality => const [
          NavigationDestination(
              icon: Icon(Icons.apartment_outlined),
              selectedIcon: Icon(Icons.apartment),
              label: 'ホーム'),
          NavigationDestination(
              icon: Icon(Icons.fact_check_outlined),
              selectedIcon: Icon(Icons.fact_check),
              label: '審査'),
          NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'マイページ'),
        ],
      AppUserRole.operator => const [
          NavigationDestination(
              icon: Icon(Icons.shield_outlined),
              selectedIcon: Icon(Icons.shield),
              label: 'ホーム'),
          NavigationDestination(
              icon: Icon(Icons.mail_outline),
              selectedIcon: Icon(Icons.mail),
              label: '招待'),
          NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'マイページ'),
        ],
      AppUserRole.youngUser => const [],
    };
  }

  List<Widget> _buildPages() {
    return switch (widget.role) {
      AppUserRole.farmer => [
          _FarmerHomePage(
            applicants: applicants,
            managedJobs: managedJobs,
            jobMessage: jobMessage,
            onMoveApplicant: _moveApplicant,
            onToggleJobStatus: _toggleJobStatus,
          ),
          _FarmerApplicantsPage(
            applicants: applicants,
            onMoveApplicant: _moveApplicant,
          ),
          AdminProfilePage(account: widget.account, role: widget.role),
        ],
      AppUserRole.municipality => [
          _MunicipalityHomePage(
            farmerApplications: farmerApplications,
            pointRequests: pointRequests,
            inviteCodes: inviteCodes,
            inviteMessage: inviteMessage,
            onDecideFarmer: _decideFarmerApplication,
            onCopyInvite: _copyInvite,
            onDecidePoint: _decidePointRequest,
          ),
          _MunicipalityReviewPage(
            farmerApplications: farmerApplications,
            inviteCodes: inviteCodes,
            inviteMessage: inviteMessage,
            onDecideFarmer: _decideFarmerApplication,
            onCopyInvite: _copyInvite,
          ),
          AdminProfilePage(account: widget.account, role: widget.role),
        ],
      AppUserRole.operator => [
          _OperatorHomePage(
            focus: operatorFocus,
            managedJobs: managedJobs,
            applicants: applicants,
            pointRequests: pointRequests,
            jobMessage: jobMessage,
            onFocusChanged: (focus) => setState(() => operatorFocus = focus),
            onSetJobReviewStatus: _setJobReviewStatus,
            onDecidePoint: _decidePointRequest,
          ),
          _OperatorInvitesPage(
            focus: operatorFocus,
            farmerApplications: farmerApplications,
            inviteCodes: inviteCodes,
            inviteMessage: inviteMessage,
            onFocusChanged: (focus) => setState(() => operatorFocus = focus),
            onDecideFarmer: _decideFarmerApplication,
            onIssueInvite: _issueInvite,
            onCopyInvite: _copyInvite,
          ),
          AdminProfilePage(account: widget.account, role: widget.role),
        ],
      AppUserRole.youngUser => [
          const SizedBox.shrink(),
        ],
    };
  }
}

class AdminProfilePage extends StatelessWidget {
  const AdminProfilePage({required this.account, required this.role, super.key});

  final DemoAccount account;
  final AppUserRole role;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _Hero(
          eyebrow: 'マイページ',
          title: account.name,
          body: '${role.label}としてログイン中です。',
        ),
        const SizedBox(height: 16),
        _Panel(
          child: Column(
            children: [
              _InfoRow('メールアドレス', account.email),
              _InfoRow('アカウント権限', role.label),
              _InfoRow('招待コード', role == AppUserRole.operator ? '利用可' : '不要'),
            ],
          ),
        ),
      ],
    );
  }
}

class _OperatorHomePage extends StatelessWidget {
  const _OperatorHomePage({
    required this.focus,
    required this.managedJobs,
    required this.applicants,
    required this.pointRequests,
    required this.jobMessage,
    required this.onFocusChanged,
    required this.onSetJobReviewStatus,
    required this.onDecidePoint,
  });

  final OperatorFocus focus;
  final List<AdminManagedJob> managedJobs;
  final List<AdminApplicant> applicants;
  final List<AdminPointRequest> pointRequests;
  final String jobMessage;
  final ValueChanged<OperatorFocus> onFocusChanged;
  final void Function(String, AdminJobStatus) onSetJobReviewStatus;
  final void Function(String, AdminPointRequestStatus) onDecidePoint;

  @override
  Widget build(BuildContext context) {
    final filteredJobs =
        managedJobs.where((job) => jobMatchesFocus(job, focus)).toList();
    final filteredApplicants = applicants
        .where((job) => filteredJobs.any((item) => item.title == job.jobTitle))
        .toList();
    final showCommunity = focus == OperatorFocus.community;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _Hero(
          eyebrow: '運営ダッシュボード',
          title: '${operatorFocusLabels[focus]}の運用状況',
          body: '分野を切り替えると、募集審査・応募確認の対象が変わります。',
        ),
        const SizedBox(height: 12),
        _FocusSelector(focus: focus, onChanged: onFocusChanged),
        if (jobMessage.isNotEmpty) ...[
          const SizedBox(height: 12),
          _Feedback(message: jobMessage),
        ],
        const SizedBox(height: 12),
        if (showCommunity)
          _PointRequestsPanel(
            requests: pointRequests,
            onDecide: onDecidePoint,
          ),
        if (!showCommunity) ...[
          _SectionTitle('募集審査'),
          for (final job in filteredJobs) ...[
            _JobReviewCard(job: job, onSetStatus: onSetJobReviewStatus),
            const SizedBox(height: 10),
          ],
          const SizedBox(height: 8),
          _SectionTitle('応募者（閲覧のみ）'),
          for (final applicant in filteredApplicants) ...[
            _ApplicantReadOnlyCard(applicant: applicant),
            const SizedBox(height: 10),
          ],
        ],
      ],
    );
  }
}

class _OperatorInvitesPage extends StatelessWidget {
  const _OperatorInvitesPage({
    required this.focus,
    required this.farmerApplications,
    required this.inviteCodes,
    required this.inviteMessage,
    required this.onFocusChanged,
    required this.onDecideFarmer,
    required this.onIssueInvite,
    required this.onCopyInvite,
  });

  final OperatorFocus focus;
  final List<FarmerApplication> farmerApplications;
  final Map<String, String> inviteCodes;
  final String inviteMessage;
  final ValueChanged<OperatorFocus> onFocusChanged;
  final void Function(String, FarmerApplicationStatus) onDecideFarmer;
  final void Function(FarmerApplication) onIssueInvite;
  final void Function(String) onCopyInvite;

  @override
  Widget build(BuildContext context) {
    final filtered = farmerApplications
        .where((app) => farmerApplicationMatchesFocus(app, focus))
        .toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _Hero(
          eyebrow: '招待管理',
          title: '${operatorFocusLabels[focus]}向けの農家招待',
          body: 'プレビュー: ${operatorInvitePreview(focus)}',
        ),
        const SizedBox(height: 12),
        _FocusSelector(focus: focus, onChanged: onFocusChanged),
        if (inviteMessage.isNotEmpty) ...[
          const SizedBox(height: 12),
          _Feedback(message: inviteMessage),
        ],
        const SizedBox(height: 12),
        for (final application in filtered) ...[
          _FarmerApplicationCard(
            application: application,
            inviteCode: inviteCodes[application.id],
            onApprove: () =>
                onDecideFarmer(application.id, FarmerApplicationStatus.approved),
            onReject: () =>
                onDecideFarmer(application.id, FarmerApplicationStatus.rejected),
            onIssueInvite: () => onIssueInvite(application),
            onCopyInvite: onCopyInvite,
            canIssueInvite: true,
          ),
          const SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _FarmerHomePage extends StatelessWidget {
  const _FarmerHomePage({
    required this.applicants,
    required this.managedJobs,
    required this.jobMessage,
    required this.onMoveApplicant,
    required this.onToggleJobStatus,
  });

  final List<AdminApplicant> applicants;
  final List<AdminManagedJob> managedJobs;
  final String jobMessage;
  final void Function(String, AdminApplicantStatus) onMoveApplicant;
  final void Function(String) onToggleJobStatus;

  @override
  Widget build(BuildContext context) {
    final published =
        managedJobs.where((job) => job.status == AdminJobStatus.published).length;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const _Hero(
          eyebrow: '農家ホーム',
          title: '今日の受け入れと応募対応',
          body: '自分の募集・応募者・面談予定をこの画面で確認できます。',
        ),
        if (jobMessage.isNotEmpty) ...[
          const SizedBox(height: 12),
          _Feedback(message: jobMessage),
        ],
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
                child: _MetricCard(
                    label: '新着応募',
                    value: '${applicants.where((a) => a.status == AdminApplicantStatus.newApplicant).length}人')),
            const SizedBox(width: 10),
            Expanded(
                child: _MetricCard(label: '公開中の募集', value: '$published件')),
          ],
        ),
        const SizedBox(height: 16),
        const _SectionTitle('今日の予定'),
        for (final item in farmerTodaySchedule)
          _ScheduleRow(
            time: item.time,
            title: item.title,
            target: item.target,
            status: item.status,
          ),
        const SizedBox(height: 16),
        const _SectionTitle('応募者'),
        for (final applicant in applicants) ...[
          _FarmerApplicantCard(
            applicant: applicant,
            onInterview: () =>
                onMoveApplicant(applicant.id, AdminApplicantStatus.interview),
            onAccept: () =>
                onMoveApplicant(applicant.id, AdminApplicantStatus.accepted),
          ),
          const SizedBox(height: 10),
        ],
        const SizedBox(height: 8),
        const _SectionTitle('自分の募集'),
        for (final job in managedJobs) ...[
          _FarmerJobCard(job: job, onToggle: () => onToggleJobStatus(job.id)),
          const SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _FarmerApplicantsPage extends StatelessWidget {
  const _FarmerApplicantsPage({
    required this.applicants,
    required this.onMoveApplicant,
  });

  final List<AdminApplicant> applicants;
  final void Function(String, AdminApplicantStatus) onMoveApplicant;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const _Hero(
          eyebrow: '応募者一覧',
          title: '自分の募集への応募',
          body: '応募者の確認と面談・受け入れの進行管理を行います。',
        ),
        const SizedBox(height: 16),
        for (final applicant in applicants) ...[
          _FarmerApplicantCard(
            applicant: applicant,
            onInterview: () =>
                onMoveApplicant(applicant.id, AdminApplicantStatus.interview),
            onAccept: () =>
                onMoveApplicant(applicant.id, AdminApplicantStatus.accepted),
          ),
          const SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _MunicipalityHomePage extends StatelessWidget {
  const _MunicipalityHomePage({
    required this.farmerApplications,
    required this.pointRequests,
    required this.inviteCodes,
    required this.inviteMessage,
    required this.onDecideFarmer,
    required this.onCopyInvite,
    required this.onDecidePoint,
  });

  final List<FarmerApplication> farmerApplications;
  final List<AdminPointRequest> pointRequests;
  final Map<String, String> inviteCodes;
  final String inviteMessage;
  final void Function(String, FarmerApplicationStatus) onDecideFarmer;
  final void Function(String) onCopyInvite;
  final void Function(String, AdminPointRequestStatus) onDecidePoint;

  @override
  Widget build(BuildContext context) {
    final pendingApps = farmerApplications
        .where((app) => app.status == FarmerApplicationStatus.pending)
        .length;
    final pendingPoints = pointRequests
        .where((req) => req.status == AdminPointRequestStatus.pending)
        .length;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const _Hero(
          eyebrow: '自治体ダッシュボード',
          title: '地域の受け入れ状況',
          body: '農家申請とポイント承認をこの画面で確認できます。',
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
                child: _MetricCard(label: '農家申請待ち', value: '$pendingApps件')),
            const SizedBox(width: 10),
            Expanded(
                child: _MetricCard(label: 'ポイント承認待ち', value: '$pendingPoints件')),
          ],
        ),
        if (inviteMessage.isNotEmpty) ...[
          const SizedBox(height: 12),
          _Feedback(message: inviteMessage),
        ],
        const SizedBox(height: 16),
        _PointRequestsPanel(requests: pointRequests, onDecide: onDecidePoint),
        const SizedBox(height: 16),
        for (final application in farmerApplications.take(2)) ...[
          _FarmerApplicationCard(
            application: application,
            inviteCode: inviteCodes[application.id],
            onApprove: () =>
                onDecideFarmer(application.id, FarmerApplicationStatus.approved),
            onReject: () =>
                onDecideFarmer(application.id, FarmerApplicationStatus.rejected),
            onIssueInvite: () {},
            onCopyInvite: onCopyInvite,
            canIssueInvite: false,
          ),
          const SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _MunicipalityReviewPage extends StatelessWidget {
  const _MunicipalityReviewPage({
    required this.farmerApplications,
    required this.inviteCodes,
    required this.inviteMessage,
    required this.onDecideFarmer,
    required this.onCopyInvite,
  });

  final List<FarmerApplication> farmerApplications;
  final Map<String, String> inviteCodes;
  final String inviteMessage;
  final void Function(String, FarmerApplicationStatus) onDecideFarmer;
  final void Function(String) onCopyInvite;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const _Hero(
          eyebrow: '申請審査',
          title: '受け入れ先の申請審査',
          body: '地域の受け入れ先申請を確認し、承認後は運営が招待コードを発行します。',
        ),
        if (inviteMessage.isNotEmpty) ...[
          const SizedBox(height: 12),
          _Feedback(message: inviteMessage),
        ],
        const SizedBox(height: 16),
        for (final application in farmerApplications) ...[
          _FarmerApplicationCard(
            application: application,
            inviteCode: inviteCodes[application.id],
            onApprove: () =>
                onDecideFarmer(application.id, FarmerApplicationStatus.approved),
            onReject: () =>
                onDecideFarmer(application.id, FarmerApplicationStatus.rejected),
            onIssueInvite: () {},
            onCopyInvite: onCopyInvite,
            canIssueInvite: false,
          ),
          const SizedBox(height: 10),
        ],
      ],
    );
  }
}

// Shared widgets

class _Hero extends StatelessWidget {
  const _Hero({required this.eyebrow, required this.title, required this.body});
  final String eyebrow;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(eyebrow,
            style: const TextStyle(
                color: _primary, fontWeight: FontWeight.w800, fontSize: 12)),
        const SizedBox(height: 6),
        Text(title,
            style: const TextStyle(
                fontSize: 24, fontWeight: FontWeight.w900, color: _textMain)),
        const SizedBox(height: 6),
        Text(body, style: const TextStyle(color: _textSub, height: 1.5)),
      ],
    );
  }
}

class _FocusSelector extends StatelessWidget {
  const _FocusSelector({required this.focus, required this.onChanged});
  final OperatorFocus focus;
  final ValueChanged<OperatorFocus> onChanged;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: OperatorFocus.values.map((item) {
        return ChoiceChip(
          label: Text(operatorFocusLabels[item]!),
          selected: focus == item,
          onSelected: (_) => onChanged(item),
        );
      }).toList(),
    );
  }
}

class _JobReviewCard extends StatelessWidget {
  const _JobReviewCard({required this.job, required this.onSetStatus});
  final AdminManagedJob job;
  final void Function(String, AdminJobStatus) onSetStatus;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _StatusChip(jobStatusLabels[job.status]!),
          const SizedBox(height: 8),
          Text(job.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17)),
          Text('${job.organization} / ${job.area}',
              style: const TextStyle(color: _textSub)),
          const SizedBox(height: 12),
          _reviewActions(job, onSetStatus),
        ],
      ),
    );
  }

  Widget _reviewActions(
    AdminManagedJob job,
    void Function(String, AdminJobStatus) onSetStatus,
  ) {
    return switch (job.status) {
      AdminJobStatus.review => Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => onSetStatus(job.id, AdminJobStatus.rejected),
                child: const Text('差し戻し'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: FilledButton(
                onPressed: () => onSetStatus(job.id, AdminJobStatus.approved),
                child: const Text('審査完了'),
              ),
            ),
          ],
        ),
      AdminJobStatus.approved => Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => onSetStatus(job.id, AdminJobStatus.rejected),
                child: const Text('差し戻し'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: FilledButton(
                onPressed: () => onSetStatus(job.id, AdminJobStatus.published),
                child: const Text('公開'),
              ),
            ),
          ],
        ),
      AdminJobStatus.published => OutlinedButton(
          onPressed: () => onSetStatus(job.id, AdminJobStatus.rejected),
          child: const Text('差し戻し'),
        ),
      AdminJobStatus.rejected => OutlinedButton(
          onPressed: () => onSetStatus(job.id, AdminJobStatus.review),
          child: const Text('再審査'),
        ),
      _ => const SizedBox.shrink(),
    };
  }
}

class _ApplicantReadOnlyCard extends StatelessWidget {
  const _ApplicantReadOnlyCard({required this.applicant});
  final AdminApplicant applicant;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                  child: Text(applicant.name,
                      style: const TextStyle(
                          fontWeight: FontWeight.w900, fontSize: 17))),
              _StatusChip(applicantStatusLabels[applicant.status]!),
            ],
          ),
          Text(applicant.jobTitle, style: const TextStyle(color: _textSub)),
          const SizedBox(height: 10),
          _InfoRow('生年月日', applicant.birthDate),
          _InfoRow('住所', applicant.address),
          _InfoRow('マイナンバー', applicant.myNumberStatus),
          _InfoRow('希望地域', applicant.region),
          _InfoRow('応募状況', applicant.nextAction),
          const SizedBox(height: 8),
          const Text(
            '個人情報は閲覧のみです。面談調整や受け入れ確定は農家側で行います。',
            style: TextStyle(color: _textSub, fontSize: 12, height: 1.45),
          ),
        ],
      ),
    );
  }
}

class _FarmerApplicantCard extends StatelessWidget {
  const _FarmerApplicantCard({
    required this.applicant,
    required this.onInterview,
    required this.onAccept,
  });

  final AdminApplicant applicant;
  final VoidCallback onInterview;
  final VoidCallback onAccept;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(applicant.name,
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17)),
          Text(applicant.jobTitle, style: const TextStyle(color: _textSub)),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onInterview,
                  child: const Text('面談へ'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: FilledButton(
                  onPressed: onAccept,
                  child: const Text('確定'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FarmerJobCard extends StatelessWidget {
  const _FarmerJobCard({required this.job, required this.onToggle});
  final AdminManagedJob job;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _StatusChip(jobStatusLabels[job.status]!),
                const SizedBox(height: 6),
                Text(job.title,
                    style: const TextStyle(fontWeight: FontWeight.w900)),
                Text('${job.organization} / ${job.area}',
                    style: const TextStyle(color: _textSub, fontSize: 12)),
              ],
            ),
          ),
          OutlinedButton(
            onPressed: onToggle,
            child: Text(job.status == AdminJobStatus.published ? '停止' : '公開'),
          ),
        ],
      ),
    );
  }
}

class _FarmerApplicationCard extends StatelessWidget {
  const _FarmerApplicationCard({
    required this.application,
    required this.inviteCode,
    required this.onApprove,
    required this.onReject,
    required this.onIssueInvite,
    required this.onCopyInvite,
    required this.canIssueInvite,
  });

  final FarmerApplication application;
  final String? inviteCode;
  final VoidCallback onApprove;
  final VoidCallback onReject;
  final VoidCallback onIssueInvite;
  final void Function(String) onCopyInvite;
  final bool canIssueInvite;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _StatusChip(farmerApplicationStatusLabels[application.status]!),
          const SizedBox(height: 8),
          Text(application.farmName,
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17)),
          Text(
            '${application.representativeName} / ${application.region} ${application.area}',
            style: const TextStyle(color: _textSub),
          ),
          Text(application.note,
              style: const TextStyle(color: _textSub, fontSize: 12)),
          const SizedBox(height: 10),
          _InfoRow('受け入れ', '${application.capacity}人'),
          _InfoRow('住まい支援', application.housingSupport ? 'あり' : '未定'),
          if (inviteCode != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(child: Text(inviteCode!, style: const TextStyle(fontWeight: FontWeight.w800))),
                IconButton(
                  onPressed: () => onCopyInvite(inviteCode!),
                  icon: const Icon(Icons.copy_outlined),
                ),
              ],
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: application.status == FarmerApplicationStatus.rejected
                      ? null
                      : onReject,
                  child: const Text('差し戻し'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: FilledButton(
                  onPressed: application.status == FarmerApplicationStatus.approved
                      ? null
                      : onApprove,
                  child: const Text('承認'),
                ),
              ),
            ],
          ),
          if (canIssueInvite &&
              application.status == FarmerApplicationStatus.approved &&
              inviteCode == null) ...[
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: onIssueInvite,
              icon: const Icon(Icons.key_outlined),
              label: const Text('招待発行'),
            ),
          ],
        ],
      ),
    );
  }
}

class _PointRequestsPanel extends StatelessWidget {
  const _PointRequestsPanel({required this.requests, required this.onDecide});
  final List<AdminPointRequest> requests;
  final void Function(String, AdminPointRequestStatus) onDecide;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _SectionTitle('ポイント承認'),
        for (final request in requests) ...[
          _Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(request.applicantName,
                    style: const TextStyle(fontWeight: FontWeight.w900)),
                Text(request.eventTitle, style: const TextStyle(color: _textSub)),
                Text('+${request.points} pt',
                    style: const TextStyle(
                        color: _primaryDark, fontWeight: FontWeight.w900)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () =>
                            onDecide(request.id, AdminPointRequestStatus.hold),
                        child: const Text('保留'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: FilledButton(
                        onPressed: () => onDecide(
                            request.id, AdminPointRequestStatus.approved),
                        child: const Text('承認'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: _textSub, fontSize: 12)),
          const SizedBox(height: 4),
          Text(value,
              style: const TextStyle(
                  fontSize: 22, fontWeight: FontWeight.w900, color: _primaryDark)),
        ],
      ),
    );
  }
}

class _ScheduleRow extends StatelessWidget {
  const _ScheduleRow({
    required this.time,
    required this.title,
    required this.target,
    required this.status,
  });

  final String time;
  final String title;
  final String target;
  final String status;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Text(time, style: const TextStyle(fontWeight: FontWeight.w800)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
                Text(target, style: const TextStyle(color: _textSub, fontSize: 12)),
              ],
            ),
          ),
          Text(status, style: const TextStyle(fontWeight: FontWeight.w800)),
        ],
      ),
    );
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

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(text,
          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip(this.label);
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _surfaceLow,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
              width: 88,
              child: Text(label, style: const TextStyle(color: _textSub, fontSize: 12))),
          Expanded(
              child: Text(value,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
        ],
      ),
    );
  }
}

class _Feedback extends StatelessWidget {
  const _Feedback({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFEEF8F5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFCFE2DC)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Text(message,
            style: const TextStyle(color: _primaryDark, fontSize: 13)),
      ),
    );
  }
}
