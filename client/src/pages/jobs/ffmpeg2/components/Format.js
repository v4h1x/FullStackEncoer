import form from '../form';
import React from 'react';
import { Grid, Box, FormLabel, FormGroup } from '@mui/material';
import { TextField, MenuItem, ListSubheader } from '@mui/material';

const Format = (props) => {

	const { containers, clip } = form;
	const data = {
		containers,
		clip,
	};

	const update = (event) => {
		const name = event.target.name;
		const value = event.target.value;
		props.dataChanged("format", name, value);
	};

	return (
		<Box >
			<Grid container spacing={2}>
				<Grid item xs={6}>
					<TextField select fullWidth size="small" label="Container" name="container" onChange={update} value={props.data.format.container}>
						<MenuItem disabled>-- Please select an option --</MenuItem>
						{
							Object.keys(data.containers).map((o) => {
								return [
									<ListSubheader>{o}</ListSubheader>,
									data.containers[o].map((item) => {
										return <MenuItem key={item.id} value={item.value}>
											{item.name}
										</MenuItem>
									})
								]
							})
						}
					</TextField>
				</Grid>
				<Grid item xs>
					<TextField select fullWidth size="small" label="Clip:" onChange={update} name="clip" value={props.data.format.clip}>
						<MenuItem disabled>-- Please select an option --</MenuItem>
						{
							clip.map((o) => {
								return <MenuItem key={o.id} value={o.value}>
									{o.name}
								</MenuItem>
							})
						}
					</TextField>
				</Grid>
				{props.data.format.clip ?
					<Grid item xs>
						<TextField fullWidth size="small" onChange={update} name="startTime" value={props.data.format.startTime} label="Start Time:" helperText="00:00:00.000" />
					</Grid>
					: null
				}
				{props.data.format.clip ?
					<Grid item xs>
						<TextField fullWidth size="small" onChange={update} name="stopTime" value={props.data.format.stopTime} label="Stop Time:" helperText="00:00:00.000" />
					</Grid>
					: null
				}
			</Grid>
		</Box >
	);
};

export default Format;