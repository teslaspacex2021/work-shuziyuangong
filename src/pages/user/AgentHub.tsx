import React, { useState, useMemo } from 'react';
import {
  Input, Avatar, Tag, Card, Row, Col, Empty, Tabs, Badge, Button, Tooltip, Drawer,
  Descriptions, Progress,
} from 'antd';
import {
  SearchOutlined, ThunderboltOutlined,
  MessageOutlined, UserOutlined, RobotOutlined, StarOutlined, StarFilled,
  FireOutlined, IdcardOutlined, TrophyOutlined, RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  digitalEmployees, skills, knowledgeBases,
  BUSINESS_LINES, BUSINESS_LINE_COLORS, getEmployeeBusinessLine,
  CAPABILITY_LEVEL_COLORS, getEmployeeCapabilityLevel,
  type DigitalEmployee,
} from '../../mock/data';

const mockAgents = [
  { id: 'a1', name: '惠企优才', desc: '我可以帮您查询人才政策、根据余额...', tags: ['人才推荐', '政策查询'], users: 10, sessions: 5, tokens: 3042, department: '数字化运营部' },
  { id: 'a2', name: '企业知识问答', desc: '欢迎使用企业知识问答智能体！', tags: ['知识问答', '企业服务'], users: 2, sessions: 2, tokens: 1001, department: '数字化运营部' },
  { id: 'a3', name: '数据运营智能体', desc: '云省协同智能体，运营问题解答、下...', tags: ['数据运营', '协同办公'], users: 1, sessions: 2, tokens: 780, department: '数字化运营部' },
  { id: 'a4', name: '价值经营', desc: '价值经营数据智能问答助手', tags: ['经营分析', '数据问答'], users: 1, sessions: 1, tokens: 562, department: '数字化运营部' },
  { id: 'a5', name: '办公写作助手', desc: '助力多场景文档解读、专业文本生成...', tags: ['文档解读', '文本生成'], users: 2, sessions: 2, tokens: 545, department: '数字化运营部' },
  { id: 'a6', name: '通用问答智能体', desc: '通用问答智能体是一款基于大语言模...', tags: ['通用问答', '大模型'], users: 0, sessions: 0, tokens: 324, department: '数字化运营部' },
  { id: 'a7', name: '数据资产问询', desc: '帮助您查询系统、表、字段等资产信息', tags: ['数据资产', '信息查询'], users: 1, sessions: 1, tokens: 218, department: '数字化运营部' },
  { id: 'a8', name: '数智开发智能体', desc: '数据开发智能体，包含数据开发、任...', tags: ['数据开发', '智能编码'], users: 1, sessions: 0, tokens: 138, department: '数字化运营部' },
  { id: 'a9', name: '数据开发智能体', desc: 'sql改写,sql生成', tags: ['SQL', '数据开发'], users: 0, sessions: 0, tokens: 85, department: '数字化运营部' },
  { id: 'a10', name: '【审计】整改判定助手', desc: '赋能审计人员准确判断整改反馈和业...', tags: ['审计', '整改判定'], users: 0, sessions: 0, tokens: 77, department: '审计部' },
  { id: 'a11', name: '【IT大脑】模型审核智能体-新', desc: '暂无描述', tags: ['IT运维', '模型审核'], users: 0, sessions: 0, tokens: 68, department: '数字化运营部' },
  { id: 'a12', name: '数据入湖-新', desc: '数据入湖-新', tags: ['数据入湖', '数据治理'], users: 0, sessions: 0, tokens: 49, department: '数字化运营部' },
];

const mockFavorites = ['a1', 'a3', 'a5'];
const mockCreated = ['a2', 'a6'];

const statusColor: Record<string, string> = {
  ACTIVE: '#52c41a', TRAINING: '#1677ff', SUSPENDED: '#faad14', TERMINATED: '#ff4d4f',
};
const statusLabel: Record<string, string> = {
  ACTIVE: '在线', TRAINING: '训练中', SUSPENDED: '已暂停', TERMINATED: '已停用',
};
const levelColor: Record<string, string> = {
  L1: '#8c8c8c', L2: '#1d39c4', L3: '#0958d9', L4: '#006d75',
};

const categoryOrder: string[] = ['全部', ...BUSINESS_LINES];
const categoryIconColors: Record<string, string> = {
  '全部': '#1677ff',
  ...BUSINESS_LINE_COLORS,
};

