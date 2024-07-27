// In the name of God
'use strict'

import { OptionDef, OptionGroupDef, Option, OptionGroup, FFMpegCommand } from './command.js';
import { parseArgsStringToArgv } from 'string-argv';

const HAS_ARG = 0x0001;
const OPT_BOOL = 0x0002;
const OPT_EXPERT = 0x0004;
const OPT_STRING = 0x0008;
const OPT_VIDEO = 0x0010;
const OPT_AUDIO = 0x0020;
const OPT_INT = 0x0080;
const OPT_FLOAT = 0x0100;
const OPT_SUBTITLE = 0x0200;
const OPT_INT64 = 0x0400;
const OPT_EXIT = 0x0800;
const OPT_DATA = 0x1000;
const OPT_PERFILE = 0x2000;     /* the option is per-file (currently ffmpeg-only).
                                   implied by OPT_OFFSET or OPT_SPEC */
const OPT_OFFSET = 0x4000;       /* option is specified as an offset in a passed optctx */
const OPT_SPEC = 0x8000;       /* option is to be stored in an array of SpecifierOpt.
                                   Implies OPT_OFFSET. Next element after the offset is
                                   an int containing element count in the array. */
const OPT_TIME = 0x10000;
const OPT_DOUBLE = 0x20000;
const OPT_INPUT = 0x40000;
const OPT_OUTPUT = 0x80000;

const commonOptions = [
    new OptionDef("L", OPT_EXIT, "show license"),
    new OptionDef("h", OPT_EXIT, "show help", "topic"),
    new OptionDef("?", OPT_EXIT, "show help", "topic"),
    new OptionDef("help", OPT_EXIT, "show help", "topic"),
    new OptionDef("-help", OPT_EXIT, "show help", "topic"),
    new OptionDef("version", OPT_EXIT, "show version"),
    new OptionDef("buildconf", OPT_EXIT, "show build configuration"),
    new OptionDef("formats", OPT_EXIT, "show available formats"),
    new OptionDef("muxers", OPT_EXIT, "show available muxers"),
    new OptionDef("demuxers", OPT_EXIT, "show available demuxers"),
    new OptionDef("devices", OPT_EXIT, "show available devices"),
    new OptionDef("codecs", OPT_EXIT, "show available codecs"),
    new OptionDef("decoders", OPT_EXIT, "show available decoders"),
    new OptionDef("encoders", OPT_EXIT, "show available encoders"),
    new OptionDef("bsfs", OPT_EXIT, "show available bit stream filters"),
    new OptionDef("protocols", OPT_EXIT, "show available protocols"),
    new OptionDef("filters", OPT_EXIT, "show available filters"),
    new OptionDef("pix_fmts", OPT_EXIT, "show available pixel formats"),
    new OptionDef("layouts", OPT_EXIT, "show standard channel layouts"),
    new OptionDef("sample_fmts", OPT_EXIT, "show available audio sample formats"),
    new OptionDef("dispositions", OPT_EXIT, "show available stream dispositions"),
    new OptionDef("colors", OPT_EXIT, "show available color names"),
    new OptionDef("loglevel", HAS_ARG, "set logging level", "loglevel"),
    new OptionDef("v", HAS_ARG, "set logging level", "loglevel"),
    new OptionDef("report", 0, "generate a report"),
    new OptionDef("max_alloc", HAS_ARG, "set maximum size of a single allocated block", "bytes"),
    new OptionDef("cpuflags", HAS_ARG | OPT_EXPERT, "force specific cpu flags", "flags"),
    new OptionDef("cpucount", HAS_ARG | OPT_EXPERT, "force specific cpu count", "count"),
    new OptionDef("hide_banner", OPT_BOOL | OPT_EXPERT, "do not show program banner", "hide_banner"),
    new OptionDef("sources", OPT_EXIT | HAS_ARG, "list sources of the input device"),
    new OptionDef("sinks", OPT_EXIT | HAS_ARG, "list sinks of the output device"),
];

