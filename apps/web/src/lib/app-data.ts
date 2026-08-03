export type Industry = "agriculture" | "forestry" | "fishery";

export type Job = {
  id: string;
  title: string;
  organization: string;
  industry: Industry;
  region: string;
  area: string;
  monthlySalary: number;
  monthlySupport: number;
  matchRate: number;
  periodMonths: number[];
  housingSupport: boolean;
  training: boolean;
  tags: string[];
  summary: string;
  description: string;
  duties: string[];
  schedule: string;
  image?: string;
  kintoneRecordId: string;
};

export type ApplicationStatus = "applied" | "interview" | "matched" | "working";

export type Application = {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  appliedAt: string;
  nextAction: string;
  expectedSupport: number;
};

export const industryLabels: Record<Industry, string> = {
  agriculture: "農業",
  forestry: "林業",
  fishery: "水産業"
};

export const jobs: Job[] = [
  {
    id: "higashihiroshima-grape",
    title: "ぶどう畑の栽培・収穫サポート",
    organization: "東広島みのりファーム",
    industry: "agriculture",
    region: "広島県",
    area: "東広島市",
    monthlySalary: 218000,
    monthlySupport: 15000,
    matchRate: 94,
    periodMonths: [3, 6, 12],
    housingSupport: true,
    training: true,
    tags: ["未経験歓迎", "住まい相談", "週休2日"],
    summary: "季節ごとのぶどう栽培を、地域の先輩と一緒に学べる仕事です。",
    description:
      "ぶどうの房づくり、収穫、選果、出荷までをチームで担当します。初めての方には道具の使い方から説明し、地域での暮らしも担当者がサポートします。",
    duties: ["ぶどうの栽培管理", "収穫・選果・出荷", "直売所イベントの運営補助"],
    schedule: "8:00〜17:00（休憩90分）",
    image: "/higashihiroshima.jpg",
    kintoneRecordId: "JOB-001"
  },
  {
    id: "uwajima-aquaculture",
    title: "海と向き合う養殖スタッフ",
    organization: "宇和島ブルーファーム",
    industry: "fishery",
    region: "愛媛県",
    area: "宇和島市",
    monthlySalary: 232000,
    monthlySupport: 18000,
    matchRate: 89,
    periodMonths: [6, 12],
    housingSupport: true,
    training: true,
    tags: ["研修あり", "社宅あり", "資格支援"],
    summary: "養殖魚の健康管理から出荷まで、海の仕事を基礎から学びます。",
    description:
      "給餌やいけすの点検、水質管理、出荷作業を行います。安全研修を受けた後、先輩スタッフと一緒に海へ出るため未経験でも安心です。",
    duties: ["給餌・いけす点検", "水質と魚の健康管理", "水揚げ・出荷作業"],
    schedule: "6:30〜15:30（季節により変動）",
    kintoneRecordId: "JOB-002"
  },
  {
    id: "hita-forestry",
    title: "森を育てる林業アシスタント",
    organization: "日田フォレストワークス",
    industry: "forestry",
    region: "大分県",
    area: "日田市",
    monthlySalary: 225000,
    monthlySupport: 17000,
    matchRate: 86,
    periodMonths: [6, 12, 24],
    housingSupport: true,
    training: true,
    tags: ["道具貸与", "資格取得", "移住支援"],
    summary: "山の手入れと木材づくりを通じて、地域の森と暮らしを守ります。",
    description:
      "植林、下草刈り、間伐材の整理から始め、段階的に林業機械の操作を学びます。天候や体調を確認しながらチームで作業します。",
    duties: ["植林・下草刈り", "間伐材の整理", "林業機械の操作補助"],
    schedule: "7:30〜16:30（休憩100分）",
    kintoneRecordId: "JOB-003"
  },
  {
    id: "nagano-vegetable",
    title: "高原野菜の生産・販売スタッフ",
    organization: "信州そらいろ農園",
    industry: "agriculture",
    region: "長野県",
    area: "佐久市",
    monthlySalary: 210000,
    monthlySupport: 14000,
    matchRate: 82,
    periodMonths: [3, 6, 12],
    housingSupport: false,
    training: true,
    tags: ["販売も経験", "短期OK", "交通費支給"],
    summary: "野菜づくりとマルシェ販売の両方を経験できる仕事です。",
    description:
      "レタスやトマトなどの栽培、収穫、袋詰めに加え、週末のマルシェ販売も担当します。生産者と消費者をつなぐ経験ができます。",
    duties: ["野菜の栽培・収穫", "選果・袋詰め", "マルシェでの販売"],
    schedule: "7:00〜16:00（繁忙期は早出あり）",
    kintoneRecordId: "JOB-004"
  },
  {
    id: "kesennuma-processing",
    title: "水産加工と地域ブランドづくり",
    organization: "気仙沼うみの恵み舎",
    industry: "fishery",
    region: "宮城県",
    area: "気仙沼市",
    monthlySalary: 220000,
    monthlySupport: 16000,
    matchRate: 78,
    periodMonths: [6, 12],
    housingSupport: true,
    training: false,
    tags: ["商品開発", "地域ブランド", "社宅あり"],
    summary: "水産物の加工から商品企画まで、地域ブランドを育てます。",
    description:
      "鮮魚の下処理、加工、梱包を基本に、慣れてきたら新商品のアイデア出しや撮影、販売イベントにも参加します。",
    duties: ["水産物の加工・梱包", "品質管理", "商品企画と販売補助"],
    schedule: "8:00〜17:00（休憩60分）",
    kintoneRecordId: "JOB-005"
  },
  {
    id: "wakayama-citrus",
    title: "みかん農園の通年スタッフ",
    organization: "有田シトラスパートナーズ",
    industry: "agriculture",
    region: "和歌山県",
    area: "有田川町",
    monthlySalary: 214000,
    monthlySupport: 15000,
    matchRate: 76,
    periodMonths: [6, 12, 24],
    housingSupport: true,
    training: true,
    tags: ["通年雇用", "独立支援", "寮あり"],
    summary: "栽培から販売までを学び、将来の独立も目指せる農園です。",
    description:
      "剪定、摘果、収穫など年間を通した作業を経験します。希望者には農地探しや就農計画づくりの支援も行います。",
    duties: ["剪定・摘果・収穫", "選果・箱詰め", "就農計画づくり"],
    schedule: "8:00〜17:00（季節により変動）",
    kintoneRecordId: "JOB-006"
  }
];

