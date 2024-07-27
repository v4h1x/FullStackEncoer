import presets from '../presets';
import React from 'react';
import { Box, TextField, MenuItem, ListSubheader, Grid } from '@mui/material';
const Presets = (props) => {

	const data = { presets: presets.getPresetOptions() };

	const update = (event) => {
		const value = event.target.value;
		props.presetChanged(value);
	};

	return (
		<Box>
			<Grid container spacing={2}>
				<Grid item xs={6}>
					<TextField select fullWidth size="small" label="Preset:" onChange={update} name="preset" value={props.data.id}>
						{
							data.presets.map((o, i) => {
								return [
									<ListSubheader key={i}>{o.name}</ListSubheader>,
									o.data &&
									o.data.map((item) => {
										return <MenuItem key={item.id} value={item.value}>
											{item.name}
										</MenuItem>
									})
								]
							})
						}
					</TextField>
				</Grid>
			</Grid>
		</Box>
	);
};

export default Presets;