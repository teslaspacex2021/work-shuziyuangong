import React, { useState, useMemo } from 'react';
import {
  Input, Avatar, Tag, Row, Col, Empty, Button, Badge,
} from 'antd';
import {
  SearchOutlined, FireOutlined, PlusOutlined,
  RobotOutlined, MessageOutlined, LeftOutlined, RightOutlined,
  StarOutlined, FolderAddOutlined, LikeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  digitalEmployees,
  BUSINESS_LINES, FEATURED_SCENES, getAllPlazaExperts,
  type PlazaExpert,
} from '../../mock/data';
import EmployeeDetailModal from '../../components/EmployeeDetailModal';
import { BRAND_PRIMARY, BRAND_PRIMARY_RGB, BRAND_PRIMARY_HOVER } from '../../theme/brand';

const sceneConfigs = FEATURED_SCENES;

type MainTab = 'experts' | 'favorites' | 'created';
type SortMode = 'hot' | 'new';

const SCENES_PER_PAGE = 4;
const SCENE_EXPERTS_LIMIT = 3;
const SCENE_GAP = 12;
const SCENE_VISIBLE_SLOTS = 4.5;
const SCENE_CARD_WIDTH = `calc((100% - ${SCENE_GAP * 4}px) / ${SCENE_VISIBLE_SLOTS})`;
const INITIAL_FAVORITE_IDS = [
  'DE-2026001', 'DE-2026004', 'DE-2026000',
  'AG-001', 'AG-002', 'AG-003', 'AG-008',
];
const MOCK_CREATED_IDS = new Set([
  'DE-2026003', 'DE-2026008', 'DE-2026009',
  'AG-005', 'AG-006', 'AG-010',
]);

