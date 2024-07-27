
import React, { useEffect, useState } from 'react';
import { Tab, Tabs, Box, Typography, Divider } from '@mui/material';
import PropTypes from 'prop-types';
import Command from './Command'
import FFMpegCommand from 'api/server/common/ffmpegTools';

const FFMpegUI = (props) => {

	const { onChange, initialValue } = props;

	const [cmd, setCmd] = useState(initialValue ? initialValue : '');

	const [data, setData] = useState(new FFMpegCommand());

	// if (initialValue)
	// 	try {
	// 		setData(FFMpegCommand.parseCommand(initialValue));
	// 	}
	// 	catch (error) {
	// 		console.log(error)
	// 	}


	// useEffect(() => {
	// 	// Notify higher order components.
		
	// }, [cmd, onChange])

	const onCommandChange = (value, property, propertyVaule) => {
		setData(value);
		if (!property) {
			onCmdChange(data.getCommand());
			return;
		}
		try {
			let cmdData = FFMpegCommand.parseCommand(cmd);
			switch (property) {
				case "inputAdded":
					cmdData.inputs.push(data.inputs[propertyVaule]);
					break;
				case "inputRemoved":
					cmdData.inputs.pop(propertyVaule);
					break;
				case "inputChanged":
					cmdData.inputs[propertyVaule] = data.inputs[propertyVaule];
					break;
				case "outputAdded":
					cmdData.outputs.push(data.outputs[propertyVaule]);
					break;
				case "outputRemoved":
					cmdData.outputs.pop(propertyVaule);
					break;
				case "outputChanged":
					cmdData.outputs[propertyVaule] = data.outputs[propertyVaule];
					break;
				case "global":
					cmdData.global_options = [...data.global_options];
					break;
				default:
					cmdData = new FFMpegCommand();
					cmdData.fromObject(data);
					break;
			}
			onCmdChange(cmdData.getCommand());
		}
		catch (error) {
		}
	};

	const onCmdChange = (v) => {
		try {
			setCmd(v);
			onChange(v);
		}
		catch (error) {
		}
	};

	return (
		<Box sx={{ flexGrow: 1 }} >
			{/* <Presets data={preset} presetChanged={updatePreset} /> */}
			{/* <FileIO data={data} dataChanged={updateData} /> */}
			{/* <Divider sx={{pt:2}}/> */}

			<Command cmd={cmd} onChange={onCmdChange} />
		</Box >
	);
};

FFMpegUI.propTypes = {
	onChange: PropTypes.func,
	value: PropTypes.object,
};
export default FFMpegUI;