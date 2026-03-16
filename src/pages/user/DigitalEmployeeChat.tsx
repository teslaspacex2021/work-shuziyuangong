import React, { useState, useRef, useEffect } from 'react';
import {
  Avatar, Tag, Button, Input, Progress, Tooltip,
  Descriptions, Tabs, List, Space, Badge, Divider, message,
} from 'antd';
import {
  SendOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
  BookOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  PaperClipOutlined,
  AudioOutlined,
  LikeOutlined,
  DislikeOutlined,
  CopyOutlined,
  ReloadOutlined,
  RobotOutlined,
  UserOutlined,
  DatabaseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { digitalEmployees, tasks, skills, knowledgeBases } from '../../mock/data';

const { TextArea } = Input;

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  time: string;
  usedSkills?: string[];
}

const mockResponses: Record<string, string[]> = {
  default: [
    '好的，我已经理解了您的需求。让我为您处理一下...',
    '根据我的分析，这个问题可以从以下几个方面来解决：\n\n1. **数据收集**：首先需要收集相关的业务数据\n2. **分析处理**：运用智能算法进行数据分析\n3. **结果输出**：生成结构化的分析报告\n\n我正在为您准备详细的方案，请稍候。',
    '已完成处理！以下是关键发现：\n\n- 本月业务量较上月增长 **12.5%**\n- 客户满意度维持在 **96.8%**\n- 建议关注3个待优化项目\n\n需要我进一步展开分析吗？',
  ],
};

const typeIcon: Record<string, React.ReactNode> = {
  '知识库': <DatabaseOutlined style={{ color: '#1677ff' }} />,
  '知识卡片': <FileTextOutlined style={{ color: '#52c41a' }} />,
  '数据集': <BookOutlined style={{ color: '#722ed1' }} />,
};

