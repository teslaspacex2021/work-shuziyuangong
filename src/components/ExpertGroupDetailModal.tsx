import React from 'react';
import { Modal, Avatar, Tag, Button } from 'antd';
import { CloseOutlined, RightOutlined, StarOutlined, StarFilled, CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ExpertGroup } from '../mock/data';

interface ExpertGroupDetailModalProps {
  open: boolean;
  group: ExpertGroup | null;
  onClose: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const formatUsageCount = (heat: number) => {
  const count = heat * 100;
  if (count >= 10000) return `${(count / 10000).toFixed(2)}万次使用`;
  return `${count}次使用`;
};

const ExpertGroupDetailModal: React.FC<ExpertGroupDetailModalProps> = ({
  open,
  group,
  onClose,
  isFavorited = false,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();

  if (!group) return null;

  const handleToggleFavorite = () => {
    onToggleFavorite?.(group.id);
  };

  const handleSummon = () => {
    onClose();
    navigate(`/digital-employee/chat?groupId=${group.id}`);
  };

  const handlePromptClick = (prompt: string) => {
    onClose();
    navigate(`/digital-employee/chat?groupId=${group.id}&msg=${encodeURIComponent(prompt)}`);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      closable={false}
      style={{ borderRadius: 16, overflow: 'hidden' }}
      styles={{ body: { padding: 0, overflow: 'hidden' } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
        <div style={{ position: 'relative', flexShrink: 0, padding: '20px 24px 14px', background: '#fff' }}>
          <div style={{
            position: 'absolute', top: 12, right: 12, zIndex: 2,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorited ? '取消收藏' : '收藏'}
          style={{
            height: 32,
            padding: '0 12px',
            border: 'none',
            borderRadius: 16,
            background: isFavorited ? '#fff7e6' : 'rgba(0,0,0,0.04)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: isFavorited ? '#faad14' : '#8c8c8c',
            fontSize: 13,
            fontWeight: isFavorited ? 600 : 400,
          }}
        >
          {isFavorited ? <StarFilled /> : <StarOutlined />}
          {isFavorited ? '已收藏' : '收藏'}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          style={{
            width: 32,
            height: 32,
            border: 'none',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.04)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8c8c8c',
          }}
        >
          <CloseOutlined style={{ fontSize: 12 }} />
        </button>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {group.avatar ? (
            <Avatar
              size={56}
              src={group.avatar}
              shape="square"
              style={{
                flexShrink: 0,
                borderRadius: 10,
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              }}
            />
          ) : (
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              flexShrink: 0,
              background: group.avatarColor || '#531dab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
                {group.name.charAt(0)}
              </span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2, paddingRight: 88 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                {group.name}
              </h2>
              {group.isSuper && (
                <Tag style={{
                  margin: 0, borderRadius: 4, background: 'linear-gradient(135deg, #531dab, #722ed1)',
                  color: '#fff', border: 'none', fontSize: 11, fontWeight: 600,
                }}>
                  超级
                </Tag>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
              <Tag style={{
                margin: 0, borderRadius: 4, background: '#f5f5f5',
                color: '#595959', border: 'none', fontSize: 12,
              }}>
                {group.category}
              </Tag>
              <Tag style={{
                margin: 0, borderRadius: 4, background: '#f5f5f5',
                color: '#595959', border: 'none', fontSize: 12,
              }}>
                专家团
              </Tag>
            </div>
            <span style={{ fontSize: 12, color: '#bfbfbf' }}>
              {formatUsageCount(group.heat)}
            </span>
          </div>
        </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          padding: '0 24px 14px',
        }}>
        <section style={{ marginBottom: 12 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
            能力介绍
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#595959', lineHeight: 1.6 }}>
            {group.description}
          </p>
        </section>

        <section style={{ marginBottom: 12 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
            擅长领域
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {group.tags.map((tag) => (
              <Tag
                key={tag}
                style={{
                  margin: 0,
                  padding: '2px 10px',
                  borderRadius: 4,
                  background: '#fafafa',
                  color: '#595959',
                  border: '1px solid #f0f0f0',
                  fontSize: 12,
                }}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 12 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
            团队成员
          </h3>
          <div style={{ borderRadius: 8, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            {group.members.map((member, index) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderBottom: index < group.members.length - 1 ? '1px solid #f5f5f5' : 'none',
                }}
              >
                {member.avatar ? (
                  <Avatar size={30} src={member.avatar} />
                ) : (
                  <Avatar
                    size={30}
                    style={{ background: member.avatarColor || '#722ed1', fontSize: 12, fontWeight: 600 }}
                  >
                    {member.name.charAt(0)}
                  </Avatar>
                )}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>
                    {member.role}
                  </span>
                  <span style={{ fontSize: 13, color: '#8c8c8c' }}>{member.name}</span>
                  {member.isHost && (
                    <Tag
                      icon={<CrownOutlined />}
                      style={{
                        margin: 0,
                        borderRadius: 4,
                        background: '#fff7e6',
                        color: '#fa8c16',
                        border: '1px solid #ffd591',
                        fontSize: 11,
                        lineHeight: '18px',
                      }}
                    >
                      主理人
                    </Tag>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
            试试这样问我
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {group.examplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #f0f0f0',
                  background: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d9d9d9';
                  e.currentTarget.style.background = '#fafafa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.background = '#fff';
                }}
              >
                <span style={{ fontSize: 13, color: '#434343', flex: 1 }}>
                  &ldquo;{prompt}&rdquo;
                </span>
                <RightOutlined style={{ fontSize: 12, color: '#bfbfbf', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </section>
        </div>

        <div style={{
          flexShrink: 0,
          padding: '10px 24px 18px',
          borderTop: '1px solid #f5f5f5',
          background: '#fff',
        }}>
        <Button
          type="primary"
          block
          size="large"
          onClick={handleSummon}
          style={{
            height: 42,
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            background: '#1a1a1a',
            borderColor: '#1a1a1a',
          }}
        >
          召唤 {group.name}
        </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExpertGroupDetailModal;
