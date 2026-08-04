import 'package:flutter/material.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import '../config/sentry_mobile_config.dart';
import '../utils/sentry_event_scrubber.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (!SentryMobileConfig.isEnabled) {
    debugPrint(
      'SENTRY_DSN is not set. Run with --dart-define-from-file=dart_defines.local.json',
    );
    return;
  }

  await SentryFlutter.init(
    (options) {
      options.dsn = SentryMobileConfig.dsn;
      options.environment = SentryMobileConfig.environment;
      options.tracesSampleRate = 0.1;
      options.sendDefaultPii = false;
      options.beforeSend = scrubSentryEvent;
    },
    appRunner: () => runApp(const SentryTestApp()),
  );
}

class SentryTestApp extends StatefulWidget {
  const SentryTestApp({super.key});

  @override
  State<SentryTestApp> createState() => _SentryTestAppState();
}

class _SentryTestAppState extends State<SentryTestApp> {
  String _status = 'Sentry に送信中...';

  @override
  void initState() {
    super.initState();
    _send();
  }

  Future<void> _send() async {
    try {
      final eventId = await Sentry.captureMessage(
        'hatarukun mobile sentry connectivity test',
        level: SentryLevel.info,
      );

      setState(() {
        _status =
            '送信完了\n\nmessage: $eventId\nenvironment: ${SentryMobileConfig.environment}\n\nSentry の Issues を確認してください';
      });
    } catch (error) {
      setState(() {
        _status = '送信失敗\n\n$error';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        backgroundColor: const Color(0xFFF8F9FA),
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                _status,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, height: 1.5),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
