import 'package:flutter/material.dart';

import 'screens/login_screen.dart';

void main() {
  runApp(const HatarukunApp());
}

class HatarukunApp extends StatelessWidget {
  const HatarukunApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'はたるくん',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2F6F44),
          primary: const Color(0xFF2F6F44),
          secondary: const Color(0xFFD9853B),
          surface: const Color(0xFFFFFCF4),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            minimumSize: const Size.fromHeight(52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFFFBFAF4),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          focusedBorder: OutlineInputBorder(
            borderSide: const BorderSide(color: Color(0xFF2F6F44), width: 2),
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(50),
            foregroundColor: const Color(0xFF23422D),
            side: const BorderSide(color: Color(0xFFB8C7B7)),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        scaffoldBackgroundColor: const Color(0xFFF7F3E8),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}
