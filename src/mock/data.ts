export interface DigitalEmployee {
  id: string;
  name: string;
  avatar: string;
  department: string;
  position: string;
  status: 'ACTIVE' | 'TRAINING' | 'SUSPENDED' | 'TERMINATED';
  employmentStatus: '在职' | '离职';
  owner: string;
  ownerType: '自有' | '外包';
  skills: string[];
  skillIds: string[];
  knowledgeIds: string[];
  description: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  tokensQuota: number;
  tokensUsed: number;
  taskCompleteRate: number;
  lastActive: string;
  onboardDate: string;
  relatedAgents: string[];
  likes: number;
  dislikes: number;
  heat: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  description: string;
  source: string;
  bindCount: number;
  status: '已启用' | '已停用';
}

export interface KnowledgeBase {
  id: string;
  name: string;
  type: '知识库' | '知识卡片' | '数据集';
  description: string;
  docCount: number;
  bindEmployees: string[];
  lastUpdate: string;
  status: '已发布' | '学习中' | '待更新';
}

export interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  agentName: string;
  status: '待执行' | '执行中' | '已完成' | '已失败';
  priority: '高' | '中' | '低';
  createTime: string;
  finishTime?: string;
  result?: string;
}

export interface AlertItem {
  id: string;
  type: '风险预警' | '待办审批' | '系统通知' | '绩效考评' | '员工信息调整';
  title: string;
  description: string;
  level: 'critical' | 'warning' | 'info';
  time: string;
  handled: boolean;
}

export interface PositionItem {
  id: string;
  name: string;
  department: string;
  category: string;
  description: string;
  requiredSkills: string[];
  level: string;
  status: '启用' | '停用';
  employeeCount: number;
  maxEmployeeCount: number;
  createTime: string;
}

export interface TaskLogItem {
  id: string;
  taskName: string;
  assignee: string;
  agentName: string;
  department: string;
  userName: string;
  status: '待执行' | '执行中' | '已完成' | '已失败';
  priority: '高' | '中' | '低';
  createTime: string;
  finishTime?: string;
  result?: string;
  duration?: string;
}

export interface AssessmentConfig {
  id: string;
  name: string;
  cycle: '季度' | '半年' | '全年';
  startDate: string;
  endDate: string;
  status: '进行中' | '已结束' | '未开始';
  metrics: string[];
}

export interface AssessmentRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  period: string;
  cycle: '季度' | '半年' | '全年';
  taskCompleteRate: number;
  tokensUsed: number;
  tokensQuota: number;
  level: string;
  score: number;
  rank: number;
}

export interface PerformanceReview {
  id: string;
  year: number;
  period: string;
  periodType: '季度' | '半年' | '年度';
  name: string;
  status: '进行中' | '已结束';
  currentStep: string;
  steps: PerformanceStep[];
  employees: PerformanceEmployeeRecord[];
}

export interface PerformanceStep {
  key: string;
  label: string;
  status: '已完成' | '进行中' | '待处理';
  deadline?: string;
}

export interface PerformanceEmployeeRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  taskCompleteRate: number;
  tokensUsed: number;
  level: string;
  score: number;
  selfEvaluation?: string;
  managerEvaluation?: string;
  currentAction?: string;
}

export interface ApprovalStep {
  step: string;
  status: '已完成' | '进行中' | '待处理' | '已驳回';
  time?: string;
  approver?: string;
  remark?: string;
  opinion?: string;
}

export interface OnboardRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  owner: string;
  ownerType: string;
  department: string;
  position: string;
  applyDate: string;
  status: '待提交' | '部门经理审批' | '人力部门审批' | '已完成' | '已驳回';
  currentStep: number;
  approvalSteps: ApprovalStep[];
}

export interface ExitRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  reason: string;
  applyDate: string;
  status: '待提交' | '部门经理审批' | '人力部门审批' | '已完成' | '已驳回';
  currentStep: number;
  approvalSteps: ApprovalStep[];
}

export interface TransferRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  fromDepartment: string;
  fromPosition: string;
  toDepartment: string;
  toPosition: string;
  reason: string;
  applyDate: string;
  applicant: string;
  status: '待提交' | '部门经理审批' | '人力部门审批' | '已完成' | '已驳回';
  currentStep: number;
  approvalSteps: ApprovalStep[];
}

export interface DemandRecord {
  id: string;
  title: string;
  department: string;
  position: string;
  headcount: number;
  urgency: '紧急' | '普通';
  reason: string;
  requirements: string;
  applyDate: string;
  applicant: string;
  status: '待提交' | '部门经理审批' | '人力部门审批' | '已完成' | '已驳回';
  currentStep: number;
  approvalSteps: ApprovalStep[];
}

