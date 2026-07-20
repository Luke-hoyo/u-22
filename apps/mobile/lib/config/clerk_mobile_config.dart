class ClerkMobileConfig {
  const ClerkMobileConfig._();

  static const publishableKey = String.fromEnvironment(
    'CLERK_PUBLISHABLE_KEY',
  );

  static bool get isEnabled => publishableKey.isNotEmpty;
}
