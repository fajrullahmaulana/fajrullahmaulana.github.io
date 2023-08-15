import React from 'react';
import { Form, DatePicker, Button } from 'antd';
import { CSVLink } from 'react-csv';
import { supabase } from '../../../databaseClient';
import { format } from 'date-fns';

const { RangePicker } = DatePicker;

const DateRangeForm = () => {
  const [csvData, setCSVData] = React.useState([]);

  const onFinish = async (values) => {
    try {

        const start = values.dateRange[0].$d;
        const startDateObj = new Date(start);
        const startDate = format(startDateObj, 'yyyy-MM-dd HH:mm');

        const end = values.dateRange[1].$d;
        const endDateObj = new Date(end);
        const endDate = format(endDateObj, 'yyyy-MM-dd HH:mm');


      const { data, error } = await supabase
        .from('Pemasangan')
        .select(`
            *,
            Users:id_user ( nama ),
            Customers:id_customer ( nama )
        `)
        .gte('tanggal_pasang', startDateObj.toISOString())
        .lte('tanggal_pasang', endDateObj.toISOString());

      if (error) {
        throw error;
      }

      setCSVData(data.map(data => { 
        let newStatus;

        data.status === 0 ? newStatus = 'Belum Selesai' : data.status === 1 ? newStatus = 'Menunggu Pembayaran' : data.status === 2 ? newStatus = 'Project Selesai' : newStatus = 'Project Dibatalkan'
        
        return {
        ...data,
        nama_customer: data.Customers.nama.replace(/,/g, ';'),
        nama_admin: data.Users.nama.replace(/,/g, ';'),
        status: newStatus
      }}));
    } catch (error) {
      console.error('Error exporting data:', error.message);
    }
  };

  const headers = [
    {
        label: 'No',
        key: 'id_pemasangan',
    },
    {
        label: 'Nama Customer',
        key: 'nama_customer',
    },
    {
    label: 'Nama Admin',
    key: 'nama_admin',
    },
    {
    label: 'Tanggal Pasang',
    key: 'tanggal_pasang',
    },
    {
    label: 'Tanggal Selesai',
    key: 'tanggal_selesai',
    },
    {
    label: 'Tanggal Bayar',
    key: 'tanggal_bayar',
    },
    {
    label: 'Total Pembayaran',
    key: 'total_pembayaran',
    },
    {
    label: 'Status',
    key: 'status',
    },
    // Add more headers as needed
  ];

  const csvOptions = {
    delimiter: ';', // Set delimiter to semicolon (;)
  };

  return (
    <Form onFinish={onFinish} layout="vertical">
      <Form.Item name="dateRange" label="Date Range" rules={[{ required: true, message: 'Please select date range' }]}>
        <RangePicker />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Export to Excel
        </Button>
      </Form.Item>
      {csvData.length > 0 && (
        <CSVLink data={csvData} headers={headers} filename={'YourFileName.csv'}  target="_blank" options={csvOptions} >
          Download CSV
        </CSVLink>
      )}
    </Form>
  );
};

export default DateRangeForm;