export interface ConversationItem {
  employeeId: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

export interface ScheduledTask {
  id: string;
  name: string;
  employeeId: string;
  employeeName: string;
  cron: string;
  cronLabel: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  description: string;
}

export interface EmployeeEditApproval {
  id: string;
  employeeId: string;
  employeeName: string;
  field: string;
  oldValue: string;
  newValue: string;
  applyDate: string;
  status: '待审批' | '已通过' | '已驳回';
  applicant: string;
}

export const digitalEmployees: DigitalEmployee[] = [
  {
    id: 'DE-2026001', name: '小翼·客服', avatar: 'KC', department: '客户服务部', position: '智能客服专员',
    status: 'ACTIVE', employmentStatus: '在职', owner: '宇雷', ownerType: '自有',
    skills: ['智能问答', '工单处理', '知识检索', '情感分析'],
    skillIds: ['SK001', 'SK005', 'SK010'],
    knowledgeIds: ['KB001', 'KB008'],
    description: '7×24小时智能客服，精通产品知识库，能快速响应客户咨询、处理常见工单，并自动归类客户问题。根据用户输入自动匹配知识库和技能进行回答。',
    level: 'L3', tokensQuota: 5000000, tokensUsed: 3200000, taskCompleteRate: 96.5,
    lastActive: '10分钟前', onboardDate: '2026-01-15', relatedAgents: ['翼答', '通用问答智能体'],
    likes: 328, dislikes: 12, heat: 1456,
  },
  {
    id: 'DE-2026002', name: '小翼·数据', avatar: 'SJ', department: '数据运营中心', position: '数据标注专员',
    status: 'TRAINING', employmentStatus: '在职', owner: '韩梅梅', ownerType: '外包',
    skills: ['数据标注', '数据清洗', '报表生成', '异常检测'],
    skillIds: ['SK003'],
    knowledgeIds: ['KB007'],
    description: '自动化数据处理专家，可高效完成数据标注、清洗和分析，支持多种数据格式处理。',
    level: 'L2', tokensQuota: 3000000, tokensUsed: 1500000, taskCompleteRate: 89.2,
    lastActive: '2小时前', onboardDate: '2026-02-01', relatedAgents: ['数据下载', '翼练'],
    likes: 145, dislikes: 8, heat: 620,
  },
  {
    id: 'DE-2026003', name: '小翼·营销', avatar: 'YX', department: '数字化运营部', position: '营销策划专员',
    status: 'ACTIVE', employmentStatus: '在职', owner: '李明', ownerType: '自有',
    skills: ['文案撰写', '营销方案', '用户画像', '竞品分析'],
    skillIds: ['SK002', 'SK004'],
    knowledgeIds: ['KB001', 'KB005'],
    description: '营销内容创作与策略分析专家，擅长多场景营销文案生成、用户画像分析和竞品对比。',
    level: 'L3', tokensQuota: 4000000, tokensUsed: 2800000, taskCompleteRate: 93.8,
    lastActive: '30分钟前', onboardDate: '2026-01-20', relatedAgents: ['营销智能体', '写作助手'],
    likes: 256, dislikes: 15, heat: 1120,
  },
  {
    id: 'DE-2026004', name: '小翼·审计', avatar: 'SH', department: '审计部', position: '审计助理',
    status: 'ACTIVE', employmentStatus: '在职', owner: '王芳', ownerType: '自有',
    skills: ['工作底稿', '整改判定', '风险识别', '报告生成'],
    skillIds: ['SK006'],
    knowledgeIds: ['KB002'],
    description: '赋能审计人员高效撰写审计工作底稿，自动识别风险点并生成整改建议。',
    level: 'L2', tokensQuota: 2000000, tokensUsed: 800000, taskCompleteRate: 91.0,
    lastActive: '1小时前', onboardDate: '2026-02-10', relatedAgents: ['【审计】工作底稿助手', '【审计】整改判定助手'],
    likes: 89, dislikes: 5, heat: 380,
  },
  {
    id: 'DE-2026005', name: '小翼·HR', avatar: 'HR', department: '人力资源部', position: '人事助理',
    status: 'ACTIVE', employmentStatus: '在职', owner: '张三', ownerType: '自有',
    skills: ['人岗匹配', '简历筛选', '面试安排', '证书查询'],
    skillIds: ['SK008'],
    knowledgeIds: ['KB003'],
    description: '人力资源管理AI助手，可快速筛选简历、进行人岗匹配、查询资质证书并安排面试流程。',
    level: 'L3', tokensQuota: 3500000, tokensUsed: 2100000, taskCompleteRate: 95.2,
    lastActive: '5分钟前', onboardDate: '2026-01-10', relatedAgents: ['人岗匹配', '资质证书问询'],
    likes: 210, dislikes: 7, heat: 980,
  },
  {
    id: 'DE-2026006', name: '小翼·财务', avatar: 'CW', department: '财务共享中心', position: '财务分析专员',
    status: 'ACTIVE', employmentStatus: '在职', owner: '赵六', ownerType: '自有',
    skills: ['报销审核', '预算分析', '费用统计', '合规检查'],
    skillIds: ['SK007'],
    knowledgeIds: ['KB004'],
    description: '财务智能助手，自动化处理报销审核、预算分析和费用统计，确保财务流程合规高效。',
    level: 'L3', tokensQuota: 4500000, tokensUsed: 3100000, taskCompleteRate: 97.1,
    lastActive: '15分钟前', onboardDate: '2025-12-20', relatedAgents: ['惠企优才', '通用问答智能体'],
    likes: 302, dislikes: 9, heat: 1350,
  },
  {
    id: 'DE-2026007', name: '小翼·运维', avatar: 'YW', department: 'IT运维部', position: '运维工程师',
    status: 'SUSPENDED', employmentStatus: '在职', owner: '孙七', ownerType: '外包',
    skills: ['故障诊断', '日志分析', '自动巡检', '性能优化'],
    skillIds: ['SK009'],
    knowledgeIds: ['KB006'],
    description: 'IT运维自动化助手，实时监控系统状态，自动诊断故障并执行修复操作。',
    level: 'L2', tokensQuota: 3000000, tokensUsed: 500000, taskCompleteRate: 85.0,
    lastActive: '3天前', onboardDate: '2026-02-15', relatedAgents: ['翼练'],
    likes: 67, dislikes: 18, heat: 210,
  },
  {
    id: 'DE-2026008', name: '小翼·商机', avatar: 'SJ', department: '数字化运营部', position: '商机分析专员',
    status: 'ACTIVE', employmentStatus: '在职', owner: '周八', ownerType: '自有',
    skills: ['商机挖掘', '客户画像', '竞品追踪', '销售预测'],
    skillIds: ['SK004'],
    knowledgeIds: ['KB005'],
    description: 'AI驱动商机线索挖掘，赋能企业产品营销，精准定位潜在客户和商业机会。',
    level: 'L4', tokensQuota: 6000000, tokensUsed: 4200000, taskCompleteRate: 92.3,
    lastActive: '20分钟前', onboardDate: '2025-11-15', relatedAgents: ['翼达（商机挖掘）', '营销智能体'],
    likes: 278, dislikes: 11, heat: 1280,
  },
  {
    id: 'DE-2026009', name: '小翼·文档', avatar: 'WD', department: '综合管理部', position: '文档管理专员',
    status: 'ACTIVE', employmentStatus: '在职', owner: '钱九', ownerType: '自有',
    skills: ['文件解析', '摘要生成', '格式转换', '内容提取'],
    skillIds: ['SK001', 'SK002'],
    knowledgeIds: ['KB001'],
    description: '文档智能处理专家，自动解析上传文件内容，生成摘要、大纲并支持多格式转换。',
    level: 'L2', tokensQuota: 2500000, tokensUsed: 1800000, taskCompleteRate: 94.5,
    lastActive: '45分钟前', onboardDate: '2026-01-25', relatedAgents: ['文件助手'],
    likes: 156, dislikes: 6, heat: 720,
  },
  {
    id: 'DE-2026010', name: '小翼·经分', avatar: 'JF', department: '经营分析部', position: '经营分析专员',
    status: 'TRAINING', employmentStatus: '在职', owner: '吴十', ownerType: '自有',
    skills: ['经营报告', '指标分析', '趋势预测', '可视化'],
    skillIds: [],
    knowledgeIds: ['KB007'],
    description: '经营分析AI助手，自动采集经营数据，生成多维度分析报告和可视化图表。',
    level: 'L1', tokensQuota: 2000000, tokensUsed: 400000, taskCompleteRate: 78.5,
    lastActive: '5小时前', onboardDate: '2026-03-01', relatedAgents: ['数据下载'],
    likes: 42, dislikes: 3, heat: 150,
  },
];

export const skills: Skill[] = [
  { id: 'SK001', name: '智能问答', category: '知识与交互', level: 'L3', description: '基于知识库的智能问答能力，支持多轮对话', source: '翼答', bindCount: 5, status: '已启用' },
  { id: 'SK002', name: '文案撰写', category: '内容创作', level: 'L3', description: '多场景营销文案、报告、邮件等文本生成', source: '写作助手', bindCount: 3, status: '已启用' },
  { id: 'SK003', name: '数据标注', category: '数据处理', level: 'L2', description: '支持文本、图片等多类型数据标注任务', source: '翼练', bindCount: 2, status: '已启用' },
  { id: 'SK004', name: '商机挖掘', category: '营销分析', level: 'L4', description: 'AI驱动的商机线索挖掘与客户画像分析', source: '翼达', bindCount: 2, status: '已启用' },
  { id: 'SK005', name: '工单处理', category: '服务支持', level: 'L2', description: '自动分类、派发和跟踪客户工单', source: '通用问答', bindCount: 4, status: '已启用' },
  { id: 'SK006', name: '审计底稿', category: '合规审计', level: 'L2', description: '辅助撰写审计工作底稿和整改建议', source: '审计助手', bindCount: 2, status: '已启用' },
  { id: 'SK007', name: '报销审核', category: '财务管理', level: 'L3', description: '自动化报销单据审核与合规检查', source: '财务助手', bindCount: 1, status: '已启用' },
  { id: 'SK008', name: '简历筛选', category: '人力资源', level: 'L3', description: '基于岗位JD智能筛选匹配简历', source: '人岗匹配', bindCount: 2, status: '已启用' },
  { id: 'SK009', name: '故障诊断', category: 'IT运维', level: 'L2', description: '自动分析系统日志定位故障原因', source: '运维助手', bindCount: 1, status: '已停用' },
  { id: 'SK010', name: '情感分析', category: '知识与交互', level: 'L1', description: '识别用户文本中的情感倾向', source: '翼答', bindCount: 3, status: '已启用' },
];

export const knowledgeBases: KnowledgeBase[] = [
  { id: 'KB001', name: '产品知识库', type: '知识库', description: '天翼云全线产品功能、定价、FAQ等知识', docCount: 1250, bindEmployees: ['DE-2026001', 'DE-2026003'], lastUpdate: '2026-03-10', status: '已发布' },
  { id: 'KB002', name: '审计规范库', type: '知识库', description: '审计相关法规、准则、操作规范', docCount: 380, bindEmployees: ['DE-2026004'], lastUpdate: '2026-03-08', status: '已发布' },
  { id: 'KB003', name: '人力资源政策卡片', type: '知识卡片', description: '公司HR政策、福利制度、招聘流程等', docCount: 95, bindEmployees: ['DE-2026005'], lastUpdate: '2026-03-05', status: '已发布' },
  { id: 'KB004', name: '财务制度集', type: '数据集', description: '财务报销、预算、审批相关制度文档', docCount: 210, bindEmployees: ['DE-2026006'], lastUpdate: '2026-03-07', status: '已发布' },
  { id: 'KB005', name: '营销案例库', type: '知识库', description: '历史营销活动案例、效果分析、最佳实践', docCount: 560, bindEmployees: ['DE-2026003', 'DE-2026008'], lastUpdate: '2026-03-09', status: '学习中' },
  { id: 'KB006', name: 'IT运维手册', type: '知识库', description: '系统架构、运维手册、故障处理指南', docCount: 420, bindEmployees: ['DE-2026007'], lastUpdate: '2026-02-28', status: '待更新' },
  { id: 'KB007', name: '经营数据集', type: '数据集', description: '各业务线经营指标数据、历史趋势数据', docCount: 850, bindEmployees: ['DE-2026010'], lastUpdate: '2026-03-11', status: '学习中' },
  { id: 'KB008', name: '客户服务话术卡片', type: '知识卡片', description: '客服标准话术、常见问题应对策略', docCount: 175, bindEmployees: ['DE-2026001'], lastUpdate: '2026-03-06', status: '已发布' },
];

export const tasks: TaskItem[] = [
  { id: 'T001', title: '处理今日客户咨询工单 (批次)', assignee: 'DE-2026001', agentName: '翼答', status: '已完成', priority: '高', createTime: '2026-03-12 08:00', finishTime: '2026-03-12 08:45', result: '处理128条工单，平均响应2.3秒' },
  { id: 'T002', title: '生成3月营销周报', assignee: 'DE-2026003', agentName: '写作助手', status: '执行中', priority: '中', createTime: '2026-03-12 09:00' },
  { id: 'T003', title: '标注新一批训练数据（2000条）', assignee: 'DE-2026002', agentName: '翼练', status: '执行中', priority: '中', createTime: '2026-03-12 07:30' },
  { id: 'T004', title: '筛选高级Java工程师简历', assignee: 'DE-2026005', agentName: '人岗匹配', status: '已完成', priority: '高', createTime: '2026-03-11 14:00', finishTime: '2026-03-11 15:30', result: '从256份简历中筛选出18名候选人' },
  { id: 'T005', title: '审计底稿-费用专项', assignee: 'DE-2026004', agentName: '审计助手', status: '待执行', priority: '高', createTime: '2026-03-12 10:00' },
  { id: 'T006', title: '本月报销单据合规检查', assignee: 'DE-2026006', agentName: '财务助手', status: '已完成', priority: '中', createTime: '2026-03-11 09:00', finishTime: '2026-03-11 17:00', result: '检查342笔报销，发现12笔异常' },
  { id: 'T007', title: '挖掘政企客户商机线索', assignee: 'DE-2026008', agentName: '翼达', status: '执行中', priority: '高', createTime: '2026-03-12 08:30' },
  { id: 'T008', title: '处理上传文件批量摘要', assignee: 'DE-2026009', agentName: '文件助手', status: '已完成', priority: '低', createTime: '2026-03-11 16:00', finishTime: '2026-03-11 16:30', result: '完成35份文档摘要提取' },
  { id: 'T009', title: '生成2月经营分析报告', assignee: 'DE-2026010', agentName: '数据下载', status: '已失败', priority: '高', createTime: '2026-03-10 10:00', result: '数据源连接超时，需重试' },
  { id: 'T010', title: '客户满意度周报分析', assignee: 'DE-2026001', agentName: '翼答', status: '待执行', priority: '中', createTime: '2026-03-12 14:00' },
];

export const alerts: AlertItem[] = [
  { id: 'A001', type: '风险预警', title: '小翼·运维 连续3天未活跃', description: '数字员工DE-2026007运行状态异常，建议检查', level: 'critical', time: '2026-03-12 09:30', handled: false },
  { id: 'A002', type: '风险预警', title: '小翼·客服 Tokens配额即将耗尽', description: 'DE-2026001已使用64%配额，预计本月超支', level: 'warning', time: '2026-03-12 08:00', handled: false },
  { id: 'A003', type: '风险预警', title: '经营数据集 内容相似度异常', description: 'KB007与KB001存在32%内容重叠', level: 'warning', time: '2026-03-11 15:00', handled: true },
  { id: 'A004', type: '待办审批', title: '小翼·经分 入职审批', description: 'DE-2026010入职审批待确认，需二级审批', level: 'info', time: '2026-03-12 10:00', handled: false },
  { id: 'A005', type: '待办审批', title: '营销智能体 上架审核', description: '新版营销智能体待上架审核', level: 'info', time: '2026-03-12 09:00', handled: false },
  { id: 'A006', type: '待办审批', title: 'IT运维手册 知识授权', description: 'KB006知识库授权变更待审批', level: 'info', time: '2026-03-11 17:00', handled: false },
  { id: 'A007', type: '系统通知', title: '翼答智能体 版本更新', description: '翼答V3.2已发布，建议更新关联数字员工', level: 'info', time: '2026-03-11 12:00', handled: true },
  { id: 'A008', type: '风险预警', title: '2月经营分析任务失败', description: '任务T009执行失败，数据源连接异常', level: 'critical', time: '2026-03-10 10:30', handled: false },
  { id: 'A009', type: '绩效考评', title: '2025年度员工考核 - 自我评价', description: '2025年度员工考核已进入自我评价环节，请及时完成', level: 'info', time: '2026-03-15 09:00', handled: false },
  { id: 'A010', type: '绩效考评', title: '2025年Q4季度考核 - HR审核', description: '2025年第四季度基干及员工考核待HR审核', level: 'info', time: '2026-03-14 10:00', handled: false },
  { id: 'A011', type: '员工信息调整', title: '小翼·客服 信息变更审批', description: '小翼·客服的Tokens配额变更待审批', level: 'info', time: '2026-03-13 14:00', handled: false },
  { id: 'A012', type: '员工信息调整', title: '小翼·数据 岗位调整审批', description: '小翼·数据的岗位信息变更待审批', level: 'info', time: '2026-03-12 16:00', handled: false },
];

export const positions: PositionItem[] = [
  { id: 'POS001', name: '智能客服专员', department: '客户服务部', category: '服务类', description: '负责7×24小时智能客服，处理客户咨询和工单', requiredSkills: ['智能问答', '工单处理', '情感分析'], level: 'L2-L3', status: '启用', employeeCount: 3, maxEmployeeCount: 5, createTime: '2025-12-01' },
  { id: 'POS002', name: '数据标注专员', department: '数据运营中心', category: '技术类', description: '负责各类数据标注、清洗和预处理工作', requiredSkills: ['数据标注', '数据清洗'], level: 'L1-L2', status: '启用', employeeCount: 2, maxEmployeeCount: 4, createTime: '2025-12-15' },
  { id: 'POS003', name: '营销策划专员', department: '数字化运营部', category: '运营类', description: '负责营销文案创作、用户画像分析和竞品对比', requiredSkills: ['文案撰写', '用户画像', '竞品分析'], level: 'L2-L3', status: '启用', employeeCount: 2, maxEmployeeCount: 3, createTime: '2025-12-10' },
  { id: 'POS004', name: '审计助理', department: '审计部', category: '合规类', description: '辅助审计人员撰写底稿、识别风险并生成建议', requiredSkills: ['工作底稿', '风险识别'], level: 'L2', status: '启用', employeeCount: 1, maxEmployeeCount: 2, createTime: '2026-01-05' },
  { id: 'POS005', name: '人事助理', department: '人力资源部', category: '管理类', description: '人力资源管理支持，简历筛选和面试安排', requiredSkills: ['简历筛选', '人岗匹配'], level: 'L2-L3', status: '启用', employeeCount: 1, maxEmployeeCount: 2, createTime: '2025-11-20' },
  { id: 'POS006', name: '财务分析专员', department: '财务共享中心', category: '财务类', description: '报销审核、预算分析和费用统计', requiredSkills: ['报销审核', '预算分析'], level: 'L3', status: '启用', employeeCount: 1, maxEmployeeCount: 2, createTime: '2025-11-25' },
  { id: 'POS007', name: '运维工程师', department: 'IT运维部', category: '技术类', description: '系统运维监控、故障诊断和修复', requiredSkills: ['故障诊断', '日志分析', '自动巡检'], level: 'L2-L3', status: '启用', employeeCount: 1, maxEmployeeCount: 3, createTime: '2026-01-15' },
  { id: 'POS008', name: '商机分析专员', department: '数字化运营部', category: '运营类', description: 'AI商机线索挖掘和客户画像分析', requiredSkills: ['商机挖掘', '客户画像'], level: 'L3-L4', status: '启用', employeeCount: 1, maxEmployeeCount: 2, createTime: '2025-10-20' },
  { id: 'POS009', name: '文档管理专员', department: '综合管理部', category: '管理类', description: '文档智能处理、摘要生成和格式转换', requiredSkills: ['文件解析', '摘要生成'], level: 'L2', status: '启用', employeeCount: 1, maxEmployeeCount: 2, createTime: '2026-01-10' },
  { id: 'POS010', name: '经营分析专员', department: '经营分析部', category: '分析类', description: '经营数据采集和多维度分析报告', requiredSkills: ['经营报告', '指标分析', '可视化'], level: 'L1-L2', status: '停用', employeeCount: 1, maxEmployeeCount: 2, createTime: '2026-02-01' },
];

export const taskLogs: TaskLogItem[] = [
  { id: 'TL001', taskName: '处理今日客户咨询工单 (批次)', assignee: 'DE-2026001', agentName: '翼答', department: '客户服务部', userName: '宇雷', status: '已完成', priority: '高', createTime: '2026-03-12 08:00', finishTime: '2026-03-12 08:45', result: '处理128条工单，平均响应2.3秒', duration: '45分钟' },
  { id: 'TL002', taskName: '生成3月营销周报', assignee: 'DE-2026003', agentName: '写作助手', department: '数字化运营部', userName: '李明', status: '执行中', priority: '中', createTime: '2026-03-12 09:00' },
  { id: 'TL003', taskName: '标注新一批训练数据（2000条）', assignee: 'DE-2026002', agentName: '翼练', department: '数据运营中心', userName: '韩梅梅', status: '执行中', priority: '中', createTime: '2026-03-12 07:30' },
  { id: 'TL004', taskName: '筛选高级Java工程师简历', assignee: 'DE-2026005', agentName: '人岗匹配', department: '人力资源部', userName: '张三', status: '已完成', priority: '高', createTime: '2026-03-11 14:00', finishTime: '2026-03-11 15:30', result: '从256份简历中筛选出18名候选人', duration: '1小时30分' },
  { id: 'TL005', taskName: '审计底稿-费用专项', assignee: 'DE-2026004', agentName: '审计助手', department: '审计部', userName: '王芳', status: '待执行', priority: '高', createTime: '2026-03-12 10:00' },
  { id: 'TL006', taskName: '本月报销单据合规检查', assignee: 'DE-2026006', agentName: '财务助手', department: '财务共享中心', userName: '赵六', status: '已完成', priority: '中', createTime: '2026-03-11 09:00', finishTime: '2026-03-11 17:00', result: '检查342笔报销，发现12笔异常', duration: '8小时' },
  { id: 'TL007', taskName: '挖掘政企客户商机线索', assignee: 'DE-2026008', agentName: '翼达', department: '数字化运营部', userName: '周八', status: '执行中', priority: '高', createTime: '2026-03-12 08:30' },
  { id: 'TL008', taskName: '处理上传文件批量摘要', assignee: 'DE-2026009', agentName: '文件助手', department: '综合管理部', userName: '钱九', status: '已完成', priority: '低', createTime: '2026-03-11 16:00', finishTime: '2026-03-11 16:30', result: '完成35份文档摘要提取', duration: '30分钟' },
  { id: 'TL009', taskName: '生成2月经营分析报告', assignee: 'DE-2026010', agentName: '数据下载', department: '经营分析部', userName: '吴十', status: '已失败', priority: '高', createTime: '2026-03-10 10:00', result: '数据源连接超时，需重试' },
  { id: 'TL010', taskName: '客户满意度周报分析', assignee: 'DE-2026001', agentName: '翼答', department: '客户服务部', userName: '宇雷', status: '待执行', priority: '中', createTime: '2026-03-12 14:00' },
  { id: 'TL011', taskName: '批量处理员工入职资料', assignee: 'DE-2026005', agentName: '人岗匹配', department: '人力资源部', userName: '张三', status: '已完成', priority: '中', createTime: '2026-03-10 09:00', finishTime: '2026-03-10 11:00', result: '完成15名新员工资料核验', duration: '2小时' },
  { id: 'TL012', taskName: '生成竞品月度分析报告', assignee: 'DE-2026003', agentName: '营销智能体', department: '数字化运营部', userName: '李明', status: '已完成', priority: '高', createTime: '2026-03-09 14:00', finishTime: '2026-03-09 16:30', result: '输出12页竞品分析PPT', duration: '2小时30分' },
];

export const onboardRecords: OnboardRecord[] = [
  {
    id: 'OB001', employeeId: 'DE-2026010', employeeName: '小翼·经分', owner: '吴十', ownerType: '自有',
    department: '经营分析部', position: '经营分析专员', applyDate: '2026-02-25', status: '已完成', currentStep: 4,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-02-25 10:00', approver: '吴十', remark: '申请入职经营分析专员岗位' },
      { step: '部门经理审批', status: '已完成', time: '2026-02-26 14:00', approver: '经营分析部-张部长', opinion: '同意入职，该岗位急需人力补充', remark: '同意' },
      { step: '人力部门审批', status: '已完成', time: '2026-02-27 11:00', approver: '人力资源部-李主管', opinion: '审核通过，资质符合要求', remark: '审批通过' },
      { step: '入职完成', status: '已完成', time: '2026-03-01 09:00' },
    ],
  },
  {
    id: 'OB002', employeeId: 'DE-2026002', employeeName: '小翼·数据', owner: '韩梅梅', ownerType: '外包',
    department: '数据运营中心', position: '数据标注专员', applyDate: '2026-01-28', status: '已完成', currentStep: 4,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-01-28 09:00', approver: '韩梅梅', remark: '申请外包数据标注专员入职' },
      { step: '部门经理审批', status: '已完成', time: '2026-01-29 10:00', approver: '数据运营中心-王总监', opinion: '同意引入外包人员', remark: '同意' },
      { step: '人力部门审批', status: '已完成', time: '2026-01-30 14:00', approver: '人力资源部-李主管', opinion: '外包资质审核通过', remark: '通过' },
      { step: '入职完成', status: '已完成', time: '2026-02-01 09:00' },
    ],
  },
  {
    id: 'OB003', employeeId: 'NEW-001', employeeName: '小翼·法务', owner: '陈律师', ownerType: '自有',
    department: '法务部', position: '法务助理', applyDate: '2026-03-10', status: '部门经理审批', currentStep: 2,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-03-10 09:00', approver: '陈律师', remark: '申请入职法务助理岗位，用于合同审核和法规检索' },
      { step: '部门经理审批', status: '进行中', time: '2026-03-10 14:00', approver: '法务部-刘总' },
      { step: '人力部门审批', status: '待处理' },
      { step: '入职完成', status: '待处理' },
    ],
  },
  {
    id: 'OB004', employeeId: 'NEW-002', employeeName: '小翼·培训', owner: '赵丽', ownerType: '自有',
    department: '人力资源部', position: '培训助理', applyDate: '2026-03-15', status: '人力部门审批', currentStep: 3,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-03-15 09:00', approver: '赵丽', remark: '申请入职培训助理岗位' },
      { step: '部门经理审批', status: '已完成', time: '2026-03-16 10:00', approver: '人力资源部-陈经理', opinion: '部门需要AI培训助手，同意入职', remark: '同意' },
      { step: '人力部门审批', status: '进行中', time: '2026-03-17 09:00', approver: '人力资源部-李主管' },
      { step: '入职完成', status: '待处理' },
    ],
  },
];

