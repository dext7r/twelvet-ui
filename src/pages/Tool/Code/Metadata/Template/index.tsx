import React, {useState, useRef} from 'react'
import {PageContainer, ProTable} from '@ant-design/pro-components'
import type {ActionType, ProColumns} from '@ant-design/pro-components'
import {
    DeleteOutlined,
    FundProjectionScreenOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined
} from '@ant-design/icons'
import {Popconfirm, Button, message, Modal, Form, Input, Space, Divider} from 'antd'
import {FormInstance} from 'antd/lib/form'
import {
    pageQueryGroup,
    getGroup,
    delGroup,
    addGroup,
    updateGroup,
    exportGroup
} from './service'
import {system} from '@/utils/twelvet'
import {isArray} from 'lodash'
import {proTableConfigs} from '@/setting'


/**
 * 模板分组模块
 */
const Group: React.FC = () => {

    const [state] = useState<{
        pageSize: number
    }>({
        pageSize: 10,
    });

    // 显示Modal
    const [modal, setModal] = useState<{ title: string, visible: boolean }>({title: ``, visible: false})

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false)

    const acForm = useRef<ActionType>()

    const formRef = useRef<FormInstance>()

    const [form] = Form.useForm()

    const formItemLayout = {
        labelCol: {
            xs: {span: 4},
            sm: {span: 4},
        },
        wrapperCol: {
            xs: {span: 18},
            sm: {span: 18},
        },
    }


    /**
     * 新增模板分组数据
     * @param row row
     */
    const refPost = async () => {
        setModal({title: "新增", visible: true})
    }

    /**
     * 获取修改模板分组信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            const {code, msg, data} = await getGroup(row.id)
            if (code !== 200) {
                return message.error(msg)
            }


            // 赋值表单数据
            form.setFieldsValue(data)

            // 设置Modal状态
            setModal({title: "修改", visible: true})

        } catch (e) {
            system.error(e)
        }
    }

    /**
     * 移除模板分组数据
     * @param row id
     */
    const refRemove = async (id: (string | number)[] | string | undefined) => {
        try {
            if (!id) {
                return true
            }

            let params
            if (isArray(id)) {
                params = id.join(",")
            } else {
                params = id
            }

            const {code, msg} = await delGroup(params)

            if (code !== 200) {
                return message.error(msg)
            }

            message.success(msg)

            acForm?.current?.reload()

        } catch (e) {
            system.error(e)
        }

    }

    /**
     * 取消Modal的显示
     */
    const handleCancel = () => {
        setModal({title: "", visible: false})

        form.resetFields()

    }

    /**
     * 保存模板分组数据
     */
    const onSave = () => {
        form
            .validateFields()
            .then(
                async (fields) => {
                    try {
                        // 开启加载中
                        setLoadingModal(true)


                        // ID为0则insert，否则将update
                        const {
                            code,
                            msg
                        } = fields.id === 0 ? await addGroup(fields) : await updateGroup(fields)
                        if (code !== 200) {
                            return message.error(msg)
                        }

                        message.success(msg)

                        if (acForm.current) {
                            acForm.current.reload()
                        }

                        // 关闭模态框
                        handleCancel()
                    } catch (e) {
                        system.error(e)
                    } finally {
                        setLoadingModal(false)
                    }
                }).catch(e => {
            system.error(e)
        })
    }

    // Form参数
    const columns: ProColumns<any>[] = [
                {
                    title: '分组名称', ellipsis: true, width: 200, valueType: "text", dataIndex: 'groupName',
                },
                {
                    title: '分组描述', ellipsis: true, width: 200, valueType: "text", dataIndex: 'groupDesc',
                },
        {
            title: '操作',
            fixed: 'right',
            width: 320,
            valueType: "option",
            dataIndex: 'operation',
            render: (_, row) => {
                return (
                    <>
                        <a onClick={() => refPut(row)}>
                            <Space>
                                <EditOutlined/>
                                修改
                            </Space>
                        </a>

                        <Divider type="vertical"/>

                        <Popconfirm
                            onConfirm={() => refRemove(row.id)}
                            title="确定删除吗"
                        >
                            <a href='#'>
                                <Space>
                                    <CloseOutlined/>
                                    删除
                                </Space>
                            </a>
                        </Popconfirm>
                    </>
                )
            }
        },
    ]

    return (
        <PageContainer>
            <ProTable
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    pageSize: state.pageSize,
                }}
                actionRef={acForm}
                formRef={formRef}
                rowKey="id"
                columns={columns}
                request={async (params) => {
                    const {data} = await pageQueryGroup(params);
                    const {records, total} = data;
                    return Promise.resolve({
                        data: records,
                        success: true,
                        total,
                    });
                }}
                rowSelection={{}}
                beforeSearchSubmit={(params) => {
                    // 分隔搜索参数
                    if (params.between) {
                        const {between} = params
                        // 移除参数
                        delete params.between

                        // 适配参数
                        params.beginTime = between[0]
                        params.endTime = between[1]
                    }
                    return params
                }}
                toolBarRender={(action, {selectedRowKeys}) => [
                    <Button key='add' type="default" onClick={refPost}>
                        <PlusOutlined/>
                        新增
                    </Button>,
                    <Popconfirm
                        key='batchDelete'
                        disabled={!(selectedRowKeys && selectedRowKeys.length > 0)}
                        onConfirm={() => refRemove(selectedRowKeys)}
                        title="是否删除选中数据"
                    >
                        <Button
                            disabled={!(selectedRowKeys && selectedRowKeys.length > 0)}
                            type="primary" danger
                        >
                            <DeleteOutlined/>
                            批量删除
                        </Button>
                    </Popconfirm>
                ]}

            />

            <Modal
                title={`${modal.title}模板分组`}
                open={modal.visible}
                okText={`${modal.title}`}
                confirmLoading={loadingModal}
                onOk={onSave}
                onCancel={handleCancel}
                // 销毁组件，要求重新装载
                destroyOnClose
            >

                <Form
                    form={form}
                >
                    <Form.Item
                        hidden
                        {...formItemLayout}
                        label="主键"
                        name="id"
                        initialValue={0}
                    >
                        <Input/>
                    </Form.Item>

                                    <Form.Item
                                        {...formItemLayout}
                                        label="分组名称"
                                        rules={[{required: false, message: '分组名称不能为空'}]}
                                        name="groupName"
                                    >
                                        <Input/>
                                    </Form.Item>

                                    <Form.Item
                                        {...formItemLayout}
                                        label="分组描述"
                                        rules={[{required: false, message: '分组描述不能为空'}]}
                                        name="groupDesc"
                                    >
                                        <Input/>
                                    </Form.Item>

                </Form>


            </Modal>
        </PageContainer>
    )

}

export default Group
