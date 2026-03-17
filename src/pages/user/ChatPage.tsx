import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Avatar, Tag, Button, Input, Tooltip, Badge, Space, Empty,
  Descriptions, Tabs, List, Progress, Divider, message, Modal,
  Card, Switch, Form, Select, Row, Col,
} from 'antd';
import {
  SendOutlined, SearchOutlined, InfoCircleOutlined,
  PaperClipOutlined, AudioOutlined, LikeOutlined,
  DislikeOutlined, CopyOutlined, RobotOutlined,
  UserOutlined, ThunderboltOutlined, BookOutlined,
  CloseOutlined, DatabaseOutlined, FileTextOutlined,
  PlusOutlined, ContactsOutlined, ClockCircleOutlined,
  ScheduleOutlined, TeamOutlined, ApartmentOutlined,
} from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  digitalEmployees, conversations, tasks, skills, knowledgeBases,
  scheduledTasks, positions,
  type ConversationItem, type ScheduledTask,
} from '../../mock/data';

const { TextArea } = Input;

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  time: string;
  usedSkills?: string[];
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

const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialEmployeeId = searchParams.get('employeeId') || '';

  const [selectedConvId, setSelectedConvId] = useState<string>(initialEmployeeId);
  const [convSearchText, setConvSearchText] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMsg[]>>({});
  const [activeConvIds, setActiveConvIds] = useState<string[]>(conversations.map((c) => c.employeeId));
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [contactsVisible, setContactsVisible] = useState(false);
  const [contactsTab, setContactsTab] = useState('dept');
  const [contactSearch, setContactSearch] = useState('');
  const [selectedTreeNode, setSelectedTreeNode] = useState('');

  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [scheduleList, setScheduleList] = useState(scheduledTasks);
  const [addScheduleVisible, setAddScheduleVisible] = useState(false);
  const [scheduleForm] = Form.useForm();

  useEffect(() => {
    if (initialEmployeeId && !activeConvIds.includes(initialEmployeeId)) {
      setActiveConvIds((prev) => [initialEmployeeId, ...prev]);
    }
  }, [initialEmployeeId]);

  const selectedEmployee = useMemo(
    () => digitalEmployees.find((e) => e.id === selectedConvId) || null,
    [selectedConvId],
  );

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
    return chatHistories[selectedConvId] || [];
  }, [chatHistories, selectedConvId]);

  useEffect(() => {
    if (selectedConvId && selectedEmployee && !chatHistories[selectedConvId]) {
      setChatHistories((prev) => ({
        ...prev,
        [selectedConvId]: [{
          role: 'assistant',
          content: `您好！我是 **${selectedEmployee.name}**，${selectedEmployee.description}\n\n请问有什么可以帮您？`,
          time: new Date().toLocaleTimeString(),
        }],
      }));
    }
  }, [selectedConvId, selectedEmployee, chatHistories]);

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

  const handleSend = () => {
    if (!inputValue.trim() || loading || !selectedConvId || !selectedEmployee) return;
    const userMsg: ChatMsg = {
      role: 'user',
      content: inputValue.trim(),
      time: new Date().toLocaleTimeString(),
    };
    setChatHistories((prev) => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), userMsg],
    }));
    setInputValue('');
    setLoading(true);

    const empId = selectedConvId;
    setTimeout(() => {
      const resp = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const emp = digitalEmployees.find((e) => e.id === empId);
      const usedSkills = emp ? emp.skills.slice(0, Math.floor(Math.random() * 2) + 1) : [];
      setChatHistories((prev) => ({
        ...prev,
        [empId]: [...(prev[empId] || []), {
          role: 'assistant',
          content: resp,
          time: new Date().toLocaleTimeString(),
          usedSkills,
        }],
      }));
      setLoading(false);
    }, 1000 + Math.random() * 500);
  };

  const toggleSchedule = (id: string) => {
    setScheduleList((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
    message.success('定时任务状态已更新');
  };

  const addSchedule = () => {
    scheduleForm.validateFields().then((values) => {
      const newTask: ScheduledTask = {
        id: `ST${String(scheduleList.length + 1).padStart(3, '0')}`,
        name: values.name,
        employeeId: values.employeeId,
        employeeName: digitalEmployees.find((e) => e.id === values.employeeId)?.name || '',
        cron: values.cron,
        cronLabel: values.cronLabel,
        enabled: true,
        nextRun: '待计算',
        description: values.description || '',
      };
      setScheduleList((prev) => [...prev, newTask]);
      message.success('定时任务已创建');
      setAddScheduleVisible(false);
      scheduleForm.resetFields();
    });
  };

  const empTasks = selectedEmployee ? tasks.filter((t) => t.assignee === selectedEmployee.id) : [];
  const empSkills = selectedEmployee ? skills.filter((s) => selectedEmployee.skillIds.includes(s.id)) : [];
  const empKnowledge = selectedEmployee ? knowledgeBases.filter((kb) => selectedEmployee.knowledgeIds.includes(kb.id)) : [];

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
      {/* Left Panel - Conversation List */}
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
            <Tooltip title="定时任务">
              <ScheduleOutlined
                style={{ fontSize: 16, color: '#999', cursor: 'pointer' }}
                onClick={() => setScheduleVisible(true)}
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
                    style={{
                      background: emp.status === 'ACTIVE' ? '#1677ff' : emp.status === 'TRAINING' ? '#722ed1' : '#999',
                      fontWeight: 600, fontSize: 14, flexShrink: 0,
                    }}
                  >
                    {emp.avatar}
                  </Avatar>
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

      {/* Right Panel - Chat Area */}
      {!selectedConvId || !selectedEmployee ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
          <Empty
            image={<RobotOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description={<span style={{ color: '#999', fontSize: 15 }}>选择一个对话开始聊天</span>}
          />
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
                <Avatar size={36} style={{ background: '#1677ff', fontWeight: 600 }}>{selectedEmployee.avatar}</Avatar>
              </Badge>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedEmployee.name}</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {selectedEmployee.department} · <span style={{ color: statusColor[selectedEmployee.status] }}>{statusLabel[selectedEmployee.status]}</span>
                </div>
              </div>
            </div>
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => setShowDetail(!showDetail)}
              style={{ color: showDetail ? '#1677ff' : undefined }}
            >
              查看详情
            </Button>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Chat Messages */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
                {currentMessages.length <= 1 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ color: '#999', fontSize: 13, marginBottom: 12 }}>快捷操作：</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {quickActions.map((action) => (
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
                    </div>
                  </div>
                )}

                {currentMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: 16, gap: 10,
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar size={32} style={{ background: '#1677ff', flexShrink: 0 }}><RobotOutlined /></Avatar>
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
                            <Tooltip title="复制"><CopyOutlined style={{ fontSize: 12, color: '#bbb', cursor: 'pointer' }} onClick={() => message.success('已复制')} /></Tooltip>
                            <Tooltip title="点赞"><LikeOutlined style={{ fontSize: 12, color: '#bbb', cursor: 'pointer' }} /></Tooltip>
                            <Tooltip title="不满意"><DislikeOutlined style={{ fontSize: 12, color: '#bbb', cursor: 'pointer' }} /></Tooltip>
                          </Space>
                        )}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <Avatar size={32} style={{ background: '#e4393c', flexShrink: 0 }}><UserOutlined /></Avatar>
                    )}
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <Avatar size={32} style={{ background: '#1677ff', flexShrink: 0 }}><RobotOutlined /></Avatar>
                    <div style={{
                      background: '#fff', padding: '12px 16px',
                      borderRadius: '16px 16px 16px 4px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}>
                      <div>
                        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#999', margin: '0 2px', animation: 'blink 1.4s infinite both' }} />
                        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#999', margin: '0 2px', animation: 'blink 1.4s infinite both', animationDelay: '0.2s' }} />
                        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#999', margin: '0 2px', animation: 'blink 1.4s infinite both', animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Bar */}
              <div style={{ background: '#fff', padding: '12px 20px 16px', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <Tooltip title="上传文件"><Button type="text" icon={<PaperClipOutlined />} /></Tooltip>
                  <TextArea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={`向 ${selectedEmployee.name} 发送消息...`}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    style={{ borderRadius: 8, resize: 'none' }}
                  />
                  <Tooltip title="语音输入"><Button type="text" icon={<AudioOutlined />} /></Tooltip>
                  <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} style={{ borderRadius: 8 }} />
                </div>
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
                  <Avatar size={56} style={{ background: '#1677ff', fontSize: 22, fontWeight: 600 }}>{selectedEmployee.avatar}</Avatar>
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
                            <Descriptions.Item label="工号">{selectedEmployee.id}</Descriptions.Item>
                            <Descriptions.Item label="部门">{selectedEmployee.department}</Descriptions.Item>
                            <Descriptions.Item label="岗位">{selectedEmployee.position}</Descriptions.Item>
                            <Descriptions.Item label="职级"><Tag color="blue">{selectedEmployee.level}</Tag></Descriptions.Item>
                            <Descriptions.Item label="归属人">{selectedEmployee.owner} ({selectedEmployee.ownerType})</Descriptions.Item>
                            <Descriptions.Item label="入职日期">{selectedEmployee.onboardDate}</Descriptions.Item>
                          </Descriptions>
                          <Divider style={{ margin: '12px 0' }} />
                          <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 13 }}>Tokens 使用</div>
                          <Progress
                            percent={Math.round((selectedEmployee.tokensUsed / selectedEmployee.tokensQuota) * 100)}
                            status={selectedEmployee.tokensUsed / selectedEmployee.tokensQuota > 0.8 ? 'exception' : 'active'}
                            format={(p) => `${p}%`}
                          />
                          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                            {(selectedEmployee.tokensUsed / 1000000).toFixed(1)}M / {(selectedEmployee.tokensQuota / 1000000).toFixed(1)}M
                          </div>
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
                            style={{
                              background: emp.status === 'ACTIVE' ? '#1677ff' : emp.status === 'TRAINING' ? '#722ed1' : '#999',
                              fontWeight: 600, fontSize: 14, flexShrink: 0,
                            }}
                          >
                            {emp.avatar}
                          </Avatar>
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

      {/* Scheduled Tasks Modal */}
      <Modal
        title={<span><ScheduleOutlined style={{ marginRight: 8 }} />定时任务</span>}
        open={scheduleVisible}
        onCancel={() => setScheduleVisible(false)}
        footer={null}
        width={650}
      >
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddScheduleVisible(true)}>新建定时任务</Button>
        </div>
        <List
          dataSource={scheduleList}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Switch
                  key="switch"
                  checked={item.enabled}
                  onChange={() => toggleSchedule(item.id)}
                  size="small"
                />,
              ]}
            >
              <List.Item.Meta
                avatar={<ClockCircleOutlined style={{ fontSize: 20, color: item.enabled ? '#1677ff' : '#999' }} />}
                title={
                  <Space>
                    <span>{item.name}</span>
                    <Tag>{item.cronLabel}</Tag>
                    {!item.enabled && <Tag color="default">已暂停</Tag>}
                  </Space>
                }
                description={
                  <div style={{ fontSize: 12 }}>
                    <div>执行员工：{item.employeeName} · {item.description}</div>
                    <div style={{ color: '#999' }}>
                      {item.lastRun ? `上次执行：${item.lastRun}` : '未执行过'} · 下次执行：{item.nextRun}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* Add Schedule Modal */}
      <Modal
        title="新建定时任务"
        open={addScheduleVisible}
        onOk={addSchedule}
        onCancel={() => { setAddScheduleVisible(false); scheduleForm.resetFields(); }}
        okText="创建"
        width={500}
      >
        <Form form={scheduleForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item name="employeeId" label="执行员工" rules={[{ required: true, message: '请选择执行员工' }]}>
            <Select
              placeholder="选择数字员工"
              options={digitalEmployees.filter((e) => e.status === 'ACTIVE').map((e) => ({ label: `${e.name} (${e.department})`, value: e.id }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cronLabel" label="执行频率" rules={[{ required: true, message: '请选择频率' }]}>
                <Select
                  placeholder="选择频率"
                  options={[
                    { label: '每天 08:00', value: '每天 08:00' },
                    { label: '每天 09:00', value: '每天 09:00' },
                    { label: '每周一 09:00', value: '每周一 09:00' },
                    { label: '每周五 17:00', value: '每周五 17:00' },
                    { label: '每月1日 09:00', value: '每月1日 09:00' },
                    { label: '每月15日 09:00', value: '每月15日 09:00' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cron" label="Cron表达式">
                <Input placeholder="可选，如 0 8 * * *" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="任务描述">
            <Input.TextArea rows={2} placeholder="描述该定时任务的执行内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChatPage;
