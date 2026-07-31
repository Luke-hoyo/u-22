import 'package:flutter/material.dart';

import '../data/mock_data.dart';
import '../models/demo_account.dart';
import '../models/job.dart';
import 'access_guide_screen.dart';
import 'logout_screen.dart';
import 'my_number_demo_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({required this.account, super.key});

  final DemoAccount account;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int currentIndex = 0;
  String searchQuery = '';
  String selectedIndustry = 'すべて';
  bool showOnlyHousing = false;
  final favorites = <String>{};
  final applications = <_DemoApplication>[
    const _DemoApplication(
      id: 'APP-001',
      jobId: 'higashihiroshima-grape',
      status: _ApplicationStatus.interview,
      appliedAt: '2026年7月18日',
      nextAction: '7月31日 18:00 オンライン面談',
      expectedSupport: 90000,
    ),
    const _DemoApplication(
      id: 'APP-002',
      jobId: 'hita-forestry',
      status: _ApplicationStatus.applied,
      appliedAt: '2026年7月21日',
      nextAction: '地域担当者が応募内容を確認中',
      expectedSupport: 102000,
    ),
  ];
  final transactions = <_PointTransaction>[
    const _PointTransaction('地域説明会への参加', '7月20日', 300),
    const _PointTransaction('プロフィール登録完了', '7月16日', 500),
    const _PointTransaction('地域商品券に交換', '7月8日', -1000),
    const _PointTransaction('オンライン農業体験', '7月2日', 800),
  ];
  var preferences = _DemoPreferences.defaults();
  int points = 3200;

  List<Job> get filteredJobs {
    final query = searchQuery.trim().toLowerCase();
    return mockJobs.where((job) {
      final matchesIndustry =
          selectedIndustry == 'すべて' || job.industry == selectedIndustry;
      final matchesHousing = !showOnlyHousing || job.housingSupport;
      final target = [
        job.title,
        job.organizationName,
        job.region,
        job.area,
        job.industry,
        job.summary,
        job.description,
        job.tags.join(' '),
      ].join(' ').toLowerCase();
      return matchesIndustry &&
          matchesHousing &&
          (query.isEmpty || target.contains(query));
    }).toList();
  }

  Job get currentJob {
    final firstApplication =
        applications.isNotEmpty ? applications.first : null;
    return mockJobs.firstWhere(
      (job) => job.id == firstApplication?.jobId,
      orElse: () => mockJobs.first,
    );
  }

  int get annualSupportEstimate {
    return preferences.housingSupport ? 180000 : 156000;
  }

  int get totalExpectedSupport {
    if (applications.isEmpty) return annualSupportEstimate;
    return applications.fold(0, (sum, item) => sum + item.expectedSupport);
  }

  bool hasApplication(String jobId) {
    return applications.any((application) => application.jobId == jobId);
  }

  _DemoApplication? applicationFor(String jobId) {
    for (final application in applications) {
      if (application.jobId == jobId) return application;
    }
    return null;
  }

  void toggleFavorite(Job job) {
    setState(() {
      if (!favorites.add(job.id)) favorites.remove(job.id);
    });
    _showSnack(favorites.contains(job.id) ? 'お気に入りに保存しました' : 'お気に入りを解除しました');
  }

  void applyForJob(Job job) {
    final existing = applicationFor(job.id);
    if (existing != null) {
      setState(() => currentIndex = 2);
      _showSnack('応募済みです。マッチング状況を表示します');
      return;
    }

    setState(() {
      applications.insert(
        0,
        _DemoApplication(
          id: 'APP-DEMO-${DateTime.now().millisecondsSinceEpoch}',
          jobId: job.id,
          status: _ApplicationStatus.applied,
          appliedAt: '2026年7月29日',
          nextAction: '地域担当者が応募内容を確認中',
          expectedSupport: job.monthlySupport * job.workPeriodMonths,
        ),
      );
      currentIndex = 2;
    });
    _showSnack('${job.title} に応募しました');
  }

  void exchangeReward(_Reward reward) {
    if (points < reward.cost) {
      _showSnack('交換に必要なポイントが足りません');
      return;
    }
    setState(() {
      points -= reward.cost;
      transactions.insert(
          0, _PointTransaction(reward.name, '7月29日', -reward.cost));
    });
    _showSnack('${reward.name}に交換しました');
  }

  void savePreferences(_DemoPreferences next) {
    setState(() => preferences = next);
    _showSnack('希望条件を保存しました');
  }

  void _showSnack(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  void openMenu() {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _SheetTile(
                icon: Icons.route_outlined,
                title: 'アクセスガイド',
                subtitle: '使い方と応募の流れを確認',
                onTap: () {
                  Navigator.of(context).pop();
                  Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const AccessGuideScreen()));
                },
              ),
              _SheetTile(
                icon: Icons.badge_outlined,
                title: 'マイナンバー登録デモ',
                subtitle: '本人確認モックを確認',
                onTap: () {
                  Navigator.of(context).pop();
                  Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) =>
                          MyNumberDemoScreen(account: widget.account)));
                },
              ),
              _SheetTile(
                icon: Icons.logout,
                title: 'ログアウト',
                subtitle: 'ログイン画面に戻る',
                danger: true,
                onTap: () {
                  Navigator.of(context).pop();
                  Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => LogoutScreen(account: widget.account)));
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void openNotifications() {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (context) => const _NotificationCenterSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      _HomeTab(
        account: widget.account,
        currentJob: currentJob,
        applications: applications,
        points: points,
        annualSupportEstimate: annualSupportEstimate,
        scholarshipBalance: preferences.scholarshipBalance,
        onJobsTap: () => setState(() => currentIndex = 1),
        onMatchingTap: () => setState(() => currentIndex = 2),
        onPointsTap: () => setState(() => currentIndex = 3),
        onProfileTap: () => setState(() => currentIndex = 4),
      ),
      _JobsTab(
        jobs: filteredJobs,
        favorites: favorites,
        selectedIndustry: selectedIndustry,
        showOnlyHousing: showOnlyHousing,
        searchQuery: searchQuery,
        hasApplication: hasApplication,
        onSearchChanged: (value) => setState(() => searchQuery = value),
        onIndustryChanged: (value) => setState(() => selectedIndustry = value),
        onHousingChanged: (value) => setState(() => showOnlyHousing = value),
        onFavorite: toggleFavorite,
        onApply: applyForJob,
      ),
      _MatchingTab(
        applications: applications,
        onJobsTap: () => setState(() => currentIndex = 1),
      ),
      _PointsTab(
        points: points,
        transactions: transactions,
        onExchange: exchangeReward,
      ),
      _ProfileTab(
        account: widget.account,
        preferences: preferences,
        favorites: favorites.length,
        applications: applications.length,
        totalExpectedSupport: totalExpectedSupport,
        onSavePreferences: savePreferences,
        onStatusTap: () => _showSnack('状態画面を確認しました'),
      ),
    ];

    return Scaffold(
      backgroundColor: _surface,
      appBar: AppBar(
        title: const Text('はたるくん'),
        centerTitle: false,
        actions: [
          IconButton(
            tooltip: '通知',
            onPressed: openNotifications,
            icon: const Badge(
              smallSize: 8,
              backgroundColor: _accent,
              child: Icon(Icons.notifications_none),
            ),
          ),
          IconButton(
            tooltip: 'メニュー',
            onPressed: openMenu,
            icon: const Icon(Icons.menu),
          ),
        ],
      ),
      body: SafeArea(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 220),
          child: pages[currentIndex],
        ),
      ),
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            return TextStyle(
              color: states.contains(WidgetState.selected)
                  ? _primaryDark
                  : _textSub,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            );
          }),
        ),
        child: NavigationBar(
          selectedIndex: currentIndex,
          height: 74,
          backgroundColor: Colors.white,
          indicatorColor: _secondaryContainer.withValues(alpha: 0.72),
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          onDestinationSelected: (index) =>
              setState(() => currentIndex = index),
          destinations: const [
            NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home),
                label: 'ホーム'),
            NavigationDestination(
                icon: Icon(Icons.search),
                selectedIcon: Icon(Icons.manage_search),
                label: '求人検索'),
            NavigationDestination(
                icon: Icon(Icons.insights_outlined),
                selectedIcon: Icon(Icons.insights),
                label: 'シミュレーション'),
            NavigationDestination(
                icon: Icon(Icons.confirmation_number_outlined),
                selectedIcon: Icon(Icons.confirmation_number),
                label: 'ポイント'),
            NavigationDestination(
                icon: Icon(Icons.person_outline),
                selectedIcon: Icon(Icons.person),
                label: 'マイページ'),
          ],
        ),
      ),
    );
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab({
    required this.account,
    required this.currentJob,
    required this.applications,
    required this.points,
    required this.annualSupportEstimate,
    required this.scholarshipBalance,
    required this.onJobsTap,
    required this.onMatchingTap,
    required this.onPointsTap,
    required this.onProfileTap,
  });

  final DemoAccount account;
  final Job currentJob;
  final List<_DemoApplication> applications;
  final int points;
  final int annualSupportEstimate;
  final int scholarshipBalance;
  final VoidCallback onJobsTap;
  final VoidCallback onMatchingTap;
  final VoidCallback onPointsTap;
  final VoidCallback onProfileTap;

  @override
  Widget build(BuildContext context) {
    final currentApplication =
        applications.isNotEmpty ? applications.first : null;
    return ListView(
      key: const ValueKey('home'),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        _PageIntro(
          eyebrow: '今日のホーム',
          title: 'まずは、面談の準備から。',
          body: '返済支援と地域の仕事を、次に必要な行動から確認できます。',
          actionLabel: '求人を探す',
          actionIcon: Icons.eco_outlined,
          onAction: onJobsTap,
        ),
        const SizedBox(height: 16),
        _NextActionCard(
          job: currentJob,
          application: currentApplication,
          onTap: onMatchingTap,
        ),
        const SizedBox(height: 14),
        LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxWidth < 360;
            final cards = [
              _MetricCard(
                label: '年間の返済支援見込み',
                value: _yen(annualSupportEstimate),
                note: '希望条件をもとに試算',
                icon: Icons.file_present_outlined,
                tone: _accentSoft,
                onTap: onMatchingTap,
              ),
              _MetricCard(
                label: '奨学金残高',
                value: '${(scholarshipBalance / 10000).round()}万円',
                note: '登録した貸与型奨学金',
                icon: Icons.account_balance_wallet_outlined,
                tone: _surfaceLow,
                onTap: onProfileTap,
              ),
              _MetricCard(
                label: '地域ポイント',
                value: '${_number(points)} pt',
                note: points < 5000
                    ? 'あと${_number(5000 - points)} ptで体験ツアー'
                    : '体験ツアーに交換できます',
                icon: Icons.confirmation_number_outlined,
                tone: _secondaryContainer.withValues(alpha: 0.45),
                onTap: onPointsTap,
              ),
            ];
            if (compact) {
              return Column(
                  children: cards
                      .map((card) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: card))
                      .toList());
            }
            return Column(
              children: [
                Row(children: [
                  Expanded(child: cards[0]),
                  const SizedBox(width: 10),
                  Expanded(child: cards[1])
                ]),
                const SizedBox(height: 10),
                cards[2],
              ],
            );
          },
        ),
        const SizedBox(height: 14),
        _MatchingPreview(
            job: currentJob,
            application: currentApplication,
            onTap: onMatchingTap),
        const SizedBox(height: 14),
        _TaskPanel(onProfileTap: onProfileTap, onMatchingTap: onMatchingTap),
        const SizedBox(height: 14),
        _CommunityEventPanel(onTap: onPointsTap),
      ],
    );
  }
}

