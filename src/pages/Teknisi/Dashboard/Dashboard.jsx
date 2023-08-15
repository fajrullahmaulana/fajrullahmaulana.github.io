import { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../../../databaseClient';


const Dashboard = () => {


    const data = [
        { name: 'Jan', value: 50 },
        { name: 'Feb', value: 100 },
        { name: 'Mar', value: 150 },
        { name: 'Apr', value: 200 },
        { name: 'May', value: 250 },
      ];

    return (
            <div style={{ width: '100%', height: 500}}>
            <h1 style={{marginBottom: '23px', fontSize: '25px', color: '#333'}}>Dashboard Project</h1>
            <p style={{marginLeft: '40px', marginBottom: '20px', color: '#444'}}>Grafik Project Selama Tahun 2023</p>
                <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
                </ResponsiveContainer>
            </div>
    )
}

export default Dashboard;