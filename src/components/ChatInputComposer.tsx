import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Dropdown, message } from 'antd';
import {
  SendOutlined,
  DownOutlined,
  AppstoreOutlined,
  PlusOutlined,
  PaperClipOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  RobotOutlined,
  ToolOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { EmployeeFeatureFlags } from '../mock/data';
import { digitalEmployees, skills } from '../mock/data';
import { BRAND_PRIMARY } from '../theme/brand';
import AiToolPickerModal, { type AiToolPickerItem, type AiToolPickerType } from './AiToolPickerModal';

export interface ChatMentionEmployee {
  id: string;
  name: string;
  department?: string;
  avatar?: string;
}

export interface ChatMentionSkill {
  id: string;
  name: string;
  description?: string;
}

export interface ChatInputComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  loading?: boolean;
  /** 未选员工时显示全部入口；已选员工时按开关显隐 */
  featureFlags?: EmployeeFeatureFlags | null;
  /** 未选员工时是否展示默认可点工具（欢迎页） */
  showAllWhenNoFlags?: boolean;
  onSummonEmployee?: () => void;
  summonLabel?: string;
  onOpenThinkTank?: () => void;
  onOpenSkill?: () => void;
  onOpenMcp?: () => void;
  mcpItems?: AiToolPickerItem[];
  maxWidth?: number | string;
  /** @ 可选数字员工列表，默认取在岗员工 */
  mentionEmployees?: ChatMentionEmployee[];
  /** / 可选技能列表，默认取已启用技能 */
  mentionSkills?: ChatMentionSkill[];
  /** 通过 @ 选中员工后的回调（如切换当前对话员工） */
  onMentionEmployee?: (employee: ChatMentionEmployee) => void;
  /** 通过 / 选中技能后的回调 */
  onMentionSkill?: (skill: ChatMentionSkill) => void;
  /** 当前对话中的数字员工（用于 @ 列表排除/提示；不在输入框展示员工标签） */
  currentEmployeeId?: string;
}

type MentionKind = 'employee' | 'skill';

type MentionState = {
  kind: MentionKind;
  query: string;
  start: number;
};

const MODEL_OPTIONS = [
  { key: 'auto', label: 'Auto' },
  { key: 'glm-4', label: 'GLM-4' },
  { key: 'deepseek-v3', label: 'DeepSeek-V3' },
  { key: 'qwen-max', label: '通义千问 Max' },
  { key: 'xirang-star', label: '星辰大模型' },
];

const DEFAULT_EMPLOYEES: ChatMentionEmployee[] = digitalEmployees
  .filter((e) => e.status === 'ACTIVE')
  .map((e) => ({
    id: e.id,
    name: e.name,
    department: e.department,
    avatar: e.avatar,
  }));

const DEFAULT_SKILLS: ChatMentionSkill[] = skills
  .filter((s) => s.status === '已启用')
  .map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
  }));

function detectMention(value: string, cursor: number): MentionState | null {
  const before = value.slice(0, cursor);
  const atIdx = before.lastIndexOf('@');
  const slashIdx = before.lastIndexOf('/');
  const triggerIdx = Math.max(atIdx, slashIdx);
  if (triggerIdx < 0) return null;

  const triggerChar = before[triggerIdx];
  const query = before.slice(triggerIdx + 1);
  if (query.includes(' ') || query.includes('\n')) return null;

  if (triggerChar === '@') {
    if (slashIdx > atIdx) return null;
    return { kind: 'employee', query, start: triggerIdx };
  }
  if (triggerChar === '/') {
    if (atIdx > slashIdx) return null;
    return { kind: 'skill', query, start: triggerIdx };
  }
  return null;
}

const chipBtnStyle = (active = false): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  height: 32,
  padding: '0 12px',
  border: `1px solid ${active ? BRAND_PRIMARY : '#e8e8e8'}`,
  background: '#fff',
  borderRadius: 16,
  fontSize: 13,
  color: active ? BRAND_PRIMARY : '#666',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

const iconBtnStyle = (active = false): React.CSSProperties => ({
  width: 32,
  height: 32,
  border: `1px solid ${active ? BRAND_PRIMARY : '#e8e8e8'}`,
  background: active ? '#fffafa' : '#fff',
  borderRadius: 8,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: active ? BRAND_PRIMARY : '#999',
  padding: 0,
  transition: 'all 0.2s',
  flexShrink: 0,
});