class _JobsTab extends StatelessWidget {
  const _JobsTab({
    required this.jobs,
    required this.favorites,
    required this.selectedIndustry,
    required this.showOnlyHousing,
    required this.searchQuery,
    required this.hasApplication,
    required this.onSearchChanged,
    required this.onIndustryChanged,
    required this.onHousingChanged,
    required this.onFavorite,
    required this.onApply,
  });

  final List<Job> jobs;
  final Set<String> favorites;
  final String selectedIndustry;
  final bool showOnlyHousing;
  final String searchQuery;
  final bool Function(String jobId) hasApplication;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onIndustryChanged;
  final ValueChanged<bool> onHousingChanged;
  final ValueChanged<Job> onFavorite;
  final ValueChanged<Job> onApply;

  @override
  Widget build(BuildContext context) {
    return ListView(
      key: const ValueKey('jobs'),
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        const _PageIntro(
          eyebrow: '求人検索',
          title: '希望条件に近い仕事を探す',
          body: '農業、林業、水産業の求人を、マッチ度や住居支援と一緒に確認できます。',
        ),
        const SizedBox(height: 16),
        TextField(
          onChanged: onSearchChanged,
          textInputAction: TextInputAction.search,
          decoration: const InputDecoration(
            hintText: '地域・職種・会社名で検索',
            prefixIcon: Icon(Icons.search),
          ),
        ),
        const SizedBox(height: 12),
        _FilterChips(
            selectedIndustry: selectedIndustry,
            showOnlyHousing: showOnlyHousing,
            onIndustryChanged: onIndustryChanged,
            onHousingChanged: onHousingChanged),
        const SizedBox(height: 16),
        if (jobs.isEmpty)
          const _StatusPanel(
              icon: Icons.search_off_outlined,
              title: '条件に合う求人がありません',
              body: '検索語句や絞り込みを変更して、もう一度探してください。')
        else
          for (final job in jobs) ...[
            _JobCard(
              job: job,
              favorite: favorites.contains(job.id),
              applied: hasApplication(job.id),
              onFavorite: () => onFavorite(job),
              onApply: () => onApply(job),
            ),
            const SizedBox(height: 12),
          ],
      ],
    );
  }
}

