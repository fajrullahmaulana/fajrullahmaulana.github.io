import { 
  DashboardOutlined, 
  UserOutlined, 
  VideoCameraAddOutlined, 
  ToolOutlined, 
  FormatPainterOutlined, 
  FileAddOutlined, 
  FileDoneOutlined,
  PoweroffOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;


const AdminLayout = ({children}) => {
  const { token: { colorBgContainer }} = theme.useToken();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/')
  }


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={'300px'}
        style={{
          background: '#050F33',
          position: 'sticky',
          top: 0,
          overflow: 'auto',
          height: '100vh'
        }}
      >
        <div 
          className="demo-logo-vertical" 
          style={
            {
              color: 'white', 
              textAlign: 'center', 
              marginTop: '20px',
              marginBottom: '20px',
              paddingBottom: '15px'
            }
          }
        >
          <h2 style={{color: 'orange'}}>Project Management</h2>
        </div>

        <div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{
              background: '#050F33',
            }}
          >

            <p style={{color: '#ccc', padding: '20px 0 8px 12px', fontWeight: 'bold'}}>Home</p>
            <Menu.Item key="1" icon={<DashboardOutlined />} onClick={() => navigate('/admin')}> Dashboard</Menu.Item>

            <p style={{color: '#ccc', padding: '20px 0 8px 12px', fontWeight: 'bold'}}>Master Data</p>
            <Menu.Item key="2" icon={<UserOutlined />} onClick={() => navigate('customers')}> Data Customer</Menu.Item>
            <Menu.Item key="3" icon={<VideoCameraAddOutlined />} onClick={() => navigate('products')}> Data Produk</Menu.Item>
            <Menu.Item key="4" icon={<ToolOutlined />} onClick={() => navigate('technicians')}> Data Teknisi</Menu.Item>

            <p style={{color: '#ccc', padding: '20px 0 8px 12px', fontWeight: 'bold'}}>Transaksi</p>
            <Menu.Item key="5" icon={<FormatPainterOutlined />} onClick={() => navigate('projects')}> Data Project</Menu.Item>
            <Menu.Item key="6" icon={<FileAddOutlined />} onClick={() => navigate('documents')}> Generate Dokumen</Menu.Item>
            <Menu.Item key="7" icon={<FileDoneOutlined />} onClick={() => navigate('reports')}> Laporan</Menu.Item>

            <Menu.Item key="8" icon={<PoweroffOutlined />} onClick={handleLogout} style={{position: 'absolute', bottom: '10px'}}> Logout</Menu.Item>

          </Menu>
        </div> 
      </Sider>
      <Layout>
      <Header style={{ padding: 0, background: '#fff', borderBottom: '1px solid #ccc', boxShadow: '0 2px 2px rgba(57, 63, 72, 0.2)'}} />
        <Content
          style={{
            margin: '24px 16px 0',
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 100,
              background: colorBgContainer,
            }}
          >
            {children}
          </div>
        </Content>
        {/* <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Sistem Informasi Manajement Project Pemasangan Security System
        </Footer> */}
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

AdminLayout.propTypes = {
    children: PropTypes.node
}