const options = [
    /* main options */
    ...commonOptions,
    new OptionDef("f", HAS_ARG | OPT_STRING | OPT_OFFSET |
        OPT_INPUT | OPT_OUTPUT),
    new OptionDef("y", OPT_BOOL),
    new OptionDef("n", OPT_BOOL),
    new OptionDef("ignore_unknown", OPT_BOOL),
    new OptionDef("copy_unknown", OPT_BOOL | OPT_EXPERT),
    new OptionDef("recast_media", OPT_BOOL | OPT_EXPERT),
    new OptionDef("c", HAS_ARG | OPT_STRING | OPT_SPEC |
        OPT_INPUT | OPT_OUTPUT),
    new OptionDef("codec", HAS_ARG | OPT_STRING | OPT_SPEC |
        OPT_INPUT | OPT_OUTPUT),
    new OptionDef("pre", HAS_ARG | OPT_STRING | OPT_SPEC |
        OPT_OUTPUT),
    new OptionDef("map", HAS_ARG | OPT_EXPERT | OPT_PERFILE |
        OPT_OUTPUT),
    new OptionDef("map_channel", HAS_ARG | OPT_EXPERT | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("map_metadata", HAS_ARG | OPT_STRING | OPT_SPEC |
        OPT_OUTPUT),
    new OptionDef("map_chapters", HAS_ARG | OPT_INT | OPT_EXPERT | OPT_OFFSET |
        OPT_OUTPUT),
    new OptionDef("t", HAS_ARG | OPT_TIME | OPT_OFFSET |
        OPT_INPUT | OPT_OUTPUT),
    new OptionDef("to", HAS_ARG | OPT_TIME | OPT_OFFSET | OPT_INPUT | OPT_OUTPUT),
    new OptionDef("fs", HAS_ARG | OPT_INT64 | OPT_OFFSET | OPT_OUTPUT),
    new OptionDef("ss", HAS_ARG | OPT_TIME | OPT_OFFSET |
        OPT_INPUT | OPT_OUTPUT),
    new OptionDef("sseof", HAS_ARG | OPT_TIME | OPT_OFFSET |
        OPT_INPUT
    ),
    new OptionDef(
        "seek_timestamp", HAS_ARG | OPT_INT | OPT_OFFSET |
    OPT_INPUT
    ),
    new OptionDef(
        "accurate_seek", OPT_BOOL | OPT_OFFSET | OPT_EXPERT |
    OPT_INPUT
    ),
    new OptionDef(
        "itsoffset", HAS_ARG | OPT_TIME | OPT_OFFSET |
        OPT_EXPERT | OPT_INPUT
    ),
    new OptionDef("itsscale", HAS_ARG | OPT_DOUBLE | OPT_SPEC | OPT_EXPERT | OPT_INPUT),
    new OptionDef("timestamp", HAS_ARG | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("metadata", HAS_ARG | OPT_STRING | OPT_SPEC | OPT_OUTPUT),
    new OptionDef("program", HAS_ARG | OPT_STRING | OPT_SPEC | OPT_OUTPUT),
    new OptionDef(
        "dframes", HAS_ARG | OPT_PERFILE | OPT_EXPERT |
    OPT_OUTPUT
    ),
    new OptionDef("benchmark", OPT_BOOL | OPT_EXPERT),
    new OptionDef("benchmark_all", OPT_BOOL | OPT_EXPERT),
    new OptionDef("progress", HAS_ARG | OPT_EXPERT),
    new OptionDef("stdin", OPT_BOOL | OPT_EXPERT),
    new OptionDef("timelimit", HAS_ARG | OPT_EXPERT),
    new OptionDef("dump", OPT_BOOL | OPT_EXPERT),
    new OptionDef("hex", OPT_BOOL | OPT_EXPERT),
    new OptionDef(
        "re", OPT_BOOL | OPT_EXPERT | OPT_OFFSET |
    OPT_INPUT
    ),
    new OptionDef(
        "readrate", HAS_ARG | OPT_FLOAT | OPT_OFFSET |
        OPT_EXPERT | OPT_INPUT
    ),
    new OptionDef("target", HAS_ARG | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("vsync", HAS_ARG | OPT_EXPERT),
    new OptionDef("frame_drop_threshold", HAS_ARG | OPT_FLOAT | OPT_EXPERT),
    new OptionDef("async", HAS_ARG | OPT_INT | OPT_EXPERT),
    new OptionDef("adrift_threshold", HAS_ARG | OPT_FLOAT | OPT_EXPERT),
    new OptionDef("copyts", OPT_BOOL | OPT_EXPERT),
    new OptionDef("start_at_zero", OPT_BOOL | OPT_EXPERT),
    new OptionDef("copytb", HAS_ARG | OPT_INT | OPT_EXPERT),
    new OptionDef(
        "shortest", OPT_BOOL | OPT_EXPERT | OPT_OFFSET |
    OPT_OUTPUT
    ),
    new OptionDef(
        "bitexact", OPT_BOOL | OPT_EXPERT | OPT_OFFSET |
        OPT_OUTPUT | OPT_INPUT
    ),
    new OptionDef(
        "apad", OPT_STRING | HAS_ARG | OPT_SPEC |
    OPT_OUTPUT
    ),
    new OptionDef("dts_delta_threshold", HAS_ARG | OPT_FLOAT | OPT_EXPERT),
    new OptionDef("dts_error_threshold", HAS_ARG | OPT_FLOAT | OPT_EXPERT),
    new OptionDef("xerror", OPT_BOOL | OPT_EXPERT),
    new OptionDef("abort_on", HAS_ARG | OPT_EXPERT),
    new OptionDef(
        "copyinkf", OPT_BOOL | OPT_EXPERT | OPT_SPEC |
    OPT_OUTPUT
    ),
    new OptionDef("copypriorss", OPT_INT | HAS_ARG | OPT_EXPERT | OPT_SPEC | OPT_OUTPUT),
    new OptionDef("frames", OPT_INT64 | HAS_ARG | OPT_SPEC | OPT_OUTPUT),
    new OptionDef(
        "tag", OPT_STRING | HAS_ARG | OPT_SPEC |
        OPT_EXPERT | OPT_OUTPUT | OPT_INPUT
    ),
    new OptionDef(
        "q", HAS_ARG | OPT_EXPERT | OPT_DOUBLE |
        OPT_SPEC | OPT_OUTPUT
    ),
    new OptionDef(
        "qscale", HAS_ARG | OPT_EXPERT | OPT_PERFILE |
    OPT_OUTPUT
    ),
    new OptionDef("profile", HAS_ARG | OPT_EXPERT | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("filter", HAS_ARG | OPT_STRING | OPT_SPEC | OPT_OUTPUT),
    new OptionDef("filter_threads", HAS_ARG),
    new OptionDef("filter_script", HAS_ARG | OPT_STRING | OPT_SPEC | OPT_OUTPUT),
    new OptionDef("reinit_filter", HAS_ARG | OPT_INT | OPT_SPEC | OPT_INPUT),
    new OptionDef("filter_complex", HAS_ARG | OPT_EXPERT),
    new OptionDef("filter_complex_threads", HAS_ARG | OPT_INT),
    new OptionDef("lavfi", HAS_ARG | OPT_EXPERT),
    new OptionDef("filter_complex_script", HAS_ARG | OPT_EXPERT),
    new OptionDef("auto_conversion_filters", OPT_BOOL | OPT_EXPERT),
    new OptionDef("stats", OPT_BOOL),
    new OptionDef("stats_period", HAS_ARG | OPT_EXPERT),
    new OptionDef("attach", HAS_ARG | OPT_PERFILE | OPT_EXPERT | OPT_OUTPUT),
    new OptionDef("dump_attachment", HAS_ARG | OPT_STRING | OPT_SPEC | OPT_EXPERT | OPT_INPUT),
    new OptionDef(
        "stream_loop", OPT_INT | HAS_ARG | OPT_EXPERT | OPT_INPUT |
    OPT_OFFSET
    ),
    new OptionDef("debug_ts", OPT_BOOL | OPT_EXPERT),
    new OptionDef("max_error_rate", HAS_ARG | OPT_FLOAT),
    new OptionDef(
        "discard", OPT_STRING | HAS_ARG | OPT_SPEC |
    OPT_INPUT
    ),
    new OptionDef(
        "disposition", OPT_STRING | HAS_ARG | OPT_SPEC |
    OPT_OUTPUT
    ),
    new OptionDef("thread_queue_size", HAS_ARG | OPT_INT | OPT_OFFSET | OPT_EXPERT | OPT_INPUT),
    new OptionDef("find_stream_info", OPT_BOOL | OPT_PERFILE | OPT_INPUT | OPT_EXPERT),
    new OptionDef("bits_per_raw_sample", OPT_INT | HAS_ARG | OPT_EXPERT | OPT_SPEC | OPT_OUTPUT),

    /* video options */
    new OptionDef("vframes", OPT_VIDEO | HAS_ARG | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef(
        "r", OPT_VIDEO | HAS_ARG | OPT_STRING | OPT_SPEC |
        OPT_INPUT | OPT_OUTPUT
    ),
    new OptionDef(
        "fpsmax", OPT_VIDEO | HAS_ARG | OPT_STRING | OPT_SPEC |
    OPT_OUTPUT
    ),
    new OptionDef(
        "s", OPT_VIDEO | HAS_ARG | OPT_SUBTITLE | OPT_STRING | OPT_SPEC |
        OPT_INPUT | OPT_OUTPUT
    ),
    new OptionDef(
        "aspect", OPT_VIDEO | HAS_ARG | OPT_STRING | OPT_SPEC |
    OPT_OUTPUT
    ),
    new OptionDef(
        "pix_fmt", OPT_VIDEO | HAS_ARG | OPT_EXPERT | OPT_STRING | OPT_SPEC |
        OPT_INPUT | OPT_OUTPUT
    ),
    new OptionDef("vn", OPT_VIDEO | OPT_BOOL | OPT_OFFSET | OPT_INPUT | OPT_OUTPUT),
    new OptionDef(
        "rc_override", OPT_VIDEO | HAS_ARG | OPT_EXPERT | OPT_STRING | OPT_SPEC |
    OPT_OUTPUT
    ),
    new OptionDef(
        "vcodec", OPT_VIDEO | HAS_ARG | OPT_PERFILE | OPT_INPUT |
    OPT_OUTPUT
    ),
    new OptionDef("timecode", OPT_VIDEO | HAS_ARG | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("pass", OPT_VIDEO | HAS_ARG | OPT_SPEC | OPT_INT | OPT_OUTPUT),
    new OptionDef(
        "passlogfile", OPT_VIDEO | HAS_ARG | OPT_STRING | OPT_EXPERT | OPT_SPEC |
    OPT_OUTPUT
    ),
    new OptionDef("psnr", OPT_VIDEO | OPT_BOOL | OPT_EXPERT),
    new OptionDef("vstats", OPT_VIDEO | OPT_EXPERT),
    new OptionDef("vstats_file", OPT_VIDEO | HAS_ARG | OPT_EXPERT),
    new OptionDef("vstats_version", OPT_VIDEO | OPT_INT | HAS_ARG | OPT_EXPERT),
    new OptionDef("vf", OPT_VIDEO | HAS_ARG | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef(
        "intra_matrix", OPT_VIDEO | HAS_ARG | OPT_EXPERT | OPT_STRING | OPT_SPEC |
    OPT_OUTPUT
    ),
    new OptionDef(
        "inter_matrix", OPT_VIDEO | HAS_ARG | OPT_EXPERT | OPT_STRING | OPT_SPEC |
    OPT_OUTPUT
    ),
    new OptionDef(
        "chroma_intra_matrix", OPT_VIDEO | HAS_ARG | OPT_EXPERT | OPT_STRING | OPT_SPEC |
    OPT_OUTPUT
    ),
    new OptionDef(
        "top", OPT_VIDEO | HAS_ARG | OPT_EXPERT | OPT_INT | OPT_SPEC |
        OPT_INPUT | OPT_OUTPUT
    ),
    new OptionDef(
        "vtag", OPT_VIDEO | HAS_ARG | OPT_EXPERT | OPT_PERFILE |
        OPT_INPUT | OPT_OUTPUT
    ),
    new OptionDef("qphist", OPT_VIDEO | OPT_BOOL | OPT_EXPERT),
    new OptionDef(
        "fps_mode", OPT_VIDEO | HAS_ARG | OPT_STRING | OPT_EXPERT |
        OPT_SPEC | OPT_OUTPUT
    ),
    new OptionDef(
        "force_fps", OPT_VIDEO | OPT_BOOL | OPT_EXPERT | OPT_SPEC |
    OPT_OUTPUT
    ),
    new OptionDef(
        "streamid", OPT_VIDEO | HAS_ARG | OPT_EXPERT | OPT_PERFILE |
    OPT_OUTPUT
    ),
    new OptionDef(
        "force_key_frames", OPT_VIDEO | OPT_STRING | HAS_ARG | OPT_EXPERT |
        OPT_SPEC | OPT_OUTPUT
    ),
    new OptionDef("ab", OPT_VIDEO | HAS_ARG | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("b", OPT_VIDEO | HAS_ARG | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef(
        "hwaccel", OPT_VIDEO | OPT_STRING | HAS_ARG | OPT_EXPERT |
        OPT_SPEC | OPT_INPUT
    ),
    new OptionDef(
        "hwaccel_device", OPT_VIDEO | OPT_STRING | HAS_ARG | OPT_EXPERT |
        OPT_SPEC | OPT_INPUT
    ),
    new OptionDef(
        "hwaccel_output_format", OPT_VIDEO | OPT_STRING | HAS_ARG | OPT_EXPERT |
        OPT_SPEC | OPT_INPUT
    ),
    new OptionDef("hwaccels", OPT_EXIT),
    new OptionDef(
        "autorotate", HAS_ARG | OPT_BOOL | OPT_SPEC |
        OPT_EXPERT | OPT_INPUT
    ),
    new OptionDef(
        "autoscale", HAS_ARG | OPT_BOOL | OPT_SPEC |
        OPT_EXPERT | OPT_OUTPUT
    ),

    /* audio options */
    new OptionDef("aframes", OPT_AUDIO | HAS_ARG | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("aq", OPT_AUDIO | HAS_ARG | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef(
        "ar", OPT_AUDIO | HAS_ARG | OPT_INT | OPT_SPEC |
        OPT_INPUT | OPT_OUTPUT
    ),
    new OptionDef(
        "ac", OPT_AUDIO | HAS_ARG | OPT_INT | OPT_SPEC |
        OPT_INPUT | OPT_OUTPUT
    ),
    new OptionDef("an", OPT_AUDIO | OPT_BOOL | OPT_OFFSET | OPT_INPUT | OPT_OUTPUT),
    new OptionDef(
        "acodec", OPT_AUDIO | HAS_ARG | OPT_PERFILE |
        OPT_INPUT | OPT_OUTPUT
    ),
    new OptionDef(
        "atag", OPT_AUDIO | HAS_ARG | OPT_EXPERT | OPT_PERFILE |
    OPT_OUTPUT
    ),
    new OptionDef("vol", OPT_AUDIO | HAS_ARG | OPT_INT),
    new OptionDef(
        "sample_fmt", OPT_AUDIO | HAS_ARG | OPT_EXPERT | OPT_SPEC |
        OPT_STRING | OPT_INPUT | OPT_OUTPUT
    ),
    new OptionDef(
        "channel_layout", OPT_AUDIO | HAS_ARG | OPT_EXPERT | OPT_SPEC |
        OPT_STRING | OPT_INPUT | OPT_OUTPUT
    ),
    new OptionDef(
        "ch_layout", OPT_AUDIO | HAS_ARG | OPT_EXPERT | OPT_SPEC |
        OPT_STRING | OPT_INPUT | OPT_OUTPUT
    ),
    new OptionDef("af", OPT_AUDIO | HAS_ARG | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("guess_layout_max", OPT_AUDIO | HAS_ARG | OPT_INT | OPT_SPEC | OPT_EXPERT | OPT_INPUT),

    /* subtitle options */
    new OptionDef("sn", OPT_SUBTITLE | OPT_BOOL | OPT_OFFSET | OPT_INPUT | OPT_OUTPUT),
    new OptionDef("scodec", OPT_SUBTITLE | HAS_ARG | OPT_PERFILE | OPT_INPUT | OPT_OUTPUT),
    new OptionDef("stag", OPT_SUBTITLE | HAS_ARG | OPT_EXPERT | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("fix_sub_duration", OPT_BOOL | OPT_EXPERT | OPT_SUBTITLE | OPT_SPEC | OPT_INPUT),
    new OptionDef("canvas_size", OPT_SUBTITLE | HAS_ARG | OPT_STRING | OPT_SPEC | OPT_INPUT),

    /* muxer options */
    new OptionDef("muxdelay", OPT_FLOAT | HAS_ARG | OPT_EXPERT | OPT_OFFSET | OPT_OUTPUT),
    new OptionDef("muxpreload", OPT_FLOAT | HAS_ARG | OPT_EXPERT | OPT_OFFSET | OPT_OUTPUT),
    new OptionDef("sdp_file", HAS_ARG | OPT_EXPERT | OPT_OUTPUT),

    new OptionDef("time_base", HAS_ARG | OPT_STRING | OPT_EXPERT | OPT_SPEC | OPT_OUTPUT),
    new OptionDef("enc_time_base", HAS_ARG | OPT_STRING | OPT_EXPERT | OPT_SPEC | OPT_OUTPUT),

    new OptionDef("bsf", HAS_ARG | OPT_STRING | OPT_SPEC | OPT_EXPERT | OPT_OUTPUT),
    new OptionDef("absf", HAS_ARG | OPT_AUDIO | OPT_EXPERT | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("vbsf", OPT_VIDEO | HAS_ARG | OPT_EXPERT | OPT_PERFILE | OPT_OUTPUT),

    new OptionDef("apre", HAS_ARG | OPT_AUDIO | OPT_EXPERT | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("vpre", OPT_VIDEO | HAS_ARG | OPT_EXPERT | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("spre", HAS_ARG | OPT_SUBTITLE | OPT_EXPERT | OPT_PERFILE | OPT_OUTPUT),
    new OptionDef("fpre", HAS_ARG | OPT_EXPERT | OPT_PERFILE | OPT_OUTPUT),

    new OptionDef("max_muxing_queue_size", HAS_ARG | OPT_INT | OPT_SPEC | OPT_EXPERT | OPT_OUTPUT),
    new OptionDef("muxing_queue_data_threshold", HAS_ARG | OPT_INT | OPT_SPEC | OPT_EXPERT | OPT_OUTPUT),

    /* data codec support */
    new OptionDef("dcodec", HAS_ARG | OPT_DATA | OPT_PERFILE | OPT_EXPERT | OPT_INPUT | OPT_OUTPUT),
    new OptionDef("dn", OPT_BOOL | OPT_VIDEO | OPT_OFFSET | OPT_INPUT | OPT_OUTPUT),

    new OptionDef("vaapi_device", HAS_ARG | OPT_EXPERT),
    new OptionDef("qsv_device", HAS_ARG | OPT_EXPERT),
    new OptionDef("init_hw_device", HAS_ARG | OPT_EXPERT),
    new OptionDef("filter_hw_device", HAS_ARG | OPT_EXPERT),

];


const groups = [
    new OptionGroupDef("output url", null, OPT_OUTPUT),
    new OptionGroupDef("input url", "i", OPT_INPUT),
];

function addOption(po, command, opt, arg, groupOptions) {
    if (!(po.flags & (OPT_PERFILE | OPT_SPEC | OPT_OFFSET))) {
        command.global_options.push(new Option(po, opt, arg));
    }
    else {
        groupOptions[opt] = arg;
    }
}

const parseCommand = (cmd) => {

    let args = parseArgsStringToArgv(cmd);

    let command = new FFMpegCommand();
    let groupOptions = {};

    let optindex = 0;
    let dashdash = -2;
    while (optindex < args.length) {
        let opt = args[optindex++]

        if (opt === '--') {
            dashdash = optindex;
            continue;
        }
        /* unnamed group separators, e.g. output filename */
        if (opt.charAt(0) !== '-' || opt.length == 1 || dashdash + 1 == optindex) {
            let group = groups[0];
            let optGroup = new OptionGroup(group, opt, { ...groupOptions });
            command.outputs.push(optGroup);
            groupOptions = {};
            continue;
        }
        opt = opt.substring(1);

        /* named group separators, e.g. -i */
        let group = groups.find(g => g.separator && g.separator === opt);
        if (group) {
            let arg = args[optindex++];
            let optGroup = new OptionGroup(group, arg, { ...groupOptions });
            if (group.name.indexOf('input') > -1)
                command.inputs.push(optGroup)
            else
                command.outputs.push(optGroup);
            groupOptions = {};
            continue;
        }

        /* normal options */
        let arg = null;
        let getArg = ()=>{
            arg = args[optindex++];
            if (!arg)
                throw `Missing argument for option ${opt}.\n`
        };

        let po = options.find(o => o.name === opt.split(':')[0])
        if (po) {
            if (po.flags & OPT_EXIT) {
                /* optional argument, e.g. -h */
                arg = args[optindex++];
            } else if (po.flags & HAS_ARG) {
                getArg(args, optindex, opt);
            } else {
                arg = true;
            }

            addOption(po, command, opt, arg, groupOptions);
            continue;
        }

        /* AVOptions */
        if (args[optindex]) {
            getArg(args, optindex, opt);
            groupOptions[opt] = arg;
            continue;
        }

        /* boolean -nofoo options */
        if (opt.startsWith('no') &&
            (po = find_option(options, opt.substring(2))) &&
            po.name && po.flags & OPT_BOOL) {
            addOption(po, command, opt, false, groupOptions);
            continue;
        }

        throw `Unrecognized option ${opt}.`;
    }

    return command;
}

export default parseCommand;