class _MatchingTab extends StatelessWidget {
  const _MatchingTab({required this.applications, required this.onJobsTap});

  final List<_DemoApplication> applications;
  final VoidCallback onJobsTap;

  @override
  Widget build(BuildContext context) {
    return ListView(
      key: const ValueKey('matching'),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        const _PageIntro(
          eyebrow: 'シミュレーション',
          title: '応募と返済支援の進み具合',
          body: '応募から面談、マッチ成立、就業開始までを同じ画面で確認できます。',
        ),
        const SizedBox(height: 16),
        if (applications.isEmpty) ...[
          _StatusPanel(
              icon: Icons.work_outline,
              title: '応募中の求人はありません',
              body: '求人検索から気になる仕事に応募すると、ここに反映されます。',
              actionLabel: '求人を探す',
              onAction: onJobsTap),
        ] else ...[
          for (final application in applications) ...[
            _ApplicationCard(application: application),
            const SizedBox(height: 12),
          ],
        ],
        const SizedBox(height: 12),
        const _StatusGallery(),
      ],
    );
  }
}

class _PointsTab extends StatelessWidget {
  const _PointsTab(
      {required this.points,
      required this.transactions,
      required this.onExchange});

  final int points;
  final List<_PointTransaction> transactions;
  final ValueChanged<_Reward> onExchange;

  @override
  Widget build(BuildContext context) {
    return ListView(
      key: const ValueKey('points'),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        _PointsHero(points: points),
        const SizedBox(height: 16),
        const _SectionHeader('参加できる地域イベント'),
        const SizedBox(height: 10),
        for (final event in _events) ...[
          _EventCard(event: event),
          const SizedBox(height: 10),
        ],
        const SizedBox(height: 12),
        const _SectionHeader('ポイントを地域特典に交換'),
        const SizedBox(height: 10),
        for (final reward in _rewards) ...[
          _RewardCard(
              reward: reward,
              enabled: points >= reward.cost,
              onExchange: () => onExchange(reward)),
          const SizedBox(height: 10),
        ],
        const SizedBox(height: 12),
        const _SectionHeader('ポイント履歴'),
        const SizedBox(height: 10),
        _Panel(
          child: Column(
            children: [
              for (final tx in transactions) _TransactionRow(transaction: tx),
            ],
          ),
        ),
      ],
    );
  }
}

class _ProfileTab extends StatefulWidget {
  const _ProfileTab({
    required this.account,
    required this.preferences,
    required this.favorites,
    required this.applications,
    required this.totalExpectedSupport,
    required this.onSavePreferences,
    required this.onStatusTap,
  });

