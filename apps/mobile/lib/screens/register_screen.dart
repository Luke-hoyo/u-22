import 'package:flutter/material.dart';

import '../models/demo_account.dart';
import 'home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final nameController = TextEditingController(text: '新規 太郎');
  final emailController = TextEditingController(text: 'new.demo@hatarukun.jp');
  final scholarshipController = TextEditingController(text: '1500000');
  String desiredIndustry = '農業';
  String desiredRegion = '長野県';
  bool hasScholarship = true;
  bool myNumberDemoCompleted = false;
  bool consent = false;

  @override
  void dispose() {
    nameController.dispose();
    emailController.dispose();
    scholarshipController.dispose();
    super.dispose();
  }

  void register() {
    if (nameController.text.trim().isEmpty ||
        emailController.text.trim().isEmpty ||
        !myNumberDemoCompleted ||
        !consent) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('名前・メール・マイナンバー登録デモ・同意を確認してください')),
      );
      return;
    }

    final scholarshipBalance =
        int.tryParse(scholarshipController.text.trim()) ?? 0;
    final account = DemoAccount(
      id: 'account-new',
      name: nameController.text.trim(),
      email: emailController.text.trim(),
      profile: '$desiredIndustry希望 / $desiredRegionで就業検討 / 新規登録デモ',
      scholarshipBalance: hasScholarship ? scholarshipBalance : 0,
      verificationStatus: '本人確認済み',
      myNumberStatus: '登録デモ完了',
      taxStatus: '免税見込み確認中',
    );

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => HomeScreen(account: account)),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('新規登録')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const _RegisterIntro(),
          const SizedBox(height: 16),
          _FormCard(
            title: '基本情報',
            children: [
              TextField(
                controller: nameController,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: '氏名',
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'メールアドレス',
                  prefixIcon: Icon(Icons.mail_outline),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _FormCard(
            title: '希望条件',
            children: [
              DropdownButtonFormField<String>(
                initialValue: desiredIndustry,
                decoration: const InputDecoration(
                  labelText: '希望する仕事',
                  prefixIcon: Icon(Icons.work_outline),
                ),
                items: const [
                  DropdownMenuItem(value: '農業', child: Text('農業')),
                  DropdownMenuItem(value: '林業', child: Text('林業')),
                  DropdownMenuItem(value: '水産業', child: Text('水産業')),
                ],
                onChanged: (value) {
                  if (value != null) setState(() => desiredIndustry = value);
                },
              ),
              const SizedBox(height: 14),
              DropdownButtonFormField<String>(
                initialValue: desiredRegion,
                decoration: const InputDecoration(
                  labelText: '希望地域',
                  prefixIcon: Icon(Icons.place_outlined),
                ),
                items: const [
                  DropdownMenuItem(value: '長野県', child: Text('長野県')),
                  DropdownMenuItem(value: '山梨県', child: Text('山梨県')),
                  DropdownMenuItem(value: '北海道', child: Text('北海道')),
                  DropdownMenuItem(value: '宮城県', child: Text('宮城県')),
                ],
                onChanged: (value) {
                  if (value != null) setState(() => desiredRegion = value);
                },
              ),
            ],
          ),
          const SizedBox(height: 12),
          _FormCard(
            title: '奨学金情報',
            children: [
              SwitchListTile(
                value: hasScholarship,
                onChanged: (value) => setState(() => hasScholarship = value),
                title: const Text('貸与型奨学金を返済中'),
                contentPadding: EdgeInsets.zero,
              ),
              TextField(
                controller: scholarshipController,
                enabled: hasScholarship,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: '返済残高（円）',
                  prefixIcon: Icon(Icons.savings_outlined),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _FormCard(
            title: 'マイナンバー登録デモ',
            children: [
              const Text(
                '奨学金免除見込みと税制確認に必要です。実データ送信は行いません。',
                style: TextStyle(color: Color(0xFF4F5F51)),
              ),
              const SizedBox(height: 10),
              Material(
                color: Colors.white,
                child: CheckboxListTile(
                  value: myNumberDemoCompleted,
                  onChanged: (value) {
                    setState(() => myNumberDemoCompleted = value ?? false);
                  },
                  title: const Text('マイナンバー登録デモを完了する'),
                  subtitle: const Text('応募と免除見込み確認に必要な登録として扱います。'),
                  controlAffinity: ListTileControlAffinity.leading,
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Material(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            child: CheckboxListTile(
              value: consent,
              onChanged: (value) => setState(() => consent = value ?? false),
              title: const Text('本人確認・奨学金情報をデモ登録することに同意する'),
              subtitle: const Text('入力内容はこの端末内の確認用として保存します。'),
              controlAffinity: ListTileControlAffinity.leading,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: register,
            icon: const Icon(Icons.person_add_alt_outlined),
            label: const Text('登録してはじめる'),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _RegisterIntro extends StatelessWidget {
  const _RegisterIntro();

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
              'デモ登録',
              style: TextStyle(
                color: Color(0xFF23422D),
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
            SizedBox(height: 8),
            Text('登録後は、そのまま求人閲覧・応募・免除見込み確認に進めます。'),
            SizedBox(height: 6),
            Text('本登録にはマイナンバー登録デモが必要です。'),
          ],
        ),
      ),
    );
  }
}

class _FormCard extends StatelessWidget {
  const _FormCard({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFD8DED1)),
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: Color(0xFF23422D),
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 14),
            ...children,
          ],
        ),
      ),
    );
  }
}
