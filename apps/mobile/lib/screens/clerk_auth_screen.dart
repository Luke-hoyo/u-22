import 'package:clerk_auth/clerk_auth.dart' as clerk;
import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/demo_account.dart';
import '../models/onboarding_profile.dart';
import '../services/profile_service.dart';
import 'home_screen.dart';
import 'onboarding_screen.dart';

class ClerkAuthScreen extends StatelessWidget {
  const ClerkAuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text(
          'アカウント',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: SafeArea(
        child: ClerkErrorListener(
          child: ClerkAuthBuilder(
            signedInBuilder: (context, authState) {
              return SignedInProfileGate(authState: authState);
            },
            signedOutBuilder: (context, authState) {
              return const _JapaneseAuthenticationPanel();
            },
          ),
        ),
      ),
    );
  }
}

class SignedInProfileGate extends StatefulWidget {
  const SignedInProfileGate({required this.authState, super.key});

  final ClerkAuthState authState;

  @override
  State<SignedInProfileGate> createState() => _SignedInProfileGateState();
}

class _SignedInProfileGateState extends State<SignedInProfileGate> {
  late final Future<SavedProfile?> _profileFuture = _loadProfile();

  Future<String> _sessionToken() async {
    final token = await widget.authState.sessionToken();
    return token.jwt;
  }

  Future<SavedProfile?> _loadProfile() async {
    final token = await _sessionToken();
    return ApiProfileRepository().fetchCurrent(sessionToken: token);
  }

  void _openOnboarding() {
    final user = widget.authState.user;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => OnboardingScreen(
          initialName: user?.name ?? '',
          email: user?.email ?? '',
          sessionTokenProvider: _sessionToken,
        ),
      ),
    );
  }

  void _openSavedProfile(SavedProfile profile) {
    if (profile.role == HatarukunUserRole.farmer) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => FarmerApplicationCompleteScreen(
            organizationName: profile.organizationName,
            savedToAppwrite: true,
          ),
        ),
      );
      return;
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => HomeScreen(account: _accountFromProfile(profile)),
      ),
    );
  }

  DemoAccount _accountFromProfile(SavedProfile profile) {
    final profileText = [
      if (profile.desiredIndustry.isNotEmpty) '${profile.desiredIndustry}希望',
      if (profile.prefecture.isNotEmpty || profile.city.isNotEmpty)
        '${profile.prefecture}${profile.city}で就業検討',
      if (profile.workPeriodMonths > 0) '${profile.workPeriodMonths}か月希望',
    ].join(' / ');

    return DemoAccount(
      id: 'clerk-user',
      name: profile.displayName,
      email: profile.email,
      profile: profileText.isEmpty ? 'プロフィール登録済み' : profileText,
      scholarshipBalance: profile.scholarshipBalance,
      verificationStatus: '本人確認前',
      myNumberStatus: '未登録',
      taxStatus: '申請前',
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<SavedProfile?>(
      future: _profileFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const _SignedInLoading();
        }

        if (snapshot.hasData && snapshot.data != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) _openSavedProfile(snapshot.data!);
          });
          return const _SignedInLoading();
        }

        return ListView(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
          children: [
            const _AuthHeading(
              title: 'ログインできました',
              description: 'アカウントを確認して、はたるくんを始めましょう。',
            ),
            const SizedBox(height: 24),
            const ClerkUserButton(),
            if (snapshot.hasError) ...[
              const SizedBox(height: 18),
              const _InlineAuthNotice(
                message: '登録状態を確認できませんでした。プロフィール設定から続行できます。',
              ),
            ],
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _openOnboarding,
              icon: const Icon(Icons.person_outline),
              label: const Text('プロフィール設定へ'),
            ),
          ],
        );
      },
    );
  }
}