export const exitRecords: ExitRecord[] = [
  {
    id: 'EX001', employeeId: 'DE-2026007', employeeName: '小翼·运维', department: 'IT运维部', position: '运维工程师',
    reason: '效能不达标', applyDate: '2026-03-08', status: '人力部门审批', currentStep: 3,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-03-08 10:00', approver: '孙七', remark: '连续3天未活跃，效能不达标，申请退出' },
      { step: '部门经理审批', status: '已完成', time: '2026-03-09 14:00', approver: 'IT运维部-周主管', opinion: '确认该员工效能持续低于标准，同意退出', remark: '同意退出' },
      { step: '人力部门审批', status: '进行中', time: '2026-03-10 09:00', approver: '人力资源部-李主管' },
      { step: '退出完成', status: '待处理' },
    ],
  },
  {
    id: 'EX002', employeeId: 'DE-2026009', employeeName: '小翼·文档', department: '综合管理部', position: '文档管理专员',
    reason: '岗位调整', applyDate: '2026-03-05', status: '部门经理审批', currentStep: 2,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-03-05 15:00', approver: '钱九', remark: '岗位调整，文档管理工作合并至其他岗位' },
      { step: '部门经理审批', status: '进行中', time: '2026-03-06 10:00', approver: '综合管理部-赵主任' },
      { step: '人力部门审批', status: '待处理' },
      { step: '退出完成', status: '待处理' },
    ],
  },
  {
    id: 'EX003', employeeId: 'DE-2026004', employeeName: '小翼·审计', department: '审计部', position: '审计助理',
    reason: '合同到期', applyDate: '2026-03-18', status: '已完成', currentStep: 4,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-03-18 09:00', approver: '王芳', remark: '服务合同到期，申请退出' },
      { step: '部门经理审批', status: '已完成', time: '2026-03-19 10:00', approver: '审计部-马经理', opinion: '合同到期，同意退出', remark: '同意' },
      { step: '人力部门审批', status: '已完成', time: '2026-03-20 14:00', approver: '人力资源部-李主管', opinion: '已确认合同到期，资源已回收', remark: '通过' },
      { step: '退出完成', status: '已完成', time: '2026-03-21 09:00' },
    ],
  },
];

