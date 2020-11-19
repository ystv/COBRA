import React, { useEffect, useState } from "react";
import { gql, QueryResult, useQuery, useMutation } from "@apollo/client";
import {
  Spin,
  Typography,
  Tabs,
  Button,
  Table,
  Form,
  Input,
  Checkbox,
  DatePicker,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { tokenRefresh } from "../commonFunctions";
import { TableRowSelection } from "antd/lib/table/interface";
import { setConstantValue } from "typescript";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const STREAM_KEYS = gql`
  query {
    streamKeys {
      streamKey
      pwd
      alias
      start
      end
    }
  }
`;

export default function Streamkeys() {
  const StreamKeys = useQuery(STREAM_KEYS);

  function onClickRefreshHandler() {
    StreamKeys.refetch();
  }

  useEffect(() => {
    tokenRefresh();
  }, []);

  return (
    <div>
      <Typography.Title level={2}>Streamkeys</Typography.Title>
      <Tabs
        defaultActiveKey="1"
        onChange={(e) => {
          if (e == "1") onClickRefreshHandler();
        }}
      >
        <TabPane tab="Keys" key="1">
          <KeysDisplay
            onClickRefreshHandler={onClickRefreshHandler}
            StreamKeys={StreamKeys}
          />
        </TabPane>
        <TabPane tab="Generate Temp Key" key="2">
          <GenerateTempKeyColumn />
        </TabPane>
        <TabPane tab="Manually Add Key" key="3">
          Content of Tab Pane 3
        </TabPane>
      </Tabs>
    </div>
  );
}

function GenerateTempKeyColumn() {
  const GEN_KEY = gql`
    mutation($alias: String, $start: String!, $end: String!) {
      genStreamKey(alias: $alias, start: $start, end: $end) {
        streamKey
      }
    }
  `;
  const [genStreamKey, { data }] = useMutation(GEN_KEY);

  const layout = {
    labelCol: { span: 2 },
    wrapperCol: { span: 6 },
  };
  const tailLayout = {
    wrapperCol: { offset: 2, span: 6 },
  };

  const onFinish = (values: any) => {
    const formattedFormData = {
      alias: values.alias,
      start: values.dates[0].toISOString().slice(0, 19).replace("T", " "),
      end: values.dates[1].toISOString().slice(0, 19).replace("T", " "),
    };
    console.log("Success:", formattedFormData);
    genStreamKey({ variables: formattedFormData });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      {...layout}
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item label="Alias" name="alias">
        <Input />
      </Form.Item>

      <Form.Item
        label="Active Dates"
        name="dates"
        rules={[
          { required: true, message: "Please select the streamkey duration!" },
        ]}
      >
        <RangePicker
          showTime={{ format: "HH:mm:ss" }}
          format="YYYY-MM-DD HH:mm:ss"
        />
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
      {data !== undefined ? (
        <Typography.Link copyable>
          {data.genStreamKey.streamKey}
        </Typography.Link>
      ) : (
        <></>
      )}
    </Form>
  );
}

interface KeysDisplayInterface {
  onClickRefreshHandler: Function;
  StreamKeys: QueryResult;
}

function KeysDisplay({
  onClickRefreshHandler,
  StreamKeys,
}: KeysDisplayInterface) {
  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
    getCheckboxProps: (record: any) => {
      return {
        value: record.streamKey,
        label: record.streamKey,
      };
    },
  };
  return (
    <>
      <Button
        type="primary"
        shape="circle"
        icon={<ReloadOutlined />}
        onClick={() => onClickRefreshHandler()}
      />
      <>
        <Typography.Title level={3}>Permakeys</Typography.Title>
        <Table
          loading={StreamKeys.loading || StreamKeys.error !== undefined}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          rowKey="streamKey"
          columns={columns}
          dataSource={
            StreamKeys.loading || StreamKeys.error !== undefined
              ? []
              : StreamKeys.data.streamKeys.filter((e: any) => e.pwd !== null)
          }
        />
        <br />
        <Typography.Title level={3}>Tempkeys</Typography.Title>
        <Table
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          rowKey="streamKey"
          columns={columns.filter((e) => e.dataIndex !== "pwd")}
          dataSource={
            StreamKeys.loading || StreamKeys.error !== undefined
              ? []
              : StreamKeys.data.streamKeys.filter((e: any) => e.pwd == null)
          }
        />
      </>
      {/* {JSON.stringify(StreamKeys.data)} */}
    </>
  );
}

const columns = [
  {
    title: "Stream Key",
    dataIndex: "streamKey",
    render: (text: any) => (
      <Typography.Link
      // copyable={{
      //   text: `rtmp://${process.env.REACT_APP_RTMP}/${process.env.REACT_APP_RTMP_INPUT_APPLICATION}/${text}`,
      // }}   //ADD PWD SUPPORT TOO
      >
        {text}
      </Typography.Link>
    ),
  },
  {
    title: "Alias",
    dataIndex: "alias",
    render: (text: any) => <p>{text}</p>,
  },
  {
    title: "Password",
    dataIndex: "pwd",
    render: (text: any) => <p>{text}</p>,
  },
  {
    title: "Start Date",
    dataIndex: "start",
    render: (text: any) => <p>{text}</p>,
  },
  {
    title: "End Date",
    dataIndex: "end",
    render: (text: any) => <p>{text}</p>,
  },
  // {
  //   title: 'Action',
  //   key: 'action',
  //   render: (text, record) => (
  //     <Space size="middle">
  //       <a>Edit</a>
  //     </Space>
  //   ),
  // },
];
