import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, notification, Select, Card } from 'antd';
import { supabase } from '../../../databaseClient';
import { CheckCircleTwoTone, CloseCircleTwoTone, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js/dist/html2pdf.min';

const DetailPemasanganTeknisi = () => {
  const [cart, setCart] = useState([]);
  const [transaksi, setDataTransaksi] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const {id} = useParams();
  const [logs, setLogs] = useState([]);
  const today = new Date().toISOString().slice(0, 10);
  const user = JSON.parse(localStorage.getItem('user'))

  const fetchDataProject = async () => {
    try {
      const { data, error } = await supabase
      .from('Pemasangan')
      .select(`
        *,
        Users:id_user ( nama ),
        Customers:id_customer ( nama )
      `).eq('id_pemasangan', id)
      ;
      if (error) {
        throw error;
      }
      const formattedData = {
        ...data[0],
        nama_customer: data[0].Customers.nama,
        nama_admin: data[0].Users.nama,
        status_id: data[0].status,
        status: data[0].status === 0 ? 'On Progress' :  data[0].status === 1 ? 'Menunggu Pembayaran' : 'Project Selesai'
      };


      form.setFieldsValue(formattedData);
      setDataTransaksi(formattedData)
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } 
  };

  const handleIDLog = async () => {
    try {
      const { data, error } = await supabase.from('Log_Harian').select('id_log').order('id_log', { ascending: false }).limit(1);
      if (error) {
        throw error;
      }
      const lastId = data.length === 0 ? 'LOG001' : data[0].id_log;
      const label = lastId.substring(0, 3);
      const idNumber = parseInt(lastId.substring(3), 10) + 1;
      const newId = `${label}${idNumber.toString().padStart(3, '0')}`;
      addForm.setFieldsValue({ id_log: data.length === 0 ? 'LOG001' : newId });
      console.log(newId)
    } catch (error) {
      console.error('Error getting last ID:', error.message);
    }
  };

  const fetchDataLog = async () => {
    try {
      const { data, error } = await supabase
      .from('Log_Harian')
      .select(`
        *,
        Teknisi:id_teknisi ( nama )
      `).eq('id_pemasangan', id)
      ;
      if (error) {
        throw error;
      }

      
      setLogs(data.map(data => ({
        ...data,
        nama_teknisi: data.Teknisi.nama,
      })));
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } 
  };

  useEffect(() => {


    const fetchDataDetail = async () => {
      try {
        const { data, error } = await supabase
        .from('Detail_Pemasangan')
        .select(`
          *,
          Products:id_produk ( nama, harga, stok )
        `).eq('id_pemasangan', id)
        ;
        if (error) {
          throw error;
        }

        
        setCart(data.map(data => ({
          ...data,
          nama: data.Products.nama,
          harga: data.Products.harga
        })));

        setCartTotal(data.reduce((acc, cur) => acc + cur.harga * cur.qty, 0))
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } 
    };


    

    const calculateCartTotal = () => {
      const newCartTotal = cart.reduce((acc, cur) => acc + cur.harga * cur.qty, 0);
      setCartTotal(newCartTotal);
    };

    fetchDataProject();
    fetchDataDetail();
    handleIDLog();
    fetchDataLog();
    calculateCartTotal
  }, []);


  const removeLog = async (logId) => {
    try {
      const updatedLog = logs.filter((item) => item.id_log !== logId);
      const { data, error } = await supabase.from('Log_Harian').delete().eq('id_log', logId);
      if (error) {
        throw error;
      }

      setLogs(updatedLog);
    } catch (error) {
      console.error('Error inserting item to database:', error.message);
    }
  };

  

  const columnsKeranjang = [
    { title: 'No', dataIndex: 'id_produk', key: 'id_produk' },
    { title: 'Nama Produk', dataIndex: 'nama', key: 'nama' },
    { title: 'Harga', dataIndex: 'harga', key: 'harga', render: (data) =>` IDR. ${data.toLocaleString()}` },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      render: (_, record) => (
        <Input
          type="number"
          min={1}
          value={record.qty}
          style={{width: '50px', border: 'none'}}
          disabled
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (_, record) => {
        const data = record.harga * record.qty
        return `IDR. ${data.toLocaleString()}`;
      },
    },
  ];

  const columnsLog = [
    {
      title: 'Tanggal',
      dataIndex: 'tanggal',
      key: 'tanggal',
    },
    {
      title: 'Nama Teknisi',
      dataIndex: 'nama_teknisi',
      key: 'nama_teknisi',
    },
    {
      title: 'Log Harian',
      dataIndex: 'detail_log',
      key: 'detail_log',
    },
    {
      title: 'Aksi',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => {
          let button;
          transaksi.status_id === 0
          ? button = <Button onClick={() => removeLog(record.id_log)}>Hapus Log</Button>
          : null

          return button;
        },
    },
  ];

  
  const handleProjectDone = async () => {
    try {
      const today = new Date(); // Mendapatkan tanggal hari ini
        const formattedDate = today.toISOString();
      const { data, error } = await supabase.from('Pemasangan')
      .update({ tanggal_selesai: formattedDate, status: 1  })
      .eq('id_pemasangan', id);
      if (error) {
        throw error;
      } 

      notification.success({
        message: 'Data Berhasil Diupdate',
        description: `Project Sudah Selesai`,
        icon: <CheckCircleTwoTone twoToneColor="green" />,
        duration: 4
      });

      fetchDataProject();
      handleIDLog();

    } catch (error) {
      console.error('Error inserting item to database:', error.message);
    }
  }

  const handleSubmitLog = async () => {
    addForm.validateFields().then((values) => {
        const { id_log, tanggal, detail_log } = values;
        console.log('Added ID:', id_log);
        console.log('Added Data:', values);
  
        // Simpan data ke Supabase
        supabase
          .from('Log_Harian')
          .insert([
            {
              id_log, 
              id_pemasangan: id, 
              id_teknisi: user.id_user,
              tanggal, 
              detail_log
            }
          ])
          .then((response) => {
            notification.success({
                message: 'Data Log Berhasil Ditambah',
                description: `Data Log Harian Berhasil Ditambah`,
                icon: <CheckCircleTwoTone twoToneColor="green" />,
                duration: 4
              });

              addForm.resetFields();
              setLogs([...logs, {id_log, 
                id_pemasangan: id, 
                id_teknisi: user.id_user,
                tanggal, 
                detail_log}])
                handleIDLog();
                fetchDataLog();
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
  

  return (
    <div id="divToConvert" >
      <h1> Detail Project {id}</h1>
      <Form form={form} layout="vertical" >
        <Form.Item label="ID Pemasangan" name="id_pemasangan" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Nama Customer" name="nama_customer" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Nama Admin" name="nama_admin" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Tanggal Pasang" name="tanggal_pasang" rules={[{ required: true }]}>
          <Input type="date" disabled />
        </Form.Item>
        <Form.Item label="Status" name="status" rules={[{ required: true }]} >
          <Input  disabled />
        </Form.Item>
        {
          transaksi.status_id === 0
          ? <Button htmlType="button" type='primary' onClick={handleProjectDone}>Project Selesai</Button>
          : null
        }
      </Form>

        <Card style={{paddingTop: '10px', marginTop: '30px'}}>
        <Table
          dataSource={cart}
          columns={columnsKeranjang}
          pagination={false}
          footer={() => <h4>Total Pembayaran: IDR {cartTotal.toLocaleString()}</h4>}
          style={{marginTop: '10px'}}
        />
      </Card>

      {
        transaksi.status_id === 0
        && <Card>
        <Form form={addForm} layout="vertical" onFinish={handleSubmitLog} initialValues={{ date: today }}>
          <Form.Item  name="id_log" rules={[{ required: true, message: 'ID LOG harian harus diisi' }]}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item label="Log Harian" name="detail_log" rules={[{ required: true, message: 'Log harian harus diisi' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Tanggal" name="tanggal" rules={[{ required: true, message: 'Tanggal harus diisi' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
        </Card>
      }

      <Table dataSource={logs} columns={columnsLog} />
      

    </div>
  );
};

export default DetailPemasanganTeknisi;
