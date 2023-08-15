import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, notification, Select } from 'antd';
import { supabase } from '../../../databaseClient';
import { CheckCircleTwoTone, CloseCircleTwoTone, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const Pemasangan = () => {
  const [data, setData] = useState([]);
  const [dataCustomers, setDataCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const { confirm } = Modal;
  const { Option } = Select;


  const fetchDataProject = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
      .from('Pemasangan')
      .select(`
        *,
        Users:id_user ( nama ),
        Customers:id_customer ( nama )
      `)
      .order('id_pemasangan');
      if (error) {
        throw error;
      }
      setData(data.map(data => ({
        ...data,
        nama_customer: data.Customers.nama,
        nama_admin: data.Users.nama,
      })));
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataCustomers =  async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
      .from('Customers')
      .select(`*`);
      if (error) {
        throw error;
      }
      setDataCustomers(data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDataProject();
    fetchDataCustomers();
  }, []);

  const handleEdit = (rowData) => {
    setSelectedData(rowData);
    form.setFieldsValue(rowData);
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const { id_pemasangan } = selectedData;
      const { error } = await supabase.from('Pemasangan').update(values).match({ id_pemasangan });
      if (error) {
        throw new Error(error.message);
      }
  
      notification.success({
        message: 'Data Berhasil Diupdate',
        description: `Data Pemasangan ${values.nama} Berhasil Diupdate`,
        icon: <CheckCircleTwoTone twoToneColor="green" />,
        duration: 4
      });
      fetchDataProject(); // Mengambil data terbaru setelah pembaruan
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
      const { data, error } = await supabase.from('Pemasangan').select('id_pemasangan').order('id_pemasangan', { ascending: false }).limit(1);
      if (error) {
        throw error;
      }
      const lastId = data.length === 0 ? 'TRX001' : data[0].id_pemasangan;
      const label = lastId.substring(0, 3);
      const idNumber = parseInt(lastId.substring(3), 10) + 1;
      const newId = `${label}${idNumber.toString().padStart(3, '0')}`;
      console.log()
      addForm.setFieldsValue({ id_pemasangan: data.length === 0 ? 'TRX001' : newId });
      setModalAddVisible(true);
    } catch (error) {
      console.error('Error getting last ID:', error.message);
    }
  };

  const handleAddModalOk = async () => {
    addForm.validateFields().then((values) => {
        const { id_pemasangan, tanggal_pasang, id_customer } = values;
        console.log('Added ID:', id_pemasangan);
        console.log('Added Data:', values);
  
        // Simpan data ke Supabase
        supabase
          .from('Pemasangan')
          .insert([
            {
              id_pemasangan, 
              id_customer, 
              id_user: 'ADM001',
              tanggal_pasang, 
              total_pembayaran: 0,
              tanggal_bayar: '2099-12-12',
              tanggal_selesai: '2099-12-12',
              status: 0,
            }
          ])
          .then((response) => {
            notification.success({
                message: 'Data Berhasil Ditambah',
                description: `Data Pemasangan ${values.nama} Berhasil Ditambah`,
                icon: <CheckCircleTwoTone twoToneColor="green" />,
                duration: 4
              });

              addForm.resetFields();
              fetchDataProject(); 
              setModalAddVisible(false)
          })
          .catch((error) => {
            notification.error({
                message: 'Data Gagal Disimpan',
                description: `Data Pemasangan ${values.nama} Tidk Berhasil Disimpan, Silahkan Periksa Form`,
                icon: <CloseCircleTwoTone twoToneColor="red" />,
                duration: 4
              });
          });
      });
  };

  const handleAddModalCancel = () => {
    setModalAddVisible(false);
  };

  const handleCancelProject = async (id) => {
    supabase
          .from('Pemasangan')
          .update({status: 404})
          .eq('id_pemasangan', id)
          .then((response) => {
            notification.success({
                message: 'Data Berhasil Diupdate',
                description: `Data Pemasangan Telah Dibatalkan`,
                icon: <CheckCircleTwoTone twoToneColor="green" />,
                duration: 4
              });

              addForm.resetFields();
              fetchDataProject(); 
              setModalAddVisible(false)
          })
          .catch((error) => {
            notification.error({
                message: 'Data Gagal Disimpan',
                description: `Data Pemasangan Tidak Berhasil Dibatalkan`,
                icon: <CloseCircleTwoTone twoToneColor="red" />,
                duration: 4
              });
          });
  }

  const columns = [
    {
      title: 'No',
      dataIndex: 'id_pemasangan',
      key: 'id_pemasangan',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nama Customer',
      dataIndex: 'nama_customer',
      key: 'nama_customer',
    },
    {
      title: 'Nama Admin',
      dataIndex: 'nama_admin',
      key: 'nama_admin',
    },
    {
      title: 'Tanggal Pasang',
      dataIndex: 'tanggal_pasang',
      key: 'tanggal_pasang',
    },
    {
      title: 'Tanggal Selesai',
      dataIndex: 'tanggal_selesai',
      key: 'tanggal_selesai',
      render: (text) => text ===  '2099-12-12' ? 'Belum Selesai' : text
    },
    {
      title: 'Tanggal Bayar',
      dataIndex: 'tanggal_bayar',
      key: 'tanggal_bayar',
      render: (text) => text ===  '2099-12-12' ? 'Belum Dibayar' : text
    },
    {
      title: 'Total Pembayaran',
      dataIndex: 'total_pembayaran',
      key: 'total_pembayaran',
      render: (text) => text ===  0 ? 'Belum Pilih Produk' : `IDR. ${text.toLocaleString('id-ID')}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => text ===  0 ? 'Belum Selesai' : text === 1 ? 'Menunggu Pembayaran' : text === 2 ? 'Project Selesai' : 'Project Dibatalkan'
    },
    {
      title: 'Actions',
      dataIndex: 'id_pemasangan',
      key: 'actions',
      render: (text, rowData) => rowData.status !== 404
      && <Space size="middle">
      <Link to={`/admin/projects/${text}`}>
        <Button type="primary">
          Detail
        </Button>
      </Link>
      {
      rowData.status === 0
        && <Button type="default" onClick={() => handleCancelProject(text)}>
        Cancel
      </Button>
      }
      
    </Space>    
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
          <Form.Item name="id_pemasangan" style={{ display: 'none' }}>
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
          <Form.Item name="id_pemasangan" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="tanggal_pasang" label="Tanggal Pasang">
            <Input type='date' />
          </Form.Item>
          <Form.Item name="id_customer" label="Pilih Customer" rules={[{ required: true, message: 'Please select the option' }]}>
          <Select>
            {dataCustomers.map((option) => (
              <Option key={option.id_customer} value={option.id_customer}>
                {option.nama}
              </Option>
            ))}
          </Select>
        </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Pemasangan;
