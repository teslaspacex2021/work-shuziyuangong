import React, { useMemo } from 'react';
import {
  Modal, Form, Input, Select, InputNumber, Card, Row, Col, Upload, DatePicker,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  SYSTEM_LEVELS, positions,
  type BusinessLine, type CapabilityLevel, type OutputMetric, type RunSystemConfig,
} from '../mock/data';

export interface EmployeeFormValues {
  name: string;
  alias?: string;
  avatar?: string;
  employeeNumber: string;
  onboardDate?: dayjs.Dayjs;
  department: string;
  businessLine: BusinessLine;
  position: string;
  ownerType: '自有' | '外包';
  capabilityLevel: CapabilityLevel;
  responsibility: string;
  operationOwner: string;
  businessOwner: string;
  techOwner: string;
  outputMetrics: OutputMetric[];
  designMaxConcurrency: number;
  designTokensPerSec: number;
  securityPassed: '是' | '否';
  logAuditCompliant: '是' | '否';
  runSystems: RunSystemConfig[];
}

const defaultOutputMetric = (): OutputMetric => ({
  name: '', cycle: '', unit: '', target: '', source: '',
});

const defaultRunSystem = (): RunSystemConfig => ({
  systemName: '', systemLevel: '公司级系统', permission: '', estimatedTokens: 0, estimatedConcurrency: 0,
});

const initialValues: Partial<EmployeeFormValues> = {
  outputMetrics: [defaultOutputMetric()],
  runSystems: [defaultRunSystem()],
  designMaxConcurrency: 0,
  designTokensPerSec: 0,
  securityPassed: '是',
  logAuditCompliant: '是',
  ownerType: '自有',
};

interface EmployeeFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
}