export const transferRecords: TransferRecord[] = [
  {
    id: 'TF001', employeeId: 'DE-2026002', employeeName: '小翼·数据',
    fromDepartment: '数据运营中心', fromPosition: '数据标注专员',
    toDepartment: '数字化运营部', toPosition: '数据分析专员',
    reason: '业务需要，该员工具备数据分析能力，调动至数字化运营部承担更重要的数据分析工作',
    applyDate: '2026-03-12', applicant: '韩梅梅',
    status: '部门经理审批', currentStep: 2,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-03-12 09:00', approver: '韩梅梅', remark: '申请调动小翼·数据至数字化运营部' },
      { step: '部门经理审批', status: '进行中', time: '2026-03-12 14:00', approver: '数据运营中心-王总监' },
      { step: '人力部门审批', status: '待处理' },
      { step: '调动完成', status: '待处理' },
    ],
  },
  {
    id: 'TF002', employeeId: 'DE-2026009', employeeName: '小翼·文档',
    fromDepartment: '综合管理部', fromPosition: '文档管理专员',
    toDepartment: '客户服务部', toPosition: '知识管理专员',
    reason: '客户服务部需要知识管理能力，小翼·文档的文件解析和摘要能力可以更好地服务于客服知识库建设',
    applyDate: '2026-03-08', applicant: '钱九',
    status: '人力部门审批', currentStep: 3,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-03-08 10:00', approver: '钱九', remark: '申请调动至客户服务部' },
      { step: '部门经理审批', status: '已完成', time: '2026-03-09 11:00', approver: '综合管理部-赵主任', opinion: '同意调动，综合管理部文档工作可由其他员工分担', remark: '同意' },
      { step: '人力部门审批', status: '进行中', time: '2026-03-10 09:00', approver: '人力资源部-李主管' },
      { step: '调动完成', status: '待处理' },
    ],
  },
  {
    id: 'TF003', employeeId: 'DE-2026003', employeeName: '小翼·营销',
    fromDepartment: '数字化运营部', fromPosition: '营销策划专员',
    toDepartment: '数字化运营部', toPosition: '高级营销策划专员',
    reason: '该员工表现优异，完成率93.8%，建议晋升为高级营销策划专员',
    applyDate: '2026-02-20', applicant: '李明',
    status: '已完成', currentStep: 4,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-02-20 09:00', approver: '李明', remark: '申请岗位调整晋升' },
      { step: '部门经理审批', status: '已完成', time: '2026-02-21 10:00', approver: '数字化运营部-刘总监', opinion: '同意晋升，该员工业绩突出', remark: '同意' },
      { step: '人力部门审批', status: '已完成', time: '2026-02-22 14:00', approver: '人力资源部-李主管', opinion: '审核通过，符合晋升条件', remark: '通过' },
      { step: '调动完成', status: '已完成', time: '2026-02-23 09:00' },
    ],
  },
];

