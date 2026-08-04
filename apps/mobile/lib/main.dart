import 'package:flutter/material.dart';
import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'config/clerk_mobile_config.dart';
import 'config/sentry_mobile_config.dart';
import 'screens/launch_screen.dart';
import 'utils/sentry_event_scrubber.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (SentryMobileConfig.isEnabled) {
    await SentryFlutter.init(
      (options) {
        options.dsn = SentryMobileConfig.dsn;
        options.environment = SentryMobileConfig.environment;
        options.tracesSampleRate = 0.1;
        options.sendDefaultPii = false;
        options.beforeSend = scrubSentryEvent;
      },
      appRunner: _runApp,
    );
    return;
  }

  _runApp();
}

void _runApp() {
  final app = HatarukunApp(clerkEnabled: ClerkMobileConfig.isEnabled);

  if (ClerkMobileConfig.isEnabled) {
    runApp(
      ClerkAuth(
        config: ClerkAuthConfig(
          publishableKey: ClerkMobileConfig.publishableKey,
        ),
        child: app,
      ),
    );
    return;
  }

  runApp(app);
}

class HatarukunApp extends StatelessWidget {
  const HatarukunApp({
    super.key,
    this.clerkEnabled = false,
    this.showLaunchAnimation = true,
  });

  final bool clerkEnabled;
  final bool showLaunchAnimation;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'はたるくん',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF004D40),
          primary: const Color(0xFF004D40),
          secondary: const Color(0xFF006A62),
          tertiary: const Color(0xFFFFAB40),
          surface: const Color(0xFFF8F9FA),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            minimumSize: const Size.fromHeight(52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFFF8F9FA),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          focusedBorder: OutlineInputBorder(
            borderSide: const BorderSide(color: Color(0xFF004D40), width: 2),
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(50),
            foregroundColor: const Color(0xFF00342B),
            side: const BorderSide(color: Color(0xFFBFC9C4)),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        scaffoldBackgroundColor: const Color(0xFFF8F9FA),
        useMaterial3: true,
      ),
      home: LaunchScreen(
        clerkEnabled: clerkEnabled,
        animate: showLaunchAnimation,
      ),
    );
  }
}