export const fullHeightModalStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    maxHeight: '100vh',
    overflow: 'hidden',
  },
  header: {
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto' as const,
  },
  footer: {
    flexShrink: 0,
  },
};

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm<EmployeeFormValues>();

  const positionOptions = useMemo(
    () => positions
      .filter((p) => p.status === '启用')
      .map((p) => {
        const full = p.employeeCount >= p.maxEmployeeCount;
        return {
          label: full ? `${p.name}（已满员）` : p.name,
          value: p.name,
          disabled: full,
        };
      }),
    [],
  );

  const handlePositionSelect = (positionName?: string) => {
    if (!positionName) {
      form.setFieldsValue({
        alias: undefined,
        businessLine: undefined,
        department: undefined,
        position: undefined,
        capabilityLevel: undefined,
        responsibility: undefined,
      });
      return;
    }
    const pos = positions.find((p) => p.name === positionName);
    if (!pos) return;
    form.setFieldsValue({
      alias: positionName,
      businessLine: pos.category as BusinessLine,
      department: pos.department,
      position: pos.benchmarkPosition,
      capabilityLevel: pos.capabilityLevel,
      responsibility: pos.description,
    });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="新增员工"
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="创建"
      cancelText="取消"
      width={860}
      centered={false}
      destroyOnClose
      style={{ top: 0, paddingBottom: 0, maxWidth: '100vw' }}
      styles={fullHeightModalStyles}
    >
      <Form form={form} layout="vertical" initialValues={initialValues} style={{ marginTop: 8 }}>
        <Card size="small" title="基本信息" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="数字员工名称"
                rules={[{ required: true, message: '请选择数字员工名称' }]}
              >
                <Select
                  placeholder="请选择岗位"
                  showSearch
                  optionFilterProp="label"
                  allowClear
                  options={positionOptions}
                  onChange={handlePositionSelect}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="alias" label="数字员工别名">
                <Input placeholder="默认同数字员工名称，可修改" allowClear />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="头像">
                <Upload
                  listType="picture-circle"
                  maxCount={1}
                  accept="image/*"
                  beforeUpload={() => false}
                  onChange={({ fileList }) => {
                    const file = fileList[0]?.originFileObj as File | undefined;
                    form.setFieldValue('avatar', file ? URL.createObjectURL(file) : undefined);
                  }}
                >
                  <button type="button" style={{ border: 0, background: 'none', cursor: 'pointer' }}>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>头像</div>
                  </button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="employeeNumber"
                label="工号"
                rules={[
                  { required: true, message: '请输入工号' },
                  { pattern: /^DE-\d{4,}$/i, message: '工号格式应为 DE- 加数字，如 DE-2026011' },
                ]}
              >
                <Input placeholder="请输入工号" allowClear />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="onboardDate" label="入职日期">
                <DatePicker style={{ width: '100%' }} placeholder="请选择入职日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部门"
                rules={[{ required: true, message: '请先选择数字员工名称以带入部门' }]}
              >
                <Input
                  placeholder="选择岗位后自动带入"
                  readOnly
                  style={{ background: '#f5f5f5', cursor: 'not-allowed', color: 'rgba(0,0,0,0.88)' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="businessLine"
                label="所属条线"
                rules={[{ required: true, message: '请先选择数字员工名称以带入所属条线' }]}
              >
                <Input
                  placeholder="选择岗位后自动带入"
                  readOnly
                  style={{ background: '#f5f5f5', cursor: 'not-allowed', color: 'rgba(0,0,0,0.88)' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="基准岗位"
                rules={[{ required: true, message: '请先选择数字员工名称以带入基准岗位' }]}
              >
                <Input
                  placeholder="选择岗位后自动带入"
                  readOnly
                  style={{ background: '#f5f5f5', cursor: 'not-allowed', color: 'rgba(0,0,0,0.88)' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ownerType"
                label="身份类型"
                rules={[{ required: true, message: '请选择身份类型' }]}
              >
                <Select
                  placeholder="请选择身份类型"
                  options={[
                    { label: '自有', value: '自有' },
                    { label: '外包', value: '外包' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="capabilityLevel"
                label="级别"
                rules={[{ required: true, message: '请先选择数字员工名称以带入级别' }]}
              >
                <Input
                  placeholder="选择岗位后自动带入"
                  readOnly
                  style={{ background: '#f5f5f5', cursor: 'not-allowed', color: 'rgba(0,0,0,0.88)' }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="responsibility"
                label="应用职责描述"
                rules={[{ required: true, message: '请输入应用职责描述' }]}
              >
                <Input.TextArea
                  rows={3}
                  maxLength={500}
                  showCount
                  placeholder="描述该数字员工的主要职责与应用场景"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="operationOwner"
                label="运营负责人"
                rules={[{ required: true, message: '请输入运营负责人' }]}
              >
                <Input placeholder="姓名" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="businessOwner"
                label="业务负责人"
                rules={[{ required: true, message: '请输入业务负责人' }]}
              >
                <Input placeholder="姓名" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="techOwner"
                label="技术负责人"
                rules={[{ required: true, message: '请输入技术负责人' }]}
              >
                <Input placeholder="姓名" allowClear />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card size="small" title="产出指标项" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name={['outputMetrics', 0, 'name']}
                label="指标名称"
                rules={[{ required: true, message: '请输入指标名称' }]}
              >
                <Input placeholder="例如：工单处理量" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={['outputMetrics', 0, 'cycle']} label="统计周期">
                <Input placeholder="日/周/月" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={['outputMetrics', 0, 'unit']} label="统计单位">
                <Input placeholder="单/次/%" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['outputMetrics', 0, 'target']} label="上岗目标值">
                <Input placeholder="目标值" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name={['outputMetrics', 0, 'source']} label="指标数据来源（系统）">
                <Input placeholder="数据来源系统名称" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card size="small" title="算力投资设计信息" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="designMaxConcurrency"
                label="设计最大并发数"
                tooltip="设计压测最大峰值"
                rules={[{ required: true, message: '请输入设计最大并发数' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="峰值并发数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="designTokensPerSec"
                label="设计 tokens 数"
                tooltip="设计最大峰值 tokens/秒，如不涉及请写 0"
                rules={[{ required: true, message: '请输入设计 tokens 数' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="tokens/秒" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card size="small" title="合规" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="securityPassed"
                label="安检是否通过"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="logAuditCompliant"
                label="是否符合日志审计"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card size="small" title="运行配置" style={{ borderRadius: 8 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name={['runSystems', 0, 'systemName']}
                label="关联系统名称"
                rules={[{ required: true, message: '请输入系统名称' }]}
              >
                <Input placeholder="系统名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['runSystems', 0, 'systemLevel']}
                label="系统级别"
                rules={[{ required: true, message: '请选择系统级别' }]}
              >
                <Select options={SYSTEM_LEVELS.map((v) => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name={['runSystems', 0, 'permission']} label="关联系统权限">
                <Input placeholder="例如：读写、只读" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['runSystems', 0, 'estimatedTokens']}
                label="预估 tokens 数"
                tooltip="如不涉及请写 0"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['runSystems', 0, 'estimatedConcurrency']}
                label="预估并发数"
                tooltip="如不涉及请写 0"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default EmployeeFormModal;