class _SignedInLoading extends StatelessWidget {
  const _SignedInLoading();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 18),
            Text(
              '登録状態を確認しています',
              style: TextStyle(
                color: Color(0xFF153A32),
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InlineAuthNotice extends StatelessWidget {
  const _InlineAuthNotice({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFFFF8E6),
        border: Border.all(color: const Color(0xFFE4C36A)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.info_outline, color: Color(0xFF8A5A00)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Color(0xFF684100)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

enum _AuthMode { signIn, signUp }

enum _AuthStep { identifier, code }

class _JapaneseAuthenticationPanel extends StatefulWidget {
  const _JapaneseAuthenticationPanel();

  @override
  State<_JapaneseAuthenticationPanel> createState() =>
      _JapaneseAuthenticationPanelState();
}

class _JapaneseAuthenticationPanelState
    extends State<_JapaneseAuthenticationPanel> {
  final _emailController = TextEditingController();
  final _codeController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  _AuthMode _mode = _AuthMode.signIn;
  _AuthStep _step = _AuthStep.identifier;
  bool _acceptTerms = false;
  bool _busy = false;
  String? _errorMessage;

  bool get _isSignUp => _mode == _AuthMode.signUp;

  @override
  void dispose() {
    _emailController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  void _showError(clerk.ClerkError error) {
    if (!mounted) return;
    final message = error.message.toLowerCase();
    setState(() {
      _errorMessage = switch (message) {
        String value when value.contains('not found') =>
          'このメールアドレスのアカウントが見つかりません。新規登録をお試しください。',
        String value when value.contains('already') =>
          'このメールアドレスは登録済みです。ログインをお試しください。',
        String value when value.contains('code') => '認証コードが正しくないか、有効期限が切れています。',
        _ => '認証に失敗しました。入力内容を確認して、もう一度お試しください。',
      };
    });
  }

  Future<void> _run(Future<void> Function(ClerkAuthState) action) async {
    if (_busy) return;
    setState(() {
      _busy = true;
      _errorMessage = null;
    });

    try {
      final authState = ClerkAuth.of(context, listen: false);
      await action(authState);
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  Future<void> _switchMode(_AuthMode mode) async {
    if (_mode == mode || _busy) return;
    final authState = ClerkAuth.of(context, listen: false);
    await authState.resetClient();
    if (!mounted) return;
    setState(() {
      _mode = mode;
      _step = _AuthStep.identifier;
      _codeController.clear();
      _errorMessage = null;
    });
  }

  Future<void> _continueWithGoogle() async {
    await _run((authState) async {
      await authState.resetClient();
      if (!mounted) return;
      if (_isSignUp) {
        await authState.ssoSignUp(
          context,
          clerk.Strategy.oauthGoogle,
          onError: _showError,
        );
      } else {
        await authState.ssoSignIn(
          context,
          clerk.Strategy.oauthGoogle,
          onError: _showError,
        );
      }
    });
  }

  Future<void> _sendCode() async {
    if (_formKey.currentState?.validate() != true) return;
    if (_isSignUp && !_acceptTerms) {
      setState(() => _errorMessage = '利用規約とプライバシーポリシーへの同意が必要です。');
      return;
    }

    await _run((authState) async {
      await authState.resetClient();
      if (_isSignUp) {
        await authState.safelyCall(
          context,
          () => authState.attemptSignUp(
            strategy: clerk.Strategy.emailCode,
            emailAddress: _emailController.text.trim(),
            legalAccepted: _acceptTerms,
          ),
          onError: _showError,
        );
      } else {
        await authState.safelyCall(
          context,
          () => authState.attemptSignIn(
            strategy: clerk.Strategy.emailCode,
            identifier: _emailController.text.trim(),
          ),
          onError: _showError,
        );
      }

      if (!mounted || _errorMessage != null || authState.user != null) return;
      setState(() => _step = _AuthStep.code);
    });
  }

  Future<void> _verifyCode() async {
    final code = _codeController.text.trim();
    if (code.length != clerk.Strategy.numericalCodeLength) {
      setState(() => _errorMessage = '6桁の認証コードを入力してください。');
      return;
    }

    await _run((authState) async {
      if (_isSignUp) {
        await authState.safelyCall(
          context,
          () => authState.attemptSignUp(
            strategy: clerk.Strategy.emailCode,
            code: code,
          ),
          onError: _showError,
        );
      } else {
        await authState.safelyCall(
          context,
          () => authState.attemptSignIn(
            strategy: clerk.Strategy.emailCode,
            code: code,
          ),
          onError: _showError,
        );
      }

      if (!mounted || _errorMessage != null || authState.user != null) return;
      setState(() => _errorMessage = '認証を完了できませんでした。コードを再送してお試しください。');
    });
  }

  Future<void> _resendCode() async {
    await _run((authState) async {
      await authState.safelyCall(
        context,
        () => authState.resendCode(clerk.Strategy.emailCode),
        onError: _showError,
      );
      if (!mounted || _errorMessage != null) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('認証コードを再送しました')),
      );
    });
  }

  Future<void> _changeEmail() async {
    final authState = ClerkAuth.of(context, listen: false);
    await authState.resetClient();
    if (!mounted) return;
    setState(() {
      _step = _AuthStep.identifier;
      _codeController.clear();
      _errorMessage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
      children: [
        _AuthHeading(
          title: _step == _AuthStep.code ? '認証コードを入力' : 'アカウントで続ける',
          description: _step == _AuthStep.code
              ? '${_emailController.text.trim()} に届いた6桁のコードを入力してください。'
              : 'Googleアカウントまたはメールアドレスで、安全に利用を始められます。',
        ),
        const SizedBox(height: 24),
        if (_step == _AuthStep.identifier) ...[
          _ModeSelector(
            mode: _mode,
            onChanged: _switchMode,
          ),
          const SizedBox(height: 20),
          OutlinedButton.icon(
            onPressed: _busy ? null : _continueWithGoogle,
            icon: const Icon(Icons.account_circle_outlined),
            label: Text(
              _isSignUp ? 'Googleで新規登録' : 'Googleでログイン',
            ),
          ),
          const _OrDivider(),
          Form(
            key: _formKey,
            child: TextFormField(
              controller: _emailController,
              enabled: !_busy,
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              textInputAction: TextInputAction.done,
              onFieldSubmitted: (_) => _sendCode(),
              validator: (value) {
                final email = value?.trim() ?? '';
                if (email.isEmpty) return 'メールアドレスを入力してください';
                if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email)) {
                  return '正しいメールアドレスを入力してください';
                }
                return null;
              },
              decoration: const InputDecoration(
                labelText: 'メールアドレス',
                prefixIcon: Icon(Icons.mail_outline),
              ),
            ),
          ),
          if (_isSignUp) ...[
            const SizedBox(height: 14),
            CheckboxListTile(
              value: _acceptTerms,
              onChanged: _busy
                  ? null
                  : (value) => setState(() => _acceptTerms = value ?? false),
              contentPadding: EdgeInsets.zero,
              controlAffinity: ListTileControlAffinity.leading,
              title: const Text(
                '利用規約とプライバシーポリシーに同意する',
                style: TextStyle(fontSize: 13),
              ),
            ),
          ],
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: _busy ? null : _sendCode,
            icon: const Icon(Icons.mark_email_read_outlined),
            label: Text(_isSignUp ? '認証コードを受け取る' : 'メールでログイン'),
          ),
        ] else ...[
          TextField(
            controller: _codeController,
            enabled: !_busy,
            autofocus: true,
            keyboardType: TextInputType.number,
            autofillHints: const [AutofillHints.oneTimeCode],
            textInputAction: TextInputAction.done,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(
                clerk.Strategy.numericalCodeLength,
              ),
            ],
            onSubmitted: (_) => _verifyCode(),
            decoration: const InputDecoration(
              labelText: '6桁の認証コード',
              prefixIcon: Icon(Icons.password_outlined),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: _busy ? null : _verifyCode,
            icon: const Icon(Icons.verified_outlined),
            label: const Text('認証して続ける'),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextButton(
                onPressed: _busy ? null : _resendCode,
                child: const Text('コードを再送'),
              ),
              TextButton(
                onPressed: _busy ? null : _changeEmail,
                child: const Text('メールを変更'),
              ),
            ],
          ),
        ],
        if (_errorMessage case final message?) ...[
          const SizedBox(height: 16),
          _ErrorMessage(message: message),
        ],
        const SizedBox(height: 22),
        const _SecurityMessage(),
      ],
    );
  }
}

class _ModeSelector extends StatelessWidget {
  const _ModeSelector({
    required this.mode,
    required this.onChanged,
  });

  final _AuthMode mode;
  final ValueChanged<_AuthMode> onChanged;

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<_AuthMode>(
      segments: const [
        ButtonSegment(
          value: _AuthMode.signIn,
          label: Text('ログイン'),
          icon: Icon(Icons.login),
        ),
        ButtonSegment(
          value: _AuthMode.signUp,
          label: Text('新規登録'),
          icon: Icon(Icons.person_add_alt_outlined),
        ),
      ],
      selected: {mode},
      onSelectionChanged: (value) => onChanged(value.first),
      showSelectedIcon: false,
    );
  }
}

class _OrDivider extends StatelessWidget {
  const _OrDivider();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 18),
      child: Row(
        children: [
          Expanded(child: Divider()),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              'または',
              style: TextStyle(color: Color(0xFF74817C), fontSize: 12),
            ),
          ),
          Expanded(child: Divider()),
        ],
      ),
    );
  }
}

class _ErrorMessage extends StatelessWidget {
  const _ErrorMessage({required this.message});

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
            const Icon(
              Icons.error_outline,
              color: Color(0xFFB42318),
              size: 20,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Color(0xFF7A271A),
                  fontSize: 13,
                  height: 1.45,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SecurityMessage extends StatelessWidget {
  const _SecurityMessage();

  @override
  Widget build(BuildContext context) {
    return const Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          Icons.lock_outline,
          color: Color(0xFF16745F),
          size: 19,
        ),
        SizedBox(width: 9),
        Expanded(
          child: Text(
            '認証情報は認証基盤で安全に管理され、アプリ側にパスワードを保存しません。',
            style: TextStyle(
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

class _AuthHeading extends StatelessWidget {
  const _AuthHeading({
    required this.title,
    required this.description,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 68,
          height: 68,
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: const Color(0xFFF5FAF8),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFDCEBE5)),
          ),
          child: Image.asset('assets/brand/hatarukun-icon-1024.png'),
        ),
        const SizedBox(height: 18),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Color(0xFF003F35),
            fontSize: 25,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          description,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Color(0xFF56645F),
            fontSize: 14,
            height: 1.55,
          ),
        ),
      ],
    );
  }
}