  final DemoAccount account;
  final _DemoPreferences preferences;
  final int favorites;
  final int applications;
  final int totalExpectedSupport;
  final ValueChanged<_DemoPreferences> onSavePreferences;
  final VoidCallback onStatusTap;

  @override
  State<_ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<_ProfileTab> {
  late final industriesController =
      TextEditingController(text: widget.preferences.industries);
  late final regionsController =
      TextEditingController(text: widget.preferences.regions);
  late final balanceController = TextEditingController(
      text: widget.preferences.scholarshipBalance.toString());
  late String period = widget.preferences.period;
  late bool housingSupport = widget.preferences.housingSupport;

  @override
  void didUpdateWidget(covariant _ProfileTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.preferences != widget.preferences) {
      industriesController.text = widget.preferences.industries;
      regionsController.text = widget.preferences.regions;
      balanceController.text = widget.preferences.scholarshipBalance.toString();
      period = widget.preferences.period;
      housingSupport = widget.preferences.housingSupport;
    }
  }

  @override
  void dispose() {
    industriesController.dispose();
    regionsController.dispose();
    balanceController.dispose();
    super.dispose();
  }

  void save() {
    widget.onSavePreferences(
      _DemoPreferences(
        industries: industriesController.text.trim().isEmpty
            ? '農業、水産業'
            : industriesController.text.trim(),
        regions: regionsController.text.trim().isEmpty
            ? '中国・四国地方、九州地方'
            : regionsController.text.trim(),
        period: period,
        housingSupport: housingSupport,
        scholarshipBalance: int.tryParse(balanceController.text) ?? 0,
      ),
    );
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      key: const ValueKey('profile'),
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        _ProfileHeader(
            account: widget.account,
            favorites: widget.favorites,
            applications: widget.applications,
            totalExpectedSupport: widget.totalExpectedSupport),
        const SizedBox(height: 14),
        _Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _SectionHeader('希望する働き方'),
              const SizedBox(height: 12),
              TextField(
                  controller: industriesController,
                  decoration: const InputDecoration(labelText: '興味のある仕事')),
              const SizedBox(height: 12),
              TextField(
                  controller: regionsController,
                  decoration: const InputDecoration(labelText: '希望地域')),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: period,
                decoration: const InputDecoration(labelText: '働ける期間'),
                items: const ['3か月〜6か月', '6か月〜12か月', '12か月〜24か月']
                    .map((value) =>
                        DropdownMenuItem(value: value, child: Text(value)))
                    .toList(),
                onChanged: (value) => setState(() => period = value ?? period),
              ),
              const SizedBox(height: 12),
              TextField(
                  controller: balanceController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: '現在の奨学金残高')),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('住まいの支援が必要',
                              style: TextStyle(fontWeight: FontWeight.w800)),
                          SizedBox(height: 2),
                          Text('寮、空き家、家賃補助がある求人を優先します。',
                              style: TextStyle(color: _textSub, fontSize: 12)),
                        ],
                      ),
                    ),
                    Switch(
                      value: housingSupport,
                      onChanged: (value) =>
                          setState(() => housingSupport = value),
                    ),
                  ],
                ),
              ),
              FilledButton.icon(
                  onPressed: save,
                  icon: const Icon(Icons.check),
                  label: const Text('希望条件を保存')),
            ],
          ),
        ),
        const SizedBox(height: 14),
        _Panel(
          child: Column(
            children: [
              _ProfileRow(
                  icon: Icons.verified_user_outlined,
                  title: '本人確認',
                  value: widget.account.verificationStatus),
              _ProfileRow(
                  icon: Icons.badge_outlined,
                  title: 'マイナンバー',
                  value: widget.account.myNumberStatus),
              _ProfileRow(
                  icon: Icons.account_balance_outlined,
                  title: '自治体確認状態',
                  value: widget.account.taxStatus),
              const _ProfileRow(
                  icon: Icons.link, title: 'Google連携', value: '未連携'),
            ],
          ),
        ),
        const SizedBox(height: 14),
        _Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _SectionHeader('状態画面'),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final label in [
                    'Loading',
                    'Empty',
                    'Error',
                    'Offline',
                    'Maintenance',
                    '404'
                  ])
                    ActionChip(
                        label: Text(label), onPressed: widget.onStatusTap),
                ],
              ),
              const SizedBox(height: 8),
              const Text('API連携前のデモ状態です。後からAppwrite/kintone境界に差し替えます。',
                  style: TextStyle(color: _textSub, fontSize: 12)),
            ],
          ),
        ),
      ],
    );
  }
}

class _PageIntro extends StatelessWidget {
  const _PageIntro(
      {required this.eyebrow,
      required this.title,
      required this.body,
      this.actionLabel,
      this.actionIcon,
      this.onAction});

  final String eyebrow;
  final String title;
  final String body;
  final String? actionLabel;
  final IconData? actionIcon;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(eyebrow,
            style: const TextStyle(
                color: _secondary, fontWeight: FontWeight.w800, fontSize: 12)),
        const SizedBox(height: 6),
        Text(title,
            style: const TextStyle(
                color: _textMain,
                fontSize: 28,
                fontWeight: FontWeight.w800,
                height: 1.18)),
        const SizedBox(height: 8),
        Text(body,
            style:
                const TextStyle(color: _textSub, fontSize: 14, height: 1.55)),
        if (actionLabel != null && onAction != null) ...[
          const SizedBox(height: 12),
          FilledButton.icon(
              onPressed: onAction,
              icon: Icon(actionIcon ?? Icons.arrow_forward),
              label: Text(actionLabel!)),
        ],
      ],
    );
  }
}

