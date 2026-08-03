import 'package:flutter/material.dart';

class AuthStatusNotice extends StatelessWidget {
  const AuthStatusNotice({required this.message, super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFEEF8F5),
        border: Border.all(color: const Color(0xFFCFE2DC)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Text(
          message,
          style: const TextStyle(
            color: Color(0xFF0D5F4C),
            fontSize: 13,
            height: 1.45,
          ),
        ),
      ),
    );
  }
}
