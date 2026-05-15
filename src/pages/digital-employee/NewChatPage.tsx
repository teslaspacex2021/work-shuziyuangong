import React, { useState, useMemo } from 'react';
import {
  Input, Button, Tooltip, Modal, Space, Avatar, Badge, Tag,
  Card, Row, Col, Empty, message,
} from 'antd';
import {
  SendOutlined, SearchOutlined, PaperClipOutlined,
  ThunderboltOutlined, RobotOutlined, IdcardOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { digitalEmployees } from '../../mock/data';

const DEFAULT_EMPLOYEE_ID = 'DE-2026000';

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

const bottomEmployeeIds = ['DE-2026000', 'DE-2026001', 'DE-2026003', 'DE-2026004', 'DE-2026005'];

const NewChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(DEFAULT_EMPLOYEE_ID);
  const [summonVisible, setSummonVisible] = useState(false);
  const [summonSearch, setSummonSearch] = useState('');

  const selectedEmployee = useMemo(
    () => digitalEmployees.find((e) => e.id === selectedEmployeeId) || null,
    [selectedEmployeeId],
  );

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

  const handleSend = () => {
    if (!inputValue.trim()) return;
    navigate(`/digital-employee/chat?employeeId=${selectedEmployeeId}&newChat=1&msg=${encodeURIComponent(inputValue.trim())}`);
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

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)',
      background: '#fff',
    }}>
      {/* Main Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '40px 24px 0',
      }}>
        {/* Welcome Text */}
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

        {/* Quick Actions */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12,
          justifyContent: 'center', marginBottom: 32, maxWidth: 700,
        }}>
          {quickActions.map((q) => (
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
          <div style={{
            padding: '8px 16px', fontSize: 14, color: '#1677ff', cursor: 'pointer',
          }}>
            ↻ 换一换
          </div>
        </div>

        {/* Input Area */}
        <div style={{ width: '100%', maxWidth: 700, marginBottom: 24 }}>
          <div style={{
            border: '1px solid #e8e8e8', borderRadius: 12, padding: '12px 16px',
            background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <Input
              placeholder="请输入指令或问题和我对话吧"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              variant="borderless"
              style={{ fontSize: 15, marginBottom: 8 }}
              suffix={
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  size="small"
                  onClick={handleSend}
                  style={{ background: '#333' }}
                />
              }
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tooltip title="上传文件">
                <Button type="text" icon={<PaperClipOutlined />} size="small" style={{ color: '#999' }} />
              </Tooltip>
              <Button
                size="small"
                style={{
                  borderRadius: 6, borderColor: '#ff4d4f', color: '#ff4d4f', fontWeight: 500,
                }}
                icon={<ThunderboltOutlined />}
              >
                深度思考
              </Button>
              <Button
                size="small"
                style={{
                  borderRadius: 6, borderColor: '#52c41a', color: '#52c41a', fontWeight: 500,
                }}
                icon={<SearchOutlined />}
              >
                全网搜索
              </Button>
              <Button
                size="small"
                type="dashed"
                icon={<RobotOutlined />}
                onClick={() => setSummonVisible(true)}
                style={{
                  borderRadius: 6, color: '#1677ff', borderColor: '#1677ff', fontWeight: 500,
                }}
              >
                {selectedEmployee ? selectedEmployee.name : '选择数字员工'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Shortcuts */}
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

      {/* Select Employee Modal */}
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
