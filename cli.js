#!/usr/bin/env node
!function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {}
        };
        return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
        module.l = !0, module.exports;
    }
    __webpack_require__.m = modules, __webpack_require__.c = installedModules, __webpack_require__.d = function(exports, name, getter) {
        __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
            enumerable: !0,
            get: getter
        });
    }, __webpack_require__.r = function(exports) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(exports, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(exports, "__esModule", {
            value: !0
        });
    }, __webpack_require__.t = function(value, mode) {
        if (1 & mode && (value = __webpack_require__(value)), 8 & mode) return value;
        if (4 & mode && "object" == typeof value && value && value.__esModule) return value;
        var ns = Object.create(null);
        if (__webpack_require__.r(ns), Object.defineProperty(ns, "default", {
            enumerable: !0,
            value: value
        }), 2 & mode && "string" != typeof value) for (var key in value) __webpack_require__.d(ns, key, function(key) {
            return value[key];
        }.bind(null, key));
        return ns;
    }, __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function() {
            return module.default;
        } : function() {
            return module;
        };
        return __webpack_require__.d(getter, "a", getter), getter;
    }, __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    }, __webpack_require__.p = "", __webpack_require__(__webpack_require__.s = 22);
}([ , , , , , function(module, exports) {
    module.exports = require("fs");
}, , , , , , function(module, exports) {
    module.exports = require("events");
}, function(module, exports) {
    module.exports = require("path");
}, , , , , , , , , , function(module, exports, __webpack_require__) {
    const commander = __webpack_require__(23), fs = __webpack_require__(5), _require = __webpack_require__(25), fixDuplicates = _require.fixDuplicates, listDuplicates = _require.listDuplicates, version = __webpack_require__(26).version;
    commander.version(version).usage("[options] [yarn.lock path (default: yarn.lock)]").option("-s, --strategy <strategy>", 'deduplication strategy. Valid values: fewer, highest. Default is "highest"', "highest").option("-l, --list", "do not change yarn.lock, just output the diagnosis").option("-f, --fail", "if there are duplicates in yarn.lock, terminate the script with exit status 1").option("--scopes <scopes>", "a comma separated list of scopes to deduplicate. Defaults to all packages.", val => val.split(",").map(v => v.trim())).option("--packages <packages>", "a comma separated list of packages to deduplicate. Defaults to all packages.", val => val.split(",").map(v => v.trim())).option("--exclude <exclude>", "a comma separated list of packages not to deduplicate.", val => val.split(",").map(v => v.trim())).option("--print", "instead of saving the deduplicated yarn.lock, print the result in stdout"), 
    commander.parse(process.argv), commander.scopes && commander.packages && (console.error("Please specify either scopes or packages, not both."), 
    commander.help()), "highest" !== commander.strategy && "fewer" !== commander.strategy && (console.error("Invalid strategy " + commander.strategy), 
    commander.help());
    const file = commander.args.length ? commander.args[0] : "yarn.lock";
    try {
        const yarnLock = fs.readFileSync(file, "utf8"), useMostCommon = "fewer" === commander.strategy;
        if (commander.list) {
            const duplicates = listDuplicates(yarnLock, {
                useMostCommon: useMostCommon,
                includeScopes: commander.scopes,
                includePackages: commander.packages,
                excludePackages: commander.exclude
            });
            duplicates.forEach(logLine => console.log(logLine)), commander.fail && duplicates.length && process.exit(1);
        } else {
            let dedupedYarnLock = fixDuplicates(yarnLock, {
                useMostCommon: useMostCommon,
                includeScopes: commander.scopes,
                includePackages: commander.packages,
                excludePackages: commander.exclude
            });
            if (commander.print) console.log(dedupedYarnLock); else {
                const eolMatch = yarnLock.match(/(\r?\n)/);
                eolMatch && "\r\n" === eolMatch[0] && (dedupedYarnLock = dedupedYarnLock.replace(/\n/g, "\r\n")), 
                fs.writeFileSync(file, dedupedYarnLock);
            }
            commander.fail && yarnLock !== dedupedYarnLock && process.exit(1);
        }
        process.exit(0);
    } catch (e) {
        console.error(e), process.exit(1);
    }
}, function(module, exports, __webpack_require__) {
    const EventEmitter = __webpack_require__(11).EventEmitter, spawn = __webpack_require__(24).spawn, path = __webpack_require__(12), fs = __webpack_require__(5);
    class Option {
        constructor(flags, description) {
            this.flags = flags, this.required = flags.indexOf("<") >= 0, this.optional = flags.indexOf("[") >= 0, 
            this.mandatory = !1, this.negate = -1 !== flags.indexOf("-no-");
            const flagParts = flags.split(/[ ,|]+/);
            flagParts.length > 1 && !/^[[<]/.test(flagParts[1]) && (this.short = flagParts.shift()), 
            this.long = flagParts.shift(), this.description = description || "", this.defaultValue = void 0;
        }
        name() {
            return this.long.replace(/^--/, "");
        }
        attributeName() {
            return this.name().replace(/^no-/, "").split("-").reduce((str, word) => str + word[0].toUpperCase() + word.slice(1));
        }
        is(arg) {
            return this.short === arg || this.long === arg;
        }
    }
    class CommanderError extends Error {
        constructor(exitCode, code, message) {
            super(message), Error.captureStackTrace(this, this.constructor), this.name = this.constructor.name, 
            this.code = code, this.exitCode = exitCode, this.nestedError = void 0;
        }
    }
    class Command extends EventEmitter {
        constructor(name) {
            super(), this.commands = [], this.options = [], this.parent = null, this._allowUnknownOption = !1, 
            this._args = [], this.rawArgs = null, this._scriptPath = null, this._name = name || "", 
            this._optionValues = {}, this._storeOptionsAsProperties = !0, this._passCommandToAction = !0, 
            this._actionResults = [], this._actionHandler = null, this._executableHandler = !1, 
            this._executableFile = null, this._defaultCommandName = null, this._exitCallback = null, 
            this._aliases = [], this._hidden = !1, this._helpFlags = "-h, --help", this._helpDescription = "display help for command", 
            this._helpShortFlag = "-h", this._helpLongFlag = "--help", this._hasImplicitHelpCommand = void 0, 
            this._helpCommandName = "help", this._helpCommandnameAndArgs = "help [command]", 
            this._helpCommandDescription = "display help for command";
        }
        command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
            let desc = actionOptsOrExecDesc, opts = execOpts;
            "object" == typeof desc && null !== desc && (opts = desc, desc = null), opts = opts || {};
            const args = nameAndArgs.split(/ +/), cmd = this.createCommand(args.shift());
            return desc && (cmd.description(desc), cmd._executableHandler = !0), opts.isDefault && (this._defaultCommandName = cmd._name), 
            cmd._hidden = !(!opts.noHelp && !opts.hidden), cmd._helpFlags = this._helpFlags, 
            cmd._helpDescription = this._helpDescription, cmd._helpShortFlag = this._helpShortFlag, 
            cmd._helpLongFlag = this._helpLongFlag, cmd._helpCommandName = this._helpCommandName, 
            cmd._helpCommandnameAndArgs = this._helpCommandnameAndArgs, cmd._helpCommandDescription = this._helpCommandDescription, 
            cmd._exitCallback = this._exitCallback, cmd._storeOptionsAsProperties = this._storeOptionsAsProperties, 
            cmd._passCommandToAction = this._passCommandToAction, cmd._executableFile = opts.executableFile || null, 
            this.commands.push(cmd), cmd._parseExpectedArgs(args), cmd.parent = this, desc ? this : cmd;
        }
        createCommand(name) {
            return new Command(name);
        }
        addCommand(cmd, opts) {
            if (!cmd._name) throw new Error("Command passed to .addCommand() must have a name");
            return function checkExplicitNames(commandArray) {
                commandArray.forEach(cmd => {
                    if (cmd._executableHandler && !cmd._executableFile) throw new Error("Must specify executableFile for deeply nested executable: " + cmd.name());
                    checkExplicitNames(cmd.commands);
                });
            }(cmd.commands), (opts = opts || {}).isDefault && (this._defaultCommandName = cmd._name), 
            (opts.noHelp || opts.hidden) && (cmd._hidden = !0), this.commands.push(cmd), cmd.parent = this, 
            this;
        }
        arguments(desc) {
            return this._parseExpectedArgs(desc.split(/ +/));
        }
        addHelpCommand(enableOrNameAndArgs, description) {
            return !1 === enableOrNameAndArgs ? this._hasImplicitHelpCommand = !1 : (this._hasImplicitHelpCommand = !0, 
            "string" == typeof enableOrNameAndArgs && (this._helpCommandName = enableOrNameAndArgs.split(" ")[0], 
            this._helpCommandnameAndArgs = enableOrNameAndArgs), this._helpCommandDescription = description || this._helpCommandDescription), 
            this;
        }
        _lazyHasImplicitHelpCommand() {
            return void 0 === this._hasImplicitHelpCommand && (this._hasImplicitHelpCommand = this.commands.length && !this._actionHandler && !this._findCommand("help")), 
            this._hasImplicitHelpCommand;
        }
        _parseExpectedArgs(args) {
            if (args.length) return args.forEach(arg => {
                const argDetails = {
                    required: !1,
                    name: "",
                    variadic: !1
                };
                switch (arg[0]) {
                  case "<":
                    argDetails.required = !0, argDetails.name = arg.slice(1, -1);
                    break;

                  case "[":
                    argDetails.name = arg.slice(1, -1);
                }
                argDetails.name.length > 3 && "..." === argDetails.name.slice(-3) && (argDetails.variadic = !0, 
                argDetails.name = argDetails.name.slice(0, -3)), argDetails.name && this._args.push(argDetails);
            }), this._args.forEach((arg, i) => {
                if (arg.variadic && i < this._args.length - 1) throw new Error(`only the last argument can be variadic '${arg.name}'`);
            }), this;
        }
        exitOverride(fn) {
            return this._exitCallback = fn || (err => {
                if ("commander.executeSubCommandAsync" !== err.code) throw err;
            }), this;
        }
        _exit(exitCode, code, message) {
            this._exitCallback && this._exitCallback(new CommanderError(exitCode, code, message)), 
            process.exit(exitCode);
        }
        action(fn) {
            return this._actionHandler = args => {
                const expectedArgsCount = this._args.length, actionArgs = args.slice(0, expectedArgsCount);
                this._passCommandToAction ? actionArgs[expectedArgsCount] = this : actionArgs[expectedArgsCount] = this.opts(), 
                args.length > expectedArgsCount && actionArgs.push(args.slice(expectedArgsCount));
                const actionResult = fn.apply(this, actionArgs);
                let rootCommand = this;
                for (;rootCommand.parent; ) rootCommand = rootCommand.parent;
                rootCommand._actionResults.push(actionResult);
            }, this;
        }
        _optionEx(config, flags, description, fn, defaultValue) {
            const option = new Option(flags, description), oname = option.name(), name = option.attributeName();
            if (option.mandatory = !!config.mandatory, "function" != typeof fn) if (fn instanceof RegExp) {
                const regex = fn;
                fn = (val, def) => {
                    const m = regex.exec(val);
                    return m ? m[0] : def;
                };
            } else defaultValue = fn, fn = null;
            if (option.negate || option.optional || option.required || "boolean" == typeof defaultValue) {
                if (option.negate) {
                    const positiveLongFlag = option.long.replace(/^--no-/, "--");
                    defaultValue = !this._findOption(positiveLongFlag) || this._getOptionValue(name);
                }
                void 0 !== defaultValue && (this._setOptionValue(name, defaultValue), option.defaultValue = defaultValue);
            }
            return this.options.push(option), this.on("option:" + oname, val => {
                null !== val && fn && (val = fn(val, void 0 === this._getOptionValue(name) ? defaultValue : this._getOptionValue(name))), 
                "boolean" == typeof this._getOptionValue(name) || void 0 === this._getOptionValue(name) ? null == val ? this._setOptionValue(name, !option.negate && (defaultValue || !0)) : this._setOptionValue(name, val) : null !== val && this._setOptionValue(name, !option.negate && val);
            }), this;
        }
        option(flags, description, fn, defaultValue) {
            return this._optionEx({}, flags, description, fn, defaultValue);
        }
        requiredOption(flags, description, fn, defaultValue) {
            return this._optionEx({
                mandatory: !0
            }, flags, description, fn, defaultValue);
        }
        allowUnknownOption(arg) {
            return this._allowUnknownOption = void 0 === arg || arg, this;
        }
        storeOptionsAsProperties(value) {
            if (this._storeOptionsAsProperties = void 0 === value || value, this.options.length) throw new Error("call .storeOptionsAsProperties() before adding options");
            return this;
        }
        passCommandToAction(value) {
            return this._passCommandToAction = void 0 === value || value, this;
        }
        _setOptionValue(key, value) {
            this._storeOptionsAsProperties ? this[key] = value : this._optionValues[key] = value;
        }
        _getOptionValue(key) {
            return this._storeOptionsAsProperties ? this[key] : this._optionValues[key];
        }
        parse(argv, parseOptions) {
            if (void 0 !== argv && !Array.isArray(argv)) throw new Error("first parameter to parse must be array or undefined");
            let userArgs;
            switch (parseOptions = parseOptions || {}, void 0 === argv && (argv = process.argv, 
            process.versions && process.versions.electron && (parseOptions.from = "electron")), 
            this.rawArgs = argv.slice(), parseOptions.from) {
              case void 0:
              case "node":
                this._scriptPath = argv[1], userArgs = argv.slice(2);
                break;

              case "electron":
                process.defaultApp ? (this._scriptPath = argv[1], userArgs = argv.slice(2)) : userArgs = argv.slice(1);
                break;

              case "user":
                userArgs = argv.slice(0);
                break;

              default:
                throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
            }
            return !this._scriptPath && process.mainModule && (this._scriptPath = process.mainModule.filename), 
            this._name = this._name || this._scriptPath && path.basename(this._scriptPath, path.extname(this._scriptPath)), 
            this._parseCommand([], userArgs), this;
        }
        parseAsync(argv, parseOptions) {
            return this.parse(argv, parseOptions), Promise.all(this._actionResults).then(() => this);
        }
        _executeSubCommand(subcommand, args) {
            args = args.slice();
            let launchWithNode = !1;
            const sourceExt = [ ".js", ".ts", ".mjs" ];
            this._checkForMissingMandatoryOptions();
            const scriptPath = this._scriptPath;
            let baseDir;
            try {
                const resolvedLink = fs.realpathSync(scriptPath);
                baseDir = path.dirname(resolvedLink);
            } catch (e) {
                baseDir = ".";
            }
            let bin = path.basename(scriptPath, path.extname(scriptPath)) + "-" + subcommand._name;
            subcommand._executableFile && (bin = subcommand._executableFile);
            const localBin = path.join(baseDir, bin);
            let proc;
            fs.existsSync(localBin) ? bin = localBin : sourceExt.forEach(ext => {
                fs.existsSync(`${localBin}${ext}`) && (bin = `${localBin}${ext}`);
            }), launchWithNode = sourceExt.includes(path.extname(bin)), "win32" !== process.platform ? launchWithNode ? (args.unshift(bin), 
            args = incrementNodeInspectorPort(process.execArgv).concat(args), proc = spawn(process.argv[0], args, {
                stdio: "inherit"
            })) : proc = spawn(bin, args, {
                stdio: "inherit"
            }) : (args.unshift(bin), args = incrementNodeInspectorPort(process.execArgv).concat(args), 
            proc = spawn(process.execPath, args, {
                stdio: "inherit"
            }));
            [ "SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP" ].forEach(signal => {
                process.on(signal, () => {
                    !1 === proc.killed && null === proc.exitCode && proc.kill(signal);
                });
            });
            const exitCallback = this._exitCallback;
            exitCallback ? proc.on("close", () => {
                exitCallback(new CommanderError(process.exitCode || 0, "commander.executeSubCommandAsync", "(close)"));
            }) : proc.on("close", process.exit.bind(process)), proc.on("error", err => {
                if ("ENOENT" === err.code) {
                    const executableMissing = `'${bin}' does not exist\n - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead\n - if the default executable name is not suitable, use the executableFile option to supply a custom name`;
                    throw new Error(executableMissing);
                }
                if ("EACCES" === err.code) throw new Error(`'${bin}' not executable`);
                if (exitCallback) {
                    const wrappedError = new CommanderError(1, "commander.executeSubCommandAsync", "(error)");
                    wrappedError.nestedError = err, exitCallback(wrappedError);
                } else process.exit(1);
            }), this.runningCommand = proc;
        }
        _dispatchSubcommand(commandName, operands, unknown) {
            const subCommand = this._findCommand(commandName);
            subCommand || this._helpAndError(), subCommand._executableHandler ? this._executeSubCommand(subCommand, operands.concat(unknown)) : subCommand._parseCommand(operands, unknown);
        }
        _parseCommand(operands, unknown) {
            const parsed = this.parseOptions(unknown);
            if (operands = operands.concat(parsed.operands), unknown = parsed.unknown, this.args = operands.concat(unknown), 
            operands && this._findCommand(operands[0])) this._dispatchSubcommand(operands[0], operands.slice(1), unknown); else if (this._lazyHasImplicitHelpCommand() && operands[0] === this._helpCommandName) 1 === operands.length ? this.help() : this._dispatchSubcommand(operands[1], [], [ this._helpLongFlag ]); else if (this._defaultCommandName) outputHelpIfRequested(this, unknown), 
            this._dispatchSubcommand(this._defaultCommandName, operands, unknown); else if (!this.commands.length || 0 !== this.args.length || this._actionHandler || this._defaultCommandName || this._helpAndError(), 
            outputHelpIfRequested(this, parsed.unknown), this._checkForMissingMandatoryOptions(), 
            parsed.unknown.length > 0 && this.unknownOption(parsed.unknown[0]), this._actionHandler) {
                const args = this.args.slice();
                this._args.forEach((arg, i) => {
                    arg.required && null == args[i] ? this.missingArgument(arg.name) : arg.variadic && (args[i] = args.splice(i));
                }), this._actionHandler(args), this.emit("command:" + this.name(), operands, unknown);
            } else operands.length ? this._findCommand("*") ? this._dispatchSubcommand("*", operands, unknown) : this.listenerCount("command:*") ? this.emit("command:*", operands, unknown) : this.commands.length && this.unknownCommand() : this.commands.length && this._helpAndError();
        }
        _findCommand(name) {
            if (name) return this.commands.find(cmd => cmd._name === name || cmd._aliases.includes(name));
        }
        _findOption(arg) {
            return this.options.find(option => option.is(arg));
        }
        _checkForMissingMandatoryOptions() {
            for (let cmd = this; cmd; cmd = cmd.parent) cmd.options.forEach(anOption => {
                anOption.mandatory && void 0 === cmd._getOptionValue(anOption.attributeName()) && cmd.missingMandatoryOptionValue(anOption);
            });
        }
        parseOptions(argv) {
            const operands = [], unknown = [];
            let dest = operands;
            const args = argv.slice();
            function maybeOption(arg) {
                return arg.length > 1 && "-" === arg[0];
            }
            for (;args.length; ) {
                const arg = args.shift();
                if ("--" === arg) {
                    dest === unknown && dest.push(arg), dest.push(...args);
                    break;
                }
                if (maybeOption(arg)) {
                    const option = this._findOption(arg);
                    if (option) {
                        if (option.required) {
                            const value = args.shift();
                            void 0 === value && this.optionMissingArgument(option), this.emit("option:" + option.name(), value);
                        } else if (option.optional) {
                            let value = null;
                            args.length > 0 && !maybeOption(args[0]) && (value = args.shift()), this.emit("option:" + option.name(), value);
                        } else this.emit("option:" + option.name());
                        continue;
                    }
                }
                if (arg.length > 2 && "-" === arg[0] && "-" !== arg[1]) {
                    const option = this._findOption("-" + arg[1]);
                    if (option) {
                        option.required || option.optional ? this.emit("option:" + option.name(), arg.slice(2)) : (this.emit("option:" + option.name()), 
                        args.unshift("-" + arg.slice(2)));
                        continue;
                    }
                }
                if (/^--[^=]+=/.test(arg)) {
                    const index = arg.indexOf("="), option = this._findOption(arg.slice(0, index));
                    if (option && (option.required || option.optional)) {
                        this.emit("option:" + option.name(), arg.slice(index + 1));
                        continue;
                    }
                }
                arg.length > 1 && "-" === arg[0] && (dest = unknown), dest.push(arg);
            }
            return {
                operands: operands,
                unknown: unknown
            };
        }
        opts() {
            if (this._storeOptionsAsProperties) {
                const result = {}, len = this.options.length;
                for (let i = 0; i < len; i++) {
                    const key = this.options[i].attributeName();
                    result[key] = key === this._versionOptionName ? this._version : this[key];
                }
                return result;
            }
            return this._optionValues;
        }
        missingArgument(name) {
            const message = `error: missing required argument '${name}'`;
            console.error(message), this._exit(1, "commander.missingArgument", message);
        }
        optionMissingArgument(option, flag) {
            let message;
            message = flag ? `error: option '${option.flags}' argument missing, got '${flag}'` : `error: option '${option.flags}' argument missing`, 
            console.error(message), this._exit(1, "commander.optionMissingArgument", message);
        }
        missingMandatoryOptionValue(option) {
            const message = `error: required option '${option.flags}' not specified`;
            console.error(message), this._exit(1, "commander.missingMandatoryOptionValue", message);
        }
        unknownOption(flag) {
            if (this._allowUnknownOption) return;
            const message = `error: unknown option '${flag}'`;
            console.error(message), this._exit(1, "commander.unknownOption", message);
        }
        unknownCommand() {
            const partCommands = [ this.name() ];
            for (let parentCmd = this.parent; parentCmd; parentCmd = parentCmd.parent) partCommands.unshift(parentCmd.name());
            const fullCommand = partCommands.join(" "), message = `error: unknown command '${this.args[0]}'. See '${fullCommand} ${this._helpLongFlag}'.`;
            console.error(message), this._exit(1, "commander.unknownCommand", message);
        }
        version(str, flags, description) {
            if (void 0 === str) return this._version;
            this._version = str;
            const versionOption = new Option(flags = flags || "-V, --version", description = description || "output the version number");
            return this._versionOptionName = versionOption.long.substr(2) || "version", this.options.push(versionOption), 
            this.on("option:" + this._versionOptionName, () => {
                process.stdout.write(str + "\n"), this._exit(0, "commander.version", str);
            }), this;
        }
        description(str, argsDescription) {
            return void 0 === str && void 0 === argsDescription ? this._description : (this._description = str, 
            this._argsDescription = argsDescription, this);
        }
        alias(alias) {
            if (void 0 === alias) return this._aliases[0];
            let command = this;
            if (0 !== this.commands.length && this.commands[this.commands.length - 1]._executableHandler && (command = this.commands[this.commands.length - 1]), 
            alias === command._name) throw new Error("Command alias can't be the same as its name");
            return command._aliases.push(alias), this;
        }
        aliases(aliases) {
            return void 0 === aliases ? this._aliases : (aliases.forEach(alias => this.alias(alias)), 
            this);
        }
        usage(str) {
            if (void 0 === str) {
                if (this._usage) return this._usage;
                const args = this._args.map(arg => humanReadableArgName(arg));
                return "[options]" + (this.commands.length ? " [command]" : "") + (this._args.length ? " " + args.join(" ") : "");
            }
            return this._usage = str, this;
        }
        name(str) {
            return void 0 === str ? this._name : (this._name = str, this);
        }
        prepareCommands() {
            const commandDetails = this.commands.filter(cmd => !cmd._hidden).map(cmd => {
                const args = cmd._args.map(arg => humanReadableArgName(arg)).join(" ");
                return [ cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + (args ? " " + args : ""), cmd._description ];
            });
            return this._lazyHasImplicitHelpCommand() && commandDetails.push([ this._helpCommandnameAndArgs, this._helpCommandDescription ]), 
            commandDetails;
        }
        largestCommandLength() {
            return this.prepareCommands().reduce((max, command) => Math.max(max, command[0].length), 0);
        }
        largestOptionLength() {
            const options = [].slice.call(this.options);
            return options.push({
                flags: this._helpFlags
            }), options.reduce((max, option) => Math.max(max, option.flags.length), 0);
        }
        largestArgLength() {
            return this._args.reduce((max, arg) => Math.max(max, arg.name.length), 0);
        }
        padWidth() {
            let width = this.largestOptionLength();
            return this._argsDescription && this._args.length && this.largestArgLength() > width && (width = this.largestArgLength()), 
            this.commands && this.commands.length && this.largestCommandLength() > width && (width = this.largestCommandLength()), 
            width;
        }
        optionHelp() {
            const width = this.padWidth(), descriptionWidth = (process.stdout.columns || 80) - width - 4;
            function padOptionDetails(flags, description) {
                return pad(flags, width) + "  " + optionalWrap(description, descriptionWidth, width + 2);
            }
            const help = this.options.map(option => {
                const fullDesc = option.description + (option.negate || void 0 === option.defaultValue ? "" : " (default: " + JSON.stringify(option.defaultValue) + ")");
                return padOptionDetails(option.flags, fullDesc);
            }), showShortHelpFlag = this._helpShortFlag && !this._findOption(this._helpShortFlag), showLongHelpFlag = !this._findOption(this._helpLongFlag);
            if (showShortHelpFlag || showLongHelpFlag) {
                let helpFlags = this._helpFlags;
                showShortHelpFlag ? showLongHelpFlag || (helpFlags = this._helpShortFlag) : helpFlags = this._helpLongFlag, 
                help.push(padOptionDetails(helpFlags, this._helpDescription));
            }
            return help.join("\n");
        }
        commandHelp() {
            if (!this.commands.length && !this._lazyHasImplicitHelpCommand()) return "";
            const commands = this.prepareCommands(), width = this.padWidth(), descriptionWidth = (process.stdout.columns || 80) - width - 4;
            return [ "Commands:", commands.map(cmd => {
                const desc = cmd[1] ? "  " + cmd[1] : "";
                return (desc ? pad(cmd[0], width) : cmd[0]) + optionalWrap(desc, descriptionWidth, width + 2);
            }).join("\n").replace(/^/gm, "  "), "" ].join("\n");
        }
        helpInformation() {
            let desc = [];
            if (this._description) {
                desc = [ this._description, "" ];
                const argsDescription = this._argsDescription;
                if (argsDescription && this._args.length) {
                    const width = this.padWidth(), descriptionWidth = (process.stdout.columns || 80) - width - 5;
                    desc.push("Arguments:"), desc.push(""), this._args.forEach(arg => {
                        desc.push("  " + pad(arg.name, width) + "  " + wrap(argsDescription[arg.name], descriptionWidth, width + 4));
                    }), desc.push("");
                }
            }
            let cmdName = this._name;
            this._aliases[0] && (cmdName = cmdName + "|" + this._aliases[0]);
            let parentCmdNames = "";
            for (let parentCmd = this.parent; parentCmd; parentCmd = parentCmd.parent) parentCmdNames = parentCmd.name() + " " + parentCmdNames;
            const usage = [ "Usage: " + parentCmdNames + cmdName + " " + this.usage(), "" ];
            let cmds = [];
            const commandHelp = this.commandHelp();
            commandHelp && (cmds = [ commandHelp ]);
            const options = [ "Options:", "" + this.optionHelp().replace(/^/gm, "  "), "" ];
            return usage.concat(desc).concat(options).concat(cmds).join("\n");
        }
        outputHelp(cb) {
            cb || (cb = passthru => passthru);
            const cbOutput = cb(this.helpInformation());
            if ("string" != typeof cbOutput && !Buffer.isBuffer(cbOutput)) throw new Error("outputHelp callback must return a string or a Buffer");
            process.stdout.write(cbOutput), this.emit(this._helpLongFlag);
        }
        helpOption(flags, description) {
            this._helpFlags = flags || this._helpFlags, this._helpDescription = description || this._helpDescription;
            const splitFlags = this._helpFlags.split(/[ ,|]+/);
            return this._helpShortFlag = void 0, splitFlags.length > 1 && (this._helpShortFlag = splitFlags.shift()), 
            this._helpLongFlag = splitFlags.shift(), this;
        }
        help(cb) {
            this.outputHelp(cb), this._exit(process.exitCode || 0, "commander.help", "(outputHelp)");
        }
        _helpAndError() {
            this.outputHelp(), this._exit(1, "commander.help", "(outputHelp)");
        }
    }
    function pad(str, width) {
        const len = Math.max(0, width - str.length);
        return str + Array(len + 1).join(" ");
    }
    function wrap(str, width, indent) {
        const regex = new RegExp(".{1," + (width - 1) + "}([\\s​]|$)|[^\\s​]+?([\\s​]|$)", "g");
        return (str.match(regex) || []).map((line, i) => ("\n" === line.slice(-1) && (line = line.slice(0, line.length - 1)), 
        (i > 0 && indent ? Array(indent + 1).join(" ") : "") + line.trimRight())).join("\n");
    }
    function optionalWrap(str, width, indent) {
        if (str.match(/[\n]\s+/)) return str;
        return width < 40 ? str : wrap(str, width, indent);
    }
    function outputHelpIfRequested(cmd, args) {
        args.find(arg => arg === cmd._helpLongFlag || arg === cmd._helpShortFlag) && (cmd.outputHelp(), 
        cmd._exit(0, "commander.helpDisplayed", "(outputHelp)"));
    }
    function humanReadableArgName(arg) {
        const nameOutput = arg.name + (!0 === arg.variadic ? "..." : "");
        return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    function incrementNodeInspectorPort(args) {
        return args.map(arg => {
            let result = arg;
            if (0 === arg.indexOf("--inspect")) {
                let debugOption, match, debugHost = "127.0.0.1", debugPort = "9229";
                null !== (match = arg.match(/^(--inspect(-brk)?)$/)) ? debugOption = match[1] : null !== (match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) ? (debugOption = match[1], 
                /^\d+$/.test(match[3]) ? debugPort = match[3] : debugHost = match[3]) : null !== (match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) && (debugOption = match[1], 
                debugHost = match[3], debugPort = match[4]), debugOption && "0" !== debugPort && (result = `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`);
            }
            return result;
        });
    }
    (exports = module.exports = new Command).program = exports, exports.Command = Command, 
    exports.Option = Option, exports.CommanderError = CommanderError;
}, function(module, exports) {
    module.exports = require("child_process");
}, function(module, exports) {
    module.exports = require("./index");
}, function(module) {
    module.exports = JSON.parse('{"name":"yarn-deduplicate","version":"2.2.0"}');
} ]);