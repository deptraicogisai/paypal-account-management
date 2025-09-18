'use client'

import { Card, Form, Input, Button, message } from 'antd';
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Simulate update settings
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Here you would call your API to update user settings
      // await updateUserSettings(values);
      setTimeout(() => {
        setLoading(false);
        message.success('Settings updated successfully!');
      }, 1000);
    } catch (error) {
      setLoading(false);
      message.error('Failed to update settings.');
    }
  };

  return (
    <Card title="Account Settings" style={{ maxWidth: 480, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        }}
        onFinish={onFinish}
      >
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input your name.' }]}>
          <Input placeholder="Your name" />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[
          { required: true, message: 'Please input your email.' },
          { type: 'email', message: 'Please enter a valid email.' }
        ]}>
          <Input placeholder="Your email" disabled />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
