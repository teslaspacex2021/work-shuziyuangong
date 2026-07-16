import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Avatar, Tag, Button, Input, Tooltip, Badge, Space, Empty,
  Descriptions, Tabs, List, Divider, message, Modal,
  Card, Form, Select, Row, Col, Upload,
} from 'antd';
import {
  SearchOutlined, InfoCircleOutlined,
  LikeOutlined,
  DislikeOutlined, CopyOutlined, RobotOutlined,
  UserOutlined, ThunderboltOutlined, BookOutlined,
  CloseOutlined, DatabaseOutlined, FileTextOutlined,
  PlusOutlined, ContactsOutlined,
  TeamOutlined, ApartmentOutlined,
  MessageOutlined, UploadOutlined, IdcardOutlined,
  DownloadOutlined, EyeOutlined, FileWordOutlined, FilePdfOutlined,
} from '@ant-design/icons';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  digitalEmployees, conversations, tasks, skills, knowledgeBases,
  getAllScheduledTasks, persistCreatedScheduledTask, mockRetrievalFiles, getEmployeeFeatureFlags,
  DISLIKE_REASON_OPTIONS, SCHEDULE_ASSISTANT_ID,
  type ConversationItem, type ScheduledTask, type RetrievalFileItem,
} from '../../mock/data';
import ThirdScreenPanel from '../../components/ThirdScreenPanel';
import ChatInputComposer from '../../components/ChatInputComposer';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  usedSkills?: string[];
  retrievedFiles?: RetrievalFileItem[];
  recalledFiles?: RetrievalFileItem[];
  feedback?: 'like' | 'dislike' | null;
  feedbackReason?: string;
}

const statusColor: Record<string, string> = {
  ACTIVE: '#52c41a', TRAINING: '#1677ff', SUSPENDED: '#faad14', TERMINATED: '#ff4d4f',
};
const statusLabel: Record<string, string> = {
  ACTIVE: '在线', TRAINING: '训练中', SUSPENDED: '已暂停', TERMINATED: '已停用',
};

const typeIcon: Record<string, React.ReactNode> = {
  '知识库': <DatabaseOutlined style={{ color: '#1677ff' }} />,
  '知识卡片': <FileTextOutlined style={{ color: '#52c41a' }} />,
  '数据集': <BookOutlined style={{ color: '#722ed1' }} />,
};

const mockResponses = [
  '好的，我已经理解了您的需求。让我为您处理一下...',
  '根据我的分析，这个问题可以从以下几个方面来解决：\n\n1. **数据收集**：首先需要收集相关的业务数据\n2. **分析处理**：运用智能算法进行数据分析\n3. **结果输出**：生成结构化的分析报告\n\n我正在为您准备详细的方案，请稍候。',
  '已完成处理！以下是关键发现：\n\n- 本月业务量较上月增长 **12.5%**\n- 客户满意度维持在 **96.8%**\n- 建议关注3个待优化项目\n\n需要我进一步展开分析吗？',
  '正在为您检索相关信息...\n\n根据知识库查询结果，我为您找到了以下内容：\n\n1. **相关文档** 共 15 篇匹配项\n2. **历史案例** 发现 3 个类似场景\n3. **推荐方案** 基于最佳实践生成\n\n是否需要查看详细内容？',
  '任务已创建并开始执行。\n\n**任务编号**：T-AUTO-001\n**预计耗时**：约 15 分钟\n**当前进度**：数据采集中 (35%)\n\n执行完成后我会第一时间通知您。',
];

const quickActions = [
  '帮我处理今日待办工作',
  '生成本周工作总结',
  '分析最近的业务数据',
  '查看最新的知识更新',
];

const genMsgId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const fileTypeIcon = (type: RetrievalFileItem['type']) => {
  if (type === 'docx') return <FileWordOutlined style={{ color: '#2b579a', fontSize: 20 }} />;
  if (type === 'pdf') return <FilePdfOutlined style={{ color: '#e4393c', fontSize: 20 }} />;
  return <FileTextOutlined style={{ color: '#1677ff', fontSize: 20 }} />;
};

interface DeptNode {
  key: string;
  name: string;
  employees: typeof digitalEmployees;
}

interface PositionNode {
  key: string;
  name: string;
  department: string;
  employees: typeof digitalEmployees;
}

const empStatusColor: Record<string, string> = {
  ACTIVE: '#52c41a', TRAINING: '#1677ff', SUSPENDED: '#faad14', TERMINATED: '#ff4d4f',
};
const empStatusLabel: Record<string, string> = {
  ACTIVE: '在线', TRAINING: '训练中', SUSPENDED: '已暂停', TERMINATED: '已停用',
};