export const applications: Application[] = [
  {
    id: "APP-001",
    jobId: "higashihiroshima-grape",
    status: "interview",
    appliedAt: "2026年7月18日",
    nextAction: "7月31日 18:00 オンライン面談",
    expectedSupport: 90000
  },
  {
    id: "APP-002",
    jobId: "hita-forestry",
    status: "applied",
    appliedAt: "2026年7月21日",
    nextAction: "地域担当者が応募内容を確認中",
    expectedSupport: 102000
  }
];

export const communityEvents = [
  {
    id: "EVT-001",
    title: "夏の棚田メンテナンス",
    region: "広島県 東広島市",
    date: "8月3日（日）9:00",
    points: 600,
    category: "地域活動"
  },
  {
    id: "EVT-002",
    title: "港の朝市サポーター",
    region: "愛媛県 宇和島市",
    date: "8月9日（土）6:30",
    points: 800,
    category: "イベント"
  },
  {
    id: "EVT-003",
    title: "森の学び場づくり",
    region: "大分県 日田市",
    date: "8月17日（日）10:00",
    points: 500,
    category: "環境保全"
  }
];

export const pointTransactions = [
  { id: "PT-001", label: "地域説明会への参加", date: "7月20日", amount: 300 },
  { id: "PT-002", label: "プロフィール登録完了", date: "7月16日", amount: 500 },
  { id: "PT-003", label: "地域商品券に交換", date: "7月8日", amount: -1000 },
  { id: "PT-004", label: "オンライン農業体験", date: "7月2日", amount: 800 }
];

export const rewards = [
  { id: "RWD-001", name: "地域のお店で使える500円券", cost: 1000 },
  { id: "RWD-002", name: "地域の特産品セット", cost: 2500 },
  { id: "RWD-003", name: "移住体験ツアー参加券", cost: 5000 }
];

export type AdminJobStatus = "draft" | "review" | "approved" | "published" | "rejected" | "paused";

export type AdminManagedJob = {
  id: string;
  title: string;
  organization: string;
  area: string;
  industry: Industry;
  status: AdminJobStatus;
  applicants: number;
  capacity: number;
  updatedAt: string;
};

export type AdminApplicantStatus = "new" | "screening" | "interview" | "accepted";

export type AdminApplicant = {
  id: string;
  name: string;
  ageGroup: string;
  birthDate: string;
  address: string;
  myNumberStatus: string;
  region: string;
  jobTitle: string;
  status: AdminApplicantStatus;
  matchRate: number;
  supportMonths: number;
  nextAction: string;
};

export type AdminPointRequestStatus = "pending" | "approved" | "hold";

export type AdminPointRequest = {
  id: string;
  applicantName: string;
  eventTitle: string;
  points: number;
  status: AdminPointRequestStatus;
  submittedAt: string;
};

export type FarmerApplicationStatus = "pending" | "approved" | "rejected";

export type FarmerApplication = {
  id: string;
  farmName: string;
  representativeName: string;
  email: string;
  region: string;
  area: string;
  industry: Industry;
  capacity: number;
  desiredStartMonth: string;
  housingSupport: boolean;
  status: FarmerApplicationStatus;
  submittedAt: string;
  note: string;
};

