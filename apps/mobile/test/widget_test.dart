import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:hatarukun_mobile/main.dart';

void main() {
  testWidgets('logs in and shows the Web-aligned mobile dashboard',
      (tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 932));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      const HatarukunApp(showLaunchAnimation: false),
    );

    expect(find.text('はたるくん'), findsOneWidget);
    expect(find.text('地域で働くことを、\n返済の力に。'), findsOneWidget);
    expect(find.text('Google・メール・ユーザーIDで続ける'), findsOneWidget);

    await tester.tap(find.text('デモを見る'));
    await tester.pumpAndSettle();

    expect(find.text('まずは、面談の準備から。'), findsOneWidget);
    expect(find.text('次にやること'), findsOneWidget);
    expect(find.text('年間の返済支援見込み'), findsOneWidget);
    expect(find.text('返済残高の見通し'), findsOneWidget);
    expect(find.text('地域ポイント'), findsOneWidget);

    await tester.tap(find.text('求人検索'));
    await tester.pumpAndSettle();

    expect(find.text('希望条件に近い仕事を探す'), findsOneWidget);
    expect(find.byIcon(Icons.favorite_border), findsWidgets);
    expect(find.text('応募する'), findsWidgets);

    await tester.ensureVisible(find.text('応募する').first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('応募する').first);
    await tester.pumpAndSettle();

    expect(find.text('応募と返済支援の進み具合'), findsOneWidget);
    expect(find.text('応募済み'), findsNothing);
    expect(find.text('確認中'), findsWidgets);

    await tester.tap(find.text('ポイント'));
    await tester.pumpAndSettle();

    expect(find.text('現在の保有ポイント'), findsOneWidget);
    expect(find.text('イベントQRチェックイン'), findsOneWidget);
    expect(find.text('ポイントを地域特典に交換'), findsOneWidget);
    expect(find.text('交換'), findsWidgets);

    await tester.tap(find.text('マイページ'));
    await tester.pumpAndSettle();

    expect(find.text('希望する働き方'), findsWidgets);
    expect(find.text('生年月日'), findsOneWidget);
    expect(find.text('希望条件を保存'), findsOneWidget);

    await tester.drag(find.byType(ListView).last, const Offset(0, -500));
    await tester.pumpAndSettle();
    expect(find.text('状態画面', skipOffstage: false), findsOneWidget);

    await tester.tap(find.byIcon(Icons.notifications_none));
    await tester.pumpAndSettle();

    expect(find.text('通知センター'), findsOneWidget);
    expect(find.text('自治体確認の追加書類があります'), findsOneWidget);
  });
}