const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isUserLayout = location.pathname.startsWith('/user/');
  const isCreateScheduleIntent = searchParams.get('intent') === 'createSchedule';
  const initialEmployeeId = searchParams.get('employeeId')
    || (isCreateScheduleIntent ? SCHEDULE_ASSISTANT_ID : '');
  const isNewChat = searchParams.get('newChat') === '1' || isCreateScheduleIntent;
  const initialMsg = searchParams.get('msg') || '';
  const initialDraft = searchParams.get('draft') || '';

  const SCHEDULE_SUGGESTIONS = [
    '帮我创建一个每天早上8点由小翼·客服执行的每日客户工单处理任务',
    '每周一9点让小翼·营销自动生成周报',
    '每月1日对小翼·财务执行月度报销检查',
    '创建一个每天6点的数据质量巡检定时任务',
  ];

  const [selectedConvId, setSelectedConvId] = useState<string>(
    () => initialEmployeeId || (!isUserLayout && !isNewChat ? (conversations[0]?.employeeId || '') : ''),
  );
  const [convSearchText, setConvSearchText] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [inputValue, setInputValue] = useState(initialDraft);
  const [loading, setLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMsg[]>>({});
  const [activeConvIds, setActiveConvIds] = useState<string[]>(conversations.map((c) => c.employeeId));
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [contactsVisible, setContactsVisible] = useState(false);
  const [contactsTab, setContactsTab] = useState('dept');
  const [contactSearch, setContactSearch] = useState('');
  const [selectedTreeNode, setSelectedTreeNode] = useState('');

  const [scheduleList, setScheduleList] = useState(() => getAllScheduledTasks());
  const scheduleBootstrapped = useRef(false);

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackForm] = Form.useForm();

  const [summonEmployeeVisible, setSummonEmployeeVisible] = useState(false);
  const [summonSearch, setSummonSearch] = useState('');
  /** 定时任务助手场景下「召唤专家」选中的执行员工（不切换当前对话） */
  const [scheduleSummonedExpertId, setScheduleSummonedExpertId] = useState<string | null>(null);

  const [thirdScreenOpen, setThirdScreenOpen] = useState(false);
  const [thirdScreenFiles, setThirdScreenFiles] = useState<RetrievalFileItem[]>([]);
  const [previewFile, setPreviewFile] = useState<RetrievalFileItem | null>(null);
  const [deepThinkingOn] = useState(false);
  const [webSearchOn] = useState(false);
  const [suggestBatch, setSuggestBatch] = useState(0);
  const [dislikeVisible, setDislikeVisible] = useState(false);
  const [dislikeMsgKey, setDislikeMsgKey] = useState<{ empId: string; msgId: string } | null>(null);
  const [dislikeForm] = Form.useForm();
  const [retrieving, setRetrieving] = useState(false);
  const [retrievingFiles, setRetrievingFiles] = useState<RetrievalFileItem[]>([]);

  useEffect(() => {
    if (initialEmployeeId && !activeConvIds.includes(initialEmployeeId)) {
      setActiveConvIds((prev) => [initialEmployeeId, ...prev]);
    }
  }, [initialEmployeeId]);

  useEffect(() => {
    if (initialEmployeeId) {
      setSelectedConvId(initialEmployeeId);
    }
  }, [initialEmployeeId]);

  useEffect(() => {
    if (initialDraft) {
      setInputValue(initialDraft);
    }
  }, [initialDraft]);

  const isDigitalEmployeeNewChat = !isUserLayout && isNewChat;
  const isNewConversationMode =
    isCreateScheduleIntent
    || (isUserLayout && !initialEmployeeId && !selectedConvId)
    || isDigitalEmployeeNewChat;

  const activeEmployeeId = ((isDigitalEmployeeNewChat || isCreateScheduleIntent) && initialEmployeeId)
    ? initialEmployeeId
    : selectedConvId;

  const selectedEmployee = useMemo(
    () => digitalEmployees.find((e) => e.id === activeEmployeeId) || null,
    [activeEmployeeId],
  );

  const featureFlags = useMemo(
    () => getEmployeeFeatureFlags(selectedEmployee),
    [selectedEmployee],
  );

  const displaySuggestedQuestions = useMemo(() => {
    const list = isCreateScheduleIntent
      ? SCHEDULE_SUGGESTIONS
      : selectedEmployee?.suggestedQuestions?.length
        ? selectedEmployee.suggestedQuestions
        : (isUserLayout
          ? ['要如何销售？', '公司对于软考有什么政策', '天翼云科技公司英文名称', '部门业务通知单 与 工作联系单 的区别']
          : quickActions);
    const start = (suggestBatch * 4) % Math.max(list.length, 1);
    return [...list, ...list].slice(start, start + 4);
  }, [selectedEmployee, suggestBatch, isUserLayout, isCreateScheduleIntent]);

  const openThirdScreen = (files: RetrievalFileItem[], preview?: RetrievalFileItem | null) => {
    setThirdScreenFiles(files);
    setPreviewFile(preview ?? null);
    setThirdScreenOpen(true);
    setShowDetail(false);
  };

  const allConversations = useMemo(() => {
    return activeConvIds.map((empId) => {
      const existing = conversations.find((c) => c.employeeId === empId);
      if (existing) return existing;
      return { employeeId: empId, lastMessage: '点击开始对话', lastTime: '刚刚', unreadCount: 0 } as ConversationItem;
    });
  }, [activeConvIds]);

  const filteredConversations = useMemo(() => {
    return allConversations.filter((c) => {
      const emp = digitalEmployees.find((e) => e.id === c.employeeId);
      if (!emp) return false;
      if (!convSearchText) return true;
      return emp.name.includes(convSearchText) || c.lastMessage.includes(convSearchText);
    });
  }, [convSearchText, allConversations]);

  const currentMessages = useMemo(() => {
    return chatHistories[activeEmployeeId] || [];
  }, [chatHistories, activeEmployeeId]);

  useEffect(() => {
    if (!activeEmployeeId || !selectedEmployee) return;

    if (isCreateScheduleIntent && !scheduleBootstrapped.current) {
      scheduleBootstrapped.current = true;
      setSelectedConvId(activeEmployeeId);
      setActiveConvIds((prev) => (prev.includes(activeEmployeeId) ? prev : [activeEmployeeId, ...prev]));
      setChatHistories((prev) => ({
        ...prev,
        [activeEmployeeId]: [{
          id: genMsgId(),
          role: 'assistant',
          content: `您好！我是 **${selectedEmployee.name}**，专门协助您创建周期性自动化任务。\n\n您可以：\n1. 直接用自然语言描述任务（例如：「每天早上8点处理客户工单」）\n2. 点击底部 **召唤专家**，选中要执行任务的数字员工\n\n我会整理任务名称、执行专家、执行频率并完成创建。`,
          time: new Date().toLocaleTimeString(),
        }],
      }));
      return;
    }

    if (!isCreateScheduleIntent && !chatHistories[activeEmployeeId]) {
      setChatHistories((prev) => ({
        ...prev,
        [activeEmployeeId]: [{
          id: genMsgId(),
          role: 'assistant',
          content: `您好！我是 **${selectedEmployee.name}**，${selectedEmployee.description}\n\n请问有什么可以帮您？`,
          time: new Date().toLocaleTimeString(),
        }],
      }));
    }
  }, [activeEmployeeId, selectedEmployee, chatHistories, isCreateScheduleIntent]);

  const [initialMsgSent, setInitialMsgSent] = useState(false);
  useEffect(() => {
    if (initialMsg && activeEmployeeId && selectedEmployee && !initialMsgSent && chatHistories[activeEmployeeId]) {
      setInitialMsgSent(true);
      const userMsg: ChatMsg = {
        id: genMsgId(),
        role: 'user',
        content: initialMsg,
        time: new Date().toLocaleTimeString(),
      };
      setChatHistories((prev) => ({
        ...prev,
        [activeEmployeeId]: [...(prev[activeEmployeeId] || []), userMsg],
      }));
      const empId = activeEmployeeId;
      const flags = getEmployeeFeatureFlags(selectedEmployee);
      setLoading(true);
      if (flags.thinkTank) {
        setRetrieving(true);
        setRetrievingFiles(mockRetrievalFiles.slice(0, 2));
      }
      setTimeout(() => {
        const resp = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        const usedSkills = selectedEmployee.skills.slice(0, Math.floor(Math.random() * 2) + 1);
        const retrieved = flags.thinkTank ? mockRetrievalFiles.slice(0, 3) : undefined;
        const recalled = flags.thinkTank || flags.attachmentUpload
          ? [mockRetrievalFiles[Math.floor(Math.random() * mockRetrievalFiles.length)]]
          : undefined;
        setChatHistories((prev) => ({
          ...prev,
          [empId]: [...(prev[empId] || []), {
            id: genMsgId(),
            role: 'assistant' as const,
            content: resp,
            time: new Date().toLocaleTimeString(),
            usedSkills,
            retrievedFiles: retrieved,
            recalledFiles: recalled,
          }],
        }));
        setRetrieving(false);
        setRetrievingFiles([]);
        setLoading(false);
      }, 1200 + Math.random() * 500);
    }
  }, [initialMsg, activeEmployeeId, selectedEmployee, chatHistories, initialMsgSent]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, loading]);

  const departments: DeptNode[] = useMemo(() => {
    const deptMap = new Map<string, typeof digitalEmployees>();
    digitalEmployees.forEach((emp) => {
      if (!deptMap.has(emp.department)) deptMap.set(emp.department, []);
      deptMap.get(emp.department)!.push(emp);
    });
    return Array.from(deptMap.entries()).map(([name, employees]) => ({
      key: `dept-${name}`,
      name,
      employees,
    }));
  }, []);

  const positionNodes: PositionNode[] = useMemo(() => {
    const posMap = new Map<string, typeof digitalEmployees>();
    digitalEmployees.forEach((emp) => {
      if (!posMap.has(emp.position)) posMap.set(emp.position, []);
      posMap.get(emp.position)!.push(emp);
    });
    return Array.from(posMap.entries()).map(([name, employees]) => ({
      key: `pos-${name}`,
      name,
      department: employees[0]?.department || '',
      employees,
    }));
  }, []);

  const filteredDepts = useMemo(() => {
    if (!contactSearch) return departments;
    return departments.map((d) => ({
      ...d,
      employees: d.employees.filter((e) => e.name.includes(contactSearch) || e.position.includes(contactSearch)),
    })).filter((d) => d.name.includes(contactSearch) || d.employees.length > 0);
  }, [departments, contactSearch]);

  const filteredPositions = useMemo(() => {
    if (!contactSearch) return positionNodes;
    return positionNodes.filter((p) => p.name.includes(contactSearch) || p.employees.some((e) => e.name.includes(contactSearch)));
  }, [positionNodes, contactSearch]);

  const handleSelectConversation = (conv: ConversationItem) => {
    setSelectedConvId(conv.employeeId);
    setShowDetail(false);
  };

  const startChatWithEmployee = (empId: string) => {
    if (!activeConvIds.includes(empId)) {
      setActiveConvIds((prev) => [empId, ...prev]);
    }
    setSelectedConvId(empId);
    setContactsVisible(false);
  };

  const scheduleSummonedExpert = useMemo(
    () => digitalEmployees.find((e) => e.id === scheduleSummonedExpertId) || null,
    [scheduleSummonedExpertId],
  );

  const buildScheduleFromText = (text: string): ScheduledTask => {
    const matchedEmp = scheduleSummonedExpert
      || digitalEmployees.find((e) => text.includes(e.name) && e.id !== SCHEDULE_ASSISTANT_ID)
      || digitalEmployees.find((e) => e.id === 'DE-2026001')
      || digitalEmployees.find((e) => e.id !== SCHEDULE_ASSISTANT_ID)
      || digitalEmployees[0];
    let cronLabel = '每天 09:00';
    let cron = '0 9 * * *';
    if (/每天.*8|早上.?8|早8/.test(text)) {
      cronLabel = '每天 08:00';
      cron = '0 8 * * *';
    } else if (/每天.*6|早6|凌晨.?6/.test(text)) {
      cronLabel = '每天 06:00';
      cron = '0 6 * * *';
    } else if (/每周一/.test(text)) {
      cronLabel = '每周一 09:00';
      cron = '0 9 * * 1';
    } else if (/每月1|每月一/.test(text)) {
      cronLabel = '每月1日 09:00';
      cron = '0 9 1 * *';
    } else if (/每周五/.test(text)) {
      cronLabel = '每周五 17:00';
      cron = '0 17 * * 5';
    }

    let name = '对话创建定时任务';
    if (text.includes('工单')) name = '每日客户工单处理';
    else if (text.includes('周报')) name = '周报自动生成';
    else if (text.includes('报销')) name = '月度报销检查';
    else if (text.includes('巡检') || text.includes('数据质量')) name = '数据质量巡检';
    else {
      const short = text.replace(/帮我|创建|一个|定时任务|任务/g, '').trim();
      if (short.length >= 4 && short.length <= 24) name = short;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextRun = `${tomorrow.toISOString().slice(0, 10)} ${cronLabel.includes('08:00') ? '08:00' : cronLabel.includes('06:00') ? '06:00' : cronLabel.includes('17:00') ? '17:00' : '09:00'}`;

    const today = new Date().toISOString().slice(0, 10);
    return {
      id: `ST${String(scheduleList.length + 1).padStart(3, '0')}`,
      name,
      employeeId: matchedEmp.id,
      employeeName: matchedEmp.name,
      cron,
      cronLabel,
      enabled: true,
      nextRun,
      description: text.slice(0, 80),
      effectiveFrom: today,
    };
  };

  const handleSend = () => {
    if (!inputValue.trim() || loading || !activeEmployeeId || !selectedEmployee) return;
    const userText = inputValue.trim();
    const userMsg: ChatMsg = {
      id: genMsgId(),
      role: 'user',
      content: userText,
      time: new Date().toLocaleTimeString(),
    };
    setChatHistories((prev) => ({
      ...prev,
      [activeEmployeeId]: [...(prev[activeEmployeeId] || []), userMsg],
    }));
    setInputValue('');
    setLoading(true);

    const empId = activeEmployeeId;
    const flags = getEmployeeFeatureFlags(selectedEmployee);

    if (isCreateScheduleIntent) {
      setTimeout(() => {
        const task = buildScheduleFromText(userText);
        persistCreatedScheduledTask(task);
        setScheduleList((prev) => [task, ...prev.filter((t) => t.id !== task.id)]);
        const reply = [
          '已根据您的描述创建定时任务，配置如下：',
          '',
          `**任务名称**：${task.name}`,
          `**执行专家**：${task.employeeName}${scheduleSummonedExpert ? '（已召唤选中）' : ''}`,
          `**执行频率**：${task.cronLabel}`,
          `**Cron**：\`${task.cron}\``,
          `**生效日期**：${task.effectiveFrom || '-'}${task.effectiveTo ? ` ~ ${task.effectiveTo}` : ' 起'}`,
          `**下次执行**：${task.nextRun}`,
          `**状态**：已启用`,
          '',
          '任务已生效。您可返回「定时任务」页面查看与管理，或继续告诉我其他需要创建的定时任务。',
        ].join('\n');
        setChatHistories((prev) => ({
          ...prev,
          [empId]: [...(prev[empId] || []), {
            id: genMsgId(),
            role: 'assistant',
            content: reply,
            time: new Date().toLocaleTimeString(),
          }],
        }));
        message.success(`定时任务「${task.name}」已创建`);
        setLoading(false);
      }, 900);
      return;
    }

    if (flags.thinkTank) {
      setRetrieving(true);
      setRetrievingFiles(mockRetrievalFiles.slice(0, 2));
    }

    setTimeout(() => {
      const resp = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const emp = digitalEmployees.find((e) => e.id === empId);
      const usedSkills = flags.skill && emp
        ? emp.skills.slice(0, Math.floor(Math.random() * 2) + 1)
        : [];
      const retrieved = flags.thinkTank ? mockRetrievalFiles.slice(0, 4) : undefined;
      const recalled = flags.thinkTank
        ? mockRetrievalFiles.slice(0, 1 + Math.floor(Math.random() * 2))
        : undefined;
      setChatHistories((prev) => ({
        ...prev,
        [empId]: [...(prev[empId] || []), {
          id: genMsgId(),
          role: 'assistant',
          content: resp + (deepThinkingOn ? '\n\n（已启用深度思考）' : '') + (webSearchOn ? '\n\n（已参考联网搜索结果）' : ''),
          time: new Date().toLocaleTimeString(),
          usedSkills: usedSkills.length ? usedSkills : undefined,
          retrievedFiles: retrieved,
          recalledFiles: recalled,
        }],
      }));
      setRetrieving(false);
      setRetrievingFiles([]);
      setLoading(false);
    }, 1200 + Math.random() * 600);
  };

  const applyMessageFeedback = (
    empId: string,
    msgId: string,
    feedback: 'like' | 'dislike' | null,
    reason?: string,
  ) => {
    setChatHistories((prev) => ({
      ...prev,
      [empId]: (prev[empId] || []).map((m) =>
        m.id === msgId
          ? { ...m, feedback, feedbackReason: reason }
          : m,
      ),
    }));
  };

  const handleLike = (empId: string, msg: ChatMsg) => {
    const next = msg.feedback === 'like' ? null : 'like';
    applyMessageFeedback(empId, msg.id, next);
    if (next === 'like') message.success('感谢反馈，已记录点赞（对齐数字人统一反馈入湖）');
  };

  const openDislike = (empId: string, msg: ChatMsg) => {
    if (msg.feedback === 'dislike') {
      applyMessageFeedback(empId, msg.id, null);
      return;
    }
    setDislikeMsgKey({ empId, msgId: msg.id });
    dislikeForm.resetFields();
    setDislikeVisible(true);
  };

  const submitDislike = () => {
    dislikeForm.validateFields().then((values) => {
      if (!dislikeMsgKey) return;
      applyMessageFeedback(
        dislikeMsgKey.empId,
        dislikeMsgKey.msgId,
        'dislike',
        values.reasonCode,
      );
      message.success('已提交点踩反馈，将同步至统一日志服务');
      setDislikeVisible(false);
      setDislikeMsgKey(null);
    });
  };

  const handleFeedbackSubmit = () => {
    feedbackForm.validateFields().then(() => {
      message.success('感谢您的反馈，我们会尽快处理！');
      feedbackForm.resetFields();
      setFeedbackVisible(false);
    });
  };

  const empTasks = selectedEmployee ? tasks.filter((t) => t.assignee === selectedEmployee.id) : [];
  const empSkills = selectedEmployee ? skills.filter((s) => selectedEmployee.skillIds.includes(s.id)) : [];
  const empKnowledge = selectedEmployee ? knowledgeBases.filter((kb) => selectedEmployee.knowledgeIds.includes(kb.id)) : [];

  const summonFilteredEmployees = useMemo(() => {
    if (!summonSearch) return digitalEmployees;
    const q = summonSearch.toLowerCase();
    return digitalEmployees.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  }, [summonSearch]);

  const selectedNodeEmployees = useMemo(() => {
    if (!selectedTreeNode) return [];
    if (contactsTab === 'dept') {
      const dept = filteredDepts.find((d) => d.key === selectedTreeNode);
      return dept?.employees || [];
    }
    const pos = filteredPositions.find((p) => p.key === selectedTreeNode);
    return pos?.employees || [];
  }, [selectedTreeNode, contactsTab, filteredDepts, filteredPositions]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: '#f5f5f5' }}>
      {/* Left Panel - Conversation List (hidden in new conversation mode from user layout) */}
      {!isNewConversationMode && (
      <div style={{
        width: 280, background: '#fff', borderRight: '1px solid #f0f0f0',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{
          padding: '16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0',
        }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>消息</span>
          <Space size={8}>
            <Tooltip title="员工通讯录">
              <PlusOutlined
                style={{ fontSize: 16, color: '#999', cursor: 'pointer' }}
                onClick={() => setContactsVisible(true)}
              />
            </Tooltip>
            <SearchOutlined style={{ fontSize: 16, color: '#999', cursor: 'pointer' }} />
          </Space>
        </div>

        <div style={{ padding: '8px 12px' }}>
          <Input
            placeholder="搜索对话..."
            prefix={<SearchOutlined />}
            value={convSearchText}
            onChange={(e) => setConvSearchText(e.target.value)}
            allowClear
            size="small"
            style={{ borderRadius: 8 }}
          />
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {filteredConversations.map((conv) => {
            const emp = digitalEmployees.find((e) => e.id === conv.employeeId);
            if (!emp) return null;
            const isSelected = selectedConvId === conv.employeeId;
            return (
              <div
                key={conv.employeeId}
                onClick={() => handleSelectConversation(conv)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', cursor: 'pointer',
                  background: isSelected ? '#e6f4ff' : 'transparent',
                  borderLeft: isSelected ? '3px solid #1677ff' : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#fafafa'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <Badge dot color={statusColor[emp.status]} offset={[-2, 32]}>
                  <Avatar
                    size={40}
                    src={emp.avatar}
                    style={{ flexShrink: 0 }}
                  />
                </Badge>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{emp.name}</span>
                    <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>{conv.lastTime}</span>
                  </div>
                  <div style={{
                    fontSize: 12, color: '#999', marginTop: 3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {conv.lastMessage}
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge count={conv.unreadCount} size="small" style={{ flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Right Panel - Chat Area */}
      {!activeEmployeeId || !selectedEmployee ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {/* Welcome Interface */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: isUserLayout ? '#e4393c' : '#1677ff', marginBottom: 4, lineHeight: 1.2 }}>
                Hi
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: isUserLayout ? '#e4393c' : '#1677ff', marginBottom: 8 }}>
                {isUserLayout ? '我是天翼云数字人' : '我是您的AI数字员工'}
              </div>
              <div style={{ fontSize: 15, color: '#666' }}>{isUserLayout ? '请问有什么可以帮您的吗？' : '请选择一位数字员工开始对话吧'}</div>
            </div>

            {/* Suggested Questions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 32, maxWidth: 700 }}>
              {(selectedEmployee && featureFlags.suggestedQuestions
                ? displaySuggestedQuestions
                : !selectedEmployee
                  ? (isUserLayout
                    ? ['要如何销售？', '公司对于软考有什么政策', '天翼云科技公司英文名称', '部门业务通知单 与 工作联系单 的区别']
                    : quickActions)
                  : []
              ).map((q) => (
                <div
                  key={q}
                  onClick={() => setInputValue(q)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, border: '1px solid #e8e8e8',
                    background: '#fff', fontSize: 14, color: '#333', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1677ff'; e.currentTarget.style.color = '#1677ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.color = '#333'; }}
                >
                  {q}
                </div>
              ))}
              {(!selectedEmployee || featureFlags.suggestedQuestions) && (
                <div
                  style={{ padding: '8px 16px', fontSize: 14, color: '#1677ff', cursor: 'pointer' }}
                  onClick={() => setSuggestBatch((b) => b + 1)}
                >
                  ↻ 换一换
                </div>
              )}
            </div>

            {/* Input Area — 对齐数字人门户对话框 */}
            <div style={{ width: '100%', maxWidth: 720, marginBottom: 24 }}>
              <ChatInputComposer
                value={inputValue}
                onChange={setInputValue}
                onSend={() => {
                  if (!inputValue.trim()) return;
                  if (!selectedEmployee) {
                    setSummonEmployeeVisible(true);
                    return;
                  }
                  handleSend();
                }}
                placeholder={
                  isUserLayout
                    ? '向天翼云数字人提问，例如：如何修改 OA 密码？公文格式规范有哪些？'
                    : '请输入指令或问题和我对话吧'
                }
                featureFlags={null}
                showAllWhenNoFlags
                onSummonEmployee={() => setSummonEmployeeVisible(true)}
                summonLabel={isUserLayout ? '切换专家' : '选择数字员工'}
              />
            </div>
          </div>

          {/* Bottom Shortcuts */}
          <div style={{
            borderTop: '1px solid #f0f0f0', padding: '12px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            {isUserLayout ? (
              <>
                {[
                  { icon: '🎯', name: '惠企优才' },
                  { icon: '📖', name: '企业知识问答' },
                  { icon: '📊', name: '数据运营智能体' },
                  { icon: '💰', name: '价值经营' },
                  { icon: '✍️', name: '办公写作助手' },
                ].map((agent) => (
                  <Button
                    key={agent.name}
                    type="text"
                    style={{ borderRadius: 8, fontSize: 13, color: '#333', border: '1px solid #f0f0f0', padding: '4px 12px', height: 32 }}
                  >
                    {agent.icon} {agent.name}
                  </Button>
                ))}
                <Button
                  type="text"
                  style={{ borderRadius: 8, fontSize: 13, color: '#333', border: '1px solid #f0f0f0', padding: '4px 12px', height: 32 }}
                >
                  <RobotOutlined /> 更多
                </Button>
              </>
            ) : (
              <>
                {digitalEmployees.filter(e => e.status === 'ACTIVE').slice(0, 5).map((emp) => (
                  <Button
                    key={emp.id}
                    type="text"
                    style={{ borderRadius: 8, fontSize: 13, color: '#333', border: '1px solid #f0f0f0', padding: '4px 12px', height: 32 }}
                    onClick={() => startChatWithEmployee(emp.id)}
                  >
                    <RobotOutlined /> {emp.name}
                  </Button>
                ))}
                <Button
                  type="text"
                  style={{ borderRadius: 8, fontSize: 13, color: '#333', border: '1px solid #f0f0f0', padding: '4px 12px', height: 32 }}
                  onClick={() => setSummonEmployeeVisible(true)}
                >
                  <RobotOutlined /> 更多
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top Bar */}
          <div style={{
            background: '#fff', padding: '10px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge dot color={statusColor[selectedEmployee.status]} offset={[-2, 32]}>
                <Avatar size={36} src={selectedEmployee.avatar} icon={<RobotOutlined />} />
              </Badge>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedEmployee.name}</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {selectedEmployee.department} · <span style={{ color: statusColor[selectedEmployee.status] }}>{statusLabel[selectedEmployee.status]}</span>
                </div>
              </div>
            </div>
            <Space>
              <Tooltip title="意见反馈">
                <Button
                  type="text"
                  icon={<MessageOutlined />}
                  onClick={() => {
                    if (selectedEmployee) {
                      feedbackForm.setFieldsValue({ employeeId: selectedEmployee.id });
                    }
                    setFeedbackVisible(true);
                  }}
                  style={{ color: '#8c8c8c' }}
                />
              </Tooltip>
              <Button
                type="text"
                icon={<InfoCircleOutlined />}
                onClick={() => {
                  setShowDetail(!showDetail);
                  if (!showDetail) setThirdScreenOpen(false);
                }}
                style={{ color: showDetail ? '#1677ff' : undefined }}
              >
                查看详情
              </Button>
            </Space>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Chat Messages */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
                {currentMessages.length <= 1 && featureFlags.suggestedQuestions && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ color: '#999', fontSize: 13, marginBottom: 12 }}>猜你想问：</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {displaySuggestedQuestions.map((action) => (
                        <Tag
                          key={action}
                          onClick={() => setInputValue(action)}
                          style={{
                            cursor: 'pointer', borderRadius: 16, padding: '4px 14px',
                            border: '1px solid #d9d9d9', background: '#fff', fontSize: 13,
                          }}
                        >
                          {action}
                        </Tag>
                      ))}
                      <Tag
                        onClick={() => setSuggestBatch((b) => b + 1)}
                        style={{ cursor: 'pointer', borderRadius: 16, padding: '4px 14px', color: '#1677ff', borderColor: '#1677ff' }}
                      >
                        ↻ 换一换
                      </Tag>
                    </div>
                  </div>
                )}

                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: 16, gap: 10,
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar size={32} src={selectedEmployee.avatar} style={{ flexShrink: 0 }} />
                    )}
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{
                        background: msg.role === 'user' ? '#1677ff' : '#fff',
                        color: msg.role === 'user' ? '#fff' : '#333',
                        padding: '12px 16px',
                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: 14, lineHeight: 1.7,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', whiteSpace: 'pre-wrap',
                      }}>
                        {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i}>{part.slice(2, -2)}</strong>;
                          }
                          return <span key={i}>{part}</span>;
                        })}
                      </div>

                      {msg.role === 'assistant' && msg.retrievedFiles && msg.retrievedFiles.length > 0 && (
                        <div
                          onClick={() => openThirdScreen(msg.retrievedFiles!)}
                          style={{
                            marginTop: 8, padding: '8px 12px', borderRadius: 8,
                            background: '#f0f5ff', border: '1px solid #d6e4ff',
                            cursor: 'pointer', fontSize: 12, color: '#1677ff',
                          }}
                        >
                          <SearchOutlined style={{ marginRight: 6 }} />
                          已检索 {msg.retrievedFiles.length} 个相关文件，点击查看检索结果
                        </div>
                      )}

                      {msg.role === 'assistant' && msg.recalledFiles && msg.recalledFiles.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {msg.recalledFiles.map((file) => (
                            <div
                              key={file.id}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 12px', borderRadius: 8, background: '#fff',
                                border: '1px solid #f0f0f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                              }}
                            >
                              {fileTypeIcon(file.type)}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {file.name}
                                </div>
                                <div style={{ fontSize: 11, color: '#999' }}>{file.size || file.type.toUpperCase()}</div>
                              </div>
                              <Space size={4}>
                                <Tooltip title="预览">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => openThirdScreen(msg.recalledFiles!, file)}
                                  />
                                </Tooltip>
                                <Tooltip title="下载">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<DownloadOutlined />}
                                    onClick={() => message.success(`开始下载：${file.name}`)}
                                  />
                                </Tooltip>
                              </Space>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.role === 'assistant' && msg.usedSkills && msg.usedSkills.length > 0 && (
                        <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: '#999' }}>调用技能：</span>
                          {msg.usedSkills.map((s) => (
                            <Tag key={s} color="processing" style={{ fontSize: 10, margin: 0 }}>{s}</Tag>
                          ))}
                        </div>
                      )}
                      <div style={{
                        display: 'flex', gap: 8, marginTop: 4, alignItems: 'center',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      }}>
                        <span style={{ fontSize: 11, color: '#bbb' }}>{msg.time}</span>
                        {msg.role === 'assistant' && (
                          <Space size={4}>
                            <Tooltip title="复制">
                              <CopyOutlined
                                style={{ fontSize: 12, color: '#bbb', cursor: 'pointer' }}
                                onClick={() => message.success('已复制')}
                              />
                            </Tooltip>
                            <Tooltip title="点赞">
                              <LikeOutlined
                                style={{
                                  fontSize: 12,
                                  color: msg.feedback === 'like' ? '#1677ff' : '#bbb',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleLike(activeEmployeeId, msg)}
                              />
                            </Tooltip>
                            <Tooltip title="点踩">
                              <DislikeOutlined
                                style={{
                                  fontSize: 12,
                                  color: msg.feedback === 'dislike' ? '#ff4d4f' : '#bbb',
                                  cursor: 'pointer',
                                }}
                                onClick={() => openDislike(activeEmployeeId, msg)}
                              />
                            </Tooltip>
                          </Space>
                        )}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <Avatar size={32} style={{ background: '#e4393c', flexShrink: 0 }}><UserOutlined /></Avatar>
                    )}
                  </div>
                ))}

                {(loading || retrieving) && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <Avatar size={32} src={selectedEmployee.avatar} style={{ flexShrink: 0 }} />
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{
                        background: '#fff', padding: '12px 16px',
                        borderRadius: '16px 16px 16px 4px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}>
                        {retrieving && featureFlags.thinkTank ? (
                          <div>
                            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                              <SearchOutlined style={{ marginRight: 6, color: '#1677ff' }} />
                              正在检索相关文件与知识…
                            </div>
                            {retrievingFiles.map((f) => (
                              <div key={f.id} style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                                · {f.name}
                              </div>
                            ))}
                            <a
                              style={{ fontSize: 12 }}
                              onClick={() => openThirdScreen(retrievingFiles.length ? retrievingFiles : mockRetrievalFiles)}
                            >
                              查看检索过程
                            </a>
                          </div>
                        ) : (
                          <div>
                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#999', margin: '0 2px', animation: 'blink 1.4s infinite both' }} />
                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#999', margin: '0 2px', animation: 'blink 1.4s infinite both', animationDelay: '0.2s' }} />
                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#999', margin: '0 2px', animation: 'blink 1.4s infinite both', animationDelay: '0.4s' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Bar — 对齐数字人门户对话框 */}
              <div style={{ background: '#fff', padding: '12px 20px 16px', borderTop: '1px solid #f0f0f0' }}>
                {isCreateScheduleIntent && scheduleSummonedExpert && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                    padding: '8px 12px', background: '#fff7e6', borderRadius: 8, border: '1px solid #ffd591',
                  }}>
                    <Avatar size={28} src={scheduleSummonedExpert.avatar} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        已召唤执行专家：{scheduleSummonedExpert.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {scheduleSummonedExpert.department} · {scheduleSummonedExpert.position}
                      </div>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setScheduleSummonedExpertId(null)}
                    >
                      取消选中
                    </Button>
                  </div>
                )}
                <ChatInputComposer
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSend}
                  loading={loading}
                  placeholder={
                    isCreateScheduleIntent
                      ? '描述要创建的定时任务，或先召唤执行专家…'
                      : `向${selectedEmployee.name}提问，例如：如何修改 OA 密码？公文格式规范有哪些？`
                  }
                  featureFlags={featureFlags}
                  showAllWhenNoFlags={false}
                  onSummonEmployee={() => setSummonEmployeeVisible(true)}
                  summonLabel={isCreateScheduleIntent ? '召唤专家' : '切换专家'}
                />
              </div>
            </div>

            {/* Detail Sidebar */}
            <div style={{
              width: showDetail ? 320 : 0, overflow: 'hidden',
              transition: 'width 0.3s ease', background: '#fff', borderLeft: showDetail ? '1px solid #f0f0f0' : 'none',
              flexShrink: 0,
            }}>
              <div style={{ width: 320, height: '100%', overflow: 'auto' }}>
                <div style={{
                  padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', borderBottom: '1px solid #f0f0f0',
                }}>
                  <span style={{ fontWeight: 600 }}>员工详情</span>
                  <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setShowDetail(false)} />
                </div>

                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <Avatar size={56} src={selectedEmployee.avatar} />
                  <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>{selectedEmployee.name}</div>
                  <Tag color={statusColor[selectedEmployee.status]} style={{ marginTop: 6 }}>{statusLabel[selectedEmployee.status]}</Tag>
                  <p style={{ fontSize: 12, color: '#999', marginTop: 8, lineHeight: 1.6 }}>{selectedEmployee.description}</p>
                </div>

                <Tabs
                  centered
                  size="small"
                  items={[
                    {
                      key: 'info',
                      label: '详情',
                      children: (
                        <div style={{ padding: '0 16px 16px' }}>
                          <Descriptions column={1} size="small">
                            <Descriptions.Item label="工号">
                              {selectedEmployee.employeeNumber
                                ? <span style={{ fontFamily: 'monospace' }}>{selectedEmployee.employeeNumber}</span>
                                : <span style={{ color: '#999' }}>未填写</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="所属条线">
                              {selectedEmployee.businessLine
                                ? <Tag>{selectedEmployee.businessLine}</Tag>
                                : <span style={{ color: '#999' }}>—</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="基准岗位">{selectedEmployee.position}</Descriptions.Item>
                            <Descriptions.Item label="级别">
                              {selectedEmployee.capabilityLevel
                                ? <Tag color="blue">{selectedEmployee.capabilityLevel}</Tag>
                                : <span style={{ color: '#999' }}>—</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="运营负责人">
                              {selectedEmployee.operationOwner ?? <span style={{ color: '#999' }}>—</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="业务负责人">
                              {selectedEmployee.businessOwner ?? <span style={{ color: '#999' }}>—</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="技术负责人">
                              {selectedEmployee.techOwner ?? <span style={{ color: '#999' }}>—</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="安检通过">
                              {selectedEmployee.securityPassed
                                ? <Tag color={selectedEmployee.securityPassed === '是' ? 'success' : 'error'}>{selectedEmployee.securityPassed}</Tag>
                                : <span style={{ color: '#999' }}>—</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="日志审计">
                              {selectedEmployee.logAuditCompliant
                                ? <Tag color={selectedEmployee.logAuditCompliant === '是' ? 'success' : 'error'}>{selectedEmployee.logAuditCompliant}</Tag>
                                : <span style={{ color: '#999' }}>—</span>}
                            </Descriptions.Item>
                          </Descriptions>
                          {selectedEmployee.responsibility && (
                            <>
                              <Divider style={{ margin: '12px 0' }} />
                              <div style={{ marginBottom: 6, fontWeight: 500, fontSize: 13 }}>应用职责描述</div>
                              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
                                {selectedEmployee.responsibility}
                              </div>
                            </>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'skills',
                      label: '技能',
                      children: (
                        <div style={{ padding: '0 16px 16px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                            {selectedEmployee.skills.map((s) => (
                              <Tag key={s} color="blue">{s}</Tag>
                            ))}
                          </div>
                          <List
                            size="small"
                            dataSource={empSkills}
                            renderItem={(skill) => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={<ThunderboltOutlined style={{ color: '#1677ff', fontSize: 16 }} />}
                                  title={
                                    <Space>
                                      <span style={{ fontSize: 13 }}>{skill.name}</span>
                                      <Tag color="blue" style={{ fontSize: 10 }}>{skill.level}</Tag>
                                    </Space>
                                  }
                                  description={<span style={{ fontSize: 12 }}>{skill.description}</span>}
                                />
                              </List.Item>
                            )}
                            locale={{ emptyText: '暂无技能' }}
                          />
                        </div>
                      ),
                    },
                    {
                      key: 'knowledge',
                      label: '知识',
                      children: (
                        <div style={{ padding: '0 16px 16px' }}>
                          <List
                            size="small"
                            dataSource={empKnowledge}
                            renderItem={(kb) => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={typeIcon[kb.type]}
                                  title={
                                    <Space>
                                      <span style={{ fontSize: 13 }}>{kb.name}</span>
                                      <Tag color={kb.status === '已发布' ? 'success' : kb.status === '学习中' ? 'processing' : 'warning'} style={{ fontSize: 10 }}>
                                        {kb.status}
                                      </Tag>
                                    </Space>
                                  }
                                  description={
                                    <div style={{ fontSize: 12 }}>
                                      <div>{kb.description}</div>
                                      <span style={{ color: '#1677ff' }}>{kb.docCount} 篇文档</span>
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                            locale={{ emptyText: '暂未关联知识' }}
                          />
                        </div>
                      ),
                    },
                    {
                      key: 'tasks',
                      label: '任务',
                      children: (
                        <div style={{ padding: '0 16px 16px' }}>
                          <List
                            size="small"
                            dataSource={empTasks}
                            renderItem={(task) => (
                              <List.Item>
                                <List.Item.Meta
                                  title={<span style={{ fontSize: 13 }}>{task.title}</span>}
                                  description={
                                    <div style={{ fontSize: 12 }}>
                                      <Tag
                                        color={task.status === '已完成' ? 'success' : task.status === '执行中' ? 'processing' : task.status === '已失败' ? 'error' : 'default'}
                                        style={{ fontSize: 11 }}
                                      >
                                        {task.status}
                                      </Tag>
                                      <span style={{ color: '#999' }}>{task.createTime}</span>
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                            locale={{ emptyText: '暂无任务' }}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>

            <ThirdScreenPanel
              open={thirdScreenOpen}
              files={thirdScreenFiles}
              previewFile={previewFile}
              onClose={() => { setThirdScreenOpen(false); setPreviewFile(null); }}
              onPreview={(file) => setPreviewFile(file)}
              onBackToList={() => setPreviewFile(null)}
            />
          </div>
        </div>
      )}

      {/* Contacts Modal */}
      <Modal
        title={<span><ContactsOutlined style={{ marginRight: 8 }} />员工通讯录</span>}
        open={contactsVisible}
        onCancel={() => { setContactsVisible(false); setSelectedTreeNode(''); }}
        footer={null}
        width={900}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', height: 520 }}>
          {/* Left Panel - Tree */}
          <div style={{ width: 300, flexShrink: 0, background: '#fafafa', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 12px 8px' }}>
              <Input
                placeholder="搜索员工名称/岗位..."
                prefix={<SearchOutlined />}
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                allowClear
                size="small"
                style={{ borderRadius: 8 }}
              />
            </div>
            <Tabs
              activeKey={contactsTab}
              onChange={(key) => { setContactsTab(key); setSelectedTreeNode(''); }}
              size="small"
              style={{ padding: '0 12px' }}
              items={[
                { key: 'dept', label: <span><TeamOutlined /> 按部门</span> },
                { key: 'position', label: <span><ApartmentOutlined /> 按岗位</span> },
              ]}
            />
            <div style={{ flex: 1, overflow: 'auto', padding: '0 4px' }}>
              {contactsTab === 'dept' ? (
                <>
                  <div
                    style={{
                      padding: '8px 12px', fontWeight: 600, fontSize: 13, display: 'flex',
                      alignItems: 'center', gap: 6, color: '#333',
                    }}
                  >
                    <TeamOutlined style={{ color: '#1677ff' }} />
                    天翼云数字员工
                    <Tag style={{ fontSize: 11, marginLeft: 4 }}>{digitalEmployees.length}</Tag>
                  </div>
                  {filteredDepts.map((dept) => (
                    <div
                      key={dept.key}
                      onClick={() => setSelectedTreeNode(dept.key)}
                      style={{
                        padding: '8px 12px 8px 24px', display: 'flex', alignItems: 'center', gap: 8,
                        cursor: 'pointer', borderRadius: 6, margin: '1px 4px',
                        background: selectedTreeNode === dept.key ? '#e6f4ff' : 'transparent',
                        fontWeight: selectedTreeNode === dept.key ? 500 : 400,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => { if (selectedTreeNode !== dept.key) e.currentTarget.style.background = '#f0f0f0'; }}
                      onMouseLeave={(e) => { if (selectedTreeNode !== dept.key) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <ApartmentOutlined style={{ color: selectedTreeNode === dept.key ? '#1677ff' : '#666', fontSize: 14 }} />
                      <span style={{ flex: 1 }}>{dept.name}</span>
                      <span style={{ fontSize: 11, color: '#999' }}>{dept.employees.length}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {filteredPositions.map((pos) => (
                    <div
                      key={pos.key}
                      onClick={() => setSelectedTreeNode(pos.key)}
                      style={{
                        padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
                        cursor: 'pointer', borderRadius: 6, margin: '1px 4px',
                        background: selectedTreeNode === pos.key ? '#e6f4ff' : 'transparent',
                        fontWeight: selectedTreeNode === pos.key ? 500 : 400,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => { if (selectedTreeNode !== pos.key) e.currentTarget.style.background = '#f0f0f0'; }}
                      onMouseLeave={(e) => { if (selectedTreeNode !== pos.key) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <ApartmentOutlined style={{ color: selectedTreeNode === pos.key ? '#1677ff' : '#666', fontSize: 14 }} />
                      <span style={{ flex: 1 }}>{pos.name}</span>
                      <Tag style={{ fontSize: 10, margin: 0 }}>{pos.department}</Tag>
                      <span style={{ fontSize: 11, color: '#999' }}>{pos.employees.length}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Employee Cards */}
          <div style={{ flex: 1, overflow: 'auto', padding: 16, background: '#fff' }}>
            {!selectedTreeNode ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty
                  image={<TeamOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
                  description={<span style={{ color: '#999' }}>请从左侧选择部门或岗位</span>}
                />
              </div>
            ) : selectedNodeEmployees.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="该分类下暂无员工" />
              </div>
            ) : (
              <Row gutter={[12, 12]}>
                {selectedNodeEmployees.map((emp) => (
                  <Col key={emp.id} span={12}>
                    <Card
                      size="small"
                      hoverable
                      style={{ borderRadius: 8 }}
                      styles={{ body: { padding: '12px 16px' } }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Badge dot color={statusColor[emp.status]} offset={[-2, 32]}>
                          <Avatar
                            size={40}
                            src={emp.avatar}
                            style={{ flexShrink: 0 }}
                          />
                        </Badge>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</span>
                            <Tag
                              color={statusColor[emp.status]}
                              style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0, borderRadius: 4 }}
                            >
                              {statusLabel[emp.status]}
                            </Tag>
                          </div>
                          <div style={{ fontSize: 12, color: '#999', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {emp.department} · {emp.position}
                          </div>
                        </div>
                        <Button
                          type="primary"
                          size="small"
                          style={{ borderRadius: 6, flexShrink: 0 }}
                          onClick={() => startChatWithEmployee(emp.id)}
                        >
                          发起对话
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        title="意见反馈"
        open={feedbackVisible}
        onOk={handleFeedbackSubmit}
        onCancel={() => { feedbackForm.resetFields(); setFeedbackVisible(false); }}
        okText="提交反馈"
        width={520}
      >
        <Form form={feedbackForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="反馈标题" rules={[{ required: true, message: '请输入反馈标题' }]}>
            <Input placeholder="请简要描述您的反馈" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="反馈类型" rules={[{ required: true, message: '请选择反馈类型' }]}>
                <Select placeholder="选择类型" options={[
                  { label: '功能建议', value: '功能建议' },
                  { label: '体验问题', value: '体验问题' },
                  { label: '错误反馈', value: '错误反馈' },
                  { label: '其他', value: '其他' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="优先级" initialValue="中">
                <Select options={[
                  { label: '高', value: '高' },
                  { label: '中', value: '中' },
                  { label: '低', value: '低' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="employeeId" label="关联数字员工">
            <Select
              placeholder="选择相关员工（可选）"
              allowClear
              options={digitalEmployees.map((e) => ({ label: `${e.name} (${e.department})`, value: e.id }))}
            />
          </Form.Item>
          <Form.Item name="content" label="详细描述" rules={[{ required: true, message: '请输入详细描述' }]}>
            <Input.TextArea rows={4} placeholder="请描述您遇到的问题或建议..." />
          </Form.Item>
          <Form.Item name="screenshots" label="上传截图" valuePropName="fileList" getValueFromEvent={(e: any) => Array.isArray(e) ? e : e?.fileList}>
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              maxCount={3}
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 4, fontSize: 12 }}>上传截图</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Summon Digital Employee Modal */}
      <Modal
        title={
          <span>
            <RobotOutlined style={{ marginRight: 8 }} />
            {isCreateScheduleIntent ? '召唤专家（选择执行员工）' : '选择数字员工'}
          </span>
        }
        open={summonEmployeeVisible}
        onCancel={() => { setSummonEmployeeVisible(false); setSummonSearch(''); }}
        footer={null}
        width={800}
        styles={{ body: { padding: '16px 24px' } }}
      >
        {isCreateScheduleIntent && (
          <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
            选中专家后仍停留在定时任务助手对话中，该专家将作为任务的执行员工。
          </div>
        )}
        <Input
          placeholder="搜索数字员工名称、岗位、部门..."
          prefix={<SearchOutlined />}
          value={summonSearch}
          onChange={(e) => setSummonSearch(e.target.value)}
          allowClear
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
        <div style={{ maxHeight: 460, overflow: 'auto' }}>
          <Row gutter={[12, 12]}>
            {(isCreateScheduleIntent
              ? summonFilteredEmployees.filter((e) => e.id !== SCHEDULE_ASSISTANT_ID)
              : summonFilteredEmployees
            ).map((emp) => (
              <Col key={emp.id} xs={24} sm={12} md={8}>
                <Card
                  size="small"
                  hoverable
                  style={{
                    borderRadius: 10,
                    borderColor: isCreateScheduleIntent && scheduleSummonedExpertId === emp.id
                      ? '#e4393c'
                      : undefined,
                    background: isCreateScheduleIntent && scheduleSummonedExpertId === emp.id
                      ? '#fff1f0'
                      : undefined,
                  }}
                  styles={{ body: { padding: '14px 16px' } }}
                  onClick={() => {
                    if (isCreateScheduleIntent) {
                      setScheduleSummonedExpertId(emp.id);
                      message.success(`已选中执行专家：${emp.name}`);
                      setSummonEmployeeVisible(false);
                      setSummonSearch('');
                      return;
                    }
                    startChatWithEmployee(emp.id);
                    setSummonEmployeeVisible(false);
                    setSummonSearch('');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge dot color={empStatusColor[emp.status]} offset={[-2, 32]}>
                      <Avatar size={40} src={emp.avatar} style={{ flexShrink: 0 }} />
                    </Badge>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</span>
                        <Tag
                          color={empStatusColor[emp.status]}
                          style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0, borderRadius: 4 }}
                        >
                          {empStatusLabel[emp.status]}
                        </Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IdcardOutlined style={{ fontSize: 11 }} />
                        {emp.department} · {emp.position}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
            {(isCreateScheduleIntent
              ? summonFilteredEmployees.filter((e) => e.id !== SCHEDULE_ASSISTANT_ID)
              : summonFilteredEmployees
            ).length === 0 && (
              <Col span={24}>
                <Empty description="暂无匹配的数字员工" style={{ padding: 40 }} />
              </Col>
            )}
          </Row>
        </div>
      </Modal>

      {/* Unified dislike feedback (aligned with digital human) */}
      <Modal
        title="点踩反馈"
        open={dislikeVisible}
        onOk={submitDislike}
        onCancel={() => { setDislikeVisible(false); setDislikeMsgKey(null); }}
        okText="提交"
        width={440}
      >
        <p style={{ color: '#666', marginBottom: 16 }}>请选择不满意的原因，反馈将按数字人统一规范写入日志服务：</p>
        <Form form={dislikeForm} layout="vertical">
          <Form.Item name="reasonCode" label="原因" rules={[{ required: true, message: '请选择原因' }]}>
            <Select
              placeholder="请选择"
              optionLabelProp="label"
              options={DISLIKE_REASON_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
                title: o.description,
              }))}
              optionRender={(option) => {
                const item = DISLIKE_REASON_OPTIONS.find((o) => o.value === option.value);
                return (
                  <div style={{ padding: '2px 0' }}>
                    <div style={{ fontWeight: 500 }}>{option.label}</div>
                    {item && (
                      <div style={{ fontSize: 12, color: '#999', lineHeight: 1.4, whiteSpace: 'normal' }}>
                        {item.description}
                      </div>
                    )}
                  </div>
                );
              }}
              listHeight={360}
            />
          </Form.Item>
          <Form.Item name="reasonText" label="补充说明">
            <Input.TextArea rows={3} placeholder="可选，补充更多细节" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChatPage;
