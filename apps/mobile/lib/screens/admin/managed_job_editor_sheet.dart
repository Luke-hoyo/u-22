import 'package:flutter/material.dart';

import '../../data/admin_mock_data.dart';

const _industryOptions = {
  'agriculture': '農業',
  'forestry': '林業',
  'fishery': '水産',
};

const _editableStatusOptions = {
  AdminJobStatus.draft: '下書き',
  AdminJobStatus.review: '審査中',
  AdminJobStatus.published: '公開中',
  AdminJobStatus.paused: '停止中',
};

Future<AdminManagedJob?> showManagedJobEditorSheet(
  BuildContext context, {
  AdminManagedJob? job,
}) {
  return showModalBottomSheet<AdminManagedJob>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (context) => ManagedJobEditorSheet(job: job),
  );
}

class ManagedJobEditorSheet extends StatefulWidget {
  const ManagedJobEditorSheet({this.job, super.key});

  final AdminManagedJob? job;

  @override
  State<ManagedJobEditorSheet> createState() => _ManagedJobEditorSheetState();
}

class _ManagedJobEditorSheetState extends State<ManagedJobEditorSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleController;
  late final TextEditingController _organizationController;
  late final TextEditingController _areaController;
  late final TextEditingController _capacityController;
  late String _industry;
  late AdminJobStatus _status;

  @override
  void initState() {
    super.initState();
    final job = widget.job;
    _titleController = TextEditingController(text: job?.title ?? '');
    _organizationController = TextEditingController(text: job?.organization ?? '');
    _areaController = TextEditingController(text: job?.area ?? '広島県 東広島市');
    _capacityController = TextEditingController(text: '${job?.capacity ?? 2}');
    _industry = job?.industry ?? 'agriculture';
    _status = job?.status ?? AdminJobStatus.draft;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _organizationController.dispose();
    _areaController.dispose();
    _capacityController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final now = DateTime.now();
    final capacity = int.tryParse(_capacityController.text.trim()) ?? 2;
    final job = AdminManagedJob(
      id: widget.job?.id ?? 'ADM-JOB-${now.millisecondsSinceEpoch}',
      title: _titleController.text.trim(),
      organization: _organizationController.text.trim(),
      area: _areaController.text.trim(),
      industry: _industry,
      status: _status,
      applicants: widget.job?.applicants ?? 0,
      capacity: capacity.clamp(1, 30),
      updatedAt: '${now.month}月${now.day}日 ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}',
    );

    Navigator.of(context).pop(job);
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.job != null;

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 16,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 20,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                isEditing ? '募集を編集' : '新しい募集',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: '募集タイトル'),
                validator: (value) =>
                    value == null || value.trim().isEmpty ? 'タイトルを入力してください' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _organizationController,
                decoration: const InputDecoration(labelText: '事業者名'),
                validator: (value) =>
                    value == null || value.trim().isEmpty ? '事業者名を入力してください' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _areaController,
                decoration: const InputDecoration(labelText: '地域'),
                validator: (value) =>
                    value == null || value.trim().isEmpty ? '地域を入力してください' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _industry,
                decoration: const InputDecoration(labelText: '分野'),
                items: _industryOptions.entries
                    .map(
                      (entry) => DropdownMenuItem(
                        value: entry.key,
                        child: Text(entry.value),
                      ),
                    )
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _industry = value);
                  }
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _capacityController,
                decoration: const InputDecoration(labelText: '募集人数'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<AdminJobStatus>(
                initialValue: _status,
                decoration: const InputDecoration(labelText: '公開状態'),
                items: _editableStatusOptions.entries
                    .map(
                      (entry) => DropdownMenuItem(
                        value: entry.key,
                        child: Text(entry.value),
                      ),
                    )
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _status = value);
                  }
                },
              ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: _submit,
                child: Text(isEditing ? '変更を保存' : '募集を作成'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
