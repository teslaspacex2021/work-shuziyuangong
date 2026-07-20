import React, { useState, useMemo } from 'react';
import {
  Input, Button, Modal, Avatar, Badge, Tag,
  Card, Row, Col, Empty, Space, Tooltip,
} from 'antd';
import {
  SearchOutlined, RobotOutlined, IdcardOutlined, PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { conversations, digitalEmployees, getEmployeeFeatureFlags } from '../../mock/data';
import ChatInputComposer from '../../components/ChatInputComposer';

const DEFAULT_EMPLOYEE_ID = 'DE-2026000';

const statusColor: Record<string, string> = {
  ACTIVE: '#52c41a', TRAINING: '#1677ff', SUSPENDED: '#faad14', TERMINATED: '#ff4d4f',
};
const statusLabel: Record<string, string> = {
  ACTIVE: '在线', TRAINING: '训练中', SUSPENDED: '已暂停', TERMINATED: '已停用',
};

const bottomEmployeeIds = ['DE-2026000', 'DE-2026001', 'DE-2026003', 'DE-2026004', 'DE-2026005'];

const NewChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(DEFAULT_EMPLOYEE_ID);
  const [summonVisible, setSummonVisible] = useState(false);
  const [summonSearch, setSummonSearch] = useState('');
  const [suggestBatch, setSuggestBatch] = useState(0);
  const [convSearchText, setConvSearchText] = useState('');

  const selectedEmployee = useMemo(
    () => digitalEmployees.find((e) => e.id === selectedEmployeeId) || null,
    [selectedEmployeeId],
  );

  const featureFlags = useMemo(
    () => getEmployeeFeatureFlags(selectedEmployee),
    [selectedEmployee],
  );

  const suggestedQuestions = useMemo(() => {
    // 新对话欢迎区：门户级引导问法；会话内追问由 ChatPage 按意图生成
    const list = [
      '帮我处理今日待办工作',
      '生成本周工作总结',
      '分析最近的业务数据',
      '查看最新的知识更新',
      '如何唤起其他数字员工？',
      '公司软考有什么政策？',
      '帮我梳理本周重点事项',
      '有哪些可用的数字员工？',
    ];
    const start = (suggestBatch * 4) % Math.max(list.length, 1);
    return [...list, ...list].slice(start, start + 4);
  }, [suggestBatch]);

  const bottomEmployees = useMemo(
    () => bottomEmployeeIds
      .map((id) => digitalEmployees.find((e) => e.id === id))
      .filter(Boolean) as typeof digitalEmployees,
    [],
  );

  const summonFilteredEmployees = useMemo(() => {
    if (!summonSearch) return digitalEmployees;
    const q = summonSearch.toLowerCase();
    return digitalEmployees.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q),
    );
  }, [summonSearch]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const emp = digitalEmployees.find((e) => e.id === c.employeeId);
      if (!emp) return false;
      if (!convSearchText) return true;
      return emp.name.includes(convSearchText) || c.lastMessage.includes(convSearchText);
    });
  }, [convSearchText]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    navigate(
      `/digital-employee/chat?employeeId=${selectedEmployeeId}&msg=${encodeURIComponent(inputValue.trim())}`,
    );
  };

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    setSummonVisible(false);
    setSummonSearch('');
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  const handleBottomEmployeeClick = (empId: string) => {
    setSelectedEmployeeId(empId);
  };

  const handleSelectConversation = (employeeId: string) => {
    navigate(`/digital-employee/chat?employeeId=${employeeId}`);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: '#f5f5f5' }}>
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
            <Tooltip title="选择数字员工">
              <PlusOutlined
                style={{ fontSize: 16, color: '#999', cursor: 'pointer' }}
                onClick={() => setSummonVisible(true)}
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
            return (
              <div
                key={conv.employeeId}
                onClick={() => handleSelectConversation(conv.employeeId)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', cursor: 'pointer',
                  background: 'transparent',
                  borderLeft: '3px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Badge dot color={statusColor[emp.status]} offset={[-2, 32]}>
                  <Avatar size={40} src={emp.avatar} style={{ flexShrink: 0 }} />
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
          {!filteredConversations.length && (
            <Empty description="暂无对话" style={{ marginTop: 48 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: '#fff', minWidth: 0,
      }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '40px 24px 0',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              fontSize: 48, fontWeight: 800, color: '#1677ff',
              marginBottom: 4, lineHeight: 1.2,
            }}>
              Hi
            </div>
            <div style={{
              fontSize: 28, fontWeight: 700, color: '#1677ff', marginBottom: 8,
            }}>
              我是您的AI数字员工
            </div>
            <div style={{ fontSize: 15, color: '#666' }}>
              请选择一位数字员工开始对话吧
            </div>
          </div>

          {featureFlags.suggestedQuestions && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 12,
              justifyContent: 'center', marginBottom: 32, maxWidth: 700,
            }}>
              {suggestedQuestions.map((q) => (
                <div
                  key={q}
                  onClick={() => handleQuickAction(q)}
                  style={{
                    padding: '8px 16px', borderRadius: 20,
                    border: '1px solid #e8e8e8', background: '#fff',
                    fontSize: 14, color: '#333', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1677ff';
                    e.currentTarget.style.color = '#1677ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e8e8e8';
                    e.currentTarget.style.color = '#333';
                  }}
                >
                  {q}
                </div>
              ))}
              <div
                style={{ padding: '8px 16px', fontSize: 14, color: '#1677ff', cursor: 'pointer' }}
                onClick={() => setSuggestBatch((b) => b + 1)}
              >
                ↻ 换一换
              </div>
            </div>
          )}

          <div style={{ width: '100%', maxWidth: 720, marginBottom: 24 }}>
            <ChatInputComposer
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              placeholder={
                selectedEmployee
                  ? `向${selectedEmployee.name}提问，例如：如何修改 OA 密码？公文格式规范有哪些？`
                  : '请输入指令或问题和我对话吧'
              }
              featureFlags={featureFlags}
              showAllWhenNoFlags={false}
              onSummonEmployee={() => setSummonVisible(true)}
              summonLabel="召唤员工"
              onMentionEmployee={(emp) => handleSelectEmployee(emp.id)}
              currentEmployeeId={selectedEmployeeId}
            />
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #f0f0f0', padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, flexWrap: 'wrap',
        }}>
          {bottomEmployees.map((emp) => (
            <Button
              key={emp.id}
              type="text"
              onClick={() => handleBottomEmployeeClick(emp.id)}
              style={{
                borderRadius: 8, fontSize: 13, padding: '4px 12px', height: 32,
                color: selectedEmployeeId === emp.id ? '#1677ff' : '#333',
                border: selectedEmployeeId === emp.id ? '1px solid #1677ff' : '1px solid #f0f0f0',
                background: selectedEmployeeId === emp.id ? '#f0f5ff' : 'transparent',
              }}
            >
              <RobotOutlined /> {emp.name}
            </Button>
          ))}
          <Button
            type="text"
            style={{
              borderRadius: 8, fontSize: 13, color: '#333',
              border: '1px solid #f0f0f0', padding: '4px 12px', height: 32,
            }}
            onClick={() => setSummonVisible(true)}
          >
            <RobotOutlined /> 更多
          </Button>
        </div>
      </div>

      <Modal
        title={<span><RobotOutlined style={{ marginRight: 8 }} />选择数字员工</span>}
        open={summonVisible}
        onCancel={() => { setSummonVisible(false); setSummonSearch(''); }}
        footer={null}
        width={800}
        styles={{ body: { padding: '16px 24px' } }}
      >
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
            {summonFilteredEmployees.map((emp) => (
              <Col key={emp.id} xs={24} sm={12} md={8}>
                <Card
                  size="small"
                  hoverable
                  style={{
                    borderRadius: 10,
                    borderColor: selectedEmployeeId === emp.id ? '#1677ff' : undefined,
                    background: selectedEmployeeId === emp.id ? '#f0f5ff' : undefined,
                  }}
                  styles={{ body: { padding: '14px 16px' } }}
                  onClick={() => handleSelectEmployee(emp.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge dot color={statusColor[emp.status]} offset={[-2, 32]}>
                      <Avatar size={40} src={emp.avatar} style={{ flexShrink: 0 }} />
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
                      <div style={{
                        fontSize: 12, color: '#999', marginTop: 2,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <IdcardOutlined style={{ fontSize: 11 }} />
                        {emp.department} · {emp.position}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
            {summonFilteredEmployees.length === 0 && (
              <Col span={24}>
                <Empty description="暂无匹配的数字员工" style={{ padding: 40 }} />
              </Col>
            )}
          </Row>
        </div>
      </Modal>
    </div>
  );
};

export default NewChatPage;
