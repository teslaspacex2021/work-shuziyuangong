import React, { useState } from 'react';
import { Input, Avatar, Tag, Card, Row, Col, Badge, Tabs, Empty, Select, Space } from 'antd';
import {
  SearchOutlined,
  ThunderboltOutlined,
  StarOutlined,
  StarFilled,
  LikeOutlined,
  LikeFilled,
  DislikeOutlined,
  DislikeFilled,
  FireOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { digitalEmployees } from '../../mock/data';

const statusColor: Record<string, string> = {
  ACTIVE: '#52c41a',
  TRAINING: '#1677ff',
  SUSPENDED: '#faad14',
  TERMINATED: '#ff4d4f',
};

const statusLabel: Record<string, string> = {
  ACTIVE: '在线',
  TRAINING: '训练中',
  SUSPENDED: '已暂停',
  TERMINATED: '已停用',
};

const allDepts = [...new Set(digitalEmployees.map((e) => e.department))];

const DigitalEmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>(['DE-2026001', 'DE-2026005']);
  const [likedMap, setLikedMap] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, { likes: number; dislikes: number }>>(
    Object.fromEntries(digitalEmployees.map((e) => [e.id, { likes: e.likes, dislikes: e.dislikes }]))
  );

  const filtered = digitalEmployees.filter((emp) => {
    const matchSearch = emp.name.includes(searchText) || emp.department.includes(searchText) || emp.position.includes(searchText) || emp.description.includes(searchText);
    const matchDept = selectedDept === 'all' || emp.department === selectedDept;
    return matchSearch && matchDept;
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleLike = (id: string, action: 'like' | 'dislike', e: React.MouseEvent) => {
    e.stopPropagation();
    const current = likedMap[id];
    setLikedMap((prev) => ({
      ...prev,
      [id]: current === action ? null : action,
    }));
    setLikeCounts((prev) => {
      const c = { ...prev[id] };
      if (current === 'like') c.likes--;
      if (current === 'dislike') c.dislikes--;
      if (current !== action) {
        if (action === 'like') c.likes++;
        if (action === 'dislike') c.dislikes++;
      }
      return { ...prev, [id]: c };
    });
  };

  const renderEmployeeCard = (emp: typeof digitalEmployees[0]) => {
    const counts = likeCounts[emp.id] || { likes: emp.likes, dislikes: emp.dislikes };
    const liked = likedMap[emp.id];
    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={emp.id}>
        <Card
          hoverable
          onClick={() => navigate(`/user/digital-employees/${emp.id}`)}
          style={{ borderRadius: 12, height: '100%' }}
          styles={{ body: { padding: '20px' } }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <Badge dot color={statusColor[emp.status]} offset={[-4, 36]}>
              <Avatar
                size={44}
                style={{
                  background: emp.status === 'ACTIVE' ? '#1677ff' : emp.status === 'TRAINING' ? '#722ed1' : '#999',
                  fontSize: 16, fontWeight: 600,
                }}
              >
                {emp.avatar}
              </Avatar>
            </Badge>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{emp.name}</span>
                <span
                  onClick={(e) => toggleFavorite(emp.id, e)}
                  style={{ cursor: 'pointer', color: favorites.includes(emp.id) ? '#faad14' : '#ccc' }}
                >
                  {favorites.includes(emp.id) ? <StarFilled /> : <StarOutlined />}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                {emp.department} · {emp.position}
              </div>
            </div>
          </div>

          <p style={{
            fontSize: 13, color: '#666', lineHeight: 1.6, margin: '8px 0 12px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {emp.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {emp.skills.slice(0, 3).map((s) => (
              <Tag key={s} style={{ borderRadius: 4, fontSize: 11, margin: 0 }} color="blue">{s}</Tag>
            ))}
            {emp.skills.length > 3 && (
              <Tag style={{ borderRadius: 4, fontSize: 11, margin: 0 }}>+{emp.skills.length - 3}</Tag>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Tag color={statusColor[emp.status]} style={{ borderRadius: 4, margin: 0 }}>
              {statusLabel[emp.status]}
            </Tag>
            <span style={{ fontSize: 12, color: '#999' }}>
              <ThunderboltOutlined style={{ marginRight: 4 }} />
              完成率 {emp.taskCompleteRate}%
            </span>
          </div>

          {/* Like / Dislike / Heat */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 8, borderTop: '1px solid #f5f5f5',
          }}>
            <Space size={16}>
              <span
                onClick={(e) => handleLike(emp.id, 'like', e)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: liked === 'like' ? '#1677ff' : '#999' }}
              >
                {liked === 'like' ? <LikeFilled /> : <LikeOutlined />}
                {counts.likes}
              </span>
              <span
                onClick={(e) => handleLike(emp.id, 'dislike', e)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: liked === 'dislike' ? '#ff4d4f' : '#999' }}
              >
                {liked === 'dislike' ? <DislikeFilled /> : <DislikeOutlined />}
                {counts.dislikes}
              </span>
            </Space>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#fa8c16' }}>
              <FireOutlined />
              {emp.heat}
            </span>
          </div>
        </Card>
      </Col>
    );
  };

  const favoriteEmployees = filtered.filter((e) => favorites.includes(e.id));
  const hotEmployees = [...filtered].sort((a, b) => b.heat - a.heat);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>AI 数字员工</h2>
        <p style={{ margin: 0, color: '#999', fontSize: 13 }}>
          选择一个数字员工开始协作，他们将根据您的问题自动调用合适的技能和知识来高效处理任务
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <Input
          placeholder="搜索数字员工名称、岗位..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 280, borderRadius: 8 }}
          allowClear
        />
        <Select
          value={selectedDept}
          onChange={setSelectedDept}
          style={{ width: 180 }}
          options={[
            { value: 'all', label: '全部部门' },
            ...allDepts.map((d) => ({ value: d, label: d })),
          ]}
          placeholder="按部门筛选"
        />
      </div>

      <Tabs
        defaultActiveKey="all"
        items={[
          {
            key: 'all',
            label: `全部 (${filtered.length})`,
            children: (
              <Row gutter={[16, 16]}>
                {filtered.map(renderEmployeeCard)}
              </Row>
            ),
          },
          {
            key: 'hot',
            label: `热门排行`,
            children: (
              <Row gutter={[16, 16]}>
                {hotEmployees.map(renderEmployeeCard)}
              </Row>
            ),
          },
          {
            key: 'favorites',
            label: `我的收藏 (${favoriteEmployees.length})`,
            children: favoriteEmployees.length > 0 ? (
              <Row gutter={[16, 16]}>
                {favoriteEmployees.map(renderEmployeeCard)}
              </Row>
            ) : (
              <Empty description="暂无收藏的数字员工" />
            ),
          },
        ]}
      />
    </div>
  );
};

export default DigitalEmployeeList;
