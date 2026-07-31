import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:flutter/material.dart';

import '../widgets/animated_brand_mark.dart';
import 'clerk_auth_screen.dart';
import 'login_screen.dart';

class LaunchScreen extends StatefulWidget {
  const LaunchScreen({
    super.key,
    required this.clerkEnabled,
    this.animate = true,
  });

  final bool clerkEnabled;
  final bool animate;

  @override
  State<LaunchScreen> createState() => _LaunchScreenState();
}

class _LaunchScreenState extends State<LaunchScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  bool _showLogin = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1050),
    );

    if (widget.animate) {
      _controller.forward().whenComplete(_finish);
    } else {
      _controller.value = 1;
      _showLogin = true;
    }
  }

  void _finish() {
    if (!mounted) return;
    setState(() => _showLogin = true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.clerkEnabled) {
      return ClerkAuthBuilder(
        signedInBuilder: (context, authState) {
          return Scaffold(
            backgroundColor: const Color(0xFFF8F9FA),
            body: SafeArea(
              child: SignedInProfileGate(authState: authState),
            ),
          );
        },
        signedOutBuilder: (context, authState) => _buildLaunchOrLogin(context),
      );
    }

    return _buildLaunchOrLogin(context);
  }

  Widget _buildLaunchOrLogin(BuildContext context) {
    final reduceMotion = MediaQuery.disableAnimationsOf(context);
    if (reduceMotion && !_showLogin) {
      _controller.value = 1;
      WidgetsBinding.instance.addPostFrameCallback((_) => _finish());
    }

    return AnimatedSwitcher(
      duration:
          reduceMotion ? Duration.zero : const Duration(milliseconds: 360),
      switchInCurve: Curves.easeOut,
      switchOutCurve: Curves.easeIn,
      child: _showLogin
          ? LoginScreen(
              key: const ValueKey('login'),
              clerkEnabled: widget.clerkEnabled,
            )
          : Scaffold(
              key: const ValueKey('launch'),
              backgroundColor: const Color(0xFFF5FAF8),
              body: Center(
                child: AnimatedBuilder(
                  animation: _controller,
                  builder: (context, _) {
                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        AnimatedBrandMark(progress: _controller.value),
                        const SizedBox(height: 22),
                        Opacity(
                          opacity:
                              ((_controller.value - 0.58) / 0.42).clamp(0, 1),
                          child: const Text(
                            'はたるくん',
                            style: TextStyle(
                              color: Color(0xFF003F35),
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
    );
  }
}
