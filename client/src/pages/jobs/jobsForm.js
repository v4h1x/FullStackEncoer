import { Create, Form, TextInput, Toolbar, SaveButton, required } from 'react-admin';
import { useInput, useEditContext } from 'react-admin';
import { Grid } from '@mui/material';
import PropTypes from 'prop-types';
import { FFMpegUI } from './ffmpeg2';
import FFMpegCommand from 'api/server/common/ffmpegTools';

const HOFFMpegUI = (props) => {

    const {
        field: { value, onChange },
        fieldState: { isTouched, error },
        formState: { isSubmitted },
        isRequired,
    } = useInput(props);

    const record = props.record;

    return (
        <>
            <FFMpegUI onChange={onChange} initialValue={record ? record : value} 
                isRequired={isRequired}
                fieldState={{isTouched, error}}
                formState={{isSubmitted}}/>
        </>
    )
}

HOFFMpegUI.propTypes = {
    source: PropTypes.string.isRequired,
    record: PropTypes.object
};

const validateJobName = required('Job name must not be empty.')

const validateCommand = (value)=>{
    if (!value)
        return 'Command must not be empty.'
    try{
        FFMpegCommand.parseCommand(value);
        return undefined;
    }
    catch (error)
    {
        return error;
    }
};

export const JobForm = (props) => {

    const {
        record, // record fetched via dataProvider.getOne() based on the id from the location
    } = useEditContext();

    return (
        <Form {...props}>
            <Grid container direction="column" spacing={2} sx={{ p: 4 }}>
                <Grid container item spacing={4}>
                    <Grid item xs={6} >
                        <TextInput fullWidth source="name" variant="standard" validate={validateJobName} />
                    </Grid>
                </Grid>
                <Grid item>
                    <TextInput fullWidth multiline source="command" isRequired validate={validateCommand}/>
                    {/* <HOFFMpegUI source="command" isRequired record={record ? record.command : null} validate={validateCommand}/> */}
                </Grid>
                <Grid item>
                    <Toolbar>
                        <SaveButton />
                    </Toolbar>
                </Grid>
            </Grid>
        </Form>
    );
};

export default JobForm;