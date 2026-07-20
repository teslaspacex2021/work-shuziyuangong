import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { message } from 'antd';
import './AiToolPickerModal.css';

export type AiToolPickerType = 'skill' | 'knowledge' | 'mcp';

export interface AiToolPickerItem {
  id: string;
  name: string;
  desc: string;
  icon?: string;
  color?: string;
  selected?: boolean;
}

const MAX_SELECT = 99;

const MOCK_SKILLS: AiToolPickerItem[] = [
  { id: 's1', name: '期刊数据多维分析', desc: '多维度拆解期刊经营与内容数据，支持对比分析', icon: '⚡', color: '#722ed1', selected: false },
  { id: 's2', name: '大白话版数据分析', desc: '用通俗语言解读复杂数据结论与趋势', icon: '📊', color: '#1677ff', selected: false },
  { id: 's3', name: '数据可视化', desc: '自动生成图表与看板，辅助汇报与决策', icon: '📈', color: '#52c41a', selected: false },
  { id: 's4', name: '数据分析技能', desc: '通用数据分析与指标计算能力', icon: '🔍', color: '#fa8c16', selected: false },
  { id: 's5', name: '运营数据分析技能', desc: '面向运营场景的转化、留存与活动分析', icon: '📋', color: '#13c2c2', selected: false },
];

const MOCK_MCP: AiToolPickerItem[] = [
  { id: 'm1', name: '期刊数据多维分析', desc: '通过 MCP 调用期刊数据多维分析工具', selected: false },
  { id: 'm2', name: '大白话版数据分析', desc: '通过 MCP 调用通俗解读类分析工具', selected: false },
  { id: 'm3', name: '数据可视化', desc: '通过 MCP 生成可视化结果', selected: false },
  { id: 'm4', name: '数据分析技能', desc: '通用数据分析 MCP 工具', selected: false },
  { id: 'm5', name: '运营数据分析技能', desc: '运营场景 MCP 分析工具', selected: false },
];

const MOCK_KNOWLEDGE: AiToolPickerItem[] = [
  { id: 'k1', name: '集团翼办使用手册', desc: '集团办公室 · 操作手册', icon: '📘', color: '#1677ff', selected: false },
  { id: 'k2', name: '公文格式标准与排版规范', desc: '综合管理部 · 规范', icon: '📄', color: '#52c41a', selected: false },
  { id: 'k3', name: '2025年度收发文登记管理办法', desc: '集团办公室 · 制度', icon: '📋', color: '#722ed1', selected: false },
  { id: 'k4', name: '请示报告工作规范', desc: '人力资源部 · 规范', icon: '📝', color: '#fa8c16', selected: false },
  { id: 'k5', name: '安全公司督办系统操作手册', desc: '安全公司 · 操作手册', icon: '🛡️', color: '#13c2c2', selected: false },
  { id: 'k6', name: '协同办公竞品分析报告', desc: '数字化运营部 · 分析报告', icon: '📊', color: '#eb2f96', selected: false },
  { id: 'k7', name: '关于进一步加强公文管理工作的通知', desc: '集团办公室 · 通知', icon: '📢', color: '#ff4d4f', selected: false },
  { id: 'k8', name: '天翼云解决方案', desc: '政企事业部 · 方案', icon: '☁️', color: '#2f54eb', selected: false },
];

const CONFIGS: Record<
  AiToolPickerType,
  {
    sidebarTitle: string;
    showCreate: boolean;
    createLabel?: string;
    nav: { id: string; label: string; icon: string }[];
    listTitle: string;
    searchPlaceholder: string;
    getItems: () => AiToolPickerItem[];
  }
> = {
  skill: {
    sidebarTitle: '',
    showCreate: true,
    createLabel: '创建技能',
    nav: [
      { id: 'public', label: '公共技能', icon: '😊' },
      { id: 'custom', label: '自建技能', icon: '⚙️' },
    ],
    listTitle: '技能列表',
    searchPlaceholder: '搜索技能',
    getItems: () => MOCK_SKILLS,
  },
  mcp: {
    sidebarTitle: 'MCP工具',
    showCreate: false,
    nav: [
      { id: 'public', label: '公共MCP', icon: '😊' },
      { id: 'custom', label: '自建MCP', icon: '⚙️' },
    ],
    listTitle: 'MCP列表',
    searchPlaceholder: '搜索MCP',
    getItems: () => MOCK_MCP,
  },
  knowledge: {
    sidebarTitle: '智库',
    showCreate: false,
    nav: [
      { id: 'public', label: '公共智库', icon: '📚' },
      { id: 'department', label: '部门智库', icon: '🏢' },
      { id: 'personal', label: '我的收藏', icon: '⭐' },
    ],
    listTitle: '知识列表',
    searchPlaceholder: '搜索知识',
    getItems: () => MOCK_KNOWLEDGE,
  },
};

