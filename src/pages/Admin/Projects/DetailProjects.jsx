import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, notification, Select, Card } from 'antd';
import { supabase } from '../../../databaseClient';
import { CheckCircleTwoTone, CloseCircleTwoTone, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js/dist/html2pdf.min';

const DetailProject = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProductModalVisible, setProductModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [transaksi, setDataTransaksi] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [form] = Form.useForm();
  const {id} = useParams();
  const [printMode, setPrintMode] = useState(false)
  const [logs, setLogs] = useState([]);


  const fetchDataProject = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('Products').select('*');
    if (error) {
      console.error('Error fetching products:', error.message);
    } else {
      setProducts(data);
    }
  };

  useEffect(() => {

    

   
   
    const fetchDataDetail = async () => {
      try {
        setLoading(true);
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
          harga: data.Products.harga,
          stok: data.Products.stok
        })));
  
        setCartTotal(data.reduce((acc, cur) => acc + cur.harga * cur.qty, 0))
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataProject();
    fetchProducts();
    fetchDataDetail();
    fetchDataLog();
  }, []);

  useEffect(() => {
    const calculateCartTotal = async () => {
      const newCartTotal = cart.reduce((acc, cur) => acc + cur.harga * cur.qty, 0);
      setCartTotal(newCartTotal);
      try {
        const { data, error } = await supabase.from('Pemasangan')
        .update({ total_pembayaran: newCartTotal, })
        .eq('id_pemasangan', id);
        if (error) {
          throw error;
        } 
  
      } catch (error) {
        console.error('Error inserting item to database:', error.message);
      }
    };

    calculateCartTotal();
  }, [cart])

  
  const addToCart = async (product) => {
    const existingProductIndex = cart.findIndex((item) => item.id_produk === product.id_produk);
    if (existingProductIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingProductIndex].qty += 1;
      try {
        const { data, error } = await supabase.from('Detail_Pemasangan').update({qty: updatedCart[existingProductIndex].qty}).eq('id_pemasangan', id).neq('id_produk', product.id_produk);
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error inserting item to database:', error.message);
      }
      setCart(updatedCart);
    } else {
      const newCartItem = { ...product, qty: 1, id_pemasangan: id, stok: product.stok - 1 }
      setCart([...cart, newCartItem]);
      try {
        const { data, error } = await supabase.from('Products').update({stok: product.stok - 1}).eq('id_produk', product.id_produk);
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error inserting item to database:', error.message);
      }
      try {
        const { data, error } = await supabase.from('Detail_Pemasangan').insert({id_pemasangan: id, id_produk: newCartItem.id_produk, qty: newCartItem.qty, harga: newCartItem.harga});
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error inserting item to database:', error.message);
      }

      
    }

    setProductModalVisible(false);
  };

  const removeFromCart = async (productId, qty, stok) => {
    const updatedCart = cart.filter((item) => item.id_produk !== productId);
    try {
      const { data, error } = await supabase.from('Products').update({stok: stok + qty}).eq('id_produk', productId);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error inserting item to database:', error.message);
    }
    try {
      const { data, error } = await supabase.from('Detail_Pemasangan').delete().eq('id_pemasangan', id).eq('id_produk', productId);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error inserting item to database:', error.message);
    }
    fetchProducts();
    setCart(updatedCart);
  };

  const handleQuantityChange = async (productId, currentQuantity, newQuantity, stok) => {
    let newStock;

    console.log(newQuantity)

    if(!newQuantity) {
      newStock = stok;
    } else if(newQuantity > currentQuantity) {
      let pengurang = newQuantity - currentQuantity
      newStock = stok - pengurang
    } else if(!currentQuantity && newQuantity) {
      newStock = stok - (newQuantity - 1)
    } 
    else {
      let penambah = currentQuantity - newQuantity
      newStock = stok + penambah
    }



    const updatedCart = cart.map((item) =>
      item.id_produk === productId ? { ...item, qty: newQuantity, stok: newStock } : item
    );
    setCart(updatedCart);

    try {
      const { data, error } = await supabase.from('Detail_Pemasangan').update({qty: newQuantity}).eq('id_pemasangan', id).eq('id_produk', productId);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error inserting item to database:', error.message);
    }

    try {
      const { data, error } = await supabase.from('Products').update({stok: newStock}).eq('id_produk', productId);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error inserting item to database:', error.message);
    }
    
  };

  const columnsTambah = [
    { title: 'No', dataIndex: 'id_produk', key: 'id_produk' },
    { title: 'Nama Produk', dataIndex: 'nama', key: 'nama' },
    { title: 'Harga', dataIndex: 'harga', key: 'harga' },
    { title: 'Stok', dataIndex: 'stok', key: 'stok' },
  ];

  const columnsKeranjang = [
    { title: 'No', dataIndex: 'id_produk', key: 'id_produk', render: (_, __, index) => index + 1, defaultSortOrder: 'ascend' },
    { title: 'Nama Produk', dataIndex: 'nama', key: 'nama' },
    { title: 'Harga', dataIndex: 'harga', key: 'harga', render: (data) =>` IDR. ${data.toLocaleString()}` },
    { title: 'Stok', dataIndex: 'stok', key: 'stok' },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      render: (_, record) => (
        <Input
          type="number"
          min={1}
          value={record.qty}
          style={{width: '80px'}}
          onChange={(e) => handleQuantityChange(record.id_produk, record.qty, parseInt(e.target.value, 10), record.stok)}
          disabled={transaksi.status_id !== 0}
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
    {
      title: 'Aksi',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => {
          let button;
          transaksi.status_id === 0
          ? button = <Button onClick={() => removeFromCart(record.id_produk, record.qty, record.stok)}>Hapus</Button>
          : null

          return button;
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
    }
  ];


  const handleFormSubmit = (values) => {
    // Simpan data dari form ke dalam tabel keranjang (state cart)
    setCart([
      ...cart,
      {
        id: values.id_pemasangan,
        name: values.nama_customer,
        admin: values.nama_admin,
        date: values.tanggal_pasang,
        total: values.total_pembayaran,
        status: values.status,
        qty: 1, // Default qty is set to 1
      },
    ]);

    // Reset form setelah submit
    form.resetFields();
  };

  
  const handlePaymentDone = async () => {

    try {
      const today = new Date(); // Mendapatkan tanggal hari ini
        const formattedDate = today.toISOString();
      const { data, error } = await supabase.from('Pemasangan')
      .update({ total_pembayaran: cartTotal, status: 2, tanggal_bayar: formattedDate  })
      .eq('id_pemasangan', id);
      if (error) {
        throw error;
      } 

      notification.success({
        message: 'Data Berhasil Dihapus',
        description: `Data Project Selesai Dibayar`,
        icon: <CheckCircleTwoTone twoToneColor="green" />,
        duration: 4
      });
      
      fetchDataProject();
      
    } catch (error) {
      console.error('Error inserting item to database:', error.message);
    }
  }
  

  return (
    <div id="divToConvert" style={{padding: '30px', textAlign: printMode ? 'center' : 'left'}}>
      <h1 style={{marginBottom: printMode ? '30px' : '10px'}}>{printMode ? 'Surat Penawaran Harga' : 'Detail Proyek'} {!printMode && id}</h1>
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
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
          transaksi.status_id === 1
          && <Button htmlType="button" type='primary' onClick={handlePaymentDone}>Pembayaran Selesai</Button>
        }
      </Form>

        <Card style={{paddingTop: '10px', marginTop: '30px'}}>
        {
          transaksi.status_id === 0
          && <Button type='primary' onClick={() => setProductModalVisible(true)} >Tampilkan Produk</Button>
        }
        
        <Table
          dataSource={cart}
          columns={columnsKeranjang}
          pagination={false}
          footer={() => <h2>Total Pembayaran: IDR {cartTotal.toLocaleString()}</h2>}
          style={{marginTop: '10px'}}
        />
      </Card>

      <Card style={{paddingTop: '10px', marginTop: '30px'}}>
        <h2>Tabel Log Harian Teknisi</h2>
        <Table dataSource={logs} columns={columnsLog} />
      </Card>

      <Modal
        title="Daftar Produk"
        visible={isProductModalVisible}
        onCancel={() => setProductModalVisible(false)}
        fotoer={null}
        width={800}
      >
        <Table
          dataSource={products}
          columns={[
            ...columnsTambah,
            {
              title: 'Aksi',
              dataIndex: 'action',
              key: 'action',
              render: (_, record) => (
                <Button onClick={() => addToCart(record)}>Tambah ke Keranjang</Button>
              ),
            },
          ]}
        />
      </Modal>

    </div>
  );
};

export default DetailProject;