class _NextActionCard extends StatelessWidget {
  const _NextActionCard(
      {required this.job, required this.application, required this.onTap});

  final Job job;
  final _DemoApplication? application;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      color: _primary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              CircleAvatar(
                  backgroundColor: Colors.white24,
                  foregroundColor: Colors.white,
                  child: Icon(Icons.calendar_month_outlined)),
              SizedBox(width: 10),
              Text('次にやること',
                  style: TextStyle(
                      color: Colors.white70, fontWeight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 14),
          const Text('オンライン面談に参加する',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  height: 1.2)),
          const SizedBox(height: 8),
          Text(
              '${application?.nextAction ?? '求人に応募すると次の予定が表示されます'} ・ ${job.organizationName}',
              style: const TextStyle(color: Colors.white, height: 1.45)),
          const SizedBox(height: 14),
          FilledButton.tonalIcon(
              onPressed: onTap,
              icon: const Icon(Icons.arrow_forward),
              label: const Text('面談の準備を確認')),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard(
      {required this.label,
      required this.value,
      required this.note,
      required this.icon,
      required this.tone,
      required this.onTap});

  final String label;
  final String value;
  final String note;
  final IconData icon;
  final Color tone;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: tone,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Expanded(
                    child: Text(label,
                        style: const TextStyle(
                            color: _textSub,
                            fontSize: 12,
                            fontWeight: FontWeight.w800))),
                Icon(icon, color: _primary)
              ]),
              const SizedBox(height: 10),
              Text(value,
                  style: const TextStyle(
                      color: _textMain,
                      fontSize: 24,
                      fontWeight: FontWeight.w900)),
              const SizedBox(height: 6),
              Text(note,
                  style: const TextStyle(
                      color: _textSub, fontSize: 12, height: 1.35)),
            ],
          ),
        ),
      ),
    );
  }
}

class _MatchingPreview extends StatelessWidget {
  const _MatchingPreview(
      {required this.job, required this.application, required this.onTap});

  final Job job;
  final _DemoApplication? application;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            const Expanded(child: Text('進行中のマッチング', style: _titleStyle)),
            _StatusChip('${job.matchRate}%')
          ]),
          const SizedBox(height: 10),
          Text(job.title,
              style:
                  const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text('${job.organizationName} / ${job.region} ${job.area}',
              style: const TextStyle(color: _textSub)),
          const SizedBox(height: 14),
          _StepTimeline(
              status: application?.status ?? _ApplicationStatus.applied),
          const SizedBox(height: 14),
          OutlinedButton.icon(
              onPressed: onTap,
              icon: const Icon(Icons.arrow_forward),
              label: const Text('応募状況を見る')),
        ],
      ),
    );
  }
}

class _TaskPanel extends StatelessWidget {
  const _TaskPanel({required this.onProfileTap, required this.onMatchingTap});

  final VoidCallback onProfileTap;
  final VoidCallback onMatchingTap;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(children: [
            Expanded(child: Text('今週のチェックリスト', style: _titleStyle)),
            Text('1 / 3',
                style: TextStyle(color: _primary, fontWeight: FontWeight.w900))
          ]),
          const SizedBox(height: 12),
          _TaskRow(
              done: true, title: '本人確認', subtitle: '確認済み', onTap: onProfileTap),
          _TaskRow(
              done: false,
              title: 'オンライン面談',
              subtitle: '7月31日 18:00',
              onTap: onMatchingTap),
          _TaskRow(
              done: false,
              title: '希望条件の見直し',
              subtitle: '求人の精度を上げる',
              onTap: onProfileTap),
        ],
      ),
    );
  }
}

class _CommunityEventPanel extends StatelessWidget {
  const _CommunityEventPanel({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      color: _accentSoft,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('地域活動',
              style: TextStyle(color: _textSub, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          const Text('夏の棚田メンテナンス',
              style: TextStyle(
                  color: _textMain, fontSize: 20, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          const Text('広島県 東広島市 / 8月3日（日）9:00',
              style: TextStyle(color: _textSub)),
          const SizedBox(height: 12),
          Row(children: [
            const Expanded(
                child: Text('+600 pt',
                    style: TextStyle(
                        color: _primaryDark,
                        fontSize: 24,
                        fontWeight: FontWeight.w900))),
            TextButton(onPressed: onTap, child: const Text('詳細を見る'))
          ]),
        ],
      ),
    );
  }
}

class _FilterChips extends StatelessWidget {
  const _FilterChips(
      {required this.selectedIndustry,
      required this.showOnlyHousing,
      required this.onIndustryChanged,
      required this.onHousingChanged});

  final String selectedIndustry;
  final bool showOnlyHousing;
  final ValueChanged<String> onIndustryChanged;
  final ValueChanged<bool> onHousingChanged;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final item in ['すべて', '農業', '林業', '水産業'])
          ChoiceChip(
              label: Text(item),
              selected: selectedIndustry == item,
              onSelected: (_) => onIndustryChanged(item)),
        FilterChip(
            label: const Text('住居支援あり'),
            selected: showOnlyHousing,
            onSelected: onHousingChanged),
      ],
    );
  }
}

class _JobCard extends StatelessWidget {
  const _JobCard(
      {required this.job,
      required this.favorite,
      required this.applied,
      required this.onFavorite,
      required this.onApply});

