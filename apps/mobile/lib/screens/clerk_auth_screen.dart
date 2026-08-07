import 'package:clerk_auth/clerk_auth.dart' as clerk;
import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/demo_account.dart';
import '../models/onboarding_profile.dart';
import '../services/profile_service.dart';
import '../utils/auth_identifier.dart';
import '../widgets/auth_status_notice.dart';
import 'admin/admin_app_screen.dart';
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
  late final Future<ClerkSession> _sessionFuture = _loadSession();

  Future<String> _sessionToken() async {
    final token = await widget.authState.sessionToken();
    return token.jwt;
  }

  Future<ClerkSession> _loadSession() async {
    final token = await _sessionToken();
    return ApiProfileRepository().fetchSession(sessionToken: token);
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

  void _openAdminDashboard(ClerkSession session) {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => AdminAppScreen(
          role: session.clerkRole,
          account: _accountFromSession(session),
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
        builder: (_) => HomeScreen(
          account: _accountFromProfile(profile),
          sessionTokenProvider: _sessionToken,
        ),
      ),
    );
  }

  DemoAccount _accountFromSession(ClerkSession session) {
    final profile = session.profile;
    final profileText = profile == null
        ? '${session.clerkRole.label} / Clerkログイン'
        : [
            if (profile.desiredIndustry.isNotEmpty)
              '${profile.desiredIndustry}希望',
            if (profile.prefecture.isNotEmpty || profile.city.isNotEmpty)
              '${profile.prefecture}${profile.city}で就業検討',
            if (profile.workPeriodMonths > 0)
              '${profile.workPeriodMonths}か月希望',
          ].join(' / ');

    return DemoAccount(
      id: 'clerk-user',
      name: session.displayName.isNotEmpty
          ? session.displayName
          : profile?.displayName ?? 'Clerkユーザー',
      email: session.email.isNotEmpty ? session.email : profile?.email ?? '',
      profile: profileText.isEmpty ? 'プロフィール登録済み' : profileText,
      scholarshipBalance: profile?.scholarshipBalance ?? 0,
      verificationStatus: '本人確認前',
      myNumberStatus: '未登録',
      taxStatus: '申請前',
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
    return FutureBuilder<ClerkSession>(
      future: _sessionFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const _SignedInLoading();
        }

        if (snapshot.hasData) {
          final session = snapshot.data!;
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (!mounted) return;
            if (session.canAccessAdmin) {
              _openAdminDashboard(session);
              return;
            }
            if (session.profile != null) {
              _openSavedProfile(session.profile!);
            }
          });
          if (session.canAccessAdmin || session.profile != null) {
            return const _SignedInLoading();
          }
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
  static final _oauthLine = clerk.Strategy(name: 'oauth', provider: 'line');

  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  final _codeController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  _AuthMode _mode = _AuthMode.signIn;
  _AuthStep _step = _AuthStep.identifier;
  bool _acceptTerms = false;
  bool _busy = false;
  bool _obscurePassword = true;
  String? _errorMessage;
  String? _statusMessage;

  bool get _isSignUp => _mode == _AuthMode.signUp;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  void _showError(clerk.ClerkError error) {
    if (!mounted) return;
    final message = error.message.toLowerCase();
    setState(() {
      _errorMessage = switch (message) {
        String value when value.contains('not found') =>
          'メールアドレスまたはユーザーIDが見つかりません。新規登録をお試しください。',
        String value when value.contains('already') =>
          'このメールアドレスは登録済みです。ログインをお試しください。',
        String value
            when value.contains('incorrect password') ||
                value.contains('password is incorrect') ||
                value.contains('form_password_incorrect') =>
          'パスワードが正しくありません。',
        String value when value.contains('password') && value.contains('weak') =>
          'もっと安全なパスワードを設定してください。',
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
      _statusMessage = null;
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
      _passwordController.clear();
      _codeController.clear();
      _errorMessage = null;
      _statusMessage = null;
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

  Future<void> _continueWithLine() async {
    await _run((authState) async {
      await authState.resetClient();
      if (!mounted) return;
      if (_isSignUp) {
        await authState.ssoSignUp(
          context,
          _oauthLine,
          onError: _showError,
        );
      } else {
        await authState.ssoSignIn(
          context,
          _oauthLine,
          onError: _showError,
        );
      }
    });
  }

  Future<void> _submitWithPassword() async {
    final validationError = validateAuthIdentifier(
      _identifierController.text,
      isSignUp: _isSignUp,
    );
    if (validationError != null) {
      setState(() => _errorMessage = validationError);
      return;
    }

    final password = _passwordController.text;
    if (password.isEmpty) {
      setState(() => _errorMessage = 'パスワードを入力してください。');
      return;
    }
    if (password.length < 8) {
      setState(() => _errorMessage = 'パスワードは8文字以上で入力してください。');
      return;
    }

    if (_formKey.currentState?.validate() != true) return;
    if (_isSignUp && !_acceptTerms) {
      setState(() => _errorMessage = '利用規約とプライバシーポリシーへの同意が必要です。');
      return;
    }

    final trimmedIdentifier = _identifierController.text.trim();

    await _run((authState) async {
      await authState.resetClient();
      if (_isSignUp) {
        await authState.safelyCall(
          context,
          () => authState.attemptSignUp(
            strategy: clerk.Strategy.password,
            emailAddress: trimmedIdentifier,
            password: password,
            legalAccepted: _acceptTerms,
          ),
          onError: _showError,
        );

        if (!mounted || _errorMessage != null || authState.user != null) return;

        // Password sign-up may still require email verification.
        await authState.safelyCall(
          context,
          () => authState.attemptSignUp(
            strategy: clerk.Strategy.emailCode,
            emailAddress: trimmedIdentifier,
            legalAccepted: _acceptTerms,
          ),
          onError: _showError,
        );

        if (!mounted || _errorMessage != null || authState.user != null) return;
        setState(() {
          _step = _AuthStep.code;
          _statusMessage =
              '$trimmedIdentifier に認証コードを送信しました。メール確認後に登録が完了します。';
        });
        return;
      }

      await authState.safelyCall(
        context,
        () => authState.attemptSignIn(
          strategy: clerk.Strategy.password,
          identifier: trimmedIdentifier,
          password: password,
        ),
        onError: _showError,
      );

      if (!mounted || _errorMessage != null || authState.user != null) return;
      setState(
        () => _errorMessage =
            'ログインを完了できませんでした。メール認証コードでのログインをお試しください。',
      );
    });
  }

  Future<void> _sendCode() async {
    final validationError = validateAuthIdentifier(
      _identifierController.text,
      isSignUp: false,
    );
    if (validationError != null) {
      setState(() => _errorMessage = validationError);
      return;
    }

    final trimmedIdentifier = _identifierController.text.trim();

    await _run((authState) async {
      await authState.resetClient();
      await authState.safelyCall(
        context,
        () => authState.attemptSignIn(
          strategy: clerk.Strategy.emailCode,
          identifier: trimmedIdentifier,
        ),
        onError: _showError,
      );

      if (!mounted || _errorMessage != null || authState.user != null) return;
      setState(() {
        _step = _AuthStep.code;
        _statusMessage = getAuthCodeDeliveryMessage(trimmedIdentifier);
      });
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
      setState(() => _statusMessage = '認証コードを再送しました。');
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
      _statusMessage = null;
    });
  }

  String get _headingDescription {
    if (_step == _AuthStep.code) {
      return getAuthCodeDeliveryMessage(_identifierController.text);
    }

    return 'Google / LINE、またはメール・ユーザーIDとパスワードで安全に利用を始められます。';
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
      children: [
        _AuthHeading(
          title: _step == _AuthStep.code ? '認証コードを入力' : 'アカウントで続ける',
          description: _headingDescription,
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
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: _busy ? null : _continueWithLine,
            icon: const Icon(Icons.chat_bubble_outline),
            label: Text(
              _isSignUp ? 'LINEで新規登録' : 'LINEでログイン',
            ),
          ),
          const _OrDivider(),
          Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _identifierController,
                  enabled: !_busy,
                  keyboardType: _isSignUp
                      ? TextInputType.emailAddress
                      : TextInputType.text,
                  autofillHints: _isSignUp
                      ? const [AutofillHints.email]
                      : const [AutofillHints.username, AutofillHints.email],
                  textInputAction: TextInputAction.next,
                  validator: (value) {
                    return validateAuthIdentifier(
                      value ?? '',
                      isSignUp: _isSignUp,
                    );
                  },
                  decoration: InputDecoration(
                    labelText:
                        _isSignUp ? 'メールアドレス' : 'メールアドレスまたはユーザーID',
                    hintText:
                        _isSignUp ? 'name@example.com' : 'メールまたはユーザーID',
                    prefixIcon: const Icon(Icons.person_outline),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _passwordController,
                  enabled: !_busy,
                  obscureText: _obscurePassword,
                  autofillHints: _isSignUp
                      ? const [AutofillHints.newPassword]
                      : const [AutofillHints.password],
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _submitWithPassword(),
                  validator: (value) {
                    final password = value ?? '';
                    if (password.isEmpty) {
                      return 'パスワードを入力してください。';
                    }
                    if (password.length < 8) {
                      return 'パスワードは8文字以上で入力してください。';
                    }
                    return null;
                  },
                  decoration: InputDecoration(
                    labelText: 'パスワード',
                    hintText: '8文字以上',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      onPressed: _busy
                          ? null
                          : () => setState(
                                () => _obscurePassword = !_obscurePassword,
                              ),
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                      ),
                    ),
                  ),
                ),
              ],
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
            onPressed: _busy ? null : _submitWithPassword,
            icon: const Icon(Icons.lock_open_outlined),
            label: Text(_isSignUp ? 'パスワードで登録' : 'パスワードでログイン'),
          ),
          if (!_isSignUp) ...[
            const SizedBox(height: 4),
            TextButton(
              onPressed: _busy ? null : _sendCode,
              child: const Text('メール認証コードでログイン'),
            ),
          ],
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
        if (_statusMessage case final message?) ...[
          const SizedBox(height: 16),
          AuthStatusNotice(message: message),
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
            'パスワードは認証基盤(Clerk)で安全に管理され、アプリ側には保存しません。',
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
