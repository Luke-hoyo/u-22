import 'package:flutter/material.dart';

const _primary = Color(0xFF004D40);
const _primaryDark = Color(0xFF003F35);
const _textSub = Color(0xFF4E5D58);
const _surfaceLow = Color(0xFFF1F4F3);

class SimulationPanel extends StatefulWidget {
  const SimulationPanel({
    this.initialBalance = 2400000,
    super.key,
  });

  final int initialBalance;

  @override
  State<SimulationPanel> createState() => _SimulationPanelState();
}

class _SimulationPanelState extends State<SimulationPanel> {
  late final TextEditingController balanceController;
  late int balance;
  String industry = 'agriculture';
  double months = 6;

  @override
  void initState() {
    super.initState();
    balance = widget.initialBalance;
    balanceController = TextEditingController(text: balance.toString());
  }

  @override
  void dispose() {
    balanceController.dispose();
    super.dispose();
  }

  static const monthlySupport = {
    'agriculture': 15000,
    'forestry': 17000,
    'fishery': 18000,
  };

  static const industryLabels = {
    'agriculture': '農業',
    'forestry': '林業',
    'fishery': '水産業',
  };

  int get support {
    final monthly = monthlySupport[industry] ?? 15000;
    return (monthly * months.round()).clamp(0, balance);
  }

  int get remaining => (balance - support).clamp(0, balance);

  int get progress => balance > 0 ? ((support / balance) * 100).round() : 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('条件を入力',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
              const SizedBox(height: 16),
              TextField(
                controller: balanceController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: '現在の奨学金残高'),
                onChanged: (value) {
                  setState(() => balance = int.tryParse(value) ?? 0);
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: industry,
                decoration: const InputDecoration(labelText: '希望する仕事'),
                items: industryLabels.entries
                    .map((entry) => DropdownMenuItem(
                          value: entry.key,
                          child: Text(entry.value),
                        ))
                    .toList(),
                onChanged: (value) =>
                    setState(() => industry = value ?? industry),
              ),
              const SizedBox(height: 12),
              Text('働く期間：${months.round()}か月',
                  style: const TextStyle(fontWeight: FontWeight.w700)),
              Slider(
                value: months,
                min: 3,
                max: 24,
                divisions: 7,
                label: '${months.round()}か月',
                onChanged: (value) => setState(() => months = value),
              ),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('3か月', style: TextStyle(color: _textSub, fontSize: 12)),
                  Text('12か月', style: TextStyle(color: _textSub, fontSize: 12)),
                  Text('24か月', style: TextStyle(color: _textSub, fontSize: 12)),
                ],
              ),
              const SizedBox(height: 12),
              const _Notice(
                message:
                    'この金額は入力内容をもとにした見込みです。実際の支援額を保証するものではありません。',
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        _Panel(
          color: const Color(0xFFEEF8F5),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('${months.round()}か月働いた場合',
                  style: const TextStyle(color: _textSub)),
              const SizedBox(height: 4),
              Text(_yen(support),
                  style: const TextStyle(
                      color: _primaryDark,
                      fontSize: 32,
                      fontWeight: FontWeight.w900)),
              const Text('奨学金返済支援の見込み額',
                  style: TextStyle(color: _textSub)),
              const SizedBox(height: 14),
              ClipRRect(
                borderRadius: BorderRadius.circular(999),
                child: LinearProgressIndicator(
                  value: progress / 100,
                  minHeight: 8,
                  backgroundColor: Colors.white,
                  color: _primary,
                ),
              ),
              const SizedBox(height: 16),
              _ResultRow('毎月の支援見込み',
                  _yen(monthlySupport[industry] ?? 15000)),
              _ResultRow('支援後の残高', _yen(remaining)),
              _ResultRow('選択した仕事', industryLabels[industry] ?? '農業'),
            ],
          ),
        ),
      ],
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.child, this.color = Colors.white});
  final Widget child;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color,
        border: Border.all(color: const Color(0xFFDCE3E0)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(padding: const EdgeInsets.all(16), child: child),
    );
  }
}

class _Notice extends StatelessWidget {
  const _Notice({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: _surfaceLow,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.info_outline, size: 18, color: _primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(message,
                  style: const TextStyle(color: _textSub, fontSize: 13, height: 1.45)),
            ),
          ],
        ),
      ),
    );
  }
}

class _ResultRow extends StatelessWidget {
  const _ResultRow(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(child: Text(label, style: const TextStyle(color: _textSub))),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

String _yen(int value) =>
    '${value.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}円';