export const demandRecords: DemandRecord[] = [
  {
    id: 'DM001', title: '客服部智能客服专员扩编', department: '客户服务部', position: '智能客服专员',
    headcount: 2, urgency: '紧急',
    reason: '315消费者权益日期间客户咨询量激增，现有客服人力不足，需紧急扩编',
    requirements: '需具备智能问答、工单处理、情感分析能力，L2及以上职级',
    applyDate: '2026-03-05', applicant: '客户服务部-宇雷',
    status: '人力部门审批', currentStep: 3,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-03-05 09:00', approver: '宇雷', remark: '紧急扩编需求' },
      { step: '部门经理审批', status: '已完成', time: '2026-03-06 10:00', approver: '客户服务部-陈总监', opinion: '同意扩编，当前客服压力大，需增加人力', remark: '同意' },
      { step: '人力部门审批', status: '进行中', time: '2026-03-07 09:00', approver: '人力资源部-李主管' },
      { step: '需求完成', status: '待处理' },
    ],
  },
  {
    id: 'DM002', title: '审计部AI审计助理招募', department: '审计部', position: '审计助理',
    headcount: 1, urgency: '普通',
    reason: '年度审计工作量增加，需补充AI审计助理协助完成工作底稿',
    requirements: '需具备工作底稿、风险识别、报告生成能力',
    applyDate: '2026-03-10', applicant: '审计部-王芳',
    status: '部门经理审批', currentStep: 2,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-03-10 09:00', approver: '王芳', remark: '补充审计人力' },
      { step: '部门经理审批', status: '进行中', time: '2026-03-11 10:00', approver: '审计部-马经理' },
      { step: '人力部门审批', status: '待处理' },
      { step: '需求完成', status: '待处理' },
    ],
  },
  {
    id: 'DM003', title: '财务中心报表分析师需求', department: '财务共享中心', position: '财务分析专员',
    headcount: 1, urgency: '普通',
    reason: '季度报表分析工作繁重，需增加一名AI财务分析专员',
    requirements: '需具备报销审核、预算分析、费用统计能力，L3职级',
    applyDate: '2026-02-15', applicant: '财务共享中心-赵六',
    status: '已完成', currentStep: 4,
    approvalSteps: [
      { step: '发起申请', status: '已完成', time: '2026-02-15 09:00', approver: '赵六', remark: '增加财务分析人力' },
      { step: '部门经理审批', status: '已完成', time: '2026-02-16 10:00', approver: '财务共享中心-吴总监', opinion: '同意增员，当前人力紧张', remark: '同意' },
      { step: '人力部门审批', status: '已完成', time: '2026-02-17 14:00', approver: '人力资源部-李主管', opinion: '审核通过，已安排入职流程', remark: '通过' },
      { step: '需求完成', status: '已完成', time: '2026-02-18 09:00' },
    ],
  },
];

