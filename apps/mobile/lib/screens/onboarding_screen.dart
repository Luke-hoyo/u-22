import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/demo_account.dart';
import '../models/onboarding_profile.dart';
import '../services/profile_service.dart';
import 'home_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({
    required this.email,
    required this.sessionTokenProvider,
    this.initialName = '',
    this.profileRepository,
    super.key,
  });

  final String email;
  final String initialName;
  final Future<String> Function() sessionTokenProvider;
  final ProfileRepository? profileRepository;

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _cityController;
  late final TextEditingController _scholarshipController;
  final _organizationController = TextEditingController();

  HatarukunUserRole? _role;
  String _prefecture = '広島県';
  String _industry = '農業';
  String _startMonth = '2026年10月';
  String _organizationType = '農業法人';
  int _periodMonths = 12;
  bool _consent = false;
  bool _saving = false;
  String? _saveError;

  bool get _isFarmer => _role == HatarukunUserRole.farmer;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialName);
    _cityController = TextEditingController();
    _scholarshipController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _cityController.dispose();
    _scholarshipController.dispose();
    _organizationController.dispose();
    super.dispose();
  }

  String? _required(String? value) {
    if (value == null || value.trim().isEmpty) return '入力してください';
    return null;
  }

  Future<void> _save() async {
    if (_formKey.currentState?.validate() != true) return;
    if (!_consent) {
      setState(() => _saveError = '利用目的とプライバシーポリシーへの同意が必要です。');
      return;
    }

    final role = _role;
    if (role == null || _saving) return;

    setState(() {
      _saving = true;
      _saveError = null;
    });

    final profile = _createProfile(role);

    try {
      final token = await widget.sessionTokenProvider();
      final repository = widget.profileRepository ?? ApiProfileRepository();
      final result = await repository.save(
        sessionToken: token,
        profile: profile,
      );
      if (!mounted) return;
      _finish(profile, savedToAppwrite: result.savedToAppwrite);
    } on ProfileSaveException catch (error) {
      if (mounted) setState(() => _saveError = error.message);
    } catch (_) {
      if (mounted) {
        setState(() {
          _saveError = 'サーバーへ接続できませんでした。通信環境を確認してください。';
        });
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  OnboardingProfile _createProfile(HatarukunUserRole role) {
    return OnboardingProfile(
      role: role,
      displayName: _nameController.text.trim(),
      email: widget.email,
      prefecture: _prefecture,
      city: _cityController.text.trim(),
      desiredIndustry: _isFarmer ? '' : _industry,
      desiredStartMonth: _isFarmer ? '' : _startMonth,
      workPeriodMonths: _isFarmer ? 0 : _periodMonths,
      scholarshipBalance:
          _isFarmer ? 0 : int.tryParse(_scholarshipController.text.trim()) ?? 0,
      organizationName: _isFarmer ? _organizationController.text.trim() : '',
      organizationType: _isFarmer ? _organizationType : '',
      consentedAt: DateTime.now(),
    );
  }

  void _continueInDemo() {
    final role = _role;
    if (role == null) return;
    _finish(_createProfile(role), savedToAppwrite: false);
  }

  void _finish(
    OnboardingProfile profile, {
    required bool savedToAppwrite,
  }) {
    if (profile.role == HatarukunUserRole.farmer) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => FarmerApplicationCompleteScreen(
            organizationName: profile.organizationName,
            savedToAppwrite: savedToAppwrite,
          ),
        ),
        (route) => false,
      );
      return;
    }

    final profileText = [
      '${profile.desiredIndustry}希望',
      '${profile.prefecture}${profile.city}で就業検討',
      '${profile.workPeriodMonths}か月希望',
    ].join(' / ');

    final account = DemoAccount(
      id: 'clerk-user',
      name: profile.displayName,
      email: profile.email,
      profile: profileText,
      scholarshipBalance: profile.scholarshipBalance,
      verificationStatus: '本人確認前',
      myNumberStatus: '未登録',
      taxStatus: '申請前',
    );

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (_) => HomeScreen(
          account: account,
          sessionTokenProvider: widget.sessionTokenProvider,
        ),
      ),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text(_role == null ? '利用方法を選択' : 'プロフィール登録'),
      ),
      body: SafeArea(
        child: _role == null ? _buildRoleSelection() : _buildProfileForm(),
      ),
    );
  }

  Widget _buildRoleSelection() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
      children: [
        const Text(
          'あなたに合った画面を\n用意します',
          style: TextStyle(
            color: Color(0xFF003F35),
            fontSize: 28,
            fontWeight: FontWeight.w800,
            height: 1.3,
          ),
        ),
        const SizedBox(height: 10),
        const Text(
          '登録後も運営への申請で変更できます。運営・自治体アカウントは招待制です。',
          style: TextStyle(color: Color(0xFF56645F), height: 1.55),
        ),
        const SizedBox(height: 28),
        _RoleOption(
          icon: Icons.school_outlined,
          title: '奨学金を返済している方',
          description: '地域の仕事を探し、応募・返済支援・ポイントを管理します。',
          actionLabel: '利用者として進む',
          onTap: () => setState(() => _role = HatarukunUserRole.youngUser),
        ),
        const SizedBox(height: 14),
        _RoleOption(
          icon: Icons.agriculture_outlined,
          title: '受け入れ事業者の方',
          description: '農林水産業の求人掲載に向けて、事業者情報を申請します。',
          actionLabel: '事業者として申請',
          onTap: () => setState(() => _role = HatarukunUserRole.farmer),
        ),
        const SizedBox(height: 24),
        const _SecurityNote(
          text: '運営権限はこの画面から取得できません。承認後、権限を個別に付与します。',
        ),
      ],
    );
  }

  Widget _buildProfileForm() {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(24, 12, 24, 32),
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  _isFarmer ? '事業者情報を申請' : '希望条件を登録',
                  style: const TextStyle(
                    color: Color(0xFF003F35),
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              TextButton(
                onPressed: _saving
                    ? null
                    : () => setState(() {
                          _role = null;
                          _saveError = null;
                        }),
                child: const Text('選び直す'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _isFarmer
                ? '入力後は運営の確認待ちになります。承認前に求人は公開されません。'
                : '求人の提案と返済支援額の試算に使用します。',
            style: const TextStyle(color: Color(0xFF56645F), height: 1.5),
          ),
          const SizedBox(height: 24),
          _SectionTitle(
            icon: _isFarmer ? Icons.storefront_outlined : Icons.person_outline,
            title: _isFarmer ? '担当者・事業者' : '基本情報',
          ),
          const SizedBox(height: 12),
          TextFormField(
            key: const ValueKey('profile-name'),
            controller: _nameController,
            enabled: !_saving,
            textInputAction: TextInputAction.next,
            validator: _required,
            decoration: InputDecoration(
              labelText: _isFarmer ? '担当者氏名' : '氏名',
              prefixIcon: const Icon(Icons.badge_outlined),
            ),
          ),
          if (_isFarmer) ...[
            const SizedBox(height: 12),
            TextFormField(
              key: const ValueKey('organization-name'),
              controller: _organizationController,
              enabled: !_saving,
              textInputAction: TextInputAction.next,
              validator: _required,
              decoration: const InputDecoration(
                labelText: '事業者名',
                prefixIcon: Icon(Icons.business_outlined),
              ),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _organizationType,
              decoration: const InputDecoration(
                labelText: '事業形態',
                prefixIcon: Icon(Icons.category_outlined),
              ),
              items: const [
                DropdownMenuItem(value: '個人農家', child: Text('個人農家')),
                DropdownMenuItem(value: '農業法人', child: Text('農業法人')),
                DropdownMenuItem(value: '林業事業者', child: Text('林業事業者')),
                DropdownMenuItem(value: '水産事業者', child: Text('水産事業者')),
                DropdownMenuItem(value: '協同組合', child: Text('協同組合')),
              ],
              onChanged: _saving
                  ? null
                  : (value) {
                      if (value != null) {
                        setState(() => _organizationType = value);
                      }
                    },
            ),
          ],
          const SizedBox(height: 12),
          TextFormField(
            initialValue: widget.email,
            readOnly: true,
            decoration: const InputDecoration(
              labelText: 'ログイン中のメールアドレス',
              prefixIcon: Icon(Icons.mail_outline),
            ),
          ),
          const SizedBox(height: 24),
          const _SectionTitle(
            icon: Icons.place_outlined,
            title: '地域',
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _prefecture,
            decoration: InputDecoration(
              labelText: _isFarmer ? '事業所在地（都道府県）' : '希望都道府県',
              prefixIcon: const Icon(Icons.map_outlined),
            ),
            items: const [
              '広島県',
              '北海道',
              '宮城県',
              '長野県',
              '和歌山県',
              '愛媛県',
              '大分県',
              'その他',
            ]
                .map(
                  (value) => DropdownMenuItem(value: value, child: Text(value)),
                )
                .toList(),
            onChanged: _saving
                ? null
                : (value) {
                    if (value != null) setState(() => _prefecture = value);
                  },
          ),
          const SizedBox(height: 12),
          TextFormField(
            key: const ValueKey('profile-city'),
            controller: _cityController,
            enabled: !_saving,
            textInputAction: TextInputAction.next,
            validator: _required,
            decoration: InputDecoration(
              labelText: _isFarmer ? '市区町村' : '希望市区町村',
              prefixIcon: const Icon(Icons.location_city_outlined),
            ),
          ),
          if (!_isFarmer) ...[
            const SizedBox(height: 24),
            const _SectionTitle(
              icon: Icons.work_outline,
              title: '希望する働き方',
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _industry,
              decoration: const InputDecoration(
                labelText: '希望職種',
                prefixIcon: Icon(Icons.agriculture_outlined),
              ),
              items: const [
                DropdownMenuItem(value: '農業', child: Text('農業')),
                DropdownMenuItem(value: '林業', child: Text('林業')),
                DropdownMenuItem(value: '水産業', child: Text('水産業')),
              ],
              onChanged: _saving
                  ? null
                  : (value) {
                      if (value != null) setState(() => _industry = value);
                    },
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _startMonth,
              decoration: const InputDecoration(
                labelText: '就業開始希望',
                prefixIcon: Icon(Icons.calendar_month_outlined),
              ),
              items: const [
                '2026年10月',
                '2027年1月',
                '2027年4月',
                '時期は相談したい',
              ]
                  .map(
                    (value) =>
                        DropdownMenuItem(value: value, child: Text(value)),
                  )
                  .toList(),
              onChanged: _saving
                  ? null
                  : (value) {
                      if (value != null) setState(() => _startMonth = value);
                    },
            ),
            const SizedBox(height: 12),
            SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 6, label: Text('6か月')),
                ButtonSegment(value: 12, label: Text('12か月')),
                ButtonSegment(value: 24, label: Text('24か月')),
              ],
              selected: {_periodMonths},
              onSelectionChanged: _saving
                  ? null
                  : (value) => setState(() => _periodMonths = value.first),
              showSelectedIcon: false,
            ),
            const SizedBox(height: 12),
            TextFormField(
              key: const ValueKey('scholarship-balance'),
              controller: _scholarshipController,
              enabled: !_saving,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: const InputDecoration(
                labelText: '奨学金返済残高（円・任意）',
                prefixIcon: Icon(Icons.account_balance_wallet_outlined),
              ),
            ),
          ],
          const SizedBox(height: 20),
          CheckboxListTile(
            key: const ValueKey('profile-consent'),
            value: _consent,
            onChanged: _saving
                ? null
                : (value) => setState(() => _consent = value ?? false),
            contentPadding: EdgeInsets.zero,
            controlAffinity: ListTileControlAffinity.leading,
            title: const Text(
              '入力情報を審査・マッチングに利用することに同意する',
              style: TextStyle(fontSize: 14),
            ),
            subtitle: const Text('本人確認書類やマイナンバーは、この画面では取得しません。'),
          ),
          if (_saveError case final error?) ...[
            const SizedBox(height: 12),
            _InlineError(message: error),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: _continueInDemo,
              icon: const Icon(Icons.visibility_outlined),
              label: const Text('通信せずデモとして続ける'),
            ),
          ],
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: _saving ? null : _save,
            icon: _saving
                ? const SizedBox.square(
                    dimension: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Icon(_isFarmer ? Icons.send_outlined : Icons.check),
            label: Text(
              _saving
                  ? '保存しています'
                  : _isFarmer
                      ? '事業者申請を送信'
                      : '登録してはじめる',
            ),
          ),
          const SizedBox(height: 16),
          const _SecurityNote(
            text: '通信は暗号化された短時間トークンで行い、秘密情報は端末に保存しません。',
          ),
        ],
      ),
    );
  }
}