  final Job job;
  final bool favorite;
  final bool applied;
  final VoidCallback onFavorite;
  final VoidCallback onApply;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                  child: Text(job.title,
                      style: const TextStyle(
                          color: _textMain,
                          fontSize: 19,
                          fontWeight: FontWeight.w900,
                          height: 1.25))),
              IconButton(
                tooltip: favorite ? 'お気に入り解除' : 'お気に入り保存',
                onPressed: onFavorite,
                icon: Icon(favorite ? Icons.favorite : Icons.favorite_border,
                    color: favorite ? _accent : _textSub),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text('${job.organizationName} / ${job.region} ${job.area}',
              style: const TextStyle(
                  color: _textSub, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          Text(job.summary,
              style: const TextStyle(color: _textSub, height: 1.5)),
          const SizedBox(height: 12),
          Wrap(spacing: 8, runSpacing: 8, children: [
            _MiniChip('${job.matchRate}%'),
            _MiniChip('月給 ${_yen(job.monthlySalary)}'),
            _MiniChip('${job.workPeriodMonths}か月'),
            if (job.housingSupport) const _MiniChip('住居支援'),
            if (job.training) const _MiniChip('研修あり'),
          ]),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                  child: Text(
                      '返済支援見込み ${_yen(job.monthlySupport * job.workPeriodMonths)}',
                      style: const TextStyle(
                          color: _primaryDark, fontWeight: FontWeight.w900))),
              FilledButton.icon(
                onPressed: onApply,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(0, 44),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                ),
                icon: Icon(applied ? Icons.check : Icons.send_outlined),
                label: Text(applied ? '応募済み' : '応募する'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ApplicationCard extends StatelessWidget {
  const _ApplicationCard({required this.application});

  final _DemoApplication application;

  @override
  Widget build(BuildContext context) {
    final job = mockJobs.firstWhere((item) => item.id == application.jobId,
        orElse: () => mockJobs.first);
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Expanded(child: _StatusChip(application.label)),
            Text(application.appliedAt,
                style: const TextStyle(color: _textSub, fontSize: 12))
          ]),
          const SizedBox(height: 12),
          Text(job.title,
              style:
                  const TextStyle(fontSize: 19, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text('${job.organizationName} / 応募日 ${application.appliedAt}',
              style: const TextStyle(color: _textSub)),
          const SizedBox(height: 8),
          Text('次の予定: ${application.nextAction}',
              style: const TextStyle(
                  color: _textMain, fontWeight: FontWeight.w700, height: 1.45)),
          const SizedBox(height: 14),
          _StepTimeline(status: application.status),
          const SizedBox(height: 14),
          Row(children: [
            const Expanded(
                child: Text('返済支援見込み', style: TextStyle(color: _textSub))),
            Text(_yen(application.expectedSupport),
                style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: _primaryDark))
          ]),
        ],
      ),
    );
  }
}

class _StepTimeline extends StatelessWidget {
  const _StepTimeline({required this.status});

  final _ApplicationStatus status;

  @override
  Widget build(BuildContext context) {
    const steps = [
      _ApplicationStatus.applied,
      _ApplicationStatus.interview,
      _ApplicationStatus.matched,
      _ApplicationStatus.working
    ];
    final current = steps.indexOf(status);
    return Row(
      children: [
        for (var i = 0; i < steps.length; i++) ...[
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 9),
              decoration: BoxDecoration(
                color: i <= current ? _primary : _surfaceLow,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(_stepLabel(steps[i]),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: i <= current ? Colors.white : _textSub,
                      fontSize: 11,
                      fontWeight: FontWeight.w800)),
            ),
          ),
          if (i != steps.length - 1) const SizedBox(width: 6),
        ],
      ],
    );
  }
}

class _PointsHero extends StatelessWidget {
  const _PointsHero({required this.points});

  final int points;

  @override
  Widget build(BuildContext context) {
    final remaining = (5000 - points).clamp(0, 5000);
    return _Panel(
      color: _primary,
      child: Row(
        children: [
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('現在の保有ポイント',
                  style: TextStyle(
                      color: Colors.white70, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text('${_number(points)} pt',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 34,
                      fontWeight: FontWeight.w900)),
              const SizedBox(height: 6),
              Text(
                  remaining == 0
                      ? '体験ツアーに交換できます'
                      : 'あと${_number(remaining)} ptで、次の地域特典がアンロックされます。',
                  style: const TextStyle(color: Colors.white, height: 1.45)),
            ]),
          ),
          const CircleAvatar(
              radius: 30,
              backgroundColor: _accent,
              foregroundColor: _primaryDark,
              child: Icon(Icons.confirmation_number_outlined, size: 30)),
        ],
      ),
    );
  }
}

class _EventCard extends StatelessWidget {
  const _EventCard({required this.event});

  final _CommunityEvent event;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Row(children: [
        Container(
            width: 52,
            height: 58,
            decoration: BoxDecoration(
                color: _surfaceLow, borderRadius: BorderRadius.circular(14)),
            child: Center(
                child: Text(event.day,
                    style: const TextStyle(
                        color: _primary,
                        fontSize: 22,
                        fontWeight: FontWeight.w900)))),
        const SizedBox(width: 12),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(event.title,
              style: const TextStyle(fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text('${event.region} / ${event.date}',
              style:
                  const TextStyle(color: _textSub, fontSize: 12, height: 1.35))
        ])),
        Text('+${event.points} pt',
            style: const TextStyle(
                color: _primaryDark, fontWeight: FontWeight.w900)),
      ]),
    );
  }
}

