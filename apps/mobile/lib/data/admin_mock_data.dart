enum AdminJobStatus {
  draft,
  review,
  approved,
  published,
  rejected,
  paused,
}

enum AdminApplicantStatus { newApplicant, screening, interview, accepted }

enum AdminPointRequestStatus { pending, approved, hold }

enum FarmerApplicationStatus { pending, approved, rejected }

enum OperatorFocus { agriculture, forestry, fishery, community }

class AdminManagedJob {
  const AdminManagedJob({
    required this.id,
    required this.title,
    required this.organization,
    required this.area,
    required this.industry,
    required this.status,
    required this.applicants,
    required this.capacity,
    required this.updatedAt,
  });

  final String id;
  final String title;
  final String organization;
  final String area;
  final String industry;
  final AdminJobStatus status;
  final int applicants;
  final int capacity;
  final String updatedAt;

  AdminManagedJob copyWith({AdminJobStatus? status}) {
    return AdminManagedJob(
      id: id,
      title: title,
      organization: organization,
      area: area,
      industry: industry,
      status: status ?? this.status,
      applicants: applicants,
      capacity: capacity,
      updatedAt: updatedAt,
    );
  }
}

class AdminApplicant {
  const AdminApplicant({
    required this.id,
    required this.name,
    required this.birthDate,
    required this.address,
    required this.myNumberStatus,
    required this.region,
    required this.jobTitle,
    required this.status,
    required this.nextAction,
  });

  final String id;
  final String name;
  final String birthDate;
  final String address;
  final String myNumberStatus;
  final String region;
  final String jobTitle;
  final AdminApplicantStatus status;
  final String nextAction;

  AdminApplicant copyWith({AdminApplicantStatus? status}) {
    return AdminApplicant(
      id: id,
      name: name,
      birthDate: birthDate,
      address: address,
      myNumberStatus: myNumberStatus,
      region: region,
      jobTitle: jobTitle,
      status: status ?? this.status,
      nextAction: nextAction,
    );
  }
}

class AdminPointRequest {
  const AdminPointRequest({
    required this.id,
    required this.applicantName,
    required this.eventTitle,
    required this.points,
    required this.status,
    required this.submittedAt,
  });

  final String id;
  final String applicantName;
  final String eventTitle;
  final int points;
  final AdminPointRequestStatus status;
  final String submittedAt;

  AdminPointRequest copyWith({AdminPointRequestStatus? status}) {
    return AdminPointRequest(
      id: id,
      applicantName: applicantName,
      eventTitle: eventTitle,
      points: points,
      status: status ?? this.status,
      submittedAt: submittedAt,
    );
  }
}

class FarmerApplication {
  const FarmerApplication({
    required this.id,
    required this.farmName,
    required this.representativeName,
    required this.email,
    required this.region,
    required this.area,
    required this.industry,
    required this.capacity,
    required this.desiredStartMonth,
    required this.housingSupport,
    required this.status,
    required this.submittedAt,
    required this.note,
  });

  final String id;
  final String farmName;
  final String representativeName;
  final String email;
  final String region;
  final String area;
  final String industry;
  final int capacity;
  final String desiredStartMonth;
  final bool housingSupport;
  final FarmerApplicationStatus status;
  final String submittedAt;
  final String note;

  FarmerApplication copyWith({FarmerApplicationStatus? status}) {
    return FarmerApplication(
      id: id,
      farmName: farmName,
      representativeName: representativeName,
      email: email,
      region: region,
      area: area,
      industry: industry,
      capacity: capacity,
      desiredStartMonth: desiredStartMonth,
      housingSupport: housingSupport,
      status: status ?? this.status,
      submittedAt: submittedAt,
      note: note,
    );
  }
}

const jobStatusLabels = {
  AdminJobStatus.draft: '下書き',
  AdminJobStatus.review: '審査中',
  AdminJobStatus.approved: '審査完了',
  AdminJobStatus.published: '公開中',
  AdminJobStatus.rejected: '差し戻し',
  AdminJobStatus.paused: '停止中',
};

const applicantStatusLabels = {
  AdminApplicantStatus.newApplicant: '新着',
  AdminApplicantStatus.screening: '確認中',
  AdminApplicantStatus.interview: '面談予定',
  AdminApplicantStatus.accepted: '受け入れ確定',
};

const farmerApplicationStatusLabels = {
  FarmerApplicationStatus.pending: '承認待ち',
  FarmerApplicationStatus.approved: '承認済み',
  FarmerApplicationStatus.rejected: '差し戻し',
};

const pointStatusLabels = {
  AdminPointRequestStatus.pending: '承認待ち',
  AdminPointRequestStatus.approved: '承認済み',
  AdminPointRequestStatus.hold: '保留',
};

