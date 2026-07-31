import 'dart:math' as math;

import 'package:flutter/material.dart';

class AnimatedBrandMark extends StatelessWidget {
  const AnimatedBrandMark({
    super.key,
    required this.progress,
    this.size = 148,
  });

  final double progress;
  final double size;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size.square(size),
      painter: _BrandMarkPainter(progress.clamp(0, 1)),
    );
  }
}

class _BrandMarkPainter extends CustomPainter {
  const _BrandMarkPainter(this.progress);

  final double progress;

  double _segment(double start, double end) {
    return ((progress - start) / (end - start)).clamp(0, 1);
  }

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 148;
    final borderPaint = Paint()
      ..color = const Color(0xFFDCEBE5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2 * scale;
    final greenPaint = Paint()..color = const Color(0xFF005447);
    final leafPaint = Paint()..color = const Color(0xFF19A286);
    final orangePaint = Paint()
      ..color = const Color(0xFFFFAB40)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 15 * scale;

    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(2 * scale, 2 * scale, 144 * scale, 144 * scale),
        Radius.circular(30 * scale),
      ),
      borderPaint,
    );

    final stems = Curves.easeOutCubic.transform(_segment(0.05, 0.56));
    final stemTop = (104 - (78 * stems)) * scale;
    final stemBottom = 112 * scale;
    final stemRadius = Radius.circular(11 * scale);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTRB(43 * scale, stemTop, 61 * scale, stemBottom),
        stemRadius,
      ),
      greenPaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTRB(87 * scale, stemTop, 105 * scale, stemBottom),
        stemRadius,
      ),
      greenPaint,
    );

    final bridge = Curves.easeOutCubic.transform(_segment(0.25, 0.62));
    if (bridge > 0) {
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: Offset(74 * scale, 73 * scale),
            width: 30 * scale * bridge,
            height: 18 * scale,
          ),
          Radius.circular(8 * scale),
        ),
        greenPaint,
      );
    }

    final leaves = Curves.easeOutBack.transform(_segment(0.32, 0.76));
    if (leaves > 0) {
      canvas.save();
      canvas.translate(74 * scale, 22 * scale);
      canvas.scale(leaves);
      canvas.translate(-74 * scale, -22 * scale);
      canvas.drawPath(_leafPath(scale, 62, 16, 25, 13), leafPaint);
      canvas.restore();

      canvas.save();
      canvas.translate(70 * scale, 124 * scale);
      canvas.scale(leaves);
      canvas.translate(-70 * scale, -124 * scale);
      canvas.drawPath(_leafPath(scale, 54, 117, 28, 14), leafPaint);
      canvas.restore();
    }

    final ring = Curves.easeInOutCubic.transform(_segment(0.52, 1));
    final ringBounds = Rect.fromCircle(
      center: Offset(105 * scale, 98 * scale),
      radius: 15 * scale,
    );
    canvas.drawArc(
      ringBounds,
      -math.pi / 2,
      math.pi * 2 * ring,
      false,
      orangePaint,
    );
  }

  Path _leafPath(
    double scale,
    double left,
    double top,
    double width,
    double height,
  ) {
    final path = Path();
    path.moveTo(left * scale, (top + height * 0.72) * scale);
    path.cubicTo(
      (left + width * 0.28) * scale,
      (top - height * 0.1) * scale,
      (left + width * 0.72) * scale,
      top * scale,
      (left + width) * scale,
      (top + height * 0.22) * scale,
    );
    path.cubicTo(
      (left + width * 0.72) * scale,
      (top + height * 1.08) * scale,
      (left + width * 0.28) * scale,
      (top + height) * scale,
      left * scale,
      (top + height * 0.72) * scale,
    );
    path.close();
    return path;
  }

  @override
  bool shouldRepaint(covariant _BrandMarkPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