const DigitalEmployeePlaza: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [mainTab, setMainTab] = useState<MainTab>('experts');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [sortMode, setSortMode] = useState<SortMode>('hot');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailExpert, setDetailExpert] = useState<PlazaExpert | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [scenePage, setScenePage] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(INITIAL_FAVORITE_IDS));

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allExperts = useMemo(() => getAllPlazaExperts(), []);

  const featuredScenes = useMemo(() => {
    const expertMap = new Map(allExperts.map((e) => [e.id, e]));
    return sceneConfigs.map((scene) => {
      const experts = scene.expertIds
        .map((id) => expertMap.get(id))
        .filter((e): e is PlazaExpert => Boolean(e))
        .slice(0, SCENE_EXPERTS_LIMIT);
      return { ...scene, experts };
    }).filter((s) => s.experts.length > 0);
  }, [allExperts]);

  const maxScenePage = Math.max(0, Math.ceil(featuredScenes.length / SCENES_PER_PAGE) - 1);
  const sceneStart = scenePage * SCENES_PER_PAGE;
  const hasMoreScenes = scenePage < maxScenePage;
  const visibleScenes = featuredScenes.slice(
    sceneStart,
    Math.min(sceneStart + SCENES_PER_PAGE + (hasMoreScenes ? 1 : 0), featuredScenes.length),
  );

  const allCategories = ['全部', ...BUSINESS_LINES];

  const filteredExperts = useMemo(() => {
    let list = [...allExperts];
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (categoryFilter !== '全部') {
      list = list.filter((e) => e.businessLine === categoryFilter);
    }
    if (mainTab === 'favorites') {
      list = list.filter((e) => favoriteIds.has(e.id));
    } else if (mainTab === 'created') {
      list = list.filter((e) => MOCK_CREATED_IDS.has(e.id));
    }
    if (sortMode === 'hot') {
      list.sort((a, b) => b.heat - a.heat);
    } else {
      list.sort((a, b) => (b.onboardDate || b.id).localeCompare(a.onboardDate || a.id));
    }
    return list;
  }, [allExperts, searchText, categoryFilter, sortMode, mainTab, favoriteIds]);

  const openDetail = (expert: PlazaExpert) => {
    setDetailExpert(expert);
    setDetailOpen(true);
  };

  const startChat = (expert: PlazaExpert, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expert.employee) {
      navigate(`/digital-employee/chat?employeeId=${expert.id}`);
    } else {
      navigate('/digital-employee/chat');
    }
  };

  const activeCount = digitalEmployees.filter((e) => e.status === 'ACTIVE').length;

  const renderExpertCard = (expert: PlazaExpert) => {
    const isHovered = hoveredCard === expert.id;
    return (
    <Col xs={24} sm={12} md={8} lg={6} xxl={4} key={expert.id}>
      <div
        style={{ position: 'relative', height: '100%' }}
        onMouseEnter={() => setHoveredCard(expert.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div
          onClick={() => openDetail(expert)}
          style={{
            background: isHovered ? BRAND_PRIMARY_HOVER : '#fff',
            borderRadius: 14,
            border: '1px solid #f0f0f0',
            padding: '18px 18px 14px',
            cursor: 'pointer',
            height: '100%',
            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: isHovered
              ? '0 2px 12px rgba(0,0,0,0.06)'
              : '0 1px 3px rgba(0,0,0,0.03)',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            {expert.avatar ? (
              <Avatar size={44} src={expert.avatar} style={{ flexShrink: 0 }} />
            ) : (
              <Avatar size={44} style={{ background: expert.avatarColor || '#722ed1', fontWeight: 600, flexShrink: 0 }}>
                {expert.name.charAt(0)}
              </Avatar>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>{expert.name}</span>
                {expert.status === 'TRAINING' && (
                  <Tag style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 4px', borderRadius: 3 }}>Beta</Tag>
                )}
                {expert.kind === 'agent' && (
                  <Tag style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 4px', borderRadius: 3, color: '#722ed1', background: '#f9f0ff', border: 'none' }}>智能体</Tag>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {expert.subtitle}
              </div>
            </div>
          </div>
          <p style={{
            fontSize: 13, color: '#8c8c8c', lineHeight: 1.7, margin: '0 0 10px',
            height: 44, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {expert.kind === 'agent' ? `描述：${expert.description}` : expert.description}
          </p>
          {expert.kind === 'agent' && (
            <div style={{ fontSize: 12, color: '#bfbfbf', marginBottom: 10 }}>
              发布部门：{expert.department}
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {expert.tags.map((s) => (
              <Tag key={s} style={{
                margin: 0, fontSize: 11, borderRadius: 4,
                background: '#fafafa', color: '#8c8c8c', border: '1px solid #f0f0f0',
                lineHeight: '20px', padding: '0 8px',
              }}>
                {s}
              </Tag>
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid #f5f5f5', paddingTop: 10, fontSize: 12, color: '#8c99a8',
          }}>
            <span><StarOutlined style={{ marginRight: 3 }} />{expert.favorites}</span>
            <span><LikeOutlined style={{ marginRight: 3, color: expert.likes > 0 ? '#ff4d4f' : undefined }} />{expert.likes}</span>
            <span><FireOutlined style={{ marginRight: 3, color: '#fa541c' }} />{expert.heat}</span>
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: `linear-gradient(0deg, rgba(${BRAND_PRIMARY_RGB}, 0.48) 0%, rgba(${BRAND_PRIMARY_RGB}, 0.1) 65%, transparent 100%)`,
          borderRadius: '0 0 14px 14px',
          padding: '28px 18px 12px',
          display: 'flex', justifyContent: 'center',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(6px)',
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: isHovered ? 'auto' : 'none',
        }}>
          <Button
            type="primary"
            icon={<MessageOutlined />}
            onClick={(e) => startChat(expert, e)}
            style={{
              borderRadius: 20, padding: '0 24px', height: 34,
              background: '#fff', color: BRAND_PRIMARY, border: 'none',
              fontWeight: 600, fontSize: 13,
              boxShadow: `0 2px 8px rgba(${BRAND_PRIMARY_RGB}, 0.12)`,
            }}
          >
            召唤
          </Button>
        </div>
      </div>
    </Col>
    );
  };

  const mainTabs: { key: MainTab; label: string; icon: React.ReactNode }[] = [
    { key: 'experts', label: '专家', icon: <RobotOutlined /> },
    { key: 'favorites', label: '我的收藏', icon: <StarOutlined /> },
    { key: 'created', label: '我创建的', icon: <FolderAddOutlined /> },
  ];

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100%', padding: '20px 28px 32px' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {mainTabs.map((tab) => {
            const isActive = mainTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMainTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 20px', borderRadius: 0, border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  background: 'transparent',
                  color: isActive ? BRAND_PRIMARY : '#8c8c8c',
                  borderBottom: `2px solid ${isActive ? BRAND_PRIMARY : 'transparent'}`,
                  transition: 'all 0.2s',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Input
            placeholder="搜索专家名称或描述"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 260, borderRadius: 20, background: '#fff' }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            创建专家
          </Button>
        </div>
      </div>

      {(mainTab === 'experts' || mainTab === 'favorites' || mainTab === 'created') && (
        <>
          {mainTab === 'experts' && (
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
              精选场景
            </h2>
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'flex',
                gap: SCENE_GAP,
                overflow: 'hidden',
              }}>
                {visibleScenes.map((scene) => (
                  <div
                    key={scene.key}
                    style={{
                      flex: `0 0 ${SCENE_CARD_WIDTH}`,
                      minWidth: 0,
                      borderRadius: 12,
                      background: scene.gradient,
                      border: '1px solid #f0f0f0',
                      padding: '10px 12px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: '#1a1a1a',
                      marginBottom: 8,
                      paddingBottom: 6,
                      borderBottom: `2px solid ${scene.accent}20`,
                    }}>
                      {scene.key}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {scene.experts.map((expert) => (
                        <div
                          key={expert.id}
                          onClick={() => openDetail(expert)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            cursor: 'pointer', padding: '2px 0',
                            borderRadius: 6, transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          {expert.avatar ? (
                            <Avatar size={28} src={expert.avatar} />
                          ) : (
                            <Avatar size={28} style={{ background: expert.avatarColor || '#722ed1', fontSize: 12, fontWeight: 600 }}>
                              {expert.name.charAt(0)}
                            </Avatar>
                          )}
                          <span style={{
                            fontSize: 13, color: '#434343', fontWeight: 500,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {expert.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {scenePage > 0 && (
                <button
                  type="button"
                  aria-label="上一页"
                  onClick={() => setScenePage((p) => Math.max(0, p - 1))}
                  style={{
                    position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)',
                    width: 36, height: 36, borderRadius: '50%', border: 'none',
                    background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#595959', zIndex: 1,
                  }}
                >
                  <LeftOutlined style={{ fontSize: 12 }} />
                </button>
              )}
              {hasMoreScenes && (
                <button
                  type="button"
                  aria-label="下一页"
                  onClick={() => setScenePage((p) => Math.min(maxScenePage, p + 1))}
                  style={{
                    position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)',
                    width: 36, height: 36, borderRadius: '50%', border: 'none',
                    background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#595959', zIndex: 1,
                  }}
                >
                  <RightOutlined style={{ fontSize: 12 }} />
                </button>
              )}
            </div>
          </section>
          )}

          {/* Filter & sort */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                {mainTab === 'favorites' ? '我的收藏' : mainTab === 'created' ? '我创建的' : '专家'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
                <Badge color="#52c41a" text={<span style={{ fontSize: 12, color: '#52c41a' }}>在线 {activeCount}</span>} />
                <button
                  type="button"
                  onClick={() => setSortMode('hot')}
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                    color: sortMode === 'hot' ? BRAND_PRIMARY : '#8c8c8c',
                    fontWeight: sortMode === 'hot' ? 600 : 400,
                  }}
                >
                  <FireOutlined style={{ marginRight: 4 }} />最热
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode('new')}
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                    color: sortMode === 'new' ? BRAND_PRIMARY : '#8c8c8c',
                    fontWeight: sortMode === 'new' ? 600 : 400,
                  }}
                >
                  最新
                </button>
              </div>
            </div>
            <div style={{
              display: 'flex', gap: 4, overflowX: 'auto', flexWrap: 'wrap',
              padding: '2px 0',
            }}>
              {allCategories.map((cat) => {
                const isActive = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      flexShrink: 0,
                      padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: isActive ? 600 : 400,
                      background: '#fff',
                      color: isActive ? BRAND_PRIMARY : '#595959',
                      boxShadow: isActive ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <Row gutter={[16, 16]}>
            {filteredExperts.map(renderExpertCard)}
            {filteredExperts.length === 0 && (
              <Col span={24}>
                <Empty
                  description={
                    mainTab === 'favorites' ? '暂无收藏的专家'
                      : mainTab === 'created' ? '暂无创建的专家'
                        : '暂无匹配的专家'
                  }
                  style={{ padding: 60 }}
                />
              </Col>
            )}
          </Row>
        </>
      )}

      <EmployeeDetailModal
        open={detailOpen}
        expert={detailExpert}
        onClose={() => setDetailOpen(false)}
        isFavorited={detailExpert ? favoriteIds.has(detailExpert.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
};

export default DigitalEmployeePlaza;
