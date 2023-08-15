import { Form, Input, Button, notification } from 'antd';
import { UserOutlined, LockOutlined, CloseCircleTwoTone } from '@ant-design/icons';
import { supabase } from '../../databaseClient';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const navigate = useNavigate();
    const onFinish = async (values) => {
        console.log('Received values:', values);
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('username', values.username)
            .single()

        if (error) {
            notification.error({
                message: 'Login Gagal',
                description: 'Username yang Anda Masukkan Tidak Ditemukan',
                icon: <CloseCircleTwoTone twoToneColor="#eb2f96" />,
                duration: 3
              });
        } else if (data) {
            if(data.password === values.password) {
              localStorage.setItem('user', JSON.stringify(data))
              data.role_id === 1
                ? navigate('/admin')
                : navigate('/teknisi')
            } else {  
              notification.error({
                message: 'Login Gagal',
                description: 'Password Salah, Silahkan Cek Kembali Password Anda.',
                icon: <CloseCircleTwoTone twoToneColor="#eb2f96" />,
                duration: 3
              });
            }
        } 
    };



  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 20, borderRadius: 8, background: '#fff', border: '1px solid #ccc' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '50px', marginTop: '30px' }}>Project Management Login</h2>
        <Form
          name="loginForm"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username" 
            rules={[{ required: true, message: 'Silahkan lengkapi kolom username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Silahkan lengkapi kolom password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
