import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, notification } from 'antd';
import { supabase } from '../../../databaseClient';
import { CheckCircleTwoTone, CloseCircleTwoTone, ExclamationCircleOutlined } from '@ant-design/icons';

const DataTable = () => {
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
      const { data, error } = await supabase.from('Customers').select('*');
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
    const { id_customer, nama } = rowData;
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
          .from('Customers')
          .delete()
          .match({ id_customer })
          .then((response) => {
            notification.success({
                message: 'Data Berhasil Dihapus',
                description: `Data Customer ${nama} Berhasil Dihapus`,
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
      const { id_customer } = selectedData;
      const { error } = await supabase.from('Customers').update(values).match({ id_customer });
      if (error) {
        throw new Error(error.message);
      }
  
      notification.success({
        message: 'Data Berhasil Diupdate',
        description: `Data Customer ${values.nama} Berhasil Diupdate`,
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
      const { data, error } = await supabase.from('Customers').select('id_customer').order('id_customer', { ascending: false }).limit(1);
      if (error) {
        throw error;
      }
      const lastId = data.length === 0 ? 'CUS001' : data[0].id_customer;
      const label = lastId.substring(0, 3);
      const idNumber = parseInt(lastId.substring(3), 10) + 1;
      const newId = `${label}${idNumber.toString().padStart(3, '0')}`;
      addForm.setFieldsValue({ id_customer: data.length === 0 ? 'CUS001' : newId });
      setModalAddVisible(true);
    } catch (error) {
      console.error('Error getting last ID:', error.message);
    }
  };

  const handleAddModalOk = async () => {
    addForm.validateFields().then((values) => {
        const { id_customer } = values;
        console.log('Added ID:', id_customer);
        console.log('Added Data:', values);
  
        // Simpan data ke Supabase
        supabase
          .from('Customers')
          .insert([values])
          .then((response) => {
            notification.success({
                message: 'Data Berhasil Ditambah',
                description: `Data Customer ${values.nama} Berhasil Ditambah`,
                icon: <CheckCircleTwoTone twoToneColor="green" />,
                duration: 4
              });
            addForm.resetFields()
            fetchData(); 
            setModalAddVisible(false);
          })
          .catch((error) => {
            notification.error({
                message: 'Data Gagal Disimpan',
                description: `Data Customer ${values.nama} Tidk Berhasil Disimpan, Silahkan Periksa Form`,
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
      dataIndex: 'id_customer',
      key: 'id_customer',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nama',
      dataIndex: 'nama',
      key: 'nama',
    },
    {
      title: 'Telepon',
      dataIndex: 'nohp',
      key: 'nohp',
    },
    {
      title: 'Alamat',
      dataIndex: 'alamat',
      key: 'alamat',
      width: 300, 
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, rowData) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(rowData)}>
            Edit
          </Button>
          <Button type="danger" onClick={() => handleDelete(rowData)}>
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
          <Form.Item name="id_customer" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="nama" label="Nama">
            <Input />
          </Form.Item>
          <Form.Item name="nohp" label="Telepon">
            <Input />
          </Form.Item>
          <Form.Item name="alamat" label="Alamat">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
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
          <Form.Item name="id_customer" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="nama" label="Nama">
            <Input />
          </Form.Item>
          <Form.Item name="nohp" label="NoHP">
            <Input />
          </Form.Item>
          <Form.Item name="alamat" label="Alamat">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataTable;