export interface AiToolPickerModalProps {
  open: boolean;
  type: AiToolPickerType | null;
  onClose: () => void;
  onSelectionChange?: (type: AiToolPickerType, selected: AiToolPickerItem[]) => void;
  /** 自定义列表（管理端传入业务数据）；不传则使用内置演示数据 */
  items?: AiToolPickerItem[];
  /** 覆盖是否展示「创建」按钮 */
  showCreate?: boolean;
}

const AiToolPickerModal: React.FC<AiToolPickerModalProps> = ({
  open,
  type,
  onClose,
  onSelectionChange,
  items: externalItems,
  showCreate,
}) => {
  const [navId, setNavId] = useState('public');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<AiToolPickerItem[]>([]);

  useEffect(() => {
    if (!open || !type) return;
    const cfg = CONFIGS[type];
    setNavId(cfg.nav[0].id);
    setSearchQuery('');
    const source = externalItems?.length
      ? externalItems
      : cfg.getItems();
    setItems(source.map((item) => ({ ...item })));
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
    // 仅在打开/切换类型时初始化，避免父级回写选中态时打断搜索与列表交互
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const cfg = type ? CONFIGS[type] : null;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const text = [item.name, item.desc].join(' ').toLowerCase();
      return text.includes(q);
    });
  }, [items, searchQuery]);

  const selected = useMemo(() => items.filter((i) => i.selected), [items]);

  const addItem = (id: string) => {
    if (selected.length >= MAX_SELECT) return;
    const next = items.map((item) => (item.id === id ? { ...item, selected: true } : item));
    setItems(next);
    if (type) onSelectionChange?.(type, next.filter((i) => i.selected));
  };

  const removeItem = (id: string) => {
    const next = items.map((item) => (item.id === id ? { ...item, selected: false } : item));
    setItems(next);
    if (type) onSelectionChange?.(type, next.filter((i) => i.selected));
  };

  if (!open || !type || !cfg) return null;

  return createPortal(
    <div
      className="ai-picker-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ai-picker-dialog" role="dialog" aria-modal="true">
        <aside className="ai-picker-sidebar">
          {cfg.sidebarTitle ? (
            <div className="ai-picker-sidebar-title">{cfg.sidebarTitle}</div>
          ) : null}
          {cfg.nav.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`ai-picker-nav-item${n.id === navId ? ' active' : ''}`}
              onClick={() => setNavId(n.id)}
            >
              <span className="ai-picker-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
          {(showCreate ?? cfg.showCreate) ? (
            <button
              type="button"
              className="ai-picker-create-btn"
              onClick={() => message.info(`${cfg.createLabel}（演示）`)}
            >
              + {cfg.createLabel}
            </button>
          ) : null}
        </aside>

        <main className="ai-picker-main">
          <div className="ai-picker-header">
            <div className="ai-picker-header-left">
              <h3>{cfg.listTitle}</h3>
              <div className="ai-picker-count">
                已选{selected.length}/{MAX_SELECT}
              </div>
            </div>
            <div className="ai-picker-header-right">
              <div className="ai-picker-search">
                <SearchOutlined style={{ color: '#bbb', fontSize: 14 }} />
                <input
                  type="text"
                  placeholder={cfg.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="button" className="ai-picker-close" aria-label="关闭" onClick={onClose}>
                ×
              </button>
            </div>
          </div>

          <div className="ai-picker-tags">
            {selected.map((item) => (
              <span key={item.id} className="ai-picker-tag">
                {item.icon ? (
                  <span
                    className="ai-picker-tag-icon"
                    style={{ background: item.color || '#fff1f0' }}
                  >
                    {item.icon}
                  </span>
                ) : null}
                <span>{item.name}</span>
                <button
                  type="button"
                  className="ai-picker-tag-remove"
                  aria-label="移除"
                  onClick={() => removeItem(item.id)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="ai-picker-list">
            {!filtered.length ? (
              <div className="ai-picker-empty">暂无匹配结果</div>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="ai-picker-item">
                  {type !== 'mcp' && item.icon ? (
                    <div
                      className="ai-picker-item-icon"
                      style={{
                        background: `${item.color || '#e4393c'}15`,
                        color: item.color || '#e4393c',
                      }}
                    >
                      {item.icon}
                    </div>
                  ) : null}
                  <div className="ai-picker-item-body">
                    <div className="ai-picker-item-title">{item.name}</div>
                    <div className="ai-picker-item-desc">{item.desc}</div>
                  </div>
                  <div className="ai-picker-item-action">
                    {item.selected ? (
                      <span className="ai-picker-check">
                        <CheckOutlined style={{ fontSize: 16 }} />
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="ai-picker-add-btn"
                        onClick={() => addItem(item.id)}
                      >
                        添加
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>,
    document.body,
  );
};

export default AiToolPickerModal;
