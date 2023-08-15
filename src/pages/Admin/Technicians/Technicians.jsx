import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, notification } from 'antd';
import { supabase } from '../../../databaseClient';
import { CheckCircleTwoTone, CloseCircleTwoTone, ExclamationCircleOutlined } from '@ant-design/icons';

const Teknisi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const { confirm } = Modal;

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('Teknisi').select('*');
      if (error) {
        throw error;
      }
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchData();
  }, []);

  const handleEdit = (rowData) => {
    setSelectedData(rowData);
    form.setFieldsValue(rowData);
    setModalVisible(true);
  };

  const handleDelete = (rowData) => {
    const { id_teknisi, nama } = rowData;
    confirm({
      title: 'Konfirmasi Hapus',
      icon: <ExclamationCircleOutlined />,
      content: `Apakah Anda yakin ingin menghapus data "${nama}"?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: () => {
        // Menghapus data dari Supabase berdasarkan ID
        supabase
          .from('Teknisi')
          .delete()
          .match({ id_teknisi })
          .then((response) => {
            notification.success({
                message: 'Data Berhasil Dihapus',
                description: `Data Teknisi ${nama} Berhasil Dihapus`,
                icon: <CheckCircleTwoTone twoToneColor="green" />,
                duration: 4
              });
            fetchData();
          })
          .catch((error) => {
            console.error('Delete error:', error.message);
          });
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const { id_teknisi } = selectedData;
      const { error } = await supabase.from('Teknisi').update(values).match({ id_teknisi });
      if (error) {
        throw new Error(error.message);
      }
  
      notification.success({
        message: 'Data Berhasil Diupdate',
        description: `Data Teknisi ${values.nama} Berhasil Diupdate`,
        icon: <CheckCircleTwoTone twoToneColor="green" />,
        duration: 4
      });
      fetchData(); // Mengambil data terbaru setelah pembaruan
      form.resetFields();
      setModalVisible(false);
    } catch (error) {
      console.error('Update error:', error.message);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleAdd = async () => {
    try {
      const { data, error } = await supabase.from('Teknisi').select('id_teknisi').order('id_teknisi', { ascending: false }).limit(1);
      if (error) {
        throw error;
      }
      const lastId = data.length === 0 ? 'TEK001' : data[0].id_teknisi;
      const label = lastId.substring(0, 3);
      const idNumber = parseInt(lastId.substring(3), 10) + 1;
      const newId = `${label}${idNumber.toString().padStart(3, '0')}`;
      console.log()
      addForm.setFieldsValue({ id_teknisi: data.length === 0 ? 'TEK001' : newId });
      setModalAddVisible(true);
    } catch (error) {
      console.error('Error getting last ID:', error.message);
    }
  };

  const handleAddModalOk = async () => {
    addForm.validateFields().then((values) => {
        const { id_teknisi, nama, nohp, username, password } = values;
        console.log('Added ID:', id_teknisi);
        console.log('Added Data:', values);
  
        // Simpan data ke Supabase
        supabase
          .from('Users')
          .insert([{id_user: id_teknisi, nama, username, password, role_id: 2}])
          .then((response) => {
            notification.success({
                message: 'Data Berhasil Ditambah',
                description: `Data Teknisi ${values.nama} Berhasil Ditambah`,
                icon: <CheckCircleTwoTone twoToneColor="green" />,
                duration: 4
              });

            
            fetchData(); 
          })
          .catch((error) => {
            notification.error({
                message: 'Data Gagal Disimpan',
                description: `Data Teknisi ${values.nama} Tidk Berhasil Disimpan, Silahkan Periksa Form`,
                icon: <CloseCircleTwoTone twoToneColor="red" />,
                duration: 4
              });
          });

        supabase
          .from('Teknisi')
          .insert([{id_teknisi, nama, nohp}])
          .then((response) => {
            fetchData(); 
            addForm.resetFields();
            setModalAddVisible(false);
          })
          .catch((error) => {
            notification.error({
                message: 'Data Gagal Disimpan',
                description: `Data Teknisi ${values.nama} Tidk Berhasil Disimpan, Silahkan Periksa Form`,
                icon: <CloseCircleTwoTone twoToneColor="red" />,
                duration: 4
              });
          });
      });
  };

  const handleAddModalCancel = () => {
    setModalAddVisible(false);
  };

  const columns = [
    {
      title: 'No',
      dataIndex: 'id_teknisi',
      key: 'id_teknisi',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nama',
      dataIndex: 'nama',
      key: 'nama',
    },
    {
      title: 'No HP',
      dataIndex: 'nohp',
      key: 'nohp',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, rowData) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(rowData)}>
            Edit
          </Button>
          <Button type="warning" onClick={() => handleDelete(rowData)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
        <div style={{ marginBottom: '16px' }}>
        <Button type="primary" onClick={handleAdd}>
          Tambah Data
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      {/* Modal untuk form edit */}
      <Modal
        title="Edit Data"
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id_teknisi" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="nama" label="Nama">
            <Input />
          </Form.Item>
          <Form.Item name="nohp" label="No HP">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Tambah Data"
        visible={modalAddVisible}
        onOk={handleAddModalOk}
        onCancel={handleAddModalCancel}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="id_teknisi" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="nama" label="Nama">
            <Input />
          </Form.Item>
          <Form.Item name="nohp" label="No HP">
            <Input />
          </Form.Item>
          <Form.Item name="username" label="Username">
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Teknisi;
