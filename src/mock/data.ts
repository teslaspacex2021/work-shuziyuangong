export interface DigitalEmployee {
  id: string;
  name: string;
  avatar: string;
  department: string;
  position: string;
  status: 'ACTIVE' | 'TRAINING' | 'SUSPENDED' | 'TERMINATED';
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
  type: '风险预警' | '待办审批' | '系统通知';
  title: string;
  description: string;
  level: 'critical' | 'warning' | 'info';
  time: string;
  handled: boolean;
}

export const digitalEmployees: DigitalEmployee[] = [
  {
    id: 'DE-2026001', name: '小翼·客服', avatar: 'KC', department: '客户服务部', position: '智能客服专员',
    status: 'ACTIVE', owner: '宇雷', ownerType: '自有',
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
    status: 'TRAINING', owner: '韩梅梅', ownerType: '外包',
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
    status: 'ACTIVE', owner: '李明', ownerType: '自有',
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
    status: 'ACTIVE', owner: '王芳', ownerType: '自有',
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
    status: 'ACTIVE', owner: '张三', ownerType: '自有',
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
    status: 'ACTIVE', owner: '赵六', ownerType: '自有',
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
    status: 'SUSPENDED', owner: '孙七', ownerType: '外包',
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
    status: 'ACTIVE', owner: '周八', ownerType: '自有',
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
    status: 'ACTIVE', owner: '钱九', ownerType: '自有',
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
    status: 'TRAINING', owner: '吴十', ownerType: '自有',
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
];

export const dashboardStats = {
  totalEmployees: 1248,
  totalAgents: 3560,
  todayTokens: '45.2M',
  avgTaskRate: 94.8,
  ownRatio: 65,
  outsourceRatio: 35,
  riskAlerts: 3,
  pendingApprovals: 5,
  healthScore: 98.5,
  healthChange: '+0.2%',
  monthNewPercent: 12,
  efficiencyGrade: 'A+',
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

export const levelDistribution = [
  { name: 'L1 基础', value: 180, color: '#C0C0C0' },
  { name: 'L2 进阶', value: 420, color: '#6B7B8D' },
  { name: 'L3 专家', value: 480, color: '#1677ff' },
  { name: 'L4 大师', value: 168, color: '#0A1929' },
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

export const chatMessages = [
  { role: 'assistant' as const, content: '您好！我是小翼·客服，很高兴为您服务。请问有什么可以帮您？' },
];
