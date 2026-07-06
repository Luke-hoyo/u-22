import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:hatarukun_mobile/main.dart';

void main() {
  testWidgets('logs in and shows the Hatarukun home screen', (tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 932));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(const HatarukunApp());

    expect(find.text('はたるくん'), findsOneWidget);
    expect(find.text('デモアカウント'), findsOneWidget);
    expect(find.text('アクセスガイドを見る'), findsOneWidget);
    expect(find.text('ログインする'), findsOneWidget);

    await tester.tap(find.text('アクセスガイドを見る'));
    await tester.pumpAndSettle();

    expect(find.text('はたるくんの使い方'), findsOneWidget);

    await tester.pageBack();
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.text('新規登録する'));
    await tester.dragFrom(const Offset(215, 820), const Offset(0, -220));
    await tester.pumpAndSettle();
    await tester.tap(find.text('新規登録する'));
    await tester.pumpAndSettle();

    expect(find.text('マイナンバー登録デモ'), findsOneWidget);

    await tester.pageBack();
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.text('デモで入る'));
    await tester.dragFrom(const Offset(215, 820), const Offset(0, -180));
    await tester.pumpAndSettle();
    await tester.tap(find.text('デモで入る'));
    await tester.pumpAndSettle();

    expect(find.text('ダッシュボード'), findsOneWidget);
    expect(find.text('マイページ'), findsOneWidget);
    expect(find.text('マイナンバー登録'), findsOneWidget);
    expect(find.text('免税・免除詳細'), findsOneWidget);
    expect(find.text('求人を見る'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.menu));
    await tester.pumpAndSettle();

    expect(find.text('求人一覧'), findsOneWidget);
    expect(find.text('応募の流れ: 求人を選ぶ → 応募内容を入力 → 免除見込みを確認'), findsOneWidget);
    expect(find.text('ログアウト'), findsOneWidget);

    await tester.tapAt(const Offset(420, 120));
    await tester.pumpAndSettle();

    await tester.tap(find.text('マイページ'));
    await tester.pumpAndSettle();

    expect(find.text('返済残高'), findsOneWidget);
    expect(find.text('Googleアカウント連携'), findsOneWidget);
    expect(find.text('登録状況'), findsOneWidget);

    await tester.dragFrom(const Offset(215, 820), const Offset(0, -420));
    await tester.pumpAndSettle();

    expect(find.text('免税審査状況'), findsOneWidget);

    await tester.pageBack();
    await tester.pumpAndSettle();

    await tester.tap(find.text('求人を見る'));
    await tester.pumpAndSettle();

    expect(find.text('求人一覧'), findsOneWidget);
    expect(find.text('応募する'), findsWidgets);

    await tester.tap(find.text('応募する').first);
    await tester.pumpAndSettle();

    expect(find.text('応募フォーム'), findsOneWidget);
    expect(find.text('勤務開始希望'), findsOneWidget);

    await tester.dragFrom(const Offset(215, 820), const Offset(0, -700));
    await tester.pumpAndSettle();

    expect(find.text('応募内容を送信する'), findsOneWidget);
  });
}