export const farmerApplicationStorageKey = "hatarukun:farmer-applications";

export const adminManagedJobs: AdminManagedJob[] = [
  {
    id: "ADM-JOB-001",
    title: "ぶどう畑の栽培・収穫サポート",
    organization: "東広島みのりファーム",
    area: "広島県 東広島市",
    industry: "agriculture",
    status: "published",
    applicants: 8,
    capacity: 3,
    updatedAt: "7月27日 10:20"
  },
  {
    id: "ADM-JOB-002",
    title: "森を育てる林業アシスタント",
    organization: "日田フォレストワークス",
    area: "大分県 日田市",
    industry: "forestry",
    status: "review",
    applicants: 4,
    capacity: 2,
    updatedAt: "7月26日 16:05"
  },
  {
    id: "ADM-JOB-003",
    title: "港の朝市と水産加工サポート",
    organization: "宇和島ブルーファーム",
    area: "愛媛県 宇和島市",
    industry: "fishery",
    status: "approved",
    applicants: 0,
    capacity: 2,
    updatedAt: "7月25日 13:40"
  }
];

export const adminApplicants: AdminApplicant[] = [
  {
    id: "USR-1042",
    name: "佐藤 みなみ",
    ageGroup: "24歳",
    birthDate: "2002年4月12日",
    address: "広島県東広島市西条町下見906-2",
    myNumberStatus: "登録済み",
    region: "広島県",
    jobTitle: "ぶどう畑の栽培・収穫サポート",
    status: "interview",
    matchRate: 94,
    supportMonths: 12,
    nextAction: "7月31日 18:00 オンライン面談"
  },
  {
    id: "USR-1188",
    name: "山本 蓮",
    ageGroup: "27歳",
    birthDate: "1999年11月3日",
    address: "大分県日田市天瀬町桜竹635",
    myNumberStatus: "登録済み",
    region: "大分県",
    jobTitle: "森を育てる林業アシスタント",
    status: "screening",
    matchRate: 88,
    supportMonths: 6,
    nextAction: "本人確認と希望条件を確認中"
  },
  {
    id: "USR-1219",
    name: "高橋 葵",
    ageGroup: "23歳",
    birthDate: "2003年7月28日",
    address: "愛媛県宇和島市坂下津甲588",
    myNumberStatus: "確認中",
    region: "愛媛県",
    jobTitle: "港の朝市と水産加工サポート",
    status: "new",
    matchRate: 81,
    supportMonths: 6,
    nextAction: "応募内容の一次確認"
  }
];

export const adminPointRequests: AdminPointRequest[] = [
  {
    id: "PNT-3301",
    applicantName: "佐藤 みなみ",
    eventTitle: "夏の棚田メンテナンス",
    points: 600,
    status: "pending",
    submittedAt: "7月27日 9:12"
  },
  {
    id: "PNT-3302",
    applicantName: "山本 蓮",
    eventTitle: "森の学び場づくり",
    points: 500,
    status: "pending",
    submittedAt: "7月26日 18:44"
  },
  {
    id: "PNT-3303",
    applicantName: "高橋 葵",
    eventTitle: "港の朝市サポーター",
    points: 800,
    status: "hold",
    submittedAt: "7月25日 7:05"
  }
];

export const farmerApplications: FarmerApplication[] = [
  {
    id: "FARM-REQ-001",
    farmName: "安芸の里ぶどう園",
    representativeName: "森田 健",
    email: "morita@example.jp",
    region: "広島県",
    area: "東広島市",
    industry: "agriculture",
    capacity: 2,
    desiredStartMonth: "2026年9月",
    housingSupport: true,
    status: "pending",
    submittedAt: "7月27日 14:10",
    note: "収穫期の人手不足に合わせて、3か月から受け入れを始めたい。"
  },
  {
    id: "FARM-REQ-002",
    farmName: "西条里山フォレスト",
    representativeName: "藤井 真帆",
    email: "fujii@example.jp",
    region: "広島県",
    area: "東広島市",
    industry: "forestry",
    capacity: 1,
    desiredStartMonth: "2026年10月",
    housingSupport: false,
    status: "approved",
    submittedAt: "7月26日 9:35",
    note: "安全研修を受けた後、山道整備と間伐補助から始める予定。"
  },
  {
    id: "FARM-REQ-003",
    farmName: "瀬戸内しおかぜ水産",
    representativeName: "中村 悠",
    email: "nakamura@example.jp",
    region: "愛媛県",
    area: "宇和島市",
    industry: "fishery",
    capacity: 3,
    desiredStartMonth: "2026年11月",
    housingSupport: true,
    status: "pending",
    submittedAt: "7月25日 16:50",
    note: "養殖作業と加工場のどちらも経験できる受け入れ先として登録したい。"
  }
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  }).format(value);
}

export function getJobById(id: string) {
  return jobs.find((job) => job.id === id);
}
