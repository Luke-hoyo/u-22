class SentryMobileConfig {
  const SentryMobileConfig._();

  static const dsn = String.fromEnvironment('SENTRY_DSN');

  static const environment = String.fromEnvironment(
    'SENTRY_ENVIRONMENT',
    defaultValue: 'development',
  );

  static bool get isEnabled => dsn.isNotEmpty;
}
