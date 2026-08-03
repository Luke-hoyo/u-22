import 'package:flutter/material.dart';

class AccessGuideScreen extends StatelessWidget {
  const AccessGuideScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('アクセスガイド')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: const [
          _IntroCard(),
          SizedBox(height: 16),
          _GuideStep(
            number: '1',
            icon: Icons.login,
            title: 'ログインまたは新規登録',
            body: 'デモアカウントを選ぶか、新規登録で利用者情報を作成します。',
          ),
          _GuideStep(
            number: '2',
            icon: Icons.search,
            title: '求人を探す',
            body: '農業・林業・水産業の求人を確認し、地域や勤務期間を比較します。',
          ),
          _GuideStep(
            number: '3',
            icon: Icons.edit_note,
            title: '応募内容を入力',
            body: '開始月、勤務期間、住居支援、志望理由を入力して応募します。',
          ),
          _GuideStep(
            number: '4',
            icon: Icons.badge_outlined,
            title: '本人確認デモ',
            body: 'マイナンバー登録や本人確認の流れをモックで確認できます。',
          ),
          _GuideStep(
            number: '5',
            icon: Icons.savings_outlined,
            title: '免除見込みを確認',
            body: 'マイページや返済支援・免除詳細で返済軽減の見込みを確認します。',
          ),
        ],
      ),
    );
  }
}

class _IntroCard extends StatelessWidget {
  const _IntroCard();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFE9F2E5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'はたるくんの使い方',
              style: TextStyle(
                color: Color(0xFF23422D),
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
            SizedBox(height: 8),
            Text('コンテストデモでは、求人検索から応募、制度確認までを順番に体験できます。'),
          ],
        ),
      ),
    );
  }
}

class _GuideStep extends StatelessWidget {
  const _GuideStep({
    required this.number,
    required this.icon,
    required this.title,
    required this.body,
  });

  final String number;
  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFD8DED1)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                backgroundColor: const Color(0xFF23422D),
                child: Text(
                  number,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Icon(icon, color: const Color(0xFF2F6F44)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Color(0xFF23422D),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      body,
                      style: const TextStyle(color: Color(0xFF4F5F51)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
