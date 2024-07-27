//In the name of God

function wrapValue(value) {
    if (value && (value.indexOf(' ') > -1 || value.indexOf('\'') > -1))
        return `"${value}"`;
    return value;
}

class OptionDef {
    constructor(name, flags, help) {
        this.name = name;
        this.flags = flags;
        this.help = help;
    }
}

class OptionGroupDef {
    constructor(name, separator, flags) {
        this.name = name;
        this.separator = separator;
        this.flags = flags;
    }
}

class Option {
    constructor(def, opt, arg) {
        this.def = def;
        this.opt = opt;
        this.arg = arg;
    }

    getCommandArray() {
        if (this.arg === true)
            return [`-${this.opt}`];
        if (this.arg === false)
            return [`-no${this.opt}`];
        return [`-${this.opt}`, wrapValue(this.arg)];
    }

    getCommand() {
        return this.getCommandArray().join(' ');
    }
}

class OptionGroup {
    constructor(def, arg, options) {
        this.def = def;
        this.arg = arg;
        this.options = options;
    }

    getCommandArray() {
        let command = [];
        for (const key in this.options) {
            if (this.options[key] === true)
                command.push(`-${key}`)
            else if (this.options[key] === false)
                command.push(`-no${key}`)
            else {
                command.push(`-${key}`)
                command.push(wrapValue(this.options[key]))
            }
        }
        command.push(this.def.separator ? '-' + this.def.separator : '')
        command.push(wrapValue(this.arg));
        return command;
    }
    getCommand() {
        return this.getCommandArray().join(' ');
    }

}

class FFMpegCommand {
    constructor() {
        this.inputs = [];
        this.outputs = [];

        this.global_options = [];
    }

    getCommandArray() {
        let command = [];
        for (let go of this.global_options)
            command.push(...go.getCommandArray());

        for (let i of this.inputs)
            command.push(...i.getCommandArray());

        for (let o of this.outputs)
            command.push(...o.getCommandArray());

        return command;
    }
    getCommand() {
        return this.getCommandArray().join(' ');
    }

    fromObject(object) {
        if (object.global_options)
            for (let go of object.global_options)
                this.global_options.push(new Option(go.def, go.opt, go.arg))

        if (object.inputs)
            for (let i of object.inputs)
                this.inputs.push(new OptionGroup(i.def, i.arg, i.options))

        if (object.outputs)
            for (let o of object.outputs)
                this.outputs.push(new OptionGroup(o.def, o.arg, o.options))

    }
}

const _OptionDef = OptionDef;
export { _OptionDef as OptionDef };
const _OptionGroupDef = OptionGroupDef;
export { _OptionGroupDef as OptionGroupDef };
const _Option = Option;
export { _Option as Option };
const _OptionGroup = OptionGroup;
export { _OptionGroup as OptionGroup };
const _FFMpegCommand = FFMpegCommand;
export { _FFMpegCommand as FFMpegCommand };
