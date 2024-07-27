import ffmpeg from '../ffmpeg';
import presets from '../presets';
import CommandUtils from '../util';
import merge from 'lodash.merge';
import clone from 'lodash.clonedeep';

import React, { useEffect, useState } from 'react';
import { Tab, Tabs, Box, Typography, Divider } from '@mui/material';
import PropTypes from 'prop-types';
import Presets from './Presets';
import FileIO from './FileIO';
import Format from './Format';
import Video from './Video';
import Audio from './Audio'
import Filters from './Filters';
import Options from './Options'
import Command from './Command'

const TabPanel = (props) => {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ flexGrow: 1 }} pt={2} pb={2}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
};

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.number.isRequired,
	value: PropTypes.number.isRequired,
};

const FFMpegUI = (props) => {

	const { onChange, initialValue } = props;
	console.log(initialValue);
	const [tabNumber, setTabNumber] = React.useState(0);

	const handleTabChange = (event, newValue) => setTabNumber(newValue);

	// Make copy of initial form as defaults.
	const defaultData = {
		io: {
			input: 'input.mp4',
			output: 'output.mp4',
		},
		format: {
			container: 'mp4',
			clip: false,
			startTime: null,
			stopTime: null,
		},
		video: {
			codec: 'x264',
			preset: 'none',
			pass: '1',
			crf: 23,
			bitrate: null,
			minrate: null,
			maxrate: null,
			bufsize: null,
			gopsize: null,
			pixel_format: 'auto',
			frame_rate: 'auto',
			speed: 'auto',
			tune: 'none',
			profile: 'none',
			level: 'none',
			faststart: false,
			size: 'source',
			width: '1080',
			height: '1920',
			format: 'widescreen',
			aspect: 'auto',
			scaling: 'auto',
			codec_options: '',
		},
		audio: {
			codec: 'copy',
			channel: 'source',
			quality: 'auto',
			sampleRate: 'auto',
			volume: 100,
		},
		filters: {
			deband: false,
			deshake: false,
			deflicker: false,
			dejudder: false,
			denoise: 'none',
			deinterlace: 'none',
			brightness: 0,
			contrast: 0,
			saturation: 0,
			gamma: 0,

			acontrast: 33,
		},
		options: {
			extra: [],
			loglevel: 'none',
		},
	}
	const [data, setData] = useState(initialValue ? initialValue : clone(defaultData));

	const [preset, setPreset] = useState({
		id: 'custom',
		name: null,
	});

	const [cmd, setCmd] = useState(null);

	const updateData = (section, name, value) => {
		setData(oldData => {
			const nd = { ...oldData };
			nd[section][name] = value;
			return nd;
		});
	};

	const setPresetData = (preset) => {
		setData(oldData => {
			const nd = { ...oldData };
			return merge(nd, preset);
		});
	}

	const updatePreset = (presetId) => {

		if (presetId.startsWith('preset-')) {
			const preset = presets.getPresetFromLocalStorage(presetId);
			setPresetData(preset);
			setPreset({ id: presetId, name: preset.name });
		} else if (presetId !== 'custom' && !presetId.startsWith('preset-')) {
			reset();
			const preset = presets.getPreset(presetId);
			setPresetData(preset);
			setPreset({ id: presetId, name: null });
		}
	}

	const generateCommand = () => {
		const opt = CommandUtils.transform(data);
		setCmd(ffmpeg.build(opt));
	};


	const reset = () => {
		// Restore form from default copy.
		setData(oldData => {
			const nd = { ...oldData };
			return merge(nd, defaultData);
		});
		setPreset({ id: null, name: null });
	}

	const updateOutput = () => {
		if (data.io.output) {
			const { format, io } = data;
			const ext = io.output.split('.').pop();
			if (ext)
				updateData("io", "output", `${io.output.replace(ext, `${format.container}`)}`)
		}
	}

	useEffect(() => {

		// Update the output filename.
		// updateOutput();

		// Generates the FFmpeg command.
		generateCommand();

		// Notify higher order components.
		onChange(CommandUtils.transformToJSON(data));
	}, [data])

	return (
		<Box sx={{ flexGrow: 1 }} >
			<Presets data={preset} presetChanged={updatePreset} />
			<FileIO data={data} dataChanged={updateData} />
			<Divider sx={{pt:2}}/>

			{/* Tabs for each command building component.
    		Format, Video, Audio, Filters and Options */}
			<Tabs value={tabNumber} onChange={handleTabChange}>
				<Tab label="Format" id="Format" />
				<Tab label="Video" id="Video" />
				<Tab label="Audio" id="Audio" />
				<Tab label="Filters" id="Filters" />
				<Tab label="Options" id="Options" />
			</Tabs>
			<TabPanel value={tabNumber} index={0}>
				<Format data={data} dataChanged={updateData} />
			</TabPanel>
			<TabPanel value={tabNumber} index={1}>
				<Video data={data} dataChanged={updateData} />
			</TabPanel>
			<TabPanel value={tabNumber} index={2}>
				<Audio data={data} dataChanged={updateData} />
			</TabPanel>
			<TabPanel value={tabNumber} index={3}>
				<Filters data={data} dataChanged={updateData} />
			</TabPanel>
			<TabPanel value={tabNumber} index={4}>
				<Options data={data} dataChanged={updateData} />
			</TabPanel>
			<Divider />
			<Command cmd={cmd} />
		</Box >
	);
};

FFMpegUI.propTypes = {
	onChange: PropTypes.func,
	value: PropTypes.object,
};
export default FFMpegUI;