class _RewardCard extends StatelessWidget {
  const _RewardCard(
      {required this.reward, required this.enabled, required this.onExchange});

  final _Reward reward;
  final bool enabled;
  final VoidCallback onExchange;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Row(children: [
        const CircleAvatar(
            backgroundColor: _accentSoft,
            foregroundColor: _primaryDark,
            child: Icon(Icons.card_giftcard)),
        const SizedBox(width: 12),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(reward.name,
              style: const TextStyle(fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text('${_number(reward.cost)} pt',
              style: const TextStyle(color: _textSub))
        ])),
        FilledButton.tonal(
          onPressed: enabled ? onExchange : null,
          style: FilledButton.styleFrom(
            minimumSize: const Size(0, 44),
            padding: const EdgeInsets.symmetric(horizontal: 14),
          ),
          child: const Text('交換'),
        ),
      ]),
    );
  }
}

class _TransactionRow extends StatelessWidget {
  const _TransactionRow({required this.transaction});

  final _PointTransaction transaction;

  @override
  Widget build(BuildContext context) {
    final positive = transaction.amount > 0;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(children: [
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(transaction.label,
              style: const TextStyle(fontWeight: FontWeight.w800)),
          Text(transaction.date,
              style: const TextStyle(color: _textSub, fontSize: 12))
        ])),
        Text('${positive ? '+' : ''}${_number(transaction.amount)} pt',
            style: TextStyle(
                color: positive ? _primary : _error,
                fontWeight: FontWeight.w900)),
      ]),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader(
      {required this.account,
      required this.favorites,
      required this.applications,
      required this.totalExpectedSupport});

  final DemoAccount account;
  final int favorites;
  final int applications;
  final int totalExpectedSupport;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          CircleAvatar(
              radius: 28,
              backgroundColor: _secondaryContainer.withValues(alpha: .6),
              foregroundColor: _primaryDark,
              child: Text(account.name.characters.first,
                  style: const TextStyle(
                      fontSize: 22, fontWeight: FontWeight.w900))),
          const SizedBox(width: 12),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(account.name,
                    style: const TextStyle(
                        fontSize: 22, fontWeight: FontWeight.w900)),
                Text(account.email, style: const TextStyle(color: _textSub))
              ])),
        ]),
        const SizedBox(height: 14),
        Wrap(spacing: 8, runSpacing: 8, children: [
          _MiniChip('お気に入り $favorites件'),
          _MiniChip('応募中 $applications件'),
          _MiniChip('支援見込み ${_yen(totalExpectedSupport)}')
        ]),
      ]),
    );
  }
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow(
      {required this.icon, required this.title, required this.value});

  final IconData icon;
  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: _primary),
          const SizedBox(width: 12),
          Expanded(child: Text(title)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusGallery extends StatelessWidget {
  const _StatusGallery();

  @override
  Widget build(BuildContext context) {
    return const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader('状態画面の用意'),
          SizedBox(height: 10),
          _StatusPanel(
              icon: Icons.cloud_off_outlined,
              title: 'オフラインです',
              body: '通信が戻ると応募状況を再同期します。'),
        ]);
  }
}

class _StatusPanel extends StatelessWidget {
  const _StatusPanel(
      {required this.icon,
      required this.title,
      required this.body,
      this.actionLabel,
      this.onAction});

  final IconData icon;
  final String title;
  final String body;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        CircleAvatar(
            backgroundColor: _surfaceLow,
            foregroundColor: _primary,
            child: Icon(icon)),
        const SizedBox(height: 12),
        Text(title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
        const SizedBox(height: 6),
        Text(body, style: const TextStyle(color: _textSub, height: 1.5)),
        if (actionLabel != null && onAction != null) ...[
          const SizedBox(height: 12),
          FilledButton(onPressed: onAction, child: Text(actionLabel!))
        ],
      ]),
    );
  }
}

class _NotificationCenterSheet extends StatelessWidget {
  const _NotificationCenterSheet();

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: .72,
      minChildSize: .45,
      maxChildSize: .92,
      builder: (context, controller) => ListView(
        controller: controller,
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: const [
          _SectionHeader('通知センター'),
          SizedBox(height: 12),
          _NotificationItem(
              status: '受理済み',
              title: '応募手続きが受理されました',
              body: '応募番号: #A892-001。マイページから詳細と確認状況をご確認いただけます。',
              time: '2時間前'),
          _NotificationItem(
              status: '重要',
              title: '自治体確認の追加書類があります',
              body: '応募手続きを進めるには、本人確認情報と希望勤務地の確認が必要です。',
              time: '昨日',
              danger: true),
          _NotificationItem(
              status: 'ポイント',
              title: 'ポイント交換の受付を開始しました',
              body: '勤務後に付与されたポイントは、マイページから商品券交換へ進めます。',
              time: '2日前'),
        ],
      ),
    );
  }
}

class _NotificationItem extends StatelessWidget {
  const _NotificationItem(
      {required this.status,
      required this.title,
      required this.body,
      required this.time,
      this.danger = false});

  final String status;
  final String title;
  final String body;
  final String time;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: _Panel(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            _StatusChip(status, danger: danger),
            const Spacer(),
            Text(time, style: const TextStyle(color: _textSub, fontSize: 12))
          ]),
          const SizedBox(height: 12),
          Text(title,
              style:
                  const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text(body, style: const TextStyle(color: _textSub, height: 1.5)),
        ]),
      ),
    );
  }
}

class _TaskRow extends StatelessWidget {
  const _TaskRow(
      {required this.done,
      required this.title,
      required this.subtitle,
      required this.onTap});

  final bool done;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Icon(done ? Icons.check_circle : Icons.radio_button_unchecked,
                color: done ? _primary : _textSub),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(color: _textSub)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right),
          ],
        ),
      ),
    );
  }
}

class _SheetTile extends StatelessWidget {
  const _SheetTile(
      {required this.icon,
      required this.title,
      required this.subtitle,
      required this.onTap,
      this.danger = false});

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      onTap: onTap,
      leading: CircleAvatar(
          backgroundColor: danger
              ? _errorContainer
              : _secondaryContainer.withValues(alpha: .5),
          foregroundColor: danger ? _error : _primary,
          child: Icon(icon)),
      title: Text(title,
          style: TextStyle(
              color: danger ? _error : _textMain, fontWeight: FontWeight.w900)),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.child, this.color = Colors.white});

  final Widget child;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: color == Colors.white
                ? _outlineVariant.withValues(alpha: .72)
                : Colors.transparent),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: .045),
              blurRadius: 18,
              offset: const Offset(0, 8))
        ],
      ),
      child: Padding(padding: const EdgeInsets.all(16), child: child),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(label, style: _titleStyle);
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip(this.label, {this.danger = false});

  final String label;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
          color: danger
              ? _errorContainer
              : _secondaryContainer.withValues(alpha: .55),
          borderRadius: BorderRadius.circular(999)),
      child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          child: Text(label,
              style: TextStyle(
                  color: danger ? _error : _primaryDark,
                  fontSize: 12,
                  fontWeight: FontWeight.w900))),
    );
  }
}

class _MiniChip extends StatelessWidget {
  const _MiniChip(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
          color: _surfaceLow,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: _outlineVariant.withValues(alpha: .55))),
      child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
          child: Text(label,
              style: const TextStyle(
                  color: _textSub, fontSize: 12, fontWeight: FontWeight.w800))),
    );
  }
}

enum _ApplicationStatus { applied, interview, matched, working }

class _DemoApplication {
  const _DemoApplication(
      {required this.id,
      required this.jobId,
      required this.status,
      required this.appliedAt,
      required this.nextAction,
      required this.expectedSupport});

  final String id;
  final String jobId;
  final _ApplicationStatus status;
  final String appliedAt;
  final String nextAction;
  final int expectedSupport;

  String get label {
    return switch (status) {
      _ApplicationStatus.applied => '確認中',
      _ApplicationStatus.interview => '面談予定',
      _ApplicationStatus.matched => 'マッチ成立',
      _ApplicationStatus.working => '就業中',
    };
  }
}

class _DemoPreferences {
  const _DemoPreferences(
      {required this.industries,
      required this.regions,
      required this.period,
      required this.housingSupport,
      required this.scholarshipBalance});

  factory _DemoPreferences.defaults() {
    return const _DemoPreferences(
        industries: '農業、水産業',
        regions: '中国・四国地方、九州地方',
        period: '6か月〜12か月',
        housingSupport: true,
        scholarshipBalance: 2400000);
  }

  final String industries;
  final String regions;
  final String period;
  final bool housingSupport;
  final int scholarshipBalance;
}

class _PointTransaction {
  const _PointTransaction(this.label, this.date, this.amount);

  final String label;
  final String date;
  final int amount;
}

class _Reward {
  const _Reward(this.name, this.cost);

  final String name;
  final int cost;
}

class _CommunityEvent {
  const _CommunityEvent(
      this.title, this.region, this.date, this.day, this.points);

  final String title;
  final String region;
  final String date;
  final String day;
  final int points;
}

const _events = [
  _CommunityEvent('夏の棚田メンテナンス', '広島県 東広島市', '8月3日（日）9:00', '3', 600),
  _CommunityEvent('港の朝市サポーター', '愛媛県 宇和島市', '8月9日（土）6:30', '9', 800),
  _CommunityEvent('森の学び場づくり', '大分県 日田市', '8月17日（日）10:00', '17', 500),
];

const _rewards = [
  _Reward('地域のお店で使える500円券', 1000),
  _Reward('地域の特産品セット', 2500),
  _Reward('移住体験ツアー参加券', 5000),
];

String _stepLabel(_ApplicationStatus status) {
  return switch (status) {
    _ApplicationStatus.applied => '応募',
    _ApplicationStatus.interview => '面談',
    _ApplicationStatus.matched => '成立',
    _ApplicationStatus.working => '就業',
  };
}

String _yen(int value) => '${_number(value)}円';
String _number(int value) => value
    .toString()
    .replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (match) => ',');

const _primary = Color(0xFF004D40);
const _primaryDark = Color(0xFF00342B);
const _secondary = Color(0xFF006A62);
const _secondaryContainer = Color(0xFF81F3E5);
const _accent = Color(0xFFFFAB40);
const _accentSoft = Color(0xFFFFF3E0);
const _surface = Color(0xFFF8F9FA);
const _surfaceLow = Color(0xFFF3F4F5);
const _textMain = Color(0xFF191C1D);
const _textSub = Color(0xFF3F4945);
const _outlineVariant = Color(0xFFBFC9C4);
const _error = Color(0xFFBA1A1A);
const _errorContainer = Color(0xFFFFDAD6);

const _titleStyle =
    TextStyle(color: _textMain, fontSize: 18, fontWeight: FontWeight.w900);
