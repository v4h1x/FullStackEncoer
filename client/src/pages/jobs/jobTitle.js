import { useRecordContext } from 'react-admin';
const JobTitle = () => {
    const record = useRecordContext();
    return <span>Job {record ? `"${record.name}"` : ''}</span>;
};

export default JobTitle;