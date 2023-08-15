import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, notification, Select, Card } from 'antd';
import { supabase } from '../../../databaseClient';
import { CheckCircleTwoTone, CloseCircleTwoTone, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js/dist/html2pdf.min';

const Documents = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProductModalVisible, setProductModalVisible] = useState(false);
  const [isCartModalVisible, setCartModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [form] = Form.useForm();
  const {id} = useParams();
  const [printMode, setPrintMode] = useState(false)
  const { Option } = Select;
  const [dataCustomers, setDataCustomers] = useState([]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('Products').select('*');
    if (error) {
      console.error('Error fetching products:', error.message);
    } else {
      setProducts(data);
      setProductModalVisible(false);
    }
  };
 

  useEffect(() => {

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

    const newCartTotal = cart.reduce((acc, cur) => acc + cur.harga * cur.qty, 0);
      setCartTotal(newCartTotal);

    const calculateCartTotal = () => {
        const newCartTotal = cart.reduce((acc, cur) => acc + cur.harga * cur.qty, 0);
        setCartTotal(newCartTotal);
    };

    fetchProducts();
    fetchDataCustomers();
    calculateCartTotal
  }, [cart]);

  
  const addToCart = async (product) => {
    console.log(product)
    const existingProductIndex = cart.findIndex((item) => item.id_produk === product.id_produk);
    console.log(existingProductIndex);
    if (existingProductIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingProductIndex].qty += 1;
      setCart(updatedCart);
    } else {
      const newCartItem = { ...product, qty: 1, id_pemasangan: id }
      setCart([...cart, newCartItem]);
    }

    setProductModalVisible(false);
  };

  const removeFromCart = async (productId) => {
    const updatedCart = cart.filter((item) => item.id_produk !== productId);
    
    setCart(updatedCart);
    const newCartTotal = cart.reduce((acc, cur) => acc + cur.harga * cur.qty, 0);
    setCartTotal(newCartTotal);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    const updatedCart = cart.map((item) =>
      item.id_produk === productId ? { ...item, qty: newQuantity } : item
    );
   
    setCart(updatedCart);
    const newCartTotal = cart.reduce((acc, cur) => acc + cur.harga * cur.qty, 0);
    setCartTotal(newCartTotal);

  };

  const columnsTambah = [
    { title: 'No', dataIndex: 'id_produk', key: 'id_produk' },
    { title: 'Nama Produk', dataIndex: 'nama', key: 'nama' },
    { title: 'Harga', dataIndex: 'harga', key: 'harga' },
    { title: 'Stok', dataIndex: 'stok', key: 'stok' },
  ];

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
          style={{width: '80px'}}
          onChange={(e) => handleQuantityChange(record.id_produk, parseInt(e.target.value, 10))}
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
      title: !printMode && 'Aksi',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => (
        printMode ? null : <Button onClick={() => removeFromCart(record.id_produk)}>Hapus</Button>
      ),
    },
  ];

  const convertToPDF = () => {
    setPrintMode(true)
    const inputElement = document.getElementById('divToConvert'); // Ganti 'divToConvert' dengan ID dari div yang ingin Anda konversi
  
    html2pdf().from(inputElement).save();
    
    setTimeout(() => {
      setPrintMode(false)
    }, 2000)

  };


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

  
  
  

  return (
    <div id="divToConvert" style={{padding: '30px', textAlign: printMode ? 'center' : 'left'}}>
      <h1 style={{marginBottom: printMode ? '30px' : '10px'}}>{printMode ? 'Surat Penawaran Harga' : 'Generate Dokumen SPH'}</h1>
      <Form layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item label="Nama Customer" name="nama_admin" rules={[{ required: true }]}>
        <Select>
            {dataCustomers.map((option) => (
              <Option  key={option.id_customer} value={option.id_customer}>
                {option.nama}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Tanggal SPH" name="tanggal_sph" rules={[{ required: true }]}>
          <Input type="date" />
        </Form.Item>
        {
          printMode
          ? null
          : <Button htmlType="button" type='primary' onClick={convertToPDF}>Keluarkan SPH</Button>
        }
      </Form>

        <Card style={{paddingTop: '10px', marginTop: '30px'}}>
        {
          printMode
          ? null
          : <Button type='default' onClick={() => setProductModalVisible(true)} >Tampilkan Produk</Button>
        }
        
        <Table
          dataSource={cart}
          columns={columnsKeranjang}
          pagination={false}
          footer={() => <h2>Total Pembayaran: IDR {cartTotal.toLocaleString()}</h2>}
          style={{marginTop: '10px'}}
        />
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

export default Documents;
