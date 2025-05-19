import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [adminData, setAdminData] = useState(null);

    useEffect(() => {
        fetchAdminData().then();
    }, []);

    const fetchAdminData = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/admin');
            setAdminData(response.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        }
    };

    if (!adminData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <div>
                <h2>Admin Data</h2>
                <pre>{JSON.stringify(adminData, null, 2)}</pre>
            </div>
        </div>
    );
};

export default AdminDashboard;
