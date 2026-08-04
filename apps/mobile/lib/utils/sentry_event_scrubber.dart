import 'package:sentry/sentry.dart';

SentryEvent? scrubSentryEvent(SentryEvent event, Hint hint) {
  final user = event.user;
  final request = event.request;

  if (user == null && request == null) {
    return event;
  }

  return event.copyWith(
    user: user == null
        ? null
        : SentryUser(
            id: user.id,
            data: user.data,
          ),
    request: request == null
        ? null
        : SentryRequest(
            url: request.url,
            method: request.method,
            headers: _scrubHeaders(request.headers),
            data: request.data,
            queryString: request.queryString,
            cookies: null,
            env: request.env,
            fragment: request.fragment,
          ),
  );
}

Map<String, String>? _scrubHeaders(Map<String, String>? headers) {
  if (headers == null) {
    return null;
  }

  final scrubbed = <String, String>{};

  for (final entry in headers.entries) {
    final key = entry.key.toLowerCase();

    if (key == 'authorization' || key == 'cookie' || key == 'set-cookie') {
      continue;
    }

    scrubbed[entry.key] = entry.value;
  }

  return scrubbed;
}