export const assessmentConfigs: AssessmentConfig[] = [
  { id: 'AC001', name: '2026年Q1季度考核', cycle: '季度', startDate: '2026-01-01', endDate: '2026-03-31', status: '进行中', metrics: ['任务完成率', 'Tokens消耗效率', '用户满意度', '响应速度'] },
  { id: 'AC002', name: '2025年H2半年考核', cycle: '半年', startDate: '2025-07-01', endDate: '2025-12-31', status: '已结束', metrics: ['任务完成率', 'Tokens消耗效率', '技能成长', '综合表现'] },
  { id: 'AC003', name: '2025年度考核', cycle: '全年', startDate: '2025-01-01', endDate: '2025-12-31', status: '已结束', metrics: ['任务完成率', 'Tokens消耗效率', '能力提升', '创新贡献'] },
  { id: 'AC004', name: '2026年H1半年考核', cycle: '半年', startDate: '2026-01-01', endDate: '2026-06-30', status: '未开始', metrics: ['任务完成率', 'Tokens效率', '用户满意度'] },
];

export const assessmentRecords: AssessmentRecord[] = digitalEmployees.map((e, i) => ({
  id: `AR-${e.id}`,
  employeeId: e.id,
  employeeName: e.name,
  department: e.department,
  position: e.position,
  period: '2026-Q1',
  cycle: '季度' as const,
  taskCompleteRate: e.taskCompleteRate,
  tokensUsed: e.tokensUsed,
  tokensQuota: e.tokensQuota,
  level: e.level,
  score: Math.round(e.taskCompleteRate * 0.4 + (1 - e.tokensUsed / e.tokensQuota) * 100 * 0.3 + (e.level === 'L4' ? 95 : e.level === 'L3' ? 85 : e.level === 'L2' ? 75 : 65) * 0.3),
  rank: i + 1,
}));

export const performanceReviews: PerformanceReview[] = [
  {
    id: 'PR001', year: 2025, period: '第四季度', periodType: '季度',
    name: '2025年第四季度基干及员工考核', status: '已结束', currentStep: '--',
    steps: [
      { key: 'init', label: '系统发起', status: '已完成', deadline: '2025-12-20' },
      { key: 'self', label: '自然人自我评价', status: '已完成', deadline: '2025-12-25' },
      { key: 'manager', label: '部门经理评价', status: '已完成', deadline: '2025-12-28' },
      { key: 'hr', label: '人力部门评价', status: '已完成', deadline: '2025-12-30' },
      { key: 'done', label: '结束', status: '已完成', deadline: '2025-12-31' },
    ],
    employees: digitalEmployees.map((e) => ({
      employeeId: e.id, employeeName: e.name, department: e.department,
      position: e.position, taskCompleteRate: e.taskCompleteRate,
      tokensUsed: e.tokensUsed, level: e.level,
      score: Math.round(Math.random() * 15 + 80),
      selfEvaluation: '本季度圆满完成各项任务目标',
      managerEvaluation: '表现优秀，建议继续保持',
    })),
  },
  {
    id: 'PR002', year: 2025, period: '年度', periodType: '年度',
    name: '2025年度员工考核', status: '进行中', currentStep: '人力部门评价',
    steps: [
      { key: 'init', label: '系统发起', status: '已完成', deadline: '2026-01-10' },
      { key: 'self', label: '自然人自我评价', status: '已完成', deadline: '2026-01-20' },
      { key: 'manager', label: '部门经理评价', status: '已完成', deadline: '2026-02-01' },
      { key: 'hr', label: '人力部门评价', status: '进行中', deadline: '2026-03-15' },
      { key: 'done', label: '结束', status: '待处理', deadline: '2026-03-31' },
    ],
    employees: digitalEmployees.map((e) => ({
      employeeId: e.id, employeeName: e.name, department: e.department,
      position: e.position, taskCompleteRate: e.taskCompleteRate,
      tokensUsed: e.tokensUsed, level: e.level,
      score: Math.round(Math.random() * 15 + 82),
      selfEvaluation: '年度工作总结已提交',
      managerEvaluation: '年度考评中',
      currentAction: 'HR审核',
    })),
  },
  {
    id: 'PR003', year: 2025, period: '第三季度', periodType: '季度',
    name: '2025年三季度基干及员工考核', status: '已结束', currentStep: '--',
    steps: [
      { key: 'init', label: '系统发起', status: '已完成' },
      { key: 'self', label: '自然人自我评价', status: '已完成' },
      { key: 'manager', label: '部门经理评价', status: '已完成' },
      { key: 'hr', label: '人力部门评价', status: '已完成' },
      { key: 'done', label: '结束', status: '已完成' },
    ],
    employees: [],
  },
  {
    id: 'PR004', year: 2025, period: '第二季度', periodType: '季度',
    name: '2025年二季度基干及员工考核', status: '已结束', currentStep: '--',
    steps: [
      { key: 'init', label: '系统发起', status: '已完成' },
      { key: 'self', label: '自然人自我评价', status: '已完成' },
      { key: 'manager', label: '部门经理评价', status: '已完成' },
      { key: 'hr', label: '人力部门评价', status: '已完成' },
      { key: 'done', label: '结束', status: '已完成' },
    ],
    employees: [],
  },
  {
    id: 'PR005', year: 2025, period: '第一季度', periodType: '季度',
    name: '2025年一季度基干及员工考核', status: '已结束', currentStep: '--',
    steps: [
      { key: 'init', label: '系统发起', status: '已完成' },
      { key: 'self', label: '自然人自我评价', status: '已完成' },
      { key: 'manager', label: '部门经理评价', status: '已完成' },
      { key: 'hr', label: '人力部门评价', status: '已完成' },
      { key: 'done', label: '结束', status: '已完成' },
    ],
    employees: [],
  },
  {
    id: 'PR006', year: 2024, period: '年度', periodType: '年度',
    name: '2024年度员工考核', status: '已结束', currentStep: '--',
    steps: [
      { key: 'init', label: '系统发起', status: '已完成' },
      { key: 'self', label: '自然人自我评价', status: '已完成' },
      { key: 'manager', label: '部门经理评价', status: '已完成' },
      { key: 'hr', label: '人力部门评价', status: '已完成' },
      { key: 'done', label: '结束', status: '已完成' },
    ],
    employees: [],
  },
  {
    id: 'PR007', year: 2024, period: '第四季度', periodType: '季度',
    name: '2024年四季度基干及员工考核', status: '已结束', currentStep: '--',
    steps: [
      { key: 'init', label: '系统发起', status: '已完成' },
      { key: 'self', label: '自然人自我评价', status: '已完成' },
      { key: 'manager', label: '部门经理评价', status: '已完成' },
      { key: 'hr', label: '人力部门评价', status: '已完成' },
      { key: 'done', label: '结束', status: '已完成' },
    ],
    employees: [],
  },
];