const AgentHub: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('agents');

  // Employee Plaza states
  const [categoryFilter, setCategoryFilter] = useState<string>('全部');
  const [posFilter, setPosFilter] = useState<string>('全部');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['DE-2026001', 'DE-2026004']));
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DigitalEmployee | null>(null);

  const filteredAgents = useMemo(() => {
    if (!searchText) return mockAgents;
    return mockAgents.filter((a) => a.name.includes(searchText) || a.desc.includes(searchText));
  }, [searchText]);

  const favoriteAgents = useMemo(() => {
    const list = mockAgents.filter((a) => mockFavorites.includes(a.id));
    if (!searchText) return list;
    return list.filter((a) => a.name.includes(searchText) || a.desc.includes(searchText));
  }, [searchText]);

  const createdAgents = useMemo(() => {
    const list = mockAgents.filter((a) => mockCreated.includes(a.id));
    if (!searchText) return list;
    return list.filter((a) => a.name.includes(searchText) || a.desc.includes(searchText));
  }, [searchText]);

  // Employee Plaza logic
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    digitalEmployees.forEach((e) => {
      cats.add(getEmployeeBusinessLine(e));
    });
    return categoryOrder.filter((c) => c === '全部' || cats.has(c));
  }, []);

  const positionsForCategory = useMemo(() => {
    if (categoryFilter === '全部') {
      const allPos = new Set(digitalEmployees.map((e) => e.position));
      return ['全部', ...Array.from(allPos)];
    }
    const posSet = new Set<string>();
    digitalEmployees.forEach((e) => {
      if (getEmployeeBusinessLine(e) === categoryFilter) posSet.add(e.position);
    });
    return ['全部', ...Array.from(posSet)];
  }, [categoryFilter]);

  const filteredEmployees = useMemo(() => {
    let list = [...digitalEmployees];
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (categoryFilter !== '全部') {
      list = list.filter((e) => getEmployeeBusinessLine(e) === categoryFilter);
    }
    if (posFilter !== '全部') {
      list = list.filter((e) => e.position === posFilter);
    }
    list.sort((a, b) => b.heat - a.heat);
    return list;
  }, [searchText, categoryFilter, posFilter]);

  const recommended = useMemo(() =>
    [...digitalEmployees].filter((e) => e.status === 'ACTIVE').sort((a, b) => {
      const rA = a.likes / (a.likes + a.dislikes + 1);
      const rB = b.likes / (b.likes + b.dislikes + 1);
      return rB - rA;
    }).slice(0, 4),
  []);

  const activeCount = digitalEmployees.filter((e) => e.status === 'ACTIVE').length;

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    setPosFilter('全部');
  };

  const openDetail = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    setDetailOpen(true);
  };

  const startChat = (empId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/digital-employee/chat?employeeId=${empId}`);
  };

  const renderAgentCard = (agent: typeof mockAgents[0]) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={agent.id}>
      <Card
        hoverable
        style={{ borderRadius: 12, height: '100%', border: '1px solid #f0f0f0' }}
        styles={{ body: { padding: '20px 16px 16px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <Avatar size={44} style={{ background: '#722ed1', fontWeight: 600, fontSize: 16, flexShrink: 0 }}>
            {agent.name.charAt(0)}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{agent.name}</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: '0 0 8px', height: 42, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          描述：{agent.desc}
        </p>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
          发布部门：{agent.department}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 10, fontSize: 12, color: '#999' }}>
          <span><StarOutlined /> {agent.users}</span>
          <span><ThunderboltOutlined style={{ color: '#ff4d4f' }} /> {agent.sessions}</span>
          <span><MessageOutlined /> {agent.tokens}</span>
        </div>
      </Card>
    </Col>
  );

  const renderEmployeeCard = (emp: DigitalEmployee) => {
    const isHovered = hoveredCard === emp.id;
    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={emp.id}>
        <div
          style={{ position: 'relative', height: '100%' }}
          onMouseEnter={() => setHoveredCard(emp.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card
            hoverable
            style={{
              borderRadius: 14, height: '100%', overflow: 'hidden',
              border: isHovered ? '1px solid rgba(22,119,255,0.3)' : '1px solid #f0f0f0',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
              boxShadow: isHovered
                ? '0 8px 24px rgba(22,119,255,0.1), 0 2px 8px rgba(0,0,0,0.04)'
                : '0 1px 4px rgba(0,0,0,0.04)',
            }}
            styles={{ body: { padding: 0 } }}
            onClick={() => openDetail(emp)}
          >
            <div style={{ padding: '18px 18px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Badge dot color={statusColor[emp.status]} offset={[-3, 38]}>
                    <Avatar size={46} src={emp.avatar} style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }} />
                  </Badge>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2332' }}>{emp.name}</span>
                    <Tooltip title={favorites.has(emp.id) ? '取消收藏' : '收藏'}>
                      {favorites.has(emp.id) ? (
                        <StarFilled style={{ color: '#faad14', cursor: 'pointer', fontSize: 15 }} onClick={(e) => toggleFav(emp.id, e)} />
                      ) : (
                        <StarOutlined style={{ color: '#d0d5dc', cursor: 'pointer', fontSize: 15 }} onClick={(e) => toggleFav(emp.id, e)} />
                      )}
                    </Tooltip>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7c93', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IdcardOutlined style={{ fontSize: 11, color: '#a0aec0' }} />
                    <span>{emp.position}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {(() => {
                    const cap = getEmployeeCapabilityLevel(emp);
                    return (
                      <Tag style={{
                        fontSize: 10, borderRadius: 4, margin: 0, lineHeight: '18px',
                        padding: '0 6px', fontWeight: 600, color: '#fff',
                        border: 'none', background: CAPABILITY_LEVEL_COLORS[cap],
                      }}>{cap}</Tag>
                    );
                  })()}
                  <Tag color={statusColor[emp.status]} style={{ fontSize: 10, margin: 0, borderRadius: 4 }}>
                    {statusLabel[emp.status]}
                  </Tag>
                </div>
              </div>
            </div>

            <div style={{ padding: '0 18px 16px' }}>
              <p style={{
                fontSize: 12.5, color: '#6b7c93', lineHeight: 1.7, margin: '0 0 10px',
                height: 42, overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>{emp.description}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {emp.skills.slice(0, 3).map((s) => (
                  <Tag key={s} style={{
                    fontSize: 11, margin: 0, borderRadius: 4,
                    background: '#f0f5ff', color: '#3d6cd4', border: 'none',
                    lineHeight: '20px', padding: '0 6px',
                  }}>{s}</Tag>
                ))}
                {emp.skills.length > 3 && <Tag style={{
                  fontSize: 11, margin: 0, borderRadius: 4,
                  background: '#f5f5f5', color: '#8c8c8c', border: 'none',
                  lineHeight: '20px', padding: '0 6px',
                }}>+{emp.skills.length - 3}</Tag>}
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: '1px solid #f5f5f5', paddingTop: 10, fontSize: 12, color: '#8c99a8',
              }}>
                <span><FireOutlined style={{ color: '#fa541c', fontSize: 12 }} /> {(emp.heat / 100).toFixed(1)}k</span>
                <span><UserOutlined style={{ fontSize: 11 }} /> {Math.floor(emp.heat / 10)}</span>
                <span><TrophyOutlined style={{ color: '#52c41a', fontSize: 12 }} /> {emp.taskCompleteRate}%</span>
                <span><StarFilled style={{ color: '#faad14', fontSize: 11 }} /> {emp.likes}</span>
              </div>
            </div>
          </Card>

          {/* Hover overlay with "发起对话" */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(0deg, rgba(22,119,255,0.92) 0%, rgba(22,119,255,0.8) 50%, transparent 100%)',
            borderRadius: '0 0 14px 14px',
            padding: '36px 18px 14px',
            display: 'flex', justifyContent: 'center',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(6px)',
            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: isHovered ? 'auto' : 'none',
          }}>
            <Button
              type="primary"
              icon={<MessageOutlined />}
              onClick={(e) => startChat(emp.id, e)}
              style={{
                borderRadius: 20, padding: '0 28px', height: 36,
                background: '#fff', color: '#1677ff', border: 'none',
                fontWeight: 600, fontSize: 13,
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              }}
            >
              发起对话
            </Button>
          </div>
        </div>
      </Col>
    );
  };

  const renderDigitalEmployeesTab = () => (
    <div style={{ marginTop: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Badge color="#52c41a" text={<span style={{ fontSize: 12, color: '#52c41a' }}>在线 {activeCount} 人</span>} />
          <span style={{ fontSize: 12, color: '#b0b8c4' }}>共 {digitalEmployees.length} 名数字员工</span>
        </div>
      </div>

      {/* "为你推荐" section - 4 per row, compact */}
      <Card style={{
        borderRadius: 14, border: 'none', marginBottom: 16,
        background: 'linear-gradient(145deg, #fff7f0 0%, #fff 60%)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }} styles={{ body: { padding: '12px 16px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #ff6b35 0%, #ff9a5c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 8px rgba(255,107,53,0.3)',
          }}>
            <RocketOutlined style={{ fontSize: 13, color: '#fff' }} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2332' }}>为你推荐</div>
        </div>
        <Row gutter={12}>
          {recommended.slice(0, 4).map((emp, index) => (
            <Col span={6} key={emp.id}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s',
                  background: '#fafafa', border: '1px solid #f5f5f5',
                }}
                onClick={() => openDetail(emp)}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f5ff'; e.currentTarget.style.borderColor = '#d6e4ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#f5f5f5'; }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: index === 0 ? '#ff4d4f' : index === 1 ? '#fa8c16' : index === 2 ? '#fadb14' : '#52c41a',
                  color: index < 2 ? '#fff' : index === 2 ? '#8c6e00' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {index + 1}
                </div>
                <Avatar size={36} src={emp.avatar} style={{ flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1a2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: '#8c99a8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.position}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Two-Level Tab Navigation */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '16px 20px 0',
        marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap',
          borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 12,
        }}>
          {allCategories.map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <div
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  padding: '6px 18px', borderRadius: 6, cursor: 'pointer', fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#fff' : '#4a5568',
                  background: isActive ? (categoryIconColors[cat] || '#1677ff') : 'transparent',
                  transition: 'all 0.2s ease', userSelect: 'none',
                }}
              >
                {cat}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', paddingBottom: 14 }}>
          {positionsForCategory.map((pos) => {
            const isActive = posFilter === pos;
            return (
              <div
                key={pos}
                onClick={() => setPosFilter(pos)}
                style={{
                  padding: '4px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#1677ff' : '#6b7c93',
                  background: isActive ? '#f0f5ff' : 'transparent',
                  transition: 'all 0.2s ease', userSelect: 'none',
                }}
              >
                {pos}
              </div>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: 14, color: '#8c99a8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
        <FireOutlined style={{ color: '#fa8c16' }} />
        找到 <span style={{ fontWeight: 600, color: '#1a2332' }}>{filteredEmployees.length}</span> 名数字员工
        {categoryFilter !== '全部' && (
          <Tag closable onClose={() => handleCategoryChange('全部')} style={{ marginLeft: 8, borderRadius: 4, fontSize: 12 }}>{categoryFilter}</Tag>
        )}
        {posFilter !== '全部' && (
          <Tag closable onClose={() => setPosFilter('全部')} style={{ borderRadius: 4, fontSize: 12 }}>{posFilter}</Tag>
        )}
      </div>

      {/* Employee Card Grid */}
      <Row gutter={[16, 16]}>
        {filteredEmployees.map(renderEmployeeCard)}
        {filteredEmployees.length === 0 && (
          <Col span={24}><Empty description="暂无匹配的数字员工" style={{ padding: 60 }} /></Col>
        )}
      </Row>
    </div>
  );

  const tabItems = [
    {
      key: 'agents',
      label: '官方推荐',
      children: (
        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          {filteredAgents.map(renderAgentCard)}
          {filteredAgents.length === 0 && (
            <Col span={24}><Empty description="暂无匹配的智能体" /></Col>
          )}
        </Row>
      ),
    },
    {
      key: 'favorites',
      label: '我的收藏',
      children: (
        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          {favoriteAgents.map(renderAgentCard)}
          {favoriteAgents.length === 0 && (
            <Col span={24}><Empty description="暂无收藏的智能体" /></Col>
          )}
        </Row>
      ),
    },
    {
      key: 'created',
      label: '我创建的',
      children: (
        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          {createdAgents.map(renderAgentCard)}
          {createdAgents.length === 0 && (
            <Col span={24}><Empty description="暂无创建的智能体" /></Col>
          )}
        </Row>
      ),
    },
    {
      key: 'digital-employees',
      label: (
        <span>
          <RobotOutlined style={{ marginRight: 4 }} />
          数字员工
          <Badge count={activeCount} size="small" offset={[6, -2]} style={{ background: '#52c41a' }} />
        </span>
      ),
      children: renderDigitalEmployeesTab(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Input
          placeholder="搜索智能体"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 280, borderRadius: 8 }}
        />
        <Button type="primary" icon={<span style={{ marginRight: 4 }}>+</span>} style={{ borderRadius: 8, background: '#ff4d4f', borderColor: '#ff4d4f' }}>
          创建智能体
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginTop: 0 }}
        tabBarStyle={{ marginBottom: 0 }}
      />

      {/* Employee Detail Drawer */}
      <Drawer
        title={null}
        placement="right"
        width={500}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        {selectedEmployee && (() => {
          const emp = selectedEmployee;
          const empSkills = skills.filter((s) => emp.skillIds.includes(s.id));
          const empKBs = knowledgeBases.filter((kb) => emp.knowledgeIds.includes(kb.id));
          const businessLine = getEmployeeBusinessLine(emp);
          return (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #1a3a5c 0%, #2064a2 100%)',
                padding: '32px 24px 24px', textAlign: 'center',
              }}>
                <Badge dot color={statusColor[emp.status]} offset={[-6, 60]}>
                  <Avatar size={72} src={emp.avatar} style={{
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)', border: '3px solid rgba(255,255,255,0.3)',
                  }} />
                </Badge>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 14, color: '#fff' }}>{emp.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6, fontSize: 13 }}>
                  {emp.department} · {emp.position}
                </div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 6 }}>
                  <Tag color={statusColor[emp.status]}>{statusLabel[emp.status]}</Tag>
                  {(() => {
                    const cap = getEmployeeCapabilityLevel(emp);
                    return (
                      <Tag style={{ color: '#fff', fontWeight: 600, fontSize: 12, padding: '2px 10px', border: 'none', background: CAPABILITY_LEVEL_COLORS[cap] }}>
                        {cap}
                      </Tag>
                    );
                  })()}
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<MessageOutlined />}
                  onClick={() => navigate(`/digital-employee/chat?employeeId=${emp.id}`)}
                  style={{
                    marginTop: 16, borderRadius: 24, padding: '0 36px', height: 42,
                    fontWeight: 600, background: '#fff', color: '#1677ff', border: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                >
                  发起对话
                </Button>
              </div>

              <div style={{ padding: '16px 24px 24px' }}>
                <Card size="small" style={{ borderRadius: 12, marginBottom: 16, background: '#f8fafc', border: 'none' }}>
                  <p style={{ fontSize: 13, color: '#5a6b7d', lineHeight: 1.8, margin: 0 }}>{emp.description}</p>
                </Card>
                <Card title="基本信息" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="数字员工名称">{emp.name}</Descriptions.Item>
                    <Descriptions.Item label="所属条线"><Tag color={BUSINESS_LINE_COLORS[businessLine]}>{businessLine}</Tag></Descriptions.Item>
                    <Descriptions.Item label="基准岗位">{emp.position}</Descriptions.Item>
                    <Descriptions.Item label="级别">
                      {emp.capabilityLevel
                        ? <Tag color="blue">{emp.capabilityLevel}</Tag>
                        : <span style={{ color: '#999' }}>—</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="应用职责描述" span={2}>
                      {emp.responsibility ?? emp.description}
                    </Descriptions.Item>
                    <Descriptions.Item label="运营负责人">
                      {emp.operationOwner ?? <span style={{ color: '#999' }}>—</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="业务负责人">
                      {emp.businessOwner ?? <span style={{ color: '#999' }}>—</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="技术负责人" span={2}>
                      {emp.techOwner ?? <span style={{ color: '#999' }}>—</span>}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
                <Card title="Tokens 使用情况" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                  <Progress
                    percent={Math.round((emp.tokensUsed / emp.tokensQuota) * 100)}
                    status={emp.tokensUsed / emp.tokensQuota > 0.8 ? 'exception' : 'active'}
                    strokeColor={{ from: '#1677ff', to: '#4096ff' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8c99a8', marginTop: 4 }}>
                    <span>已用 {(emp.tokensUsed / 1000000).toFixed(1)}M</span>
                    <span>配额 {(emp.tokensQuota / 1000000).toFixed(1)}M</span>
                  </div>
                </Card>
                <Card title="技能" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {emp.skills.map((s) => <Tag key={s} style={{ background: '#eef3ff', color: '#3d6cd4', border: 'none' }}>{s}</Tag>)}
                  </div>
                  {empSkills.map((sk) => (
                    <div key={sk.id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ThunderboltOutlined style={{ color: '#1677ff' }} />
                        <span style={{ fontWeight: 500, color: '#1a2332' }}>{sk.name}</span>
                        <Tag style={{ fontSize: 11, fontWeight: 600, color: '#fff', padding: '0 8px', border: 'none', background: levelColor[sk.level] }}>{sk.level}</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#8c99a8', marginTop: 2, paddingLeft: 20 }}>{sk.description}</div>
                    </div>
                  ))}
                </Card>
                <Card title="关联知识库" size="small" style={{ borderRadius: 12 }}>
                  {empKBs.length > 0 ? empKBs.map((kb) => (
                    <div key={kb.id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ fontWeight: 500, color: '#1a2332' }}>{kb.name}</div>
                      <div style={{ fontSize: 12, color: '#8c99a8', marginTop: 2 }}>{kb.description} · {kb.docCount} 篇文档</div>
                    </div>
                  )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无关联知识" />}
                </Card>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};

export default AgentHub;