class _RoleOption extends StatelessWidget {
  const _RoleOption({
    required this.icon,
    required this.title,
    required this.description,
    required this.actionLabel,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String description;
  final String actionLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: Color(0xFFD5E1DC)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 30, color: const Color(0xFF006A5A)),
              const SizedBox(height: 14),
              Text(
                title,
                style: const TextStyle(
                  color: Color(0xFF153A32),
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                description,
                style: const TextStyle(
                  color: Color(0xFF56645F),
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Text(
                    actionLabel,
                    style: const TextStyle(
                      color: Color(0xFF006A5A),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.arrow_forward,
                    size: 18,
                    color: Color(0xFF006A5A),
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

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.icon, required this.title});

  final IconData icon;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF006A5A)),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: Color(0xFF153A32),
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

class _SecurityNote extends StatelessWidget {
  const _SecurityNote({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.lock_outline, size: 19, color: Color(0xFF16745F)),
        const SizedBox(width: 9),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: Color(0xFF56645F),
              fontSize: 13,
              height: 1.5,
            ),
          ),
        ),
      ],
    );
  }
}

class _InlineError extends StatelessWidget {
  const _InlineError({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3F1),
        border: Border.all(color: const Color(0xFFF4B7AF)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.error_outline, color: Color(0xFFB42318)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Color(0xFF7A271A)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class FarmerApplicationCompleteScreen extends StatelessWidget {
  const FarmerApplicationCompleteScreen({
    required this.organizationName,
    required this.savedToAppwrite,
    super.key,
  });

  final String organizationName;
  final bool savedToAppwrite;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        title: const Text('事業者申請'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: const Color(0xFFE1F2EC),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.fact_check_outlined,
                  color: Color(0xFF006A5A),
                  size: 34,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                '申請を受け付けました',
                style: TextStyle(
                  color: Color(0xFF003F35),
                  fontSize: 27,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '$organizationName の情報を運営が確認します。承認後、農家向けWebダッシュボードをご案内します。',
                style: const TextStyle(
                  color: Color(0xFF56645F),
                  height: 1.65,
                ),
              ),
              const SizedBox(height: 28),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.hourglass_top_outlined),
                title: const Text('現在の状態'),
                subtitle: const Text('運営確認待ち'),
                trailing: const Text(
                  '申請中',
                  style: TextStyle(
                    color: Color(0xFF9A6700),
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const Divider(),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.storage_outlined),
                title: const Text('データ保存'),
                subtitle: Text(
                  savedToAppwrite ? 'プロフィールを保存しました' : 'デモ環境へ保存しました',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