export const employeeEditApprovals: EmployeeEditApproval[] = [
  { id: 'EA001', employeeId: 'DE-2026001', employeeName: '小翼·客服', field: 'Tokens配额', oldValue: '500万', newValue: '800万', applyDate: '2026-03-13', status: '待审批', applicant: '宇雷' },
  { id: 'EA002', employeeId: 'DE-2026002', employeeName: '小翼·数据', field: '岗位', oldValue: '数据标注专员', newValue: '数据分析专员', applyDate: '2026-03-12', status: '待审批', applicant: '韩梅梅' },
];

export const scheduledTasks: ScheduledTask[] = [
  { id: 'ST001', name: '每日客户工单处理', employeeId: 'DE-2026001', employeeName: '小翼·客服', cron: '0 8 * * *', cronLabel: '每天 08:00', enabled: true, lastRun: '2026-03-17 08:00', nextRun: '2026-03-18 08:00', description: '自动处理前一天未完成的客户工单' },
  { id: 'ST002', name: '周报自动生成', employeeId: 'DE-2026003', employeeName: '小翼·营销', cron: '0 9 * * 1', cronLabel: '每周一 09:00', enabled: true, lastRun: '2026-03-17 09:00', nextRun: '2026-03-24 09:00', description: '自动生成上周营销周报' },
  { id: 'ST003', name: '月度报销检查', employeeId: 'DE-2026006', employeeName: '小翼·财务', cron: '0 9 1 * *', cronLabel: '每月1日 09:00', enabled: true, lastRun: '2026-03-01 09:00', nextRun: '2026-04-01 09:00', description: '自动执行月度报销单据合规检查' },
  { id: 'ST004', name: '数据质量巡检', employeeId: 'DE-2026002', employeeName: '小翼·数据', cron: '0 6 * * *', cronLabel: '每天 06:00', enabled: false, lastRun: '2026-03-15 06:00', nextRun: '-', description: '每日自动检查数据质量' },
];

export const conversations: ConversationItem[] = [
  { employeeId: 'DE-2026001', lastMessage: '已完成128条工单处理，平均响应2.3秒', lastTime: '10分钟前', unreadCount: 2 },
  { employeeId: 'DE-2026003', lastMessage: '3月营销周报正在生成中，预计30分钟完成', lastTime: '30分钟前', unreadCount: 0 },
  { employeeId: 'DE-2026005', lastMessage: '从256份简历中筛选出18名候选人，详情请查看', lastTime: '2小时前', unreadCount: 1 },
  { employeeId: 'DE-2026006', lastMessage: '本月报销单据已检查完毕，发现12笔异常', lastTime: '昨天', unreadCount: 3 },
  { employeeId: 'DE-2026008', lastMessage: '正在分析政企客户数据，已识别5条高价值线索', lastTime: '20分钟前', unreadCount: 0 },
];

export const dashboardStats = {
  totalEmployees: 1248,
  totalAgents: 3560,
  todayTokens: '45.2M',
  avgTaskRate: 94.8,
  ownRatio: 65,
  outsourceRatio: 35,
  healthScore: 98.5,
  healthChange: '+0.2%',
  monthNewPercent: 12,
  efficiencyGrade: 'A+',
  totalUsers: 856,
  todayActiveUsers: 342,
  todayTaskCount: 1580,
  avgResponseTime: '2.1s',
};

export const tokensWeekly = [
  { date: '03-06', text: 18200, multimodal: 4500 },
  { date: '03-07', text: 21000, multimodal: 5200 },
  { date: '03-08', text: 15600, multimodal: 3800 },
  { date: '03-09', text: 19800, multimodal: 4100 },
  { date: '03-10', text: 22500, multimodal: 5800 },
  { date: '03-11', text: 24100, multimodal: 6200 },
  { date: '03-12', text: 20800, multimodal: 5000 },
];

export const userUsageTrend = [
  { date: '03-06', users: 280, sessions: 1520, tasks: 890 },
  { date: '03-07', users: 320, sessions: 1780, tasks: 1020 },
  { date: '03-08', users: 260, sessions: 1350, tasks: 780 },
  { date: '03-09', users: 310, sessions: 1680, tasks: 960 },
  { date: '03-10', users: 350, sessions: 1920, tasks: 1100 },
  { date: '03-11', users: 380, sessions: 2100, tasks: 1250 },
  { date: '03-12', users: 342, sessions: 1850, tasks: 1080 },
];

export const monthlyStats = [
  { month: '2025-10', employees: 980, users: 520, tokens: 98.5, tasks: 8200 },
  { month: '2025-11', employees: 1050, users: 610, tokens: 112.3, tasks: 9800 },
  { month: '2025-12', employees: 1120, users: 680, tokens: 128.6, tasks: 11500 },
  { month: '2026-01', employees: 1180, users: 750, tokens: 138.2, tasks: 13200 },
  { month: '2026-02', employees: 1220, users: 810, tokens: 145.8, tasks: 14800 },
  { month: '2026-03', employees: 1248, users: 856, tokens: 152.8, tasks: 15200 },
];

export const levelDistribution = [
  { name: 'L1 基础', value: 180, color: '#C0C0C0' },
  { name: 'L2 进阶', value: 420, color: '#6B7B8D' },
  { name: 'L3 专家', value: 480, color: '#1677ff' },
  { name: 'L4 大师', value: 168, color: '#0A1929' },
];

export const departmentUsage = [
  { department: '客户服务部', users: 120, sessions: 5800, tasks: 3200 },
  { department: '数字化运营部', users: 95, sessions: 4200, tasks: 2100 },
  { department: '财务共享中心', users: 80, sessions: 3600, tasks: 1800 },
  { department: '人力资源部', users: 65, sessions: 2800, tasks: 1400 },
  { department: '审计部', users: 45, sessions: 1900, tasks: 950 },
  { department: 'IT运维部', users: 55, sessions: 2400, tasks: 1200 },
  { department: '经营分析部', users: 40, sessions: 1600, tasks: 800 },
  { department: '综合管理部', users: 35, sessions: 1200, tasks: 600 },
];

export const tokensScenario = [
  { name: '客户服务', value: 35, color: '#1677ff' },
  { name: '财务共享', value: 20, color: '#52c41a' },
  { name: 'IT运维', value: 15, color: '#ff4d4f' },
  { name: '人力资源', value: 18, color: '#722ed1' },
  { name: '经营分析', value: 12, color: '#eb2f96' },
];

export const efficiencyReport = {
  savedHours: 1240,
  costReduction: 45,
  roi: '1:4.5',
};

export interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  department: string;
  employeeId: string;
  employeeName: string;
  type: '功能建议' | '体验问题' | '错误反馈' | '其他';
  title: string;
  content: string;
  status: '待处理' | '处理中' | '已解决' | '已关闭';
  priority: '高' | '中' | '低';
  createTime: string;
  updateTime: string;
  reply?: string;
}

