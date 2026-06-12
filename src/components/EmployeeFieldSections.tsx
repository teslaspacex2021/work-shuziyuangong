import React from 'react';
import { Card, Descriptions, Table, Tag } from 'antd';
import type { DigitalEmployee } from '../mock/data';

const yesNoColor = (v?: string) => (v === '是' ? 'success' : v === '否' ? 'error' : 'default');

const emptyText = (v?: string | number | null) =>
  v === undefined || v === null || v === '' ? <span style={{ color: '#999' }}>—</span> : v;

interface EmployeeFieldSectionsProps {
  employee: DigitalEmployee;
}

const EmployeeFieldSections: React.FC<EmployeeFieldSectionsProps> = ({ employee }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Card size="small" title="基本信息" style={{ borderRadius: 8 }}>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="数字员工名称">{employee.name}</Descriptions.Item>
        <Descriptions.Item label="所属条线">{emptyText(employee.businessLine)}</Descriptions.Item>
        <Descriptions.Item label="基准岗位">{emptyText(employee.position)}</Descriptions.Item>
        <Descriptions.Item label="级别">
          {employee.capabilityLevel
            ? <Tag color="blue">{employee.capabilityLevel}</Tag>
            : emptyText()}
        </Descriptions.Item>
        <Descriptions.Item label="应用职责描述" span={2}>
          {emptyText(employee.responsibility ?? employee.description)}
        </Descriptions.Item>
        <Descriptions.Item label="运营负责人">{emptyText(employee.operationOwner)}</Descriptions.Item>
        <Descriptions.Item label="业务负责人">{emptyText(employee.businessOwner)}</Descriptions.Item>
        <Descriptions.Item label="技术负责人" span={2}>
          {emptyText(employee.techOwner)}
        </Descriptions.Item>
      </Descriptions>
    </Card>

    <Card size="small" title="产出指标项" style={{ borderRadius: 8 }}>
      {(employee.outputMetrics?.length ?? 0) > 0 ? (
        <Table
          size="small"
          pagination={false}
          rowKey={(_, i) => String(i)}
          dataSource={employee.outputMetrics}
          columns={[
            { title: '指标名称', dataIndex: 'name', key: 'name' },
            { title: '统计周期', dataIndex: 'cycle', key: 'cycle', width: 90 },
            { title: '统计单位', dataIndex: 'unit', key: 'unit', width: 90 },
            { title: '上岗目标值', dataIndex: 'target', key: 'target', width: 100 },
            { title: '指标数据来源（系统）', dataIndex: 'source', key: 'source' },
          ]}
        />
      ) : (
        <span style={{ color: '#999' }}>暂未配置产出指标</span>
      )}
    </Card>

    <Card size="small" title="算力投资设计信息" style={{ borderRadius: 8 }}>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="设计最大并发数">
          {emptyText(employee.designMaxConcurrency)}
        </Descriptions.Item>
        <Descriptions.Item label="设计 tokens 数">
          {employee.designTokensPerSec !== undefined
            ? `${employee.designTokensPerSec} tokens/秒`
            : emptyText()}
        </Descriptions.Item>
      </Descriptions>
    </Card>

    <Card size="small" title="合规" style={{ borderRadius: 8 }}>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="安检是否通过">
          {employee.securityPassed
            ? <Tag color={yesNoColor(employee.securityPassed)}>{employee.securityPassed}</Tag>
            : emptyText()}
        </Descriptions.Item>
        <Descriptions.Item label="是否符合日志审计">
          {employee.logAuditCompliant
            ? <Tag color={yesNoColor(employee.logAuditCompliant)}>{employee.logAuditCompliant}</Tag>
            : emptyText()}
        </Descriptions.Item>
      </Descriptions>
    </Card>

    <Card size="small" title="运行配置" style={{ borderRadius: 8 }}>
      {(employee.runSystems?.length ?? 0) > 0 ? (
        <Table
          size="small"
          pagination={false}
          rowKey={(_, i) => String(i)}
          dataSource={employee.runSystems}
          columns={[
            { title: '关联系统名称', dataIndex: 'systemName', key: 'systemName' },
            { title: '系统级别', dataIndex: 'systemLevel', key: 'systemLevel', width: 110 },
            { title: '关联系统权限', dataIndex: 'permission', key: 'permission' },
            {
              title: '预估 tokens 数',
              dataIndex: 'estimatedTokens',
              key: 'estimatedTokens',
              width: 120,
              render: (v: number) => v?.toLocaleString() ?? '—',
            },
            {
              title: '预估并发数',
              dataIndex: 'estimatedConcurrency',
              key: 'estimatedConcurrency',
              width: 100,
            },
          ]}
        />
      ) : (
        <span style={{ color: '#999' }}>暂未配置关联系统</span>
      )}
    </Card>
  </div>
);

export default EmployeeFieldSections;