const operatorFocusLabels = {
  OperatorFocus.agriculture: '農業',
  OperatorFocus.forestry: '林業',
  OperatorFocus.fishery: '水産業',
  OperatorFocus.community: '地域イベント',
};

String operatorInvitePreview(OperatorFocus focus) {
  return switch (focus) {
    OperatorFocus.agriculture => 'FARM-AGRI-2026',
    OperatorFocus.forestry => 'FARM-FOR-2026',
    OperatorFocus.fishery => 'FARM-FISH-2026',
    OperatorFocus.community => 'EVENT-CHUGOKU-2026',
  };
}

bool jobMatchesFocus(AdminManagedJob job, OperatorFocus focus) {
  if (focus == OperatorFocus.community) return false;
  return job.industry == focus.name;
}

bool farmerApplicationMatchesFocus(FarmerApplication app, OperatorFocus focus) {
  if (focus == OperatorFocus.community) return false;
  return app.industry == focus.name;
}

List<AdminManagedJob> initialManagedJobs() => [
      const AdminManagedJob(
        id: 'ADM-JOB-001',
        title: 'ぶどう畑の栽培・収穫サポート',
        organization: '東広島みのりファーム',
        area: '広島県 東広島市',
        industry: 'agriculture',
        status: AdminJobStatus.published,
        applicants: 8,
        capacity: 3,
        updatedAt: '7月27日 10:20',
      ),
      const AdminManagedJob(
        id: 'ADM-JOB-002',
        title: '森を育てる林業アシスタント',
        organization: '日田フォレストワークス',
        area: '大分県 日田市',
        industry: 'forestry',
        status: AdminJobStatus.review,
        applicants: 4,
        capacity: 2,
        updatedAt: '7月26日 16:05',
      ),
      const AdminManagedJob(
        id: 'ADM-JOB-003',
        title: '港の朝市と水産加工サポート',
        organization: '宇和島ブルーファーム',
        area: '愛媛県 宇和島市',
        industry: 'fishery',
        status: AdminJobStatus.approved,
        applicants: 0,
        capacity: 2,
        updatedAt: '7月25日 13:40',
      ),
    ];

List<AdminApplicant> initialApplicants() => [
      const AdminApplicant(
        id: 'USR-1042',
        name: '佐藤 みなみ',
        birthDate: '2002年4月12日',
        address: '広島県東広島市西条町下見906-2',
        myNumberStatus: '登録済み',
        region: '広島県',
        jobTitle: 'ぶどう畑の栽培・収穫サポート',
        status: AdminApplicantStatus.interview,
        nextAction: '7月31日 18:00 オンライン面談',
      ),
      const AdminApplicant(
        id: 'USR-1188',
        name: '山本 蓮',
        birthDate: '1999年11月3日',
        address: '大分県日田市天瀬町桜竹635',
        myNumberStatus: '登録済み',
        region: '大分県',
        jobTitle: '森を育てる林業アシスタント',
        status: AdminApplicantStatus.screening,
        nextAction: '書類確認中',
      ),
    ];

List<FarmerApplication> initialFarmerApplications() => [
      const FarmerApplication(
        id: 'FARM-001',
        farmName: '東広島みのりファーム',
        representativeName: '田中 健',
        email: 'tanaka@minorifarm.jp',
        region: '広島県',
        area: '東広島市',
        industry: 'agriculture',
        capacity: 3,
        desiredStartMonth: '2026年9月',
        housingSupport: true,
        status: FarmerApplicationStatus.pending,
        submittedAt: '7月24日',
        note: 'ぶどう栽培の受け入れ枠を拡大したい',
      ),
      const FarmerApplication(
        id: 'FARM-002',
        farmName: '日田フォレストワークス',
        representativeName: '中村 翔',
        email: 'nakamura@hita-forest.jp',
        region: '大分県',
        area: '日田市',
        industry: 'forestry',
        capacity: 2,
        desiredStartMonth: '2026年10月',
        housingSupport: false,
        status: FarmerApplicationStatus.approved,
        submittedAt: '7月22日',
        note: '林業体験プログラムの継続',
      ),
    ];

List<AdminPointRequest> initialPointRequests() => [
      const AdminPointRequest(
        id: 'PT-001',
        applicantName: '佐藤 みのり',
        eventTitle: '夏の棚田メンテナンス',
        points: 600,
        status: AdminPointRequestStatus.pending,
        submittedAt: '7月28日',
      ),
    ];

const farmerTodaySchedule = [
  (time: '09:00', title: '受け入れ枠の確認', target: 'ぶどう畑の栽培・収穫サポート', status: '準備'),
  (time: '18:00', title: 'オンライン面談', target: '佐藤 みなみ', status: '面談'),
];
