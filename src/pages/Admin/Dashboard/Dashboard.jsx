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
            </div>
    )
}

export default Dashboard;