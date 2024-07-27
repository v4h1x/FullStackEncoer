import { useRecordContext } from "react-admin";

const UserTitle = () => {
    const record = useRecordContext()
    return <span>User {record ? `"${record.username}"` : ''}</span>;
};

export default UserTitle;