const ChatInputComposer: React.FC<ChatInputComposerProps> = ({
  value,
  onChange,
  onSend,
  placeholder = '请直接提出您的问题~',
  loading = false,
  featureFlags = null,
  showAllWhenNoFlags = true,
  onSummonEmployee,
  summonLabel = '切换专家',
  onOpenThinkTank,
  onOpenSkill,
  onOpenMcp,
  mcpItems,
  maxWidth,
  mentionEmployees = DEFAULT_EMPLOYEES,
  mentionSkills = DEFAULT_SKILLS,
  onMentionEmployee,
  onMentionSkill,
  currentEmployeeId,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [modelKey, setModelKey] = useState('auto');
  const [focused, setFocused] = useState(false);
  const [pickerType, setPickerType] = useState<AiToolPickerType | null>(null);
  const [selectedCounts, setSelectedCounts] = useState({
    skill: 3,
    knowledge: 0,
    mcp: mcpItems ? mcpItems.filter((item) => item.selected).length : 3,
  });
  const [mention, setMention] = useState<MentionState | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  /** / 选中的技能：以标签形式展示在输入框顶部，可多选 */
  const [selectedSkills, setSelectedSkills] = useState<ChatMentionSkill[]>([]);

  useEffect(() => {
    if (!mcpItems) return;
    setSelectedCounts((prev) => ({
      ...prev,
      mcp: mcpItems.filter((item) => item.selected).length,
    }));
  }, [mcpItems]);

  const openPicker = (type: AiToolPickerType) => {
    setPickerType(type);
    if (type === 'skill') onOpenSkill?.();
    if (type === 'knowledge') onOpenThinkTank?.();
    if (type === 'mcp') onOpenMcp?.();
  };

  const visible = useMemo(() => {
    if (!featureFlags) {
      return {
        attachmentUpload: showAllWhenNoFlags,
        skill: showAllWhenNoFlags,
        mcp: showAllWhenNoFlags,
        thinkTank: showAllWhenNoFlags,
        summon: true,
      };
    }
    return {
      attachmentUpload: featureFlags.attachmentUpload,
      skill: featureFlags.skill,
      mcp: featureFlags.mcp,
      thinkTank: featureFlags.thinkTank,
      summon: true,
    };
  }, [featureFlags, showAllWhenNoFlags]);

  const toolMenuItems = useMemo(() => {
    const items: {
      key: string;
      label: React.ReactNode;
      icon: React.ReactNode;
      onClick: () => void;
    }[] = [];

    if (visible.skill) {
      items.push({
        key: 'skill',
        icon: <ThunderboltOutlined />,
        label: (
          <span>
            技能
            {selectedCounts.skill > 0 ? (
              <span style={{ marginLeft: 6, color: BRAND_PRIMARY }}>{selectedCounts.skill}</span>
            ) : null}
          </span>
        ),
        onClick: () => openPicker('skill'),
      });
    }
    if (visible.thinkTank) {
      items.push({
        key: 'knowledge',
        icon: <DatabaseOutlined />,
        label: (
          <span>
            智库
            {selectedCounts.knowledge > 0 ? (
              <span style={{ marginLeft: 6, color: BRAND_PRIMARY }}>{selectedCounts.knowledge}</span>
            ) : null}
          </span>
        ),
        onClick: () => openPicker('knowledge'),
      });
    }
    if (visible.mcp) {
      items.push({
        key: 'mcp',
        icon: <ApiOutlined />,
        label: (
          <span>
            MCP
            {selectedCounts.mcp > 0 ? (
              <span style={{ marginLeft: 6, color: BRAND_PRIMARY }}>{selectedCounts.mcp}</span>
            ) : null}
          </span>
        ),
        onClick: () => openPicker('mcp'),
      });
    }
    return items;
  }, [visible, selectedCounts]);

  const hasCollapsedTools = toolMenuItems.length > 0;
  const toolsActive =
    selectedCounts.skill > 0 || selectedCounts.knowledge > 0 || selectedCounts.mcp > 0;

  const modelLabel = MODEL_OPTIONS.find((m) => m.key === modelKey)?.label ?? 'Auto';
  const effectivePlaceholder = `${placeholder}  @ 切换数字员工， / 添加技能标签`;

  const filteredEmployees = useMemo(() => {
    if (!mention || mention.kind !== 'employee') return [];
    const q = mention.query.toLowerCase();
    return mentionEmployees.filter((e) =>
      e.id !== currentEmployeeId
      && (!q || e.name.toLowerCase().includes(q) || e.department?.toLowerCase().includes(q)),
    ).slice(0, 8);
  }, [mention, mentionEmployees, currentEmployeeId]);

  const filteredSkills = useMemo(() => {
    if (!mention || mention.kind !== 'skill') return [];
    const q = mention.query.toLowerCase();
    const selectedIds = new Set(selectedSkills.map((s) => s.id));
    return mentionSkills.filter((s) =>
      !selectedIds.has(s.id)
      && (!q || s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)),
    ).slice(0, 8);
  }, [mention, mentionSkills, selectedSkills]);

  const mentionItems = mention?.kind === 'employee' ? filteredEmployees : filteredSkills;
  const mentionOpen = !!mention;
  const hasChips = selectedSkills.length > 0;

  useEffect(() => {
    setMentionIndex(0);
  }, [mention?.query, mention?.kind]);

  const syncMention = useCallback((nextValue: string, cursor: number) => {
    setMention(detectMention(nextValue, cursor));
  }, []);

  /** 选中后清除触发符与查询词，改为标签展示（技能）或切换员工（@） */
  const stripTriggerAndKeepText = useCallback((start: number, cursor: number) => {
    const nextValue = value.slice(0, start) + value.slice(cursor);
    onChange(nextValue);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(start, start);
    });
  }, [onChange, value]);

  const applyMention = useCallback((
    item: ChatMentionEmployee | ChatMentionSkill,
    kind: MentionKind,
  ) => {
    if (!mention) return;
    const cursor = textareaRef.current?.selectionStart ?? value.length;
    stripTriggerAndKeepText(mention.start, cursor);
    setMention(null);

    if (kind === 'employee') {
      // 不展示员工标签：对话对象由页头/占位符体现，避免与「切换专家」不同步
      onMentionEmployee?.(item as ChatMentionEmployee);
      return;
    }

    const skill = item as ChatMentionSkill;
    setSelectedSkills((prev) => (prev.some((s) => s.id === skill.id) ? prev : [...prev, skill]));
    onMentionSkill?.(skill);
  }, [mention, onMentionEmployee, onMentionSkill, stripTriggerAndKeepText, value.length]);

  const removeSkill = (id: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSendClick = () => {
    onSend();
    setSelectedSkills([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    onChange(next);
    syncMention(next, e.target.selectionStart ?? next.length);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    syncMention(value, el.selectionStart ?? value.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen && mentionItems.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % mentionItems.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + mentionItems.length) % mentionItems.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const item = mentionItems[mentionIndex];
        if (item) applyMention(item, mention!.kind);
        return;
      }
    }
    if (mentionOpen && e.key === 'Escape') {
      e.preventDefault();
      setMention(null);
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    padding: '0 8px 0 10px',
    borderRadius: 8,
    background: '#f5f5f5',
    border: '1px solid #ebebeb',
    fontSize: 13,
    color: '#333',
    lineHeight: 1,
    maxWidth: 220,
  };

  return (
    <div style={{ width: '100%', maxWidth, margin: '0 auto' }}>
      <div
        style={{
          position: 'relative',
          border: `1px solid ${focused ? 'rgba(228, 57, 60, 0.4)' : '#e8e8e8'}`,
          borderRadius: 12,
          background: '#fff',
          boxShadow: focused ? '0 0 0 2px rgba(228, 57, 60, 0.08)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          overflow: 'visible',
        }}
      >
        {mentionOpen && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: '100%',
              marginBottom: 8,
              background: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(15,35,70,0.12)',
              maxHeight: 280,
              overflowY: 'auto',
              zIndex: 20,
            }}
          >
            <div style={{
              padding: '8px 12px',
              fontSize: 12,
              color: '#999',
              borderBottom: '1px solid #f0f0f0',
            }}
            >
              {mention?.kind === 'employee'
                ? (currentEmployeeId ? '切换数字员工（@，一次一位）' : '选择数字员工（@）')
                : '选择技能（/）'}
            </div>
            {mention?.kind === 'employee' && filteredEmployees.map((emp, idx) => (
              <button
                key={emp.id}
                type="button"
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  applyMention(emp, 'employee');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  background: idx === mentionIndex ? '#fff1f0' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <Avatar size={32} src={emp.avatar} icon={<RobotOutlined />} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{emp.name}</div>
                  {emp.department && (
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{emp.department}</div>
                  )}
                </div>
              </button>
            ))}
            {mention?.kind === 'skill' && filteredSkills.map((skill, idx) => (
              <button
                key={skill.id}
                type="button"
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  applyMention(skill, 'skill');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  background: idx === mentionIndex ? '#fff1f0' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#f5f5f5',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  flexShrink: 0,
                }}
                >
                  <ToolOutlined />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{skill.name}</div>
                  {skill.description && (
                    <div style={{
                      fontSize: 12,
                      color: '#999',
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    >
                      {skill.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
            {mention?.kind === 'skill' && filteredSkills.length === 0 && (
              <div style={{ padding: '12px', fontSize: 13, color: '#999' }}>暂无更多可添加技能</div>
            )}
            {mention?.kind === 'employee' && filteredEmployees.length === 0 && (
              <div style={{ padding: '12px', fontSize: 13, color: '#999' }}>暂无匹配的数字员工</div>
            )}
          </div>
        )}

        {hasChips && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '10px 14px 0',
          }}
          >
            {selectedSkills.map((skill) => (
              <span key={skill.id} style={chipStyle}>
                <ToolOutlined style={{ fontSize: 13, color: '#595959' }} />
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 160,
                }}
                >
                  {skill.name}
                </span>
                <button
                  type="button"
                  aria-label={`移除技能 ${skill.name}`}
                  onClick={() => removeSkill(skill.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    marginLeft: 2,
                    cursor: 'pointer',
                    color: '#999',
                    display: 'inline-flex',
                    lineHeight: 1,
                  }}
                >
                  <CloseOutlined style={{ fontSize: 10 }} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div style={{ padding: hasChips ? '8px 14px 6px' : '12px 14px 6px' }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onClick={handleSelect}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              window.setTimeout(() => setMention(null), 150);
            }}
            placeholder={effectivePlaceholder}
            rows={Math.min(10, Math.max(3, (value.match(/\n/g)?.length ?? 0) + 1))}
            style={{
              display: 'block',
              width: '100%',
              border: 'none',
              outline: 'none',
              resize: 'none',
              margin: 0,
              padding: 0,
              fontSize: 14,
              fontFamily: 'inherit',
              color: '#333',
              lineHeight: '22px',
              background: 'transparent',
              minHeight: 66,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '4px 10px 10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
            {hasCollapsedTools && (
              <Dropdown
                menu={{
                  items: toolMenuItems.map((item) => ({
                    key: item.key,
                    icon: item.icon,
                    label: item.label,
                    onClick: item.onClick,
                  })),
                }}
                trigger={['click']}
                placement="topLeft"
              >
                <button
                  type="button"
                  style={iconBtnStyle(toolsActive)}
                  aria-label="更多工具"
                  title="技能 / 智库 / MCP"
                >
                  <PlusOutlined style={{ fontSize: 14 }} />
                </button>
              </Dropdown>
            )}

            {visible.summon && onSummonEmployee && (
              <button type="button" style={chipBtnStyle()} onClick={onSummonEmployee}>
                <AppstoreOutlined style={{ fontSize: 14 }} />
                {summonLabel}
              </button>
            )}

            {visible.attachmentUpload && (
              <button
                type="button"
                style={iconBtnStyle()}
                aria-label="上传附件"
                title="上传附件"
                onClick={() => message.info('选择附件（演示）')}
              >
                <PaperClipOutlined style={{ fontSize: 14 }} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Dropdown
              menu={{
                items: MODEL_OPTIONS.map((m) => ({
                  key: m.key,
                  label: m.label,
                  onClick: () => setModelKey(m.key),
                })),
                selectedKeys: [modelKey],
              }}
              trigger={['click']}
              placement="topRight"
            >
              <button type="button" style={chipBtnStyle()} title="大模型选择">
                <span>{modelLabel}</span>
                <DownOutlined style={{ fontSize: 10, color: '#999' }} />
              </button>
            </Dropdown>
            <button
              type="button"
              aria-label="发送"
              disabled={loading || !value.trim()}
              onClick={handleSendClick}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: !value.trim() ? '#ffccc7' : BRAND_PRIMARY,
                color: '#fff',
                border: 'none',
                cursor: !value.trim() || loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s, transform 0.15s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <SendOutlined style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      </div>

      <AiToolPickerModal
        open={!!pickerType}
        type={pickerType}
        items={pickerType === 'mcp' ? mcpItems : undefined}
        onClose={() => setPickerType(null)}
        onSelectionChange={(type, selected) => {
          setSelectedCounts((prev) => ({ ...prev, [type]: selected.length }));
        }}
      />
    </div>
  );
};

export default ChatInputComposer;
