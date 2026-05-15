import React, { useState, useMemo } from 'react';
import {
  Input, Avatar, Tag, Card, Row, Col, Badge, Empty,
  Button, Tooltip, Drawer, Descriptions, Progress, Rate, Typography,
} from 'antd';
import {
  SearchOutlined, ThunderboltOutlined, StarOutlined, StarFilled,
  MessageOutlined, UserOutlined,
  TeamOutlined, FireOutlined,
  IdcardOutlined, EnvironmentOutlined, TrophyOutlined, RocketOutlined,
  CrownOutlined, ClockCircleOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
import { useNavigate } from 'react-router-dom';
import { digitalEmployees, positions, skills, knowledgeBases, type DigitalEmployee } from '../../mock/data';

const statusColor: Record<string, string> = {
  ACTIVE: '#52c41a', TRAINING: '#1677ff', SUSPENDED: '#faad14', TERMINATED: '#ff4d4f',
};
const statusLabel: Record<string, string> = {
  ACTIVE: '在线', TRAINING: '训练中', SUSPENDED: '已暂停', TERMINATED: '已停用',
};
const levelLabel: Record<string, string> = {
  L1: '初级', L2: '中级', L3: '高级', L4: '专家',
};
const levelColor: Record<string, string> = {
  L1: '#8c8c8c', L2: '#1d39c4', L3: '#0958d9', L4: '#006d75',
};

const positionToCategoryMap: Record<string, string> = {};
positions.forEach((p) => {
  positionToCategoryMap[p.name] = p.category;
});
positionToCategoryMap['智能综合助理'] = '综合类';

const categoryOrder = ['全部', '综合类', '服务类', '技术类', '运营类', '合规类', '管理类', '财务类', '分析类'];

const categoryIconColors: Record<string, string> = {
  '全部': '#1677ff',
  '综合类': '#722ed1',
  '服务类': '#13c2c2',
  '技术类': '#2f54eb',
  '运营类': '#fa541c',
  '合规类': '#52c41a',
  '管理类': '#eb2f96',
  '财务类': '#faad14',
  '分析类': '#1890ff',
};

const EmployeePlaza: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('全部');
  const [posFilter, setPosFilter] = useState<string>('全部');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['DE-2026001', 'DE-2026004']));
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DigitalEmployee | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    digitalEmployees.forEach((e) => {
      const cat = positionToCategoryMap[e.position] || '其他';
      cats.add(cat);
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
      const cat = positionToCategoryMap[e.position] || '其他';
      if (cat === categoryFilter) posSet.add(e.position);
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
      list = list.filter((e) => (positionToCategoryMap[e.position] || '其他') === categoryFilter);
    }
    if (posFilter !== '全部') {
      list = list.filter((e) => e.position === posFilter);
    }
    list.sort((a, b) => b.heat - a.heat);
    return list;
  }, [searchText, categoryFilter, posFilter]);

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openDetail = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    setDetailOpen(true);
  };

  const startChat = (empId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/digital-employee/chat?employeeId=${empId}`);
  };

  const activeCount = digitalEmployees.filter((e) => e.status === 'ACTIVE').length;

  const recommended = useMemo(() =>
    [...digitalEmployees].filter((e) => e.status === 'ACTIVE').sort((a, b) => {
      const rA = a.likes / (a.likes + a.dislikes + 1);
      const rB = b.likes / (b.likes + b.dislikes + 1);
      return rB - rA;
    }).slice(0, 3),
  []);

  const popular = useMemo(() =>
    [...digitalEmployees].sort((a, b) => b.heat - a.heat).slice(0, 3),
  []);

  const newest = useMemo(() =>
    [...digitalEmployees].sort((a, b) => b.onboardDate.localeCompare(a.onboardDate)).slice(0, 3),
  []);

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    setPosFilter('全部');
  };

  const renderMiniItem = (emp: DigitalEmployee, index: number) => (
    <div
      key={emp.id}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
        borderBottom: index < 2 ? '1px solid #f5f5f5' : 'none',
        cursor: 'pointer', transition: 'background 0.2s',
      }}
      onClick={() => openDetail(emp)}
    >
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: index === 0 ? '#ff4d4f' : index === 1 ? '#fa8c16' : '#fadb14',
        color: index < 2 ? '#fff' : '#8c6e00',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700,
      }}>
        {index + 1}
      </div>
      <Avatar size={36} src={emp.avatar} style={{ flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: 13, color: '#1a2332',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{emp.name}</div>
        <div style={{ fontSize: 11, color: '#8c99a8', marginTop: 1 }}>{emp.position}</div>
      </div>
    </div>
  );

  const renderEmployeeCard = (emp: DigitalEmployee) => {
    const rating = Math.min(5, Math.max(0, (emp.likes / (emp.likes + emp.dislikes + 1)) * 5));
    const isHovered = hoveredCard === emp.id;
    const cat = positionToCategoryMap[emp.position] || '其他';
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
                  <Tag style={{
                    fontSize: 10, borderRadius: 4, margin: 0, lineHeight: '18px',
                    padding: '0 6px', fontWeight: 600, color: '#fff',
                    border: 'none', background: levelColor[emp.level],
                  }}>{emp.level} {levelLabel[emp.level]}</Tag>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FireOutlined style={{ color: '#fa541c', fontSize: 12 }} />
                  <span>{(emp.heat / 100).toFixed(1)}k</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <UserOutlined style={{ fontSize: 11 }} />
                  <span>{Math.floor(emp.heat / 10)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrophyOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                  <span>{emp.taskCompleteRate}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <StarFilled style={{ color: '#faad14', fontSize: 11 }} />
                  <span>{emp.likes}</span>
                </div>
              </div>
            </div>
          </Card>

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

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1600, margin: '0 auto', background: '#f8f9fb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TeamOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: '#1a2332' }}>数字员工广场</span>
          <Badge color="#52c41a" text={<span style={{ fontSize: 12, color: '#52c41a' }}>在线 {activeCount} 人</span>} />
          <span style={{ fontSize: 12, color: '#b0b8c4' }}>共 {digitalEmployees.length} 名数字员工</span>
        </div>
        <Input
          placeholder="搜索数字员工名称、岗位、技能..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 280, borderRadius: 8, borderColor: '#e0e4ea' }}
        />
      </div>

      {/* Top 3-Column Recommendation Section */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* 为你推荐 */}
        <Col xs={24} md={8}>
          <Card style={{
            borderRadius: 14, border: 'none', height: '100%',
            background: 'linear-gradient(145deg, #fff7f0 0%, #fff 60%)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }} styles={{ body: { padding: '16px 20px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #ff6b35 0%, #ff9a5c 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(255,107,53,0.3)',
              }}>
                <RocketOutlined style={{ fontSize: 15, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', lineHeight: 1.2 }}>为你推荐</div>
                <div style={{ fontSize: 11, color: '#b0b8c4' }}>Personal Picks</div>
              </div>
            </div>
            {recommended.map((emp, i) => renderMiniItem(emp, i))}
          </Card>
        </Col>

        {/* 热门精选 */}
        <Col xs={24} md={8}>
          <Card style={{
            borderRadius: 14, border: 'none', height: '100%',
            background: 'linear-gradient(145deg, #fff5f5 0%, #fff 60%)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }} styles={{ body: { padding: '16px 20px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(255,77,79,0.3)',
              }}>
                <FireOutlined style={{ fontSize: 15, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', lineHeight: 1.2 }}>热门精选</div>
                <div style={{ fontSize: 11, color: '#b0b8c4' }}>Popular Now</div>
              </div>
            </div>
            {popular.map((emp, i) => renderMiniItem(emp, i))}
          </Card>
        </Col>

        {/* 最近上新 */}
        <Col xs={24} md={8}>
          <Card style={{
            borderRadius: 14, border: 'none', height: '100%',
            background: 'linear-gradient(145deg, #f0f5ff 0%, #fff 60%)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }} styles={{ body: { padding: '16px 20px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(22,119,255,0.3)',
              }}>
                <ClockCircleOutlined style={{ fontSize: 15, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', lineHeight: 1.2 }}>最近上新</div>
                <div style={{ fontSize: 11, color: '#b0b8c4' }}>Fresh Releases</div>
              </div>
            </div>
            {newest.map((emp, i) => renderMiniItem(emp, i))}
          </Card>
        </Col>
      </Row>

      {/* Two-Level Tab Navigation */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '16px 20px 0',
        marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        {/* Level 1: Category Tabs */}
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
                  padding: '6px 18px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#fff' : '#4a5568',
                  background: isActive ? (categoryIconColors[cat] || '#1677ff') : 'transparent',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                }}
              >
                {cat}
              </div>
            );
          })}
        </div>

        {/* Level 2: Position Sub-tabs */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap',
          paddingBottom: 14,
        }}>
          {positionsForCategory.map((pos) => {
            const isActive = posFilter === pos;
            return (
              <div
                key={pos}
                onClick={() => setPosFilter(pos)}
                style={{
                  padding: '4px 14px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#1677ff' : '#6b7c93',
                  background: isActive ? '#f0f5ff' : 'transparent',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
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
          <Tag
            closable
            onClose={() => handleCategoryChange('全部')}
            style={{ marginLeft: 8, borderRadius: 4, fontSize: 12 }}
          >{categoryFilter}</Tag>
        )}
        {posFilter !== '全部' && (
          <Tag
            closable
            onClose={() => setPosFilter('全部')}
            style={{ borderRadius: 4, fontSize: 12 }}
          >{posFilter}</Tag>
        )}
      </div>

      {/* Employee Card Grid */}
      <Row gutter={[16, 16]}>
        {filteredEmployees.map(renderEmployeeCard)}
        {filteredEmployees.length === 0 && (
          <Col span={24}><Empty description="暂无匹配的数字员工" style={{ padding: 60 }} /></Col>
        )}
      </Row>

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
          const cat = positionToCategoryMap[emp.position] || '其他';
          return (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #1a3a5c 0%, #2064a2 100%)',
                padding: '32px 24px 24px',
                textAlign: 'center',
              }}>
                <Badge dot color={statusColor[emp.status]} offset={[-6, 60]}>
                  <Avatar size={72} src={emp.avatar} style={{
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    border: '3px solid rgba(255,255,255,0.3)',
                  }} />
                </Badge>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 14, color: '#fff' }}>{emp.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6, fontSize: 13 }}>
                  {emp.department} · {emp.position}
                </div>
                <div style={{ marginTop: 6 }}>
                  <Tag style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.85)',
                    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 4,
                  }}>{cat}</Tag>
                </div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 6 }}>
                  <Tag color={statusColor[emp.status]}>{statusLabel[emp.status]}</Tag>
                  <Tag style={{ color: '#fff', fontWeight: 600, fontSize: 12, padding: '2px 10px', border: 'none', background: levelColor[emp.level] }}>
                    {emp.level} {levelLabel[emp.level]}
                  </Tag>
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
                    <Descriptions.Item label="工号"><span style={{ fontFamily: 'monospace' }}>{emp.id}</span></Descriptions.Item>
                    <Descriptions.Item label="职级"><Tag color="blue">{emp.level}</Tag></Descriptions.Item>
                    <Descriptions.Item label="部门">{emp.department}</Descriptions.Item>
                    <Descriptions.Item label="岗位">{emp.position}</Descriptions.Item>
                    <Descriptions.Item label="岗位性质"><Tag color={categoryIconColors[cat]}>{cat}</Tag></Descriptions.Item>
                    <Descriptions.Item label="归属人">{emp.owner}</Descriptions.Item>
                    <Descriptions.Item label="身份类型"><Tag color={emp.ownerType === '自有' ? 'blue' : 'orange'}>{emp.ownerType}</Tag></Descriptions.Item>
                    <Descriptions.Item label="入职日期">{emp.onboardDate}</Descriptions.Item>
                    <Descriptions.Item label="最近活跃">{emp.lastActive}</Descriptions.Item>
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
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#5a6b7d' }}>任务完成率：</span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1677ff' }}>{emp.taskCompleteRate}%</span>
                  </div>
                </Card>

                <Card title="技能" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: empSkills.length > 0 ? 12 : 0 }}>
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

                <Card title="关联知识库" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                  {empKBs.length > 0 ? empKBs.map((kb) => (
                    <div key={kb.id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ fontWeight: 500, color: '#1a2332' }}>{kb.name}</div>
                      <div style={{ fontSize: 12, color: '#8c99a8', marginTop: 2 }}>{kb.description} · {kb.docCount} 篇文档</div>
                    </div>
                  )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无关联知识" />}
                </Card>

                <Card title="关联智能体" size="small" style={{ borderRadius: 12 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {emp.relatedAgents.map((a) => <Tag key={a} color="processing">{a}</Tag>)}
                  </div>
                </Card>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};

export default EmployeePlaza;