export const feedbackList: FeedbackItem[] = [
  { id: 'FB001', userId: 'U004', userName: '宇雷', department: '客户服务部', employeeId: 'DE-2026001', employeeName: '小翼·客服', type: '功能建议', title: '希望增加多语言客服能力', content: '目前小翼·客服只支持中文，建议增加英文和日文客服能力，以应对海外客户咨询。', status: '处理中', priority: '高', createTime: '2026-03-20 10:30', updateTime: '2026-03-21 09:00', reply: '已收到建议，正在评估多语言模型接入方案。' },
  { id: 'FB002', userId: 'U002', userName: '张部长', department: '经营分析部', employeeId: 'DE-2026010', employeeName: '小翼·经分', type: '错误反馈', title: '经营报告数据图表显示异常', content: '使用小翼·经分生成的2月经营报告中，柱状图数据与表格数据不一致，疑似计算错误。', status: '已解决', priority: '高', createTime: '2026-03-18 14:20', updateTime: '2026-03-19 16:00', reply: '已定位问题为数据聚合逻辑错误，已修复并重新生成报告。' },
  { id: 'FB003', userId: 'U004', userName: '宇雷', department: '客户服务部', employeeId: 'DE-2026001', employeeName: '小翼·客服', type: '体验问题', title: '工单处理响应速度变慢', content: '最近一周小翼·客服处理工单的平均响应时间从2.3秒增加到5.8秒，影响客户体验。', status: '处理中', priority: '高', createTime: '2026-03-22 09:15', updateTime: '2026-03-22 11:00' },
  { id: 'FB004', userId: 'U003', userName: '李主管', department: '人力资源部', employeeId: 'DE-2026005', employeeName: '小翼·HR', type: '功能建议', title: '增加面试评价自动汇总功能', content: '目前面试评价需要手动汇总，建议增加面试反馈自动整理和候选人排名功能。', status: '待处理', priority: '中', createTime: '2026-03-21 16:45', updateTime: '2026-03-21 16:45' },
  { id: 'FB005', userId: 'U002', userName: '张部长', department: '经营分析部', employeeId: 'DE-2026003', employeeName: '小翼·营销', type: '体验问题', title: '营销文案生成质量需优化', content: '小翼·营销生成的文案偶尔会出现重复内容和逻辑不通顺的情况，建议优化内容质量。', status: '待处理', priority: '中', createTime: '2026-03-23 10:00', updateTime: '2026-03-23 10:00' },
  { id: 'FB006', userId: 'U005', userName: '王芳', department: '审计部', employeeId: 'DE-2026004', employeeName: '小翼·审计', type: '功能建议', title: '支持审计底稿模板自定义', content: '不同审计项目需要不同格式的底稿，希望能支持自定义底稿模板配置。', status: '已解决', priority: '中', createTime: '2026-03-15 11:30', updateTime: '2026-03-17 14:00', reply: '已新增底稿模板管理功能，可在审计助手技能配置中设置。' },
  { id: 'FB007', userId: 'U004', userName: '宇雷', department: '客户服务部', employeeId: 'DE-2026006', employeeName: '小翼·财务', type: '其他', title: '报销审核规则更新建议', content: '近期公司报销制度有更新，建议尽快更新小翼·财务的审核规则库。', status: '已关闭', priority: '低', createTime: '2026-03-10 09:00', updateTime: '2026-03-12 10:00', reply: '已更新财务制度知识库，新规则已生效。' },
  { id: 'FB008', userId: 'U003', userName: '李主管', department: '人力资源部', employeeId: 'DE-2026008', employeeName: '小翼·商机', type: '错误反馈', title: '商机线索重复推送', content: '小翼·商机连续两天推送了相同的商机线索，存在去重逻辑问题。', status: '待处理', priority: '高', createTime: '2026-03-24 08:30', updateTime: '2026-03-24 08:30' },
];

export const chatMessages = [
  { role: 'assistant' as const, content: '您好！我是小翼·客服，很高兴为您服务。请问有什么可以帮您？' },
];

export type SystemRole = '系统管理员' | '部门经理' | '人力部门' | '审计' | '普通用户';

export interface UserInfo {
  id: string;
  name: string;
  role: SystemRole;
  department?: string;
  permissions: string[];
}

export const rolePermissions: Record<SystemRole, string[]> = {
  '系统管理员': [
    'dashboard', 'pending', 'alerts',
    'employees', 'positions',
    'onboard', 'transfer', 'demand', 'performance', 'exit',
    'task-logs', 'feedback',
    'approval:approve', 'approval:reject',
    'employee:create', 'employee:edit', 'employee:delete',
    'position:create', 'position:edit', 'position:delete',
    'performance:initiate', 'performance:evaluate',
    'system:settings',
  ],
  '部门经理': [
    'dashboard', 'pending', 'alerts',
    'employees', 'positions',
    'onboard', 'transfer', 'demand', 'performance', 'exit',
    'task-logs', 'feedback',
    'approval:approve', 'approval:reject',
    'employee:edit',
    'performance:evaluate',
  ],
  '人力部门': [
    'dashboard', 'pending', 'alerts',
    'employees', 'positions',
    'onboard', 'transfer', 'demand', 'performance', 'exit',
    'task-logs', 'feedback',
    'approval:approve', 'approval:reject',
    'employee:create', 'employee:edit',
    'position:create', 'position:edit',
    'performance:initiate', 'performance:evaluate',
  ],
  '审计': [
    'task-logs', 'schedule',
  ],
  '普通用户': [
    'dashboard', 'pending',
    'employees',
    'onboard', 'performance',
    'task-logs',
  ],
};

export const currentUser: UserInfo = {
  id: 'U001',
  name: '管理员',
  role: '系统管理员',
  permissions: rolePermissions['系统管理员'],
};

export const mockUsers: UserInfo[] = [
  { id: 'U001', name: '管理员', role: '系统管理员', permissions: rolePermissions['系统管理员'] },
  { id: 'U002', name: '张部长', role: '部门经理', department: '经营分析部', permissions: rolePermissions['部门经理'] },
  { id: 'U003', name: '李主管', role: '人力部门', department: '人力资源部', permissions: rolePermissions['人力部门'] },
  { id: 'U004', name: '宇雷', role: '普通用户', department: '客户服务部', permissions: rolePermissions['普通用户'] },
  { id: 'U005', name: '王芳', role: '审计', department: '审计部', permissions: rolePermissions['审计'] },
];

export const orgTree = [
  {
    key: 'org-root',
    title: '天翼云数字员工',
    children: [
      {
        key: 'dept-kfb',
        title: '客户服务部',
        children: [
          { key: 'DE-2026001', title: '小翼·客服', isLeaf: true },
        ],
      },
      {
        key: 'dept-sjzx',
        title: '数据运营中心',
        children: [
          { key: 'DE-2026002', title: '小翼·数据', isLeaf: true },
        ],
      },
      {
        key: 'dept-szhyy',
        title: '数字化运营部',
        children: [
          { key: 'DE-2026003', title: '小翼·营销', isLeaf: true },
          { key: 'DE-2026008', title: '小翼·商机', isLeaf: true },
        ],
      },
      {
        key: 'dept-sjb',
        title: '审计部',
        children: [
          { key: 'DE-2026004', title: '小翼·审计', isLeaf: true },
        ],
      },
      {
        key: 'dept-rlzy',
        title: '人力资源部',
        children: [
          { key: 'DE-2026005', title: '小翼·HR', isLeaf: true },
        ],
      },
      {
        key: 'dept-cwgx',
        title: '财务共享中心',
        children: [
          { key: 'DE-2026006', title: '小翼·财务', isLeaf: true },
        ],
      },
      {
        key: 'dept-ityw',
        title: 'IT运维部',
        children: [
          { key: 'DE-2026007', title: '小翼·运维', isLeaf: true },
        ],
      },
      {
        key: 'dept-zhgl',
        title: '综合管理部',
        children: [
          { key: 'DE-2026009', title: '小翼·文档', isLeaf: true },
        ],
      },
      {
        key: 'dept-jyfx',
        title: '经营分析部',
        children: [
          { key: 'DE-2026010', title: '小翼·经分', isLeaf: true },
        ],
      },
    ],
  },
];
