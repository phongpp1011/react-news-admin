import React, { useEffect, useState } from "react";
import axios from "axios";

function UserList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8081/users")
            .then(res => setUsers(res.data))
            .catch(err => console.log(err));
    }, []);

    return (
        <div className="user-list">
            <h2>Danh sách người dùng</h2>

            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Trạng thái</th>
                        <th>Quyền</th>
                        <th>Ngày tạo</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.fullname}</td>
                            <td>{u.email}</td>
                            <td>{u.phone}</td>
                            <td>{u.status}</td>
                            <td>{u.role}</td>
                            <td>{new Date(u.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserList;