const DigitalEmployeeChat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employee = digitalEmployees.find((e) => e.id === id);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (employee) {
      setMessages([{
        role: 'assistant',
        content: `您好！我是 **${employee.name}**，${employee.description}\n\n我掌握的技能包括：${employee.skills.join('、')}。\n\n请问有什么可以帮您？`,
        time: new Date().toLocaleTimeString(),
      }]);
    }
  }, [employee]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!employee) {
    return <div style={{ padding: 48, textAlign: 'center' }}>数字员工不存在</div>;
  }

  const empTasks = tasks.filter((t) => t.assignee === employee.id);
  const empSkills = skills.filter((s) => employee.skillIds.includes(s.id));
  const empKnowledge = knowledgeBases.filter((kb) => employee.knowledgeIds.includes(kb.id));

  const handleSend = () => {
    if (!inputValue.trim() || loading) return;
    const userMsg: ChatMsg = {
      role: 'user',
      content: inputValue.trim(),
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    setTimeout(() => {
      const responses = mockResponses.default;
      const resp = responses[Math.floor(Math.random() * responses.length)];
      const usedSkills = employee.skills.slice(0, Math.floor(Math.random() * 2) + 1);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: resp,
        time: new Date().toLocaleTimeString(),
        usedSkills,
      }]);
      setLoading(false);
    }, 1200 + Math.random() * 800);
  };

  const statusColor: Record<string, string> = {
    ACTIVE: '#52c41a', TRAINING: '#1677ff', SUSPENDED: '#faad14', TERMINATED: '#ff4d4f',
  };
  const statusLabel: Record<string, string> = {
    ACTIVE: '在线', TRAINING: '训练中', SUSPENDED: '已暂停', TERMINATED: '已停用',
  };

  const quickActions = [
    '帮我处理今日待办工作',
    '生成本周工作总结',
    '分析最近的业务数据',
    '查看最新的知识更新',
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: '#f5f5f5' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: '#fff', padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f0f0f0',
        }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/user/digital-employees')} />
          <Badge dot color={statusColor[employee.status]} offset={[-2, 32]}>
            <Avatar size={36} style={{ background: '#1677ff', fontWeight: 600 }}>{employee.avatar}</Avatar>
          </Badge>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{employee.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {employee.department} · <span style={{ color: statusColor[employee.status] }}>{statusLabel[employee.status]}</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {messages.length <= 1 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: '#999', fontSize: 13, marginBottom: 12 }}>快捷操作：</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {quickActions.map((action) => (
                  <Tag
                    key={action}
                    onClick={() => setInputValue(action)}
                    style={{ cursor: 'pointer', borderRadius: 16, padding: '4px 14px', border: '1px solid #d9d9d9', background: '#fff', fontSize: 13 }}
                  >
                    {action}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
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
              <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
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

        <div style={{ background: '#fff', padding: '12px 20px 16px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <Tooltip title="上传文件"><Button type="text" icon={<PaperClipOutlined />} /></Tooltip>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`向 ${employee.name} 发送消息...`}
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ borderRadius: 8, resize: 'none' }}
            />
            <Tooltip title="语音输入"><Button type="text" icon={<AudioOutlined />} /></Tooltip>
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} style={{ borderRadius: 8 }} />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ width: 320, background: '#fff', borderLeft: '1px solid #f0f0f0', overflow: 'auto' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: 'chat',
              label: <span><InfoCircleOutlined /> 详情</span>,
              children: (
                <div style={{ padding: '0 16px 16px' }}>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Avatar size={64} style={{ background: '#1677ff', fontSize: 24, fontWeight: 600 }}>{employee.avatar}</Avatar>
                    <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>{employee.name}</div>
                    <Tag color={statusColor[employee.status]} style={{ marginTop: 4 }}>{statusLabel[employee.status]}</Tag>
                  </div>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="工号">{employee.id}</Descriptions.Item>
                    <Descriptions.Item label="部门">{employee.department}</Descriptions.Item>
                    <Descriptions.Item label="岗位">{employee.position}</Descriptions.Item>
                    <Descriptions.Item label="能力等级"><Tag color="blue">{employee.level}</Tag></Descriptions.Item>
                    <Descriptions.Item label="归属人">{employee.owner} ({employee.ownerType})</Descriptions.Item>
                    <Descriptions.Item label="入职日期">{employee.onboardDate}</Descriptions.Item>
                    <Descriptions.Item label="最近活跃">{employee.lastActive}</Descriptions.Item>
                  </Descriptions>
                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>Tokens 使用情况</div>
                  <Progress
                    percent={Math.round((employee.tokensUsed / employee.tokensQuota) * 100)}
                    status={employee.tokensUsed / employee.tokensQuota > 0.8 ? 'exception' : 'active'}
                    format={(p) => `${p}%`}
                  />
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    {(employee.tokensUsed / 1000000).toFixed(1)}M / {(employee.tokensQuota / 1000000).toFixed(1)}M
                  </div>
                </div>
              ),
            },
            {
              key: 'skills',
              label: <span><ThunderboltOutlined /> 技能</span>,
              children: (
                <div style={{ padding: '0 16px' }}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
                    该数字员工已配置 {empSkills.length} 项技能，将根据您的输入自动匹配合适的技能来处理：
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
                              <Tag style={{ fontSize: 10 }}>{skill.category}</Tag>
                            </Space>
                          }
                          description={<span style={{ fontSize: 12 }}>{skill.description}</span>}
                        />
                      </List.Item>
                    )}
                    locale={{ emptyText: '暂无技能配置' }}
                  />
                  {employee.skills.length > empSkills.length && (
                    <>
                      <Divider style={{ margin: '8px 0', fontSize: 12 }}>其他技能标签</Divider>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {employee.skills.filter((s) => !empSkills.find((es) => es.name === s)).map((s) => (
                          <Tag key={s} color="default">{s}</Tag>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ),
            },
            {
              key: 'knowledge',
              label: <span><BookOutlined /> 知识</span>,
              children: (
                <div style={{ padding: '0 16px' }}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
                    已关联 {empKnowledge.length} 个知识资源，构成该数字员工的知识基础：
                  </div>
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
                    locale={{ emptyText: '暂未关联知识资源' }}
                  />
                  {employee.relatedAgents.length > 0 && (
                    <>
                      <Divider style={{ margin: '8px 0', fontSize: 12 }}>关联智能体</Divider>
                      <List
                        size="small"
                        dataSource={employee.relatedAgents}
                        renderItem={(agent) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar size="small" style={{ background: '#1677ff' }}><RobotOutlined /></Avatar>}
                              title={<span style={{ fontSize: 13 }}>{agent}</span>}
                            />
                          </List.Item>
                        )}
                      />
                    </>
                  )}
                </div>
              ),
            },
            {
              key: 'tasks',
              label: <span><ThunderboltOutlined /> 任务</span>,
              children: (
                <div style={{ padding: '0 16px' }}>
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
            {
              key: 'history',
              label: <span><HistoryOutlined /> 历史</span>,
              children: (
                <div style={{ padding: '0 16px' }}>
                  <List
                    size="small"
                    dataSource={[
                      { title: '处理客户咨询工单', time: '今天 08:45' },
                      { title: '生成营销周报', time: '昨天 17:30' },
                      { title: '数据分析报告', time: '昨天 14:00' },
                      { title: '客户满意度调查', time: '03-10 10:00' },
                    ]}
                    renderItem={(item) => (
                      <List.Item style={{ cursor: 'pointer' }}>
                        <List.Item.Meta
                          title={<span style={{ fontSize: 13 }}>{item.title}</span>}
                          description={<span style={{ fontSize: 12, color: '#999' }}>{item.time}</span>}
                        />
                        <ReloadOutlined style={{ color: '#999' }} />
                      </List.Item>
                    )}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default DigitalEmployeeChat;
