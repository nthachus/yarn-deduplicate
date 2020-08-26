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
}([ function(module, exports, __webpack_require__) {
    const debug = __webpack_require__(6), _require = __webpack_require__(5), MAX_LENGTH = _require.MAX_LENGTH, MAX_SAFE_INTEGER = _require.MAX_SAFE_INTEGER, _require2 = __webpack_require__(3), re = _require2.re, t = _require2.t, compareIdentifiers = __webpack_require__(11).compareIdentifiers;
    class SemVer {
        constructor(version, options) {
            if (options && "object" == typeof options || (options = {
                loose: !!options,
                includePrerelease: !1
            }), version instanceof SemVer) {
                if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) return version;
                version = version.version;
            } else if ("string" != typeof version) throw new TypeError("Invalid Version: " + version);
            if (version.length > MAX_LENGTH) throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
            debug("SemVer", version, options), this.options = options, this.loose = !!options.loose, 
            this.includePrerelease = !!options.includePrerelease;
            const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
            if (!m) throw new TypeError("Invalid Version: " + version);
            if (this.raw = version, this.major = +m[1], this.minor = +m[2], this.patch = +m[3], 
            this.major > MAX_SAFE_INTEGER || this.major < 0) throw new TypeError("Invalid major version");
            if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) throw new TypeError("Invalid minor version");
            if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) throw new TypeError("Invalid patch version");
            m[4] ? this.prerelease = m[4].split(".").map(id => {
                if (/^[0-9]+$/.test(id)) {
                    const num = +id;
                    if (num >= 0 && num < MAX_SAFE_INTEGER) return num;
                }
                return id;
            }) : this.prerelease = [], this.build = m[5] ? m[5].split(".") : [], this.format();
        }
        format() {
            return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += "-" + this.prerelease.join(".")), 
            this.version;
        }
        toString() {
            return this.version;
        }
        compare(other) {
            if (debug("SemVer.compare", this.version, this.options, other), !(other instanceof SemVer)) {
                if ("string" == typeof other && other === this.version) return 0;
                other = new SemVer(other, this.options);
            }
            return other.version === this.version ? 0 : this.compareMain(other) || this.comparePre(other);
        }
        compareMain(other) {
            return other instanceof SemVer || (other = new SemVer(other, this.options)), compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
        }
        comparePre(other) {
            if (other instanceof SemVer || (other = new SemVer(other, this.options)), this.prerelease.length && !other.prerelease.length) return -1;
            if (!this.prerelease.length && other.prerelease.length) return 1;
            if (!this.prerelease.length && !other.prerelease.length) return 0;
            let i = 0;
            do {
                const a = this.prerelease[i], b = other.prerelease[i];
                if (debug("prerelease compare", i, a, b), void 0 === a && void 0 === b) return 0;
                if (void 0 === b) return 1;
                if (void 0 === a) return -1;
                if (a !== b) return compareIdentifiers(a, b);
            } while (++i);
        }
        compareBuild(other) {
            other instanceof SemVer || (other = new SemVer(other, this.options));
            let i = 0;
            do {
                const a = this.build[i], b = other.build[i];
                if (debug("prerelease compare", i, a, b), void 0 === a && void 0 === b) return 0;
                if (void 0 === b) return 1;
                if (void 0 === a) return -1;
                if (a !== b) return compareIdentifiers(a, b);
            } while (++i);
        }
        inc(release, identifier) {
            switch (release) {
              case "premajor":
                this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", identifier);
                break;

              case "preminor":
                this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", identifier);
                break;

              case "prepatch":
                this.prerelease.length = 0, this.inc("patch", identifier), this.inc("pre", identifier);
                break;

              case "prerelease":
                0 === this.prerelease.length && this.inc("patch", identifier), this.inc("pre", identifier);
                break;

              case "major":
                0 === this.minor && 0 === this.patch && 0 !== this.prerelease.length || this.major++, 
                this.minor = 0, this.patch = 0, this.prerelease = [];
                break;

              case "minor":
                0 === this.patch && 0 !== this.prerelease.length || this.minor++, this.patch = 0, 
                this.prerelease = [];
                break;

              case "patch":
                0 === this.prerelease.length && this.patch++, this.prerelease = [];
                break;

              case "pre":
                if (0 === this.prerelease.length) this.prerelease = [ 0 ]; else {
                    let i = this.prerelease.length;
                    for (;--i >= 0; ) "number" == typeof this.prerelease[i] && (this.prerelease[i]++, 
                    i = -2);
                    -1 === i && this.prerelease.push(0);
                }
                identifier && (this.prerelease[0] === identifier ? isNaN(this.prerelease[1]) && (this.prerelease = [ identifier, 0 ]) : this.prerelease = [ identifier, 0 ]);
                break;

              default:
                throw new Error("invalid increment argument: " + release);
            }
            return this.format(), this.raw = this.version, this;
        }
    }
    module.exports = SemVer;
}, function(module, exports, __webpack_require__) {
    const SemVer = __webpack_require__(0);
    module.exports = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
}, function(module, exports, __webpack_require__) {
    class Range {
        constructor(range, options) {
            if (options && "object" == typeof options || (options = {
                loose: !!options,
                includePrerelease: !1
            }), range instanceof Range) return range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease ? range : new Range(range.raw, options);
            if (range instanceof Comparator) return this.raw = range.value, this.set = [ [ range ] ], 
            this.format(), this;
            if (this.options = options, this.loose = !!options.loose, this.includePrerelease = !!options.includePrerelease, 
            this.raw = range, this.set = range.split(/\s*\|\|\s*/).map(range => this.parseRange(range.trim())).filter(c => c.length), 
            !this.set.length) throw new TypeError("Invalid SemVer Range: " + range);
            this.format();
        }
        format() {
            return this.range = this.set.map(comps => comps.join(" ").trim()).join("||").trim(), 
            this.range;
        }
        toString() {
            return this.range;
        }
        parseRange(range) {
            const loose = this.options.loose;
            range = range.trim();
            const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
            range = range.replace(hr, hyphenReplace(this.options.includePrerelease)), debug("hyphen replace", range), 
            range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace), debug("comparator trim", range, re[t.COMPARATORTRIM]), 
            range = (range = (range = range.replace(re[t.TILDETRIM], tildeTrimReplace)).replace(re[t.CARETTRIM], caretTrimReplace)).split(/\s+/).join(" ");
            const compRe = loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
            return range.split(" ").map(comp => parseComparator(comp, this.options)).join(" ").split(/\s+/).map(comp => replaceGTE0(comp, this.options)).filter(this.options.loose ? comp => !!comp.match(compRe) : () => !0).map(comp => new Comparator(comp, this.options));
        }
        intersects(range, options) {
            if (!(range instanceof Range)) throw new TypeError("a Range is required");
            return this.set.some(thisComparators => isSatisfiable(thisComparators, options) && range.set.some(rangeComparators => isSatisfiable(rangeComparators, options) && thisComparators.every(thisComparator => rangeComparators.every(rangeComparator => thisComparator.intersects(rangeComparator, options)))));
        }
        test(version) {
            if (!version) return !1;
            if ("string" == typeof version) try {
                version = new SemVer(version, this.options);
            } catch (er) {
                return !1;
            }
            for (let i = 0; i < this.set.length; i++) if (testSet(this.set[i], version, this.options)) return !0;
            return !1;
        }
    }
    module.exports = Range;
    const Comparator = __webpack_require__(8), debug = __webpack_require__(6), SemVer = __webpack_require__(0), _require = __webpack_require__(3), re = _require.re, t = _require.t, comparatorTrimReplace = _require.comparatorTrimReplace, tildeTrimReplace = _require.tildeTrimReplace, caretTrimReplace = _require.caretTrimReplace, isSatisfiable = (comparators, options) => {
        let result = !0;
        const remainingComparators = comparators.slice();
        let testComparator = remainingComparators.pop();
        for (;result && remainingComparators.length; ) result = remainingComparators.every(otherComparator => testComparator.intersects(otherComparator, options)), 
        testComparator = remainingComparators.pop();
        return result;
    }, parseComparator = (comp, options) => (debug("comp", comp, options), comp = replaceCarets(comp, options), 
    debug("caret", comp), comp = replaceTildes(comp, options), debug("tildes", comp), 
    comp = replaceXRanges(comp, options), debug("xrange", comp), comp = replaceStars(comp, options), 
    debug("stars", comp), comp), isX = id => !id || "x" === id.toLowerCase() || "*" === id, replaceTildes = (comp, options) => comp.trim().split(/\s+/).map(comp => replaceTilde(comp, options)).join(" "), replaceTilde = (comp, options) => {
        const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
        return comp.replace(r, (_, M, m, p, pr) => {
            let ret;
            return debug("tilde", comp, _, M, m, p, pr), isX(M) ? ret = "" : isX(m) ? ret = `>=${M}.0.0 <${+M + 1}.0.0-0` : isX(p) ? ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0` : pr ? (debug("replaceTilde pr", pr), 
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`) : ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`, 
            debug("tilde return", ret), ret;
        });
    }, replaceCarets = (comp, options) => comp.trim().split(/\s+/).map(comp => replaceCaret(comp, options)).join(" "), replaceCaret = (comp, options) => {
        debug("caret", comp, options);
        const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET], z = options.includePrerelease ? "-0" : "";
        return comp.replace(r, (_, M, m, p, pr) => {
            let ret;
            return debug("caret", comp, _, M, m, p, pr), isX(M) ? ret = "" : isX(m) ? ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0` : isX(p) ? ret = "0" === M ? `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0` : `>=${M}.${m}.0${z} <${+M + 1}.0.0-0` : pr ? (debug("replaceCaret pr", pr), 
            ret = "0" === M ? "0" === m ? `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0` : `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0` : `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`) : (debug("no pr"), 
            ret = "0" === M ? "0" === m ? `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0` : `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0` : `>=${M}.${m}.${p} <${+M + 1}.0.0-0`), 
            debug("caret return", ret), ret;
        });
    }, replaceXRanges = (comp, options) => (debug("replaceXRanges", comp, options), 
    comp.split(/\s+/).map(comp => replaceXRange(comp, options)).join(" ")), replaceXRange = (comp, options) => {
        comp = comp.trim();
        const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
        return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
            debug("xRange", comp, ret, gtlt, M, m, p, pr);
            const xM = isX(M), xm = xM || isX(m), xp = xm || isX(p), anyX = xp;
            return "=" === gtlt && anyX && (gtlt = ""), pr = options.includePrerelease ? "-0" : "", 
            xM ? ret = ">" === gtlt || "<" === gtlt ? "<0.0.0-0" : "*" : gtlt && anyX ? (xm && (m = 0), 
            p = 0, ">" === gtlt ? (gtlt = ">=", xm ? (M = +M + 1, m = 0, p = 0) : (m = +m + 1, 
            p = 0)) : "<=" === gtlt && (gtlt = "<", xm ? M = +M + 1 : m = +m + 1), "<" === gtlt && (pr = "-0"), 
            ret = `${gtlt + M}.${m}.${p}${pr}`) : xm ? ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0` : xp && (ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`), 
            debug("xRange return", ret), ret;
        });
    }, replaceStars = (comp, options) => (debug("replaceStars", comp, options), comp.trim().replace(re[t.STAR], "")), replaceGTE0 = (comp, options) => (debug("replaceGTE0", comp, options), 
    comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "")), hyphenReplace = incPr => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => `${from = isX(fM) ? "" : isX(fm) ? `>=${fM}.0.0${incPr ? "-0" : ""}` : isX(fp) ? `>=${fM}.${fm}.0${incPr ? "-0" : ""}` : fpr ? ">=" + from : `>=${from}${incPr ? "-0" : ""}`} ${to = isX(tM) ? "" : isX(tm) ? `<${+tM + 1}.0.0-0` : isX(tp) ? `<${tM}.${+tm + 1}.0-0` : tpr ? `<=${tM}.${tm}.${tp}-${tpr}` : incPr ? `<${tM}.${tm}.${+tp + 1}-0` : "<=" + to}`.trim(), testSet = (set, version, options) => {
        for (let i = 0; i < set.length; i++) if (!set[i].test(version)) return !1;
        if (version.prerelease.length && !options.includePrerelease) {
            for (let i = 0; i < set.length; i++) if (debug(set[i].semver), set[i].semver !== Comparator.ANY && set[i].semver.prerelease.length > 0) {
                const allowed = set[i].semver;
                if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) return !0;
            }
            return !1;
        }
        return !0;
    };
}, function(module, exports, __webpack_require__) {
    const MAX_SAFE_COMPONENT_LENGTH = __webpack_require__(5).MAX_SAFE_COMPONENT_LENGTH, debug = __webpack_require__(6), re = (exports = module.exports = {}).re = [], src = exports.src = [], t = exports.t = {};
    let R = 0;
    const createToken = (name, value, isGlobal) => {
        const index = R++;
        debug(index, value), t[name] = index, src[index] = value, re[index] = new RegExp(value, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*"), createToken("NUMERICIDENTIFIERLOOSE", "[0-9]+"), 
    createToken("NONNUMERICIDENTIFIER", "\\d*[a-zA-Z-][a-zA-Z0-9-]*"), createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`), 
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`), 
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`), 
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`), 
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`), 
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`), 
    createToken("BUILDIDENTIFIER", "[0-9A-Za-z-]+"), createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`), 
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`), 
    createToken("FULL", `^${src[t.FULLPLAIN]}$`), createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`), 
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`), createToken("GTLT", "((?:<|>)?=?)"), 
    createToken("XRANGEIDENTIFIERLOOSE", src[t.NUMERICIDENTIFIERLOOSE] + "|x|X|\\*"), 
    createToken("XRANGEIDENTIFIER", src[t.NUMERICIDENTIFIER] + "|x|X|\\*"), createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`), 
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`), 
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`), createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`), 
    createToken("COERCE", `(^|[^\\d])(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:$|[^\\d])`), 
    createToken("COERCERTL", src[t.COERCE], !0), createToken("LONETILDE", "(?:~>?)"), 
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, !0), exports.tildeTrimReplace = "$1~", 
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`), createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`), 
    createToken("LONECARET", "(?:\\^)"), createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, !0), 
    exports.caretTrimReplace = "$1^", createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`), 
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`), createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`), 
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`), createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, !0), 
    exports.comparatorTrimReplace = "$1$2$3", createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`), 
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`), 
    createToken("STAR", "(<|>)?=?\\s*\\*"), createToken("GTE0", "^\\s*>=\\s*0.0.0\\s*$"), 
    createToken("GTE0PRE", "^\\s*>=\\s*0.0.0-0\\s*$");
}, function(module, exports, __webpack_require__) {
    const MAX_LENGTH = __webpack_require__(5).MAX_LENGTH, _require2 = __webpack_require__(3), re = _require2.re, t = _require2.t, SemVer = __webpack_require__(0);
    module.exports = (version, options) => {
        if (options && "object" == typeof options || (options = {
            loose: !!options,
            includePrerelease: !1
        }), version instanceof SemVer) return version;
        if ("string" != typeof version) return null;
        if (version.length > MAX_LENGTH) return null;
        if (!(options.loose ? re[t.LOOSE] : re[t.FULL]).test(version)) return null;
        try {
            return new SemVer(version, options);
        } catch (er) {
            return null;
        }
    };
}, function(module, exports) {
    const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
    module.exports = {
        SEMVER_SPEC_VERSION: "2.0.0",
        MAX_LENGTH: 256,
        MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
        MAX_SAFE_COMPONENT_LENGTH: 16
    };
}, function(module, exports) {
    const debug = "object" == typeof process && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
    module.exports = debug;
}, function(module, exports, __webpack_require__) {
    const compare = __webpack_require__(1);
    module.exports = (a, b, loose) => compare(a, b, loose) > 0;
}, function(module, exports, __webpack_require__) {
    const ANY = Symbol("SemVer ANY");
    class Comparator {
        static get ANY() {
            return ANY;
        }
        constructor(comp, options) {
            if (options && "object" == typeof options || (options = {
                loose: !!options,
                includePrerelease: !1
            }), comp instanceof Comparator) {
                if (comp.loose === !!options.loose) return comp;
                comp = comp.value;
            }
            debug("comparator", comp, options), this.options = options, this.loose = !!options.loose, 
            this.parse(comp), this.semver === ANY ? this.value = "" : this.value = this.operator + this.semver.version, 
            debug("comp", this);
        }
        parse(comp) {
            const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR], m = comp.match(r);
            if (!m) throw new TypeError("Invalid comparator: " + comp);
            this.operator = void 0 !== m[1] ? m[1] : "", "=" === this.operator && (this.operator = ""), 
            m[2] ? this.semver = new SemVer(m[2], this.options.loose) : this.semver = ANY;
        }
        toString() {
            return this.value;
        }
        test(version) {
            if (debug("Comparator.test", version, this.options.loose), this.semver === ANY || version === ANY) return !0;
            if ("string" == typeof version) try {
                version = new SemVer(version, this.options);
            } catch (er) {
                return !1;
            }
            return cmp(version, this.operator, this.semver, this.options);
        }
        intersects(comp, options) {
            if (!(comp instanceof Comparator)) throw new TypeError("a Comparator is required");
            if (options && "object" == typeof options || (options = {
                loose: !!options,
                includePrerelease: !1
            }), "" === this.operator) return "" === this.value || new Range(comp.value, options).test(this.value);
            if ("" === comp.operator) return "" === comp.value || new Range(this.value, options).test(comp.semver);
            const sameDirectionIncreasing = !(">=" !== this.operator && ">" !== this.operator || ">=" !== comp.operator && ">" !== comp.operator), sameDirectionDecreasing = !("<=" !== this.operator && "<" !== this.operator || "<=" !== comp.operator && "<" !== comp.operator), sameSemVer = this.semver.version === comp.semver.version, differentDirectionsInclusive = !(">=" !== this.operator && "<=" !== this.operator || ">=" !== comp.operator && "<=" !== comp.operator), oppositeDirectionsLessThan = cmp(this.semver, "<", comp.semver, options) && (">=" === this.operator || ">" === this.operator) && ("<=" === comp.operator || "<" === comp.operator), oppositeDirectionsGreaterThan = cmp(this.semver, ">", comp.semver, options) && ("<=" === this.operator || "<" === this.operator) && (">=" === comp.operator || ">" === comp.operator);
            return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
        }
    }
    module.exports = Comparator;
    const _require = __webpack_require__(3), re = _require.re, t = _require.t, cmp = __webpack_require__(21), debug = __webpack_require__(6), SemVer = __webpack_require__(0), Range = __webpack_require__(2);
}, function(module, exports, __webpack_require__) {
    const Range = __webpack_require__(2);
    module.exports = (version, range, options) => {
        try {
            range = new Range(range, options);
        } catch (er) {
            return !1;
        }
        return range.test(version);
    };
}, function(module, exports) {
    module.exports = require("fs");
}, function(module, exports) {
    const numeric = /^[0-9]+$/, compareIdentifiers = (a, b) => {
        const anum = numeric.test(a), bnum = numeric.test(b);
        return anum && bnum && (a = +a, b = +b), a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    module.exports = {
        compareIdentifiers: compareIdentifiers,
        rcompareIdentifiers: (a, b) => compareIdentifiers(b, a)
    };
}, function(module, exports, __webpack_require__) {
    const compare = __webpack_require__(1);
    module.exports = (a, b, loose) => 0 === compare(a, b, loose);
}, function(module, exports, __webpack_require__) {
    const SemVer = __webpack_require__(0);
    module.exports = (a, b, loose) => {
        const versionA = new SemVer(a, loose), versionB = new SemVer(b, loose);
        return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
}, function(module, exports, __webpack_require__) {
    const compare = __webpack_require__(1);
    module.exports = (a, b, loose) => compare(a, b, loose) < 0;
}, function(module, exports, __webpack_require__) {
    const compare = __webpack_require__(1);
    module.exports = (a, b, loose) => compare(a, b, loose) >= 0;
}, function(module, exports, __webpack_require__) {
    const compare = __webpack_require__(1);
    module.exports = (a, b, loose) => compare(a, b, loose) <= 0;
}, function(module, exports, __webpack_require__) {
    const SemVer = __webpack_require__(0), Comparator = __webpack_require__(8), ANY = Comparator.ANY, Range = __webpack_require__(2), satisfies = __webpack_require__(9), gt = __webpack_require__(7), lt = __webpack_require__(14), lte = __webpack_require__(16), gte = __webpack_require__(15);
    module.exports = (version, range, hilo, options) => {
        let gtfn, ltefn, ltfn, comp, ecomp;
        switch (version = new SemVer(version, options), range = new Range(range, options), 
        hilo) {
          case ">":
            gtfn = gt, ltefn = lte, ltfn = lt, comp = ">", ecomp = ">=";
            break;

          case "<":
            gtfn = lt, ltefn = gte, ltfn = gt, comp = "<", ecomp = "<=";
            break;

          default:
            throw new TypeError('Must provide a hilo val of "<" or ">"');
        }
        if (satisfies(version, range, options)) return !1;
        for (let i = 0; i < range.set.length; ++i) {
            const comparators = range.set[i];
            let high = null, low = null;
            if (comparators.forEach(comparator => {
                comparator.semver === ANY && (comparator = new Comparator(">=0.0.0")), high = high || comparator, 
                low = low || comparator, gtfn(comparator.semver, high.semver, options) ? high = comparator : ltfn(comparator.semver, low.semver, options) && (low = comparator);
            }), high.operator === comp || high.operator === ecomp) return !1;
            if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) return !1;
            if (low.operator === ecomp && ltfn(version, low.semver)) return !1;
        }
        return !0;
    };
}, function(module, exports) {
    module.exports = require("events");
}, function(module, exports) {
    module.exports = require("path");
}, function(module, exports, __webpack_require__) {
    const compare = __webpack_require__(1);
    module.exports = (a, b, loose) => 0 !== compare(a, b, loose);
}, function(module, exports, __webpack_require__) {
    const eq = __webpack_require__(12), neq = __webpack_require__(20), gt = __webpack_require__(7), gte = __webpack_require__(15), lt = __webpack_require__(14), lte = __webpack_require__(16);
    module.exports = (a, op, b, loose) => {
        switch (op) {
          case "===":
            return "object" == typeof a && (a = a.version), "object" == typeof b && (b = b.version), 
            a === b;

          case "!==":
            return "object" == typeof a && (a = a.version), "object" == typeof b && (b = b.version), 
            a !== b;

          case "":
          case "=":
          case "==":
            return eq(a, b, loose);

          case "!=":
            return neq(a, b, loose);

          case ">":
            return gt(a, b, loose);

          case ">=":
            return gte(a, b, loose);

          case "<":
            return lt(a, b, loose);

          case "<=":
            return lte(a, b, loose);

          default:
            throw new TypeError("Invalid operator: " + op);
        }
    };
}, function(module, exports, __webpack_require__) {
    const commander = __webpack_require__(23), fs = __webpack_require__(10), _require = __webpack_require__(25), fixDuplicates = _require.fixDuplicates, listDuplicates = _require.listDuplicates;
    commander.version("2.2.0").usage("[options] [yarn.lock path (default: yarn.lock)]").option("-s, --strategy <strategy>", 'deduplication strategy. Valid values: fewer, highest. Default is "highest"', "highest").option("-l, --list", "do not change yarn.lock, just output the diagnosis").option("-f, --fail", "if there are duplicates in yarn.lock, terminate the script with exit status 1").option("--scopes <scopes>", "a comma separated list of scopes to deduplicate. Defaults to all packages.", val => val.split(",").map(v => v.trim())).option("--packages <packages>", "a comma separated list of packages to deduplicate. Defaults to all packages.", val => val.split(",").map(v => v.trim())).option("--exclude <exclude>", "a comma separated list of packages not to deduplicate.", val => val.split(",").map(v => v.trim())).option("--print", "instead of saving the deduplicated yarn.lock, print the result in stdout"), 
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
            duplicates.forEach(logLine => console.log(logLine)), commander.fail && duplicates.length > 0 && process.exit(1);
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
    const EventEmitter = __webpack_require__(18).EventEmitter, spawn = __webpack_require__(24).spawn, path = __webpack_require__(19), fs = __webpack_require__(10);
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
}, function(module, exports, __webpack_require__) {
    function _slicedToArray(arr, i) {
        return function(arr) {
            if (Array.isArray(arr)) return arr;
        }(arr) || function(arr, i) {
            if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(arr))) return;
            var _arr = [], _n = !0, _d = !1, _e = void 0;
            try {
                for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done) && (_arr.push(_s.value), 
                !i || _arr.length !== i); _n = !0) ;
            } catch (err) {
                _d = !0, _e = err;
            } finally {
                try {
                    _n || null == _i.return || _i.return();
                } finally {
                    if (_d) throw _e;
                }
            }
            return _arr;
        }(arr, i) || function(o, minLen) {
            if (!o) return;
            if ("string" == typeof o) return _arrayLikeToArray(o, minLen);
            var n = Object.prototype.toString.call(o).slice(8, -1);
            "Object" === n && o.constructor && (n = o.constructor.name);
            if ("Map" === n || "Set" === n) return Array.from(o);
            if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
        }(arr, i) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }();
    }
    function _arrayLikeToArray(arr, len) {
        (null == len || len > arr.length) && (len = arr.length);
        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
        return arr2;
    }
    const lockfile = __webpack_require__(26), semver = __webpack_require__(34), parseYarnLock = file => lockfile.parse(file).object, getDuplicatedPackages = (json, {includeScopes: includeScopes, includePackages: includePackages, excludePackages: excludePackages, useMostCommon: useMostCommon}) => {
        const packages = ((json, includeScopes = [], includePackages = [], excludePackages = []) => {
            const packages = {}, re = /^(.*)@([^@]*?)$/;
            let resolvable = null;
            return includeScopes.length && (includeScopes = includeScopes.filter(v => ![ "^", "~", "*" ].includes(v) || !(resolvable = v))), 
            Object.keys(json).forEach(name => {
                const pkg = json[name], match = name.match(re);
                let packageName, requestedVersion;
                if (match) {
                    var _match = _slicedToArray(match, 3);
                    packageName = _match[1], requestedVersion = _match[2], "*" === resolvable ? requestedVersion = "*" : "^" === resolvable && /(^|\s|\|)~\s*\d/.test(requestedVersion) ? requestedVersion = requestedVersion.replace(/(^|\s|\|)~\s*(\d)/g, "$1^$2") : resolvable && /^\d[\w.-]*$/.test(requestedVersion = semver.clean(requestedVersion)) && (requestedVersion = resolvable + requestedVersion.replace(/^(0)\..*$/, "$1"));
                } else packageName = name, requestedVersion = "*";
                includeScopes.length > 0 && !includeScopes.find(scope => packageName.startsWith(scope + "/")) || includePackages.length > 0 && !includePackages.includes(packageName) || excludePackages.length > 0 && excludePackages.includes(packageName) || (packages[packageName] = packages[packageName] || [], 
                packages[packageName].push({
                    pkg: pkg,
                    name: packageName,
                    requestedVersion: requestedVersion,
                    installedVersion: pkg.version,
                    satisfiedBy: new Set
                }));
            }), packages;
        })(json, includeScopes, includePackages, excludePackages);
        return Object.keys(packages).reduce((acc, name) => acc.concat(((packages, name, useMostCommon) => {
            const packageInstances = packages[name], versions = packageInstances.reduce((versions, packageInstance) => (packageInstance.installedVersion in versions || (versions[packageInstance.installedVersion] = {
                pkg: packageInstance.pkg,
                satisfies: new Set
            }), versions), {});
            return Object.keys(versions).forEach(version => {
                const satisfies = versions[version].satisfies;
                packageInstances.forEach(packageInstance => {
                    packageInstance.satisfiedBy.add(packageInstance.installedVersion), semver.validRange(packageInstance.requestedVersion) && semver.satisfies(version, packageInstance.requestedVersion) && (satisfies.add(packageInstance), 
                    packageInstance.satisfiedBy.add(version));
                });
            }), packageInstances.forEach(packageInstance => {
                packageInstance.versions = versions;
                const candidateVersions = Array.from(packageInstance.satisfiedBy);
                candidateVersions.sort((versionA, versionB) => {
                    if (useMostCommon) {
                        if (versions[versionB].satisfies.size > versions[versionA].satisfies.size) return 1;
                        if (versions[versionB].satisfies.size < versions[versionA].satisfies.size) return -1;
                    }
                    return semver.rcompare(versionA, versionB);
                }), packageInstance.satisfiedBy = candidateVersions, packageInstance.bestVersion = candidateVersions[0];
            }), packageInstances;
        })(packages, name, useMostCommon)), []).filter(({bestVersion: bestVersion, installedVersion: installedVersion}) => bestVersion !== installedVersion);
    };
    module.exports.listDuplicates = (yarnLock, {includeScopes: includeScopes = [], includePackages: includePackages = [], excludePackages: excludePackages = [], useMostCommon: useMostCommon = !1} = {}) => {
        const json = parseYarnLock(yarnLock), result = [];
        return getDuplicatedPackages(json, {
            includeScopes: includeScopes,
            includePackages: includePackages,
            excludePackages: excludePackages,
            useMostCommon: useMostCommon
        }).forEach(({bestVersion: bestVersion, name: name, installedVersion: installedVersion, requestedVersion: requestedVersion}) => {
            result.push(`Package "${name}" wants ${requestedVersion} and could get ${bestVersion}, but got ${installedVersion}`);
        }), result;
    }, module.exports.fixDuplicates = (yarnLock, {includeScopes: includeScopes = [], includePackages: includePackages = [], excludePackages: excludePackages = [], useMostCommon: useMostCommon = !1} = {}) => {
        const json = parseYarnLock(yarnLock);
        return getDuplicatedPackages(json, {
            includeScopes: includeScopes,
            includePackages: includePackages,
            excludePackages: excludePackages,
            useMostCommon: useMostCommon
        }).forEach(({bestVersion: bestVersion, name: name, versions: versions, requestedVersion: requestedVersion}) => {
            json[`${name}@${requestedVersion}`] = versions[bestVersion].pkg;
        }), lockfile.stringify(json);
    };
}, function(module, exports, __webpack_require__) {
    module.exports = function(modules) {
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
        return __webpack_require__.m = modules, __webpack_require__.c = installedModules, 
        __webpack_require__.i = function(value) {
            return value;
        }, __webpack_require__.d = function(exports, name, getter) {
            __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
                configurable: !1,
                enumerable: !0,
                get: getter
            });
        }, __webpack_require__.n = function(module) {
            var getter = module && module.__esModule ? function() {
                return module.default;
            } : function() {
                return module;
            };
            return __webpack_require__.d(getter, "a", getter), getter;
        }, __webpack_require__.o = function(object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
        }, __webpack_require__.p = "", __webpack_require__(__webpack_require__.s = 14);
    }([ function(module, exports) {
        module.exports = __webpack_require__(19);
    }, function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        var obj, _promise = __webpack_require__(173), _promise2 = (obj = _promise) && obj.__esModule ? obj : {
            default: obj
        };
        exports.default = function(fn) {
            return function() {
                var gen = fn.apply(this, arguments);
                return new _promise2.default((function(resolve, reject) {
                    return function step(key, arg) {
                        try {
                            var info = gen[key](arg), value = info.value;
                        } catch (error) {
                            return void reject(error);
                        }
                        if (!info.done) return _promise2.default.resolve(value).then((function(value) {
                            step("next", value);
                        }), (function(err) {
                            step("throw", err);
                        }));
                        resolve(value);
                    }("next");
                }));
            };
        };
    }, function(module, exports) {
        module.exports = __webpack_require__(27);
    }, function(module, exports) {
        module.exports = __webpack_require__(10);
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        class MessageError extends Error {
            constructor(msg, code) {
                super(msg), this.code = code;
            }
        }
        exports.MessageError = MessageError;
        exports.ProcessSpawnError = class extends MessageError {
            constructor(msg, code, process) {
                super(msg, code), this.process = process;
            }
        };
        exports.SecurityError = class extends MessageError {};
        exports.ProcessTermError = class extends MessageError {};
        class ResponseError extends Error {
            constructor(msg, responseCode) {
                super(msg), this.responseCode = responseCode;
            }
        }
        exports.ResponseError = ResponseError;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var _asyncToGenerator2;
        function _load_asyncToGenerator() {
            return _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(1));
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.getFirstSuitableFolder = exports.readFirstAvailableStream = exports.makeTempDir = exports.hardlinksWork = exports.writeFilePreservingEol = exports.getFileSizeOnDisk = exports.walk = exports.symlink = exports.find = exports.readJsonAndFile = exports.readJson = exports.readFileAny = exports.hardlinkBulk = exports.copyBulk = exports.unlink = exports.glob = exports.link = exports.chmod = exports.lstat = exports.exists = exports.mkdirp = exports.stat = exports.access = exports.rename = exports.readdir = exports.realpath = exports.readlink = exports.writeFile = exports.open = exports.readFileBuffer = exports.lockQueue = exports.constants = void 0;
        let buildActionsForCopy = (_ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(queue, events, possibleExtraneous, reporter) {
            let build = (_ref5 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(data) {
                const src = data.src, dest = data.dest, type = data.type, onFresh = data.onFresh || noop, onDone = data.onDone || noop;
                if (files.has(dest.toLowerCase()) ? reporter.verbose(`The case-insensitive file ${dest} shouldn't be copied twice in one bulk copy`) : files.add(dest.toLowerCase()), 
                "symlink" === type) return yield mkdirp((_path || _load_path()).default.dirname(dest)), 
                onFresh(), actions.symlink.push({
                    dest: dest,
                    linkname: src
                }), void onDone();
                if (events.ignoreBasenames.indexOf((_path || _load_path()).default.basename(src)) >= 0) return;
                const srcStat = yield lstat(src);
                let srcFiles, destStat;
                srcStat.isDirectory() && (srcFiles = yield readdir(src));
                try {
                    destStat = yield lstat(dest);
                } catch (e) {
                    if ("ENOENT" !== e.code) throw e;
                }
                if (destStat) {
                    const bothSymlinks = srcStat.isSymbolicLink() && destStat.isSymbolicLink(), bothFolders = srcStat.isDirectory() && destStat.isDirectory(), bothFiles = srcStat.isFile() && destStat.isFile();
                    if (bothFiles && artifactFiles.has(dest)) return onDone(), void reporter.verbose(reporter.lang("verboseFileSkipArtifact", src));
                    if (bothFiles && srcStat.size === destStat.size && (0, (_fsNormalized || _load_fsNormalized()).fileDatesEqual)(srcStat.mtime, destStat.mtime)) return onDone(), 
                    void reporter.verbose(reporter.lang("verboseFileSkip", src, dest, srcStat.size, +srcStat.mtime));
                    if (bothSymlinks) {
                        const srcReallink = yield readlink(src);
                        if (srcReallink === (yield readlink(dest))) return onDone(), void reporter.verbose(reporter.lang("verboseFileSkipSymlink", src, dest, srcReallink));
                    }
                    if (bothFolders) {
                        const destFiles = yield readdir(dest);
                        invariant(srcFiles, "src files not initialised");
                        var _iterator4 = destFiles, _isArray4 = Array.isArray(_iterator4), _i4 = 0;
                        for (_iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator](); ;) {
                            var _ref6;
                            if (_isArray4) {
                                if (_i4 >= _iterator4.length) break;
                                _ref6 = _iterator4[_i4++];
                            } else {
                                if ((_i4 = _iterator4.next()).done) break;
                                _ref6 = _i4.value;
                            }
                            const file = _ref6;
                            if (srcFiles.indexOf(file) < 0) {
                                const loc = (_path || _load_path()).default.join(dest, file);
                                if (possibleExtraneous.add(loc), (yield lstat(loc)).isDirectory()) {
                                    var _iterator5 = yield readdir(loc), _isArray5 = Array.isArray(_iterator5), _i5 = 0;
                                    for (_iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator](); ;) {
                                        var _ref7;
                                        if (_isArray5) {
                                            if (_i5 >= _iterator5.length) break;
                                            _ref7 = _iterator5[_i5++];
                                        } else {
                                            if ((_i5 = _iterator5.next()).done) break;
                                            _ref7 = _i5.value;
                                        }
                                        const file = _ref7;
                                        possibleExtraneous.add((_path || _load_path()).default.join(loc, file));
                                    }
                                }
                            }
                        }
                    }
                }
                if (destStat && destStat.isSymbolicLink() && (yield (0, (_fsNormalized || _load_fsNormalized()).unlink)(dest), 
                destStat = null), srcStat.isSymbolicLink()) {
                    onFresh();
                    const linkname = yield readlink(src);
                    actions.symlink.push({
                        dest: dest,
                        linkname: linkname
                    }), onDone();
                } else if (srcStat.isDirectory()) {
                    destStat || (reporter.verbose(reporter.lang("verboseFileFolder", dest)), yield mkdirp(dest));
                    const destParts = dest.split((_path || _load_path()).default.sep);
                    for (;destParts.length; ) files.add(destParts.join((_path || _load_path()).default.sep).toLowerCase()), 
                    destParts.pop();
                    invariant(srcFiles, "src files not initialised");
                    let remaining = srcFiles.length;
                    remaining || onDone();
                    var _iterator6 = srcFiles, _isArray6 = Array.isArray(_iterator6), _i6 = 0;
                    for (_iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator](); ;) {
                        var _ref8;
                        if (_isArray6) {
                            if (_i6 >= _iterator6.length) break;
                            _ref8 = _iterator6[_i6++];
                        } else {
                            if ((_i6 = _iterator6.next()).done) break;
                            _ref8 = _i6.value;
                        }
                        const file = _ref8;
                        queue.push({
                            dest: (_path || _load_path()).default.join(dest, file),
                            onFresh: onFresh,
                            onDone: function(_onDone) {
                                function onDone() {
                                    return _onDone.apply(this, arguments);
                                }
                                return onDone.toString = function() {
                                    return _onDone.toString();
                                }, onDone;
                            }((function() {
                                0 == --remaining && onDone();
                            })),
                            src: (_path || _load_path()).default.join(src, file)
                        });
                    }
                } else {
                    if (!srcStat.isFile()) throw new Error("unsure how to copy this: " + src);
                    onFresh(), actions.file.push({
                        src: src,
                        dest: dest,
                        atime: srcStat.atime,
                        mtime: srcStat.mtime,
                        mode: srcStat.mode
                    }), onDone();
                }
            })), function(_x5) {
                return _ref5.apply(this, arguments);
            });
            var _ref5;
            const artifactFiles = new Set(events.artifactFiles || []), files = new Set;
            var _iterator = queue, _isArray = Array.isArray(_iterator), _i = 0;
            for (_iterator = _isArray ? _iterator : _iterator[Symbol.iterator](); ;) {
                var _ref2;
                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref2 = _iterator[_i++];
                } else {
                    if ((_i = _iterator.next()).done) break;
                    _ref2 = _i.value;
                }
                const item = _ref2, onDone = item.onDone;
                item.onDone = function() {
                    events.onProgress(item.dest), onDone && onDone();
                };
            }
            events.onStart(queue.length);
            const actions = {
                file: [],
                symlink: [],
                link: []
            };
            for (;queue.length; ) {
                const items = queue.splice(0, CONCURRENT_QUEUE_ITEMS);
                yield Promise.all(items.map(build));
            }
            var _iterator2 = artifactFiles, _isArray2 = Array.isArray(_iterator2), _i2 = 0;
            for (_iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator](); ;) {
                var _ref3;
                if (_isArray2) {
                    if (_i2 >= _iterator2.length) break;
                    _ref3 = _iterator2[_i2++];
                } else {
                    if ((_i2 = _iterator2.next()).done) break;
                    _ref3 = _i2.value;
                }
                const file = _ref3;
                possibleExtraneous.has(file) && (reporter.verbose(reporter.lang("verboseFilePhantomExtraneous", file)), 
                possibleExtraneous.delete(file));
            }
            var _iterator3 = possibleExtraneous, _isArray3 = Array.isArray(_iterator3), _i3 = 0;
            for (_iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator](); ;) {
                var _ref4;
                if (_isArray3) {
                    if (_i3 >= _iterator3.length) break;
                    _ref4 = _iterator3[_i3++];
                } else {
                    if ((_i3 = _iterator3.next()).done) break;
                    _ref4 = _i3.value;
                }
                const loc = _ref4;
                files.has(loc.toLowerCase()) && possibleExtraneous.delete(loc);
            }
            return actions;
        })), function(_x, _x2, _x3, _x4) {
            return _ref.apply(this, arguments);
        });
        var _ref;
        let buildActionsForHardlink = (_ref9 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(queue, events, possibleExtraneous, reporter) {
            let build = (_ref13 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(data) {
                const src = data.src, dest = data.dest, onFresh = data.onFresh || noop, onDone = data.onDone || noop;
                if (files.has(dest.toLowerCase())) return void onDone();
                if (files.add(dest.toLowerCase()), events.ignoreBasenames.indexOf((_path || _load_path()).default.basename(src)) >= 0) return;
                const srcStat = yield lstat(src);
                let srcFiles;
                srcStat.isDirectory() && (srcFiles = yield readdir(src));
                const destExists = yield exists(dest);
                if (destExists) {
                    const destStat = yield lstat(dest), bothSymlinks = srcStat.isSymbolicLink() && destStat.isSymbolicLink(), bothFolders = srcStat.isDirectory() && destStat.isDirectory(), bothFiles = srcStat.isFile() && destStat.isFile();
                    if (srcStat.mode !== destStat.mode) try {
                        yield access(dest, srcStat.mode);
                    } catch (err) {
                        reporter.verbose(err);
                    }
                    if (bothFiles && artifactFiles.has(dest)) return onDone(), void reporter.verbose(reporter.lang("verboseFileSkipArtifact", src));
                    if (bothFiles && null !== srcStat.ino && srcStat.ino === destStat.ino) return onDone(), 
                    void reporter.verbose(reporter.lang("verboseFileSkip", src, dest, srcStat.ino));
                    if (bothSymlinks) {
                        const srcReallink = yield readlink(src);
                        if (srcReallink === (yield readlink(dest))) return onDone(), void reporter.verbose(reporter.lang("verboseFileSkipSymlink", src, dest, srcReallink));
                    }
                    if (bothFolders) {
                        const destFiles = yield readdir(dest);
                        invariant(srcFiles, "src files not initialised");
                        var _iterator10 = destFiles, _isArray10 = Array.isArray(_iterator10), _i10 = 0;
                        for (_iterator10 = _isArray10 ? _iterator10 : _iterator10[Symbol.iterator](); ;) {
                            var _ref14;
                            if (_isArray10) {
                                if (_i10 >= _iterator10.length) break;
                                _ref14 = _iterator10[_i10++];
                            } else {
                                if ((_i10 = _iterator10.next()).done) break;
                                _ref14 = _i10.value;
                            }
                            const file = _ref14;
                            if (srcFiles.indexOf(file) < 0) {
                                const loc = (_path || _load_path()).default.join(dest, file);
                                if (possibleExtraneous.add(loc), (yield lstat(loc)).isDirectory()) {
                                    var _iterator11 = yield readdir(loc), _isArray11 = Array.isArray(_iterator11), _i11 = 0;
                                    for (_iterator11 = _isArray11 ? _iterator11 : _iterator11[Symbol.iterator](); ;) {
                                        var _ref15;
                                        if (_isArray11) {
                                            if (_i11 >= _iterator11.length) break;
                                            _ref15 = _iterator11[_i11++];
                                        } else {
                                            if ((_i11 = _iterator11.next()).done) break;
                                            _ref15 = _i11.value;
                                        }
                                        const file = _ref15;
                                        possibleExtraneous.add((_path || _load_path()).default.join(loc, file));
                                    }
                                }
                            }
                        }
                    }
                }
                if (srcStat.isSymbolicLink()) {
                    onFresh();
                    const linkname = yield readlink(src);
                    actions.symlink.push({
                        dest: dest,
                        linkname: linkname
                    }), onDone();
                } else if (srcStat.isDirectory()) {
                    reporter.verbose(reporter.lang("verboseFileFolder", dest)), yield mkdirp(dest);
                    const destParts = dest.split((_path || _load_path()).default.sep);
                    for (;destParts.length; ) files.add(destParts.join((_path || _load_path()).default.sep).toLowerCase()), 
                    destParts.pop();
                    invariant(srcFiles, "src files not initialised");
                    let remaining = srcFiles.length;
                    remaining || onDone();
                    var _iterator12 = srcFiles, _isArray12 = Array.isArray(_iterator12), _i12 = 0;
                    for (_iterator12 = _isArray12 ? _iterator12 : _iterator12[Symbol.iterator](); ;) {
                        var _ref16;
                        if (_isArray12) {
                            if (_i12 >= _iterator12.length) break;
                            _ref16 = _iterator12[_i12++];
                        } else {
                            if ((_i12 = _iterator12.next()).done) break;
                            _ref16 = _i12.value;
                        }
                        const file = _ref16;
                        queue.push({
                            onFresh: onFresh,
                            src: (_path || _load_path()).default.join(src, file),
                            dest: (_path || _load_path()).default.join(dest, file),
                            onDone: function(_onDone2) {
                                function onDone() {
                                    return _onDone2.apply(this, arguments);
                                }
                                return onDone.toString = function() {
                                    return _onDone2.toString();
                                }, onDone;
                            }((function() {
                                0 == --remaining && onDone();
                            }))
                        });
                    }
                } else {
                    if (!srcStat.isFile()) throw new Error("unsure how to copy this: " + src);
                    onFresh(), actions.link.push({
                        src: src,
                        dest: dest,
                        removeDest: destExists
                    }), onDone();
                }
            })), function(_x10) {
                return _ref13.apply(this, arguments);
            });
            var _ref13;
            const artifactFiles = new Set(events.artifactFiles || []), files = new Set;
            var _iterator7 = queue, _isArray7 = Array.isArray(_iterator7), _i7 = 0;
            for (_iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator](); ;) {
                var _ref10;
                if (_isArray7) {
                    if (_i7 >= _iterator7.length) break;
                    _ref10 = _iterator7[_i7++];
                } else {
                    if ((_i7 = _iterator7.next()).done) break;
                    _ref10 = _i7.value;
                }
                const item = _ref10, onDone = item.onDone || noop;
                item.onDone = function() {
                    events.onProgress(item.dest), onDone();
                };
            }
            events.onStart(queue.length);
            const actions = {
                file: [],
                symlink: [],
                link: []
            };
            for (;queue.length; ) {
                const items = queue.splice(0, CONCURRENT_QUEUE_ITEMS);
                yield Promise.all(items.map(build));
            }
            var _iterator8 = artifactFiles, _isArray8 = Array.isArray(_iterator8), _i8 = 0;
            for (_iterator8 = _isArray8 ? _iterator8 : _iterator8[Symbol.iterator](); ;) {
                var _ref11;
                if (_isArray8) {
                    if (_i8 >= _iterator8.length) break;
                    _ref11 = _iterator8[_i8++];
                } else {
                    if ((_i8 = _iterator8.next()).done) break;
                    _ref11 = _i8.value;
                }
                const file = _ref11;
                possibleExtraneous.has(file) && (reporter.verbose(reporter.lang("verboseFilePhantomExtraneous", file)), 
                possibleExtraneous.delete(file));
            }
            var _iterator9 = possibleExtraneous, _isArray9 = Array.isArray(_iterator9), _i9 = 0;
            for (_iterator9 = _isArray9 ? _iterator9 : _iterator9[Symbol.iterator](); ;) {
                var _ref12;
                if (_isArray9) {
                    if (_i9 >= _iterator9.length) break;
                    _ref12 = _iterator9[_i9++];
                } else {
                    if ((_i9 = _iterator9.next()).done) break;
                    _ref12 = _i9.value;
                }
                const loc = _ref12;
                files.has(loc.toLowerCase()) && possibleExtraneous.delete(loc);
            }
            return actions;
        })), function(_x6, _x7, _x8, _x9) {
            return _ref9.apply(this, arguments);
        });
        var _ref9;
        let copyBulk = exports.copyBulk = (_ref17 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(queue, reporter, _events) {
            const events = {
                onStart: _events && _events.onStart || noop,
                onProgress: _events && _events.onProgress || noop,
                possibleExtraneous: _events ? _events.possibleExtraneous : new Set,
                ignoreBasenames: _events && _events.ignoreBasenames || [],
                artifactFiles: _events && _events.artifactFiles || []
            }, actions = yield buildActionsForCopy(queue, events, events.possibleExtraneous, reporter);
            events.onStart(actions.file.length + actions.symlink.length + actions.link.length);
            const fileActions = actions.file, currentlyWriting = new Map;
            var _ref18;
            yield (_promise || _load_promise()).queue(fileActions, (_ref18 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(data) {
                let writePromise;
                for (;writePromise = currentlyWriting.get(data.dest); ) yield writePromise;
                reporter.verbose(reporter.lang("verboseFileCopy", data.src, data.dest));
                const copier = (0, (_fsNormalized || _load_fsNormalized()).copyFile)(data, (function() {
                    return currentlyWriting.delete(data.dest);
                }));
                return currentlyWriting.set(data.dest, copier), events.onProgress(data.dest), copier;
            })), function(_x14) {
                return _ref18.apply(this, arguments);
            }), CONCURRENT_QUEUE_ITEMS);
            const symlinkActions = actions.symlink;
            yield (_promise || _load_promise()).queue(symlinkActions, (function(data) {
                const linkname = (_path || _load_path()).default.resolve((_path || _load_path()).default.dirname(data.dest), data.linkname);
                return reporter.verbose(reporter.lang("verboseFileSymlink", data.dest, linkname)), 
                symlink(linkname, data.dest);
            }));
        })), function(_x11, _x12, _x13) {
            return _ref17.apply(this, arguments);
        });
        var _ref17;
        exports.hardlinkBulk = (_ref19 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(queue, reporter, _events) {
            const events = {
                onStart: _events && _events.onStart || noop,
                onProgress: _events && _events.onProgress || noop,
                possibleExtraneous: _events ? _events.possibleExtraneous : new Set,
                artifactFiles: _events && _events.artifactFiles || [],
                ignoreBasenames: []
            }, actions = yield buildActionsForHardlink(queue, events, events.possibleExtraneous, reporter);
            events.onStart(actions.file.length + actions.symlink.length + actions.link.length);
            const fileActions = actions.link;
            var _ref20;
            yield (_promise || _load_promise()).queue(fileActions, (_ref20 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(data) {
                reporter.verbose(reporter.lang("verboseFileLink", data.src, data.dest)), data.removeDest && (yield (0, 
                (_fsNormalized || _load_fsNormalized()).unlink)(data.dest)), yield link(data.src, data.dest);
            })), function(_x18) {
                return _ref20.apply(this, arguments);
            }), CONCURRENT_QUEUE_ITEMS);
            const symlinkActions = actions.symlink;
            yield (_promise || _load_promise()).queue(symlinkActions, (function(data) {
                const linkname = (_path || _load_path()).default.resolve((_path || _load_path()).default.dirname(data.dest), data.linkname);
                return reporter.verbose(reporter.lang("verboseFileSymlink", data.dest, linkname)), 
                symlink(linkname, data.dest);
            }));
        })), function(_x15, _x16, _x17) {
            return _ref19.apply(this, arguments);
        });
        var _ref19;
        exports.readFileAny = (_ref21 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(files) {
            var _iterator13 = files, _isArray13 = Array.isArray(_iterator13), _i13 = 0;
            for (_iterator13 = _isArray13 ? _iterator13 : _iterator13[Symbol.iterator](); ;) {
                var _ref22;
                if (_isArray13) {
                    if (_i13 >= _iterator13.length) break;
                    _ref22 = _iterator13[_i13++];
                } else {
                    if ((_i13 = _iterator13.next()).done) break;
                    _ref22 = _i13.value;
                }
                const file = _ref22;
                if (yield exists(file)) return readFile(file);
            }
            return null;
        })), function(_x19) {
            return _ref21.apply(this, arguments);
        });
        var _ref21;
        exports.readJson = (_ref23 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(loc) {
            return (yield readJsonAndFile(loc)).object;
        })), function(_x20) {
            return _ref23.apply(this, arguments);
        });
        var _ref23;
        let readJsonAndFile = exports.readJsonAndFile = (_ref24 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(loc) {
            const file = yield readFile(loc);
            try {
                return {
                    object: (0, (_map || (_map = _interopRequireDefault(__webpack_require__(20)))).default)(JSON.parse(stripBOM(file))),
                    content: file
                };
            } catch (err) {
                throw err.message = `${loc}: ${err.message}`, err;
            }
        })), function(_x21) {
            return _ref24.apply(this, arguments);
        });
        var _ref24;
        exports.find = (_ref25 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(filename, dir) {
            const parts = dir.split((_path || _load_path()).default.sep);
            for (;parts.length; ) {
                const loc = parts.concat(filename).join((_path || _load_path()).default.sep);
                if (yield exists(loc)) return loc;
                parts.pop();
            }
            return !1;
        })), function(_x22, _x23) {
            return _ref25.apply(this, arguments);
        });
        var _ref25;
        let symlink = exports.symlink = (_ref26 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(src, dest) {
            try {
                if ((yield lstat(dest)).isSymbolicLink() && (yield realpath(dest)) === src) return;
            } catch (err) {
                if ("ENOENT" !== err.code) throw err;
            }
            if (yield (0, (_fsNormalized || _load_fsNormalized()).unlink)(dest), "win32" === process.platform) yield fsSymlink(src, dest, "junction"); else {
                let relative;
                try {
                    relative = (_path || _load_path()).default.relative((_fs || _load_fs()).default.realpathSync((_path || _load_path()).default.dirname(dest)), (_fs || _load_fs()).default.realpathSync(src));
                } catch (err) {
                    if ("ENOENT" !== err.code) throw err;
                    relative = (_path || _load_path()).default.relative((_path || _load_path()).default.dirname(dest), src);
                }
                yield fsSymlink(relative || ".", dest);
            }
        })), function(_x24, _x25) {
            return _ref26.apply(this, arguments);
        });
        var _ref26;
        let walk = exports.walk = (_ref27 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(dir, relativeDir, ignoreBasenames = new Set) {
            let files = [], filenames = yield readdir(dir);
            ignoreBasenames.size && (filenames = filenames.filter((function(name) {
                return !ignoreBasenames.has(name);
            })));
            var _iterator14 = filenames, _isArray14 = Array.isArray(_iterator14), _i14 = 0;
            for (_iterator14 = _isArray14 ? _iterator14 : _iterator14[Symbol.iterator](); ;) {
                var _ref28;
                if (_isArray14) {
                    if (_i14 >= _iterator14.length) break;
                    _ref28 = _iterator14[_i14++];
                } else {
                    if ((_i14 = _iterator14.next()).done) break;
                    _ref28 = _i14.value;
                }
                const name = _ref28, relative = relativeDir ? (_path || _load_path()).default.join(relativeDir, name) : name, loc = (_path || _load_path()).default.join(dir, name), stat = yield lstat(loc);
                files.push({
                    relative: relative,
                    basename: name,
                    absolute: loc,
                    mtime: +stat.mtime
                }), stat.isDirectory() && (files = files.concat(yield walk(loc, relative, ignoreBasenames)));
            }
            return files;
        })), function(_x26, _x27) {
            return _ref27.apply(this, arguments);
        });
        var _ref27;
        exports.getFileSizeOnDisk = (_ref29 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(loc) {
            const stat = yield lstat(loc), size = stat.size, blockSize = stat.blksize;
            return Math.ceil(size / blockSize) * blockSize;
        })), function(_x28) {
            return _ref29.apply(this, arguments);
        });
        var _ref29;
        let getEolFromFile = (_ref30 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(path) {
            if (!(yield exists(path))) return;
            const buffer = yield readFileBuffer(path);
            for (let i = 0; i < buffer.length; ++i) {
                if (buffer[i] === cr) return "\r\n";
                if (buffer[i] === lf) return "\n";
            }
        })), function(_x29) {
            return _ref30.apply(this, arguments);
        });
        var _ref30;
        exports.writeFilePreservingEol = (_ref31 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(path, data) {
            const eol = (yield getEolFromFile(path)) || (_os || _load_os()).default.EOL;
            "\n" !== eol && (data = data.replace(/\n/g, eol)), yield writeFile(path, data);
        })), function(_x30, _x31) {
            return _ref31.apply(this, arguments);
        });
        var _ref31;
        exports.hardlinksWork = (_ref32 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(dir) {
            const filename = "test-file" + Math.random(), file = (_path || _load_path()).default.join(dir, filename), fileLink = (_path || _load_path()).default.join(dir, filename + "-link");
            try {
                yield writeFile(file, "test"), yield link(file, fileLink);
            } catch (err) {
                return !1;
            } finally {
                yield (0, (_fsNormalized || _load_fsNormalized()).unlink)(file), yield (0, (_fsNormalized || _load_fsNormalized()).unlink)(fileLink);
            }
            return !0;
        })), function(_x32) {
            return _ref32.apply(this, arguments);
        });
        var _ref32;
        exports.makeTempDir = (_ref33 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(prefix) {
            const dir = (_path || _load_path()).default.join((_os || _load_os()).default.tmpdir(), `yarn-${prefix || ""}-${Date.now()}-${Math.random()}`);
            return yield (0, (_fsNormalized || _load_fsNormalized()).unlink)(dir), yield mkdirp(dir), 
            dir;
        })), function(_x33) {
            return _ref33.apply(this, arguments);
        });
        var _ref33;
        exports.readFirstAvailableStream = (_ref34 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(paths) {
            var _iterator15 = paths, _isArray15 = Array.isArray(_iterator15), _i15 = 0;
            for (_iterator15 = _isArray15 ? _iterator15 : _iterator15[Symbol.iterator](); ;) {
                var _ref35;
                if (_isArray15) {
                    if (_i15 >= _iterator15.length) break;
                    _ref35 = _iterator15[_i15++];
                } else {
                    if ((_i15 = _iterator15.next()).done) break;
                    _ref35 = _i15.value;
                }
                const path = _ref35;
                try {
                    const fd = yield open(path, "r");
                    return (_fs || _load_fs()).default.createReadStream(path, {
                        fd: fd
                    });
                } catch (err) {}
            }
            return null;
        })), function(_x34) {
            return _ref34.apply(this, arguments);
        });
        var _ref34;
        exports.getFirstSuitableFolder = (_ref36 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(paths, mode = constants.W_OK | constants.X_OK) {
            const result = {
                skipped: [],
                folder: null
            };
            var _iterator16 = paths, _isArray16 = Array.isArray(_iterator16), _i16 = 0;
            for (_iterator16 = _isArray16 ? _iterator16 : _iterator16[Symbol.iterator](); ;) {
                var _ref37;
                if (_isArray16) {
                    if (_i16 >= _iterator16.length) break;
                    _ref37 = _iterator16[_i16++];
                } else {
                    if ((_i16 = _iterator16.next()).done) break;
                    _ref37 = _i16.value;
                }
                const folder = _ref37;
                try {
                    return yield mkdirp(folder), yield access(folder, mode), result.folder = folder, 
                    result;
                } catch (error) {
                    result.skipped.push({
                        error: error,
                        folder: folder
                    });
                }
            }
            return result;
        })), function(_x35) {
            return _ref36.apply(this, arguments);
        });
        var _ref36, _fs, _glob, _os, _path, _blockingQueue, _promise, _promise2, _map, _fsNormalized;
        function _load_fs() {
            return _fs = _interopRequireDefault(__webpack_require__(3));
        }
        function _load_os() {
            return _os = _interopRequireDefault(__webpack_require__(36));
        }
        function _load_path() {
            return _path = _interopRequireDefault(__webpack_require__(0));
        }
        function _load_promise() {
            return _promise = function(obj) {
                if (obj && obj.__esModule) return obj;
                var newObj = {};
                if (null != obj) for (var key in obj) Object.prototype.hasOwnProperty.call(obj, key) && (newObj[key] = obj[key]);
                return newObj.default = obj, newObj;
            }(__webpack_require__(40));
        }
        function _load_promise2() {
            return _promise2 = __webpack_require__(40);
        }
        function _load_fsNormalized() {
            return _fsNormalized = __webpack_require__(164);
        }
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        exports.copy = function(src, dest, reporter) {
            return copyBulk([ {
                src: src,
                dest: dest
            } ], reporter);
        }, exports.readFile = readFile, exports.readFileRaw = function(loc) {
            return _readFile(loc, "binary");
        }, exports.normalizeOS = normalizeOS;
        const constants = exports.constants = void 0 !== (_fs || _load_fs()).default.constants ? (_fs || _load_fs()).default.constants : {
            R_OK: (_fs || _load_fs()).default.R_OK,
            W_OK: (_fs || _load_fs()).default.W_OK,
            X_OK: (_fs || _load_fs()).default.X_OK
        }, readFileBuffer = (exports.lockQueue = new ((_blockingQueue || (_blockingQueue = _interopRequireDefault(__webpack_require__(84)))).default)("fs lock"), 
        exports.readFileBuffer = (0, (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.readFile)), open = exports.open = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.open), writeFile = exports.writeFile = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.writeFile), readlink = exports.readlink = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.readlink), realpath = exports.realpath = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.realpath), readdir = exports.readdir = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.readdir), access = (exports.rename = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.rename), 
        exports.access = (0, (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.access)), mkdirp = (exports.stat = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.stat), exports.mkdirp = (0, 
        (_promise2 || _load_promise2()).promisify)(__webpack_require__(116))), exists = exports.exists = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.exists, !0), lstat = exports.lstat = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.lstat), link = (exports.chmod = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.chmod), exports.link = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.link));
        exports.glob = (0, (_promise2 || _load_promise2()).promisify)((_glob || (_glob = _interopRequireDefault(__webpack_require__(75)))).default);
        exports.unlink = (_fsNormalized || _load_fsNormalized()).unlink;
        const CONCURRENT_QUEUE_ITEMS = (_fs || _load_fs()).default.copyFile ? 128 : 4, fsSymlink = (0, 
        (_promise2 || _load_promise2()).promisify)((_fs || _load_fs()).default.symlink), invariant = __webpack_require__(7), stripBOM = __webpack_require__(122), noop = () => {};
        function _readFile(loc, encoding) {
            return new Promise((resolve, reject) => {
                (_fs || _load_fs()).default.readFile(loc, encoding, (function(err, content) {
                    err ? reject(err) : resolve(content);
                }));
            });
        }
        function readFile(loc) {
            return _readFile(loc, "utf8").then(normalizeOS);
        }
        function normalizeOS(body) {
            return body.replace(/\r\n/g, "\n");
        }
        const cr = "\r".charCodeAt(0), lf = "\n".charCodeAt(0);
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.getPathKey = getPathKey;
        const os = __webpack_require__(36), path = __webpack_require__(0), userHome = __webpack_require__(45).default;
        var _require = __webpack_require__(171);
        const getCacheDir = _require.getCacheDir, getConfigDir = _require.getConfigDir, getDataDir = _require.getDataDir, isWebpackBundle = __webpack_require__(227), DEPENDENCY_TYPES = exports.DEPENDENCY_TYPES = [ "devDependencies", "dependencies", "optionalDependencies", "peerDependencies" ], RESOLUTIONS = exports.RESOLUTIONS = "resolutions";
        exports.MANIFEST_FIELDS = [ RESOLUTIONS, ...DEPENDENCY_TYPES ], exports.SUPPORTED_NODE_VERSIONS = "^4.8.0 || ^5.7.0 || ^6.2.2 || >=8.0.0", 
        exports.YARN_REGISTRY = "https://registry.yarnpkg.com", exports.YARN_DOCS = "https://yarnpkg.com/en/docs/cli/", 
        exports.YARN_INSTALLER_SH = "https://yarnpkg.com/install.sh", exports.YARN_INSTALLER_MSI = "https://yarnpkg.com/latest.msi", 
        exports.SELF_UPDATE_VERSION_URL = "https://yarnpkg.com/latest-version", exports.CACHE_VERSION = 2, 
        exports.LOCKFILE_VERSION = 1, exports.NETWORK_CONCURRENCY = 8, exports.NETWORK_TIMEOUT = 3e4, 
        exports.CHILD_CONCURRENCY = 5, exports.REQUIRED_PACKAGE_KEYS = [ "name", "version", "_uid" ];
        exports.PREFERRED_MODULE_CACHE_DIRECTORIES = function() {
            const preferredCacheDirectories = [ getCacheDir() ];
            return process.getuid && preferredCacheDirectories.push(path.join(os.tmpdir(), ".yarn-cache-" + process.getuid())), 
            preferredCacheDirectories.push(path.join(os.tmpdir(), ".yarn-cache")), preferredCacheDirectories;
        }(), exports.CONFIG_DIRECTORY = getConfigDir();
        const DATA_DIRECTORY = exports.DATA_DIRECTORY = getDataDir();
        exports.LINK_REGISTRY_DIRECTORY = path.join(DATA_DIRECTORY, "link"), exports.GLOBAL_MODULE_DIRECTORY = path.join(DATA_DIRECTORY, "global"), 
        exports.NODE_BIN_PATH = process.execPath, exports.YARN_BIN_PATH = isWebpackBundle ? __filename : path.join(__dirname, "..", "bin", "yarn.js");
        exports.NODE_MODULES_FOLDER = "node_modules", exports.NODE_PACKAGE_JSON = "package.json", 
        exports.POSIX_GLOBAL_PREFIX = (process.env.DESTDIR || "") + "/usr/local", exports.FALLBACK_GLOBAL_PREFIX = path.join(userHome, ".yarn"), 
        exports.META_FOLDER = ".yarn-meta", exports.INTEGRITY_FILENAME = ".yarn-integrity", 
        exports.LOCKFILE_FILENAME = "yarn.lock", exports.METADATA_FILENAME = ".yarn-metadata.json", 
        exports.TARBALL_FILENAME = ".yarn-tarball.tgz", exports.CLEAN_FILENAME = ".yarnclean", 
        exports.NPM_LOCK_FILENAME = "package-lock.json", exports.NPM_SHRINKWRAP_FILENAME = "npm-shrinkwrap.json", 
        exports.DEFAULT_INDENT = "  ", exports.SINGLE_INSTANCE_PORT = 31997, exports.SINGLE_INSTANCE_FILENAME = ".yarn-single-instance", 
        exports.ENV_PATH_KEY = getPathKey(process.platform, process.env);
        function getPathKey(platform, env) {
            let pathKey = "PATH";
            if ("win32" === platform) {
                pathKey = "Path";
                for (const key in env) "path" === key.toLowerCase() && (pathKey = key);
            }
            return pathKey;
        }
        exports.VERSION_COLOR_SCHEME = {
            major: "red",
            premajor: "red",
            minor: "yellow",
            preminor: "yellow",
            patch: "green",
            prepatch: "green",
            prerelease: "red",
            unchanged: "white",
            unknown: "red"
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var NODE_ENV = process.env.NODE_ENV;
        module.exports = function(condition, format, a, b, c, d, e, f) {
            if ("production" !== NODE_ENV && void 0 === format) throw new Error("invariant requires an error message argument");
            if (!condition) {
                var error;
                if (void 0 === format) error = new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings."); else {
                    var args = [ a, b, c, d, e, f ], argIndex = 0;
                    (error = new Error(format.replace(/%s/g, (function() {
                        return args[argIndex++];
                    })))).name = "Invariant Violation";
                }
                throw error.framesToPop = 1, error;
            }
        };
    }, , function(module, exports) {
        module.exports = __webpack_require__(28);
    }, , function(module, exports) {
        var global = module.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
        "number" == typeof __g && (__g = global);
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.sortAlpha = function(a, b) {
            const shortLen = Math.min(a.length, b.length);
            for (let i = 0; i < shortLen; i++) {
                const aChar = a.charCodeAt(i), bChar = b.charCodeAt(i);
                if (aChar !== bChar) return aChar - bChar;
            }
            return a.length - b.length;
        }, exports.entries = function(obj) {
            const entries = [];
            if (obj) for (const key in obj) entries.push([ key, obj[key] ]);
            return entries;
        }, exports.removePrefix = function(pattern, prefix) {
            pattern.startsWith(prefix) && (pattern = pattern.slice(prefix.length));
            return pattern;
        }, exports.removeSuffix = function(pattern, suffix) {
            if (pattern.endsWith(suffix)) return pattern.slice(0, -suffix.length);
            return pattern;
        }, exports.addSuffix = function(pattern, suffix) {
            if (!pattern.endsWith(suffix)) return pattern + suffix;
            return pattern;
        }, exports.hyphenate = function(str) {
            return str.replace(/[A-Z]/g, match => "-" + match.charAt(0).toLowerCase());
        }, exports.camelCase = function(str) {
            return /[A-Z]/.test(str) ? null : _camelCase(str);
        }, exports.compareSortedArrays = function(array1, array2) {
            if (array1.length !== array2.length) return !1;
            for (let i = 0, len = array1.length; i < len; i++) if (array1[i] !== array2[i]) return !1;
            return !0;
        }, exports.sleep = function(ms) {
            return new Promise(resolve => {
                setTimeout(resolve, ms);
            });
        };
        const _camelCase = __webpack_require__(176);
    }, function(module, exports, __webpack_require__) {
        var store = __webpack_require__(107)("wks"), uid = __webpack_require__(111), Symbol = __webpack_require__(11).Symbol, USE_SYMBOL = "function" == typeof Symbol;
        (module.exports = function(name) {
            return store[name] || (store[name] = USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)("Symbol." + name));
        }).store = store;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var _asyncToGenerator2, _parse, _stringify, _misc, _normalizePattern, _parse2, _constants, _fs;
        function _load_fs() {
            return _fs = function(obj) {
                if (obj && obj.__esModule) return obj;
                var newObj = {};
                if (null != obj) for (var key in obj) Object.prototype.hasOwnProperty.call(obj, key) && (newObj[key] = obj[key]);
                return newObj.default = obj, newObj;
            }(__webpack_require__(5));
        }
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.stringify = exports.parse = void 0, Object.defineProperty(exports, "parse", {
            enumerable: !0,
            get: function() {
                return _interopRequireDefault(_parse || (_parse = __webpack_require__(81))).default;
            }
        }), Object.defineProperty(exports, "stringify", {
            enumerable: !0,
            get: function() {
                return _interopRequireDefault(_stringify || (_stringify = __webpack_require__(150))).default;
            }
        }), exports.implodeEntry = implodeEntry, exports.explodeEntry = explodeEntry;
        const invariant = __webpack_require__(7), path = __webpack_require__(0), ssri = __webpack_require__(55);
        function getName(pattern) {
            return (0, (_normalizePattern || (_normalizePattern = __webpack_require__(29))).normalizePattern)(pattern).name;
        }
        function blankObjectUndefined(obj) {
            return obj && Object.keys(obj).length ? obj : void 0;
        }
        function keyForRemote(remote) {
            return remote.resolved || (remote.reference && remote.hash ? `${remote.reference}#${remote.hash}` : null);
        }
        function implodeEntry(pattern, obj) {
            const inferredName = getName(pattern), integrity = obj.integrity ? function(integrity) {
                return integrity.toString().split(" ").sort().join(" ");
            }(obj.integrity) : "", imploded = {
                name: inferredName === obj.name ? void 0 : obj.name,
                version: obj.version,
                uid: obj.uid === obj.version ? void 0 : obj.uid,
                resolved: obj.resolved,
                registry: "npm" === obj.registry ? void 0 : obj.registry,
                dependencies: blankObjectUndefined(obj.dependencies),
                optionalDependencies: blankObjectUndefined(obj.optionalDependencies),
                permissions: blankObjectUndefined(obj.permissions),
                prebuiltVariants: blankObjectUndefined(obj.prebuiltVariants)
            };
            return integrity && (imploded.integrity = integrity), imploded;
        }
        function explodeEntry(pattern, obj) {
            obj.optionalDependencies = obj.optionalDependencies || {}, obj.dependencies = obj.dependencies || {}, 
            obj.uid = obj.uid || obj.version, obj.permissions = obj.permissions || {}, obj.registry = obj.registry || "npm", 
            obj.name = obj.name || getName(pattern);
            const integrity = obj.integrity;
            return integrity && integrity.isIntegrity && (obj.integrity = ssri.parse(integrity)), 
            obj;
        }
        class Lockfile {
            constructor({cache: cache, source: source, parseResultType: parseResultType} = {}) {
                this.source = source || "", this.cache = cache, this.parseResultType = parseResultType;
            }
            hasEntriesExistWithoutIntegrity() {
                if (!this.cache) return !1;
                for (const key in this.cache) if (!/^.*@(file:|http)/.test(key) && this.cache[key] && !this.cache[key].integrity) return !0;
                return !1;
            }
            static fromDirectory(dir, reporter) {
                return (0, (_asyncToGenerator2 || (_asyncToGenerator2 = _interopRequireDefault(__webpack_require__(1)))).default)((function*() {
                    const lockfileLoc = path.join(dir, (_constants || (_constants = __webpack_require__(6))).LOCKFILE_FILENAME);
                    let lockfile, parseResult, rawLockfile = "";
                    return (yield (_fs || _load_fs()).exists(lockfileLoc)) ? (rawLockfile = yield (_fs || _load_fs()).readFile(lockfileLoc), 
                    parseResult = (0, (_parse2 || (_parse2 = _interopRequireDefault(__webpack_require__(81)))).default)(rawLockfile, lockfileLoc), 
                    reporter && ("merge" === parseResult.type ? reporter.info(reporter.lang("lockfileMerged")) : "conflict" === parseResult.type && reporter.warn(reporter.lang("lockfileConflict"))), 
                    lockfile = parseResult.object) : reporter && reporter.info(reporter.lang("noLockfileFound")), 
                    new Lockfile({
                        cache: lockfile,
                        source: rawLockfile,
                        parseResultType: parseResult && parseResult.type
                    });
                }))();
            }
            getLocked(pattern) {
                const cache = this.cache;
                if (!cache) return;
                const shrunk = pattern in cache && cache[pattern];
                return "string" == typeof shrunk ? this.getLocked(shrunk) : shrunk ? (explodeEntry(pattern, shrunk), 
                shrunk) : void 0;
            }
            removePattern(pattern) {
                const cache = this.cache;
                cache && delete cache[pattern];
            }
            getLockfile(patterns) {
                const lockfile = {}, seen = new Map;
                var _iterator = Object.keys(patterns).sort((_misc || (_misc = __webpack_require__(12))).sortAlpha), _isArray = Array.isArray(_iterator), _i = 0;
                for (_iterator = _isArray ? _iterator : _iterator[Symbol.iterator](); ;) {
                    var _ref;
                    if (_isArray) {
                        if (_i >= _iterator.length) break;
                        _ref = _iterator[_i++];
                    } else {
                        if ((_i = _iterator.next()).done) break;
                        _ref = _i.value;
                    }
                    const pattern = _ref, pkg = patterns[pattern], remote = pkg._remote, ref = pkg._reference;
                    invariant(ref, "Package is missing a reference"), invariant(remote, "Package is missing a remote");
                    const remoteKey = keyForRemote(remote), seenPattern = remoteKey && seen.get(remoteKey);
                    if (seenPattern) {
                        lockfile[pattern] = seenPattern, seenPattern.name || getName(pattern) === pkg.name || (seenPattern.name = pkg.name);
                        continue;
                    }
                    const obj = implodeEntry(pattern, {
                        name: pkg.name,
                        version: pkg.version,
                        uid: pkg._uid,
                        resolved: remote.resolved,
                        integrity: remote.integrity,
                        registry: remote.registry,
                        dependencies: pkg.dependencies,
                        peerDependencies: pkg.peerDependencies,
                        optionalDependencies: pkg.optionalDependencies,
                        permissions: ref.permissions,
                        prebuiltVariants: pkg.prebuiltVariants
                    });
                    lockfile[pattern] = obj, remoteKey && seen.set(remoteKey, obj);
                }
                return lockfile;
            }
        }
        exports.default = Lockfile;
    }, , , function(module, exports) {
        module.exports = __webpack_require__(29);
    }, , , function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.default = function nullify(obj = {}) {
            if (Array.isArray(obj)) {
                var _iterator = obj, _isArray = Array.isArray(_iterator), _i = 0;
                for (_iterator = _isArray ? _iterator : _iterator[Symbol.iterator](); ;) {
                    var _ref;
                    if (_isArray) {
                        if (_i >= _iterator.length) break;
                        _ref = _iterator[_i++];
                    } else {
                        if ((_i = _iterator.next()).done) break;
                        _ref = _i.value;
                    }
                    nullify(_ref);
                }
            } else if ((null !== obj && "object" == typeof obj || "function" == typeof obj) && (Object.setPrototypeOf(obj, null), 
            "object" == typeof obj)) for (const key in obj) nullify(obj[key]);
            return obj;
        };
    }, , function(module, exports) {
        module.exports = __webpack_require__(30);
    }, function(module, exports) {
        var core = module.exports = {
            version: "2.5.7"
        };
        "number" == typeof __e && (__e = core);
    }, , , , function(module, exports, __webpack_require__) {
        var isObject = __webpack_require__(34);
        module.exports = function(it) {
            if (!isObject(it)) throw TypeError(it + " is not an object!");
            return it;
        };
    }, , function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.normalizePattern = function(pattern) {
            let hasVersion = !1, range = "latest", name = pattern, isScoped = !1;
            "@" === name[0] && (isScoped = !0, name = name.slice(1));
            const parts = name.split("@");
            parts.length > 1 && (name = parts.shift(), range = parts.join("@"), range ? hasVersion = !0 : range = "*");
            isScoped && (name = "@" + name);
            return {
                name: name,
                range: range,
                hasVersion: hasVersion
            };
        };
    }, , function(module, exports, __webpack_require__) {
        var dP = __webpack_require__(50), createDesc = __webpack_require__(106);
        module.exports = __webpack_require__(33) ? function(object, key, value) {
            return dP.f(object, key, createDesc(1, value));
        } : function(object, key, value) {
            return object[key] = value, object;
        };
    }, function(module, exports, __webpack_require__) {
        var buffer = __webpack_require__(63), Buffer = buffer.Buffer;
        function copyProps(src, dst) {
            for (var key in src) dst[key] = src[key];
        }
        function SafeBuffer(arg, encodingOrOffset, length) {
            return Buffer(arg, encodingOrOffset, length);
        }
        Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow ? module.exports = buffer : (copyProps(buffer, exports), 
        exports.Buffer = SafeBuffer), copyProps(Buffer, SafeBuffer), SafeBuffer.from = function(arg, encodingOrOffset, length) {
            if ("number" == typeof arg) throw new TypeError("Argument must not be a number");
            return Buffer(arg, encodingOrOffset, length);
        }, SafeBuffer.alloc = function(size, fill, encoding) {
            if ("number" != typeof size) throw new TypeError("Argument must be a number");
            var buf = Buffer(size);
            return void 0 !== fill ? "string" == typeof encoding ? buf.fill(fill, encoding) : buf.fill(fill) : buf.fill(0), 
            buf;
        }, SafeBuffer.allocUnsafe = function(size) {
            if ("number" != typeof size) throw new TypeError("Argument must be a number");
            return Buffer(size);
        }, SafeBuffer.allocUnsafeSlow = function(size) {
            if ("number" != typeof size) throw new TypeError("Argument must be a number");
            return buffer.SlowBuffer(size);
        };
    }, function(module, exports, __webpack_require__) {
        module.exports = !__webpack_require__(85)((function() {
            return 7 != Object.defineProperty({}, "a", {
                get: function() {
                    return 7;
                }
            }).a;
        }));
    }, function(module, exports) {
        module.exports = function(it) {
            return "object" == typeof it ? null !== it : "function" == typeof it;
        };
    }, function(module, exports) {
        module.exports = {};
    }, function(module, exports) {
        module.exports = __webpack_require__(31);
    }, , , , function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.wait = function(delay) {
            return new Promise(resolve => {
                setTimeout(resolve, delay);
            });
        }, exports.promisify = function(fn, firstData) {
            return function(...args) {
                return new Promise((function(resolve, reject) {
                    args.push((function(err, ...result) {
                        let res = result;
                        result.length <= 1 && (res = result[0]), firstData && (res = err, err = null), err ? reject(err) : resolve(res);
                    })), fn.apply(null, args);
                }));
            };
        }, exports.queue = function(arr, promiseProducer, concurrency = 1 / 0) {
            concurrency = Math.min(concurrency, arr.length), arr = arr.slice();
            const results = [];
            let total = arr.length;
            if (!total) return Promise.resolve(results);
            return new Promise((resolve, reject) => {
                for (let i = 0; i < concurrency; i++) next();
                function next() {
                    const item = arr.shift();
                    promiseProducer(item).then((function(result) {
                        results.push(result), total--, 0 === total ? resolve(results) : arr.length && next();
                    }), reject);
                }
            });
        };
    }, function(module, exports, __webpack_require__) {
        var global = __webpack_require__(11), core = __webpack_require__(23), ctx = __webpack_require__(48), hide = __webpack_require__(31), has = __webpack_require__(49), $export = function $export(type, name, source) {
            var key, own, out, IS_FORCED = type & $export.F, IS_GLOBAL = type & $export.G, IS_STATIC = type & $export.S, IS_PROTO = type & $export.P, IS_BIND = type & $export.B, IS_WRAP = type & $export.W, exports = IS_GLOBAL ? core : core[name] || (core[name] = {}), expProto = exports.prototype, target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {}).prototype;
            for (key in IS_GLOBAL && (source = name), source) (own = !IS_FORCED && target && void 0 !== target[key]) && has(exports, key) || (out = own ? target[key] : source[key], 
            exports[key] = IS_GLOBAL && "function" != typeof target[key] ? source[key] : IS_BIND && own ? ctx(out, global) : IS_WRAP && target[key] == out ? function(C) {
                var F = function(a, b, c) {
                    if (this instanceof C) {
                        switch (arguments.length) {
                          case 0:
                            return new C;

                          case 1:
                            return new C(a);

                          case 2:
                            return new C(a, b);
                        }
                        return new C(a, b, c);
                    }
                    return C.apply(this, arguments);
                };
                return F.prototype = C.prototype, F;
            }(out) : IS_PROTO && "function" == typeof out ? ctx(Function.call, out) : out, IS_PROTO && ((exports.virtual || (exports.virtual = {}))[key] = out, 
            type & $export.R && expProto && !expProto[key] && hide(expProto, key, out)));
        };
        $export.F = 1, $export.G = 2, $export.S = 4, $export.P = 8, $export.B = 16, $export.W = 32, 
        $export.U = 64, $export.R = 128, module.exports = $export;
    }, function(module, exports, __webpack_require__) {
        try {
            var util = __webpack_require__(2);
            if ("function" != typeof util.inherits) throw "";
            module.exports = util.inherits;
        } catch (e) {
            module.exports = __webpack_require__(224);
        }
    }, , , function(module, exports, __webpack_require__) {
        "use strict";
        var _rootUser;
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.home = void 0;
        const path = __webpack_require__(0), home = exports.home = __webpack_require__(36).homedir(), userHomeDir = (_rootUser || (obj = __webpack_require__(169), 
        _rootUser = obj && obj.__esModule ? obj : {
            default: obj
        })).default ? path.resolve("/usr/local/share") : home;
        var obj;
        exports.default = userHomeDir;
    }, function(module, exports) {
        module.exports = function(it) {
            if ("function" != typeof it) throw TypeError(it + " is not a function!");
            return it;
        };
    }, function(module, exports) {
        var toString = {}.toString;
        module.exports = function(it) {
            return toString.call(it).slice(8, -1);
        };
    }, function(module, exports, __webpack_require__) {
        var aFunction = __webpack_require__(46);
        module.exports = function(fn, that, length) {
            if (aFunction(fn), void 0 === that) return fn;
            switch (length) {
              case 1:
                return function(a) {
                    return fn.call(that, a);
                };

              case 2:
                return function(a, b) {
                    return fn.call(that, a, b);
                };

              case 3:
                return function(a, b, c) {
                    return fn.call(that, a, b, c);
                };
            }
            return function() {
                return fn.apply(that, arguments);
            };
        };
    }, function(module, exports) {
        var hasOwnProperty = {}.hasOwnProperty;
        module.exports = function(it, key) {
            return hasOwnProperty.call(it, key);
        };
    }, function(module, exports, __webpack_require__) {
        var anObject = __webpack_require__(27), IE8_DOM_DEFINE = __webpack_require__(184), toPrimitive = __webpack_require__(201), dP = Object.defineProperty;
        exports.f = __webpack_require__(33) ? Object.defineProperty : function(O, P, Attributes) {
            if (anObject(O), P = toPrimitive(P, !0), anObject(Attributes), IE8_DOM_DEFINE) try {
                return dP(O, P, Attributes);
            } catch (e) {}
            if ("get" in Attributes || "set" in Attributes) throw TypeError("Accessors not supported!");
            return "value" in Attributes && (O[P] = Attributes.value), O;
        };
    }, , , , function(module, exports) {
        module.exports = __webpack_require__(18);
    }, function(module, exports, __webpack_require__) {
        "use strict";
        const Buffer = __webpack_require__(32).Buffer, crypto = __webpack_require__(9), Transform = __webpack_require__(17).Transform, SPEC_ALGORITHMS = [ "sha256", "sha384", "sha512" ], BASE64_REGEX = /^[a-z0-9+/]+(?:=?=?)$/i, SRI_REGEX = /^([^-]+)-([^?]+)([?\S*]*)$/, STRICT_SRI_REGEX = /^([^-]+)-([A-Za-z0-9+/=]{44,88})(\?[\x21-\x7E]*)*$/, VCHAR_REGEX = /^[\x21-\x7E]+$/;
        class Hash {
            get isHash() {
                return !0;
            }
            constructor(hash, opts) {
                const strict = !(!opts || !opts.strict);
                this.source = hash.trim();
                const match = this.source.match(strict ? STRICT_SRI_REGEX : SRI_REGEX);
                if (!match) return;
                if (strict && !SPEC_ALGORITHMS.some(a => a === match[1])) return;
                this.algorithm = match[1], this.digest = match[2];
                const rawOpts = match[3];
                this.options = rawOpts ? rawOpts.slice(1).split("?") : [];
            }
            hexDigest() {
                return this.digest && Buffer.from(this.digest, "base64").toString("hex");
            }
            toJSON() {
                return this.toString();
            }
            toString(opts) {
                if (opts && opts.strict && !(SPEC_ALGORITHMS.some(x => x === this.algorithm) && this.digest.match(BASE64_REGEX) && (this.options || []).every(opt => opt.match(VCHAR_REGEX)))) return "";
                const options = this.options && this.options.length ? "?" + this.options.join("?") : "";
                return `${this.algorithm}-${this.digest}${options}`;
            }
        }
        class Integrity {
            get isIntegrity() {
                return !0;
            }
            toJSON() {
                return this.toString();
            }
            toString(opts) {
                let sep = (opts = opts || {}).sep || " ";
                return opts.strict && (sep = sep.replace(/\S+/g, " ")), Object.keys(this).map(k => this[k].map(hash => Hash.prototype.toString.call(hash, opts)).filter(x => x.length).join(sep)).filter(x => x.length).join(sep);
            }
            concat(integrity, opts) {
                const other = "string" == typeof integrity ? integrity : stringify(integrity, opts);
                return parse(`${this.toString(opts)} ${other}`, opts);
            }
            hexDigest() {
                return parse(this, {
                    single: !0
                }).hexDigest();
            }
            match(integrity, opts) {
                const other = parse(integrity, opts), algo = other.pickAlgorithm(opts);
                return this[algo] && other[algo] && this[algo].find(hash => other[algo].find(otherhash => hash.digest === otherhash.digest)) || !1;
            }
            pickAlgorithm(opts) {
                const pickAlgorithm = opts && opts.pickAlgorithm || getPrioritizedHash, keys = Object.keys(this);
                if (!keys.length) throw new Error("No algorithms available for " + JSON.stringify(this.toString()));
                return keys.reduce((acc, algo) => pickAlgorithm(acc, algo) || acc);
            }
        }
        function parse(sri, opts) {
            if (opts = opts || {}, "string" == typeof sri) return _parse(sri, opts);
            if (sri.algorithm && sri.digest) {
                const fullSri = new Integrity;
                return fullSri[sri.algorithm] = [ sri ], _parse(stringify(fullSri, opts), opts);
            }
            return _parse(stringify(sri, opts), opts);
        }
        function _parse(integrity, opts) {
            return opts.single ? new Hash(integrity, opts) : integrity.trim().split(/\s+/).reduce((acc, string) => {
                const hash = new Hash(string, opts);
                if (hash.algorithm && hash.digest) {
                    const algo = hash.algorithm;
                    acc[algo] || (acc[algo] = []), acc[algo].push(hash);
                }
                return acc;
            }, new Integrity);
        }
        function stringify(obj, opts) {
            return obj.algorithm && obj.digest ? Hash.prototype.toString.call(obj, opts) : "string" == typeof obj ? stringify(parse(obj, opts), opts) : Integrity.prototype.toString.call(obj, opts);
        }
        function integrityStream(opts) {
            const sri = (opts = opts || {}).integrity && parse(opts.integrity, opts), goodSri = sri && Object.keys(sri).length, algorithm = goodSri && sri.pickAlgorithm(opts), digests = goodSri && sri[algorithm], algorithms = Array.from(new Set((opts.algorithms || [ "sha512" ]).concat(algorithm ? [ algorithm ] : []))), hashes = algorithms.map(crypto.createHash);
            let streamSize = 0;
            const stream = new Transform({
                transform(chunk, enc, cb) {
                    streamSize += chunk.length, hashes.forEach(h => h.update(chunk, enc)), cb(null, chunk, enc);
                }
            }).on("end", () => {
                const optString = opts.options && opts.options.length ? "?" + opts.options.join("?") : "", newSri = parse(hashes.map((h, i) => `${algorithms[i]}-${h.digest("base64")}${optString}`).join(" "), opts), match = goodSri && newSri.match(sri, opts);
                if ("number" == typeof opts.size && streamSize !== opts.size) {
                    const err = new Error(`stream size mismatch when checking ${sri}.\n  Wanted: ${opts.size}\n  Found: ${streamSize}`);
                    err.code = "EBADSIZE", err.found = streamSize, err.expected = opts.size, err.sri = sri, 
                    stream.emit("error", err);
                } else if (opts.integrity && !match) {
                    const err = new Error(`${sri} integrity checksum failed when using ${algorithm}: wanted ${digests} but got ${newSri}. (${streamSize} bytes)`);
                    err.code = "EINTEGRITY", err.found = newSri, err.expected = digests, err.algorithm = algorithm, 
                    err.sri = sri, stream.emit("error", err);
                } else stream.emit("size", streamSize), stream.emit("integrity", newSri), match && stream.emit("verified", match);
            });
            return stream;
        }
        module.exports.parse = parse, module.exports.stringify = stringify, module.exports.fromHex = function(hexDigest, algorithm, opts) {
            const optString = opts && opts.options && opts.options.length ? "?" + opts.options.join("?") : "";
            return parse(`${algorithm}-${Buffer.from(hexDigest, "hex").toString("base64")}${optString}`, opts);
        }, module.exports.fromData = function(data, opts) {
            const algorithms = (opts = opts || {}).algorithms || [ "sha512" ], optString = opts.options && opts.options.length ? "?" + opts.options.join("?") : "";
            return algorithms.reduce((acc, algo) => {
                const digest = crypto.createHash(algo).update(data).digest("base64"), hash = new Hash(`${algo}-${digest}${optString}`, opts);
                if (hash.algorithm && hash.digest) {
                    const algo = hash.algorithm;
                    acc[algo] || (acc[algo] = []), acc[algo].push(hash);
                }
                return acc;
            }, new Integrity);
        }, module.exports.fromStream = function(stream, opts) {
            const P = (opts = opts || {}).Promise || Promise, istream = integrityStream(opts);
            return new P((resolve, reject) => {
                let sri;
                stream.pipe(istream), stream.on("error", reject), istream.on("error", reject), istream.on("integrity", s => {
                    sri = s;
                }), istream.on("end", () => resolve(sri)), istream.on("data", () => {});
            });
        }, module.exports.checkData = function(data, sri, opts) {
            if (sri = parse(sri, opts = opts || {}), !Object.keys(sri).length) {
                if (opts.error) throw Object.assign(new Error("No valid integrity hashes to check against"), {
                    code: "EINTEGRITY"
                });
                return !1;
            }
            const algorithm = sri.pickAlgorithm(opts), digest = crypto.createHash(algorithm).update(data).digest("base64"), newSri = parse({
                algorithm: algorithm,
                digest: digest
            }), match = newSri.match(sri, opts);
            if (match || !opts.error) return match;
            if ("number" == typeof opts.size && data.length !== opts.size) {
                const err = new Error(`data size mismatch when checking ${sri}.\n  Wanted: ${opts.size}\n  Found: ${data.length}`);
                throw err.code = "EBADSIZE", err.found = data.length, err.expected = opts.size, 
                err.sri = sri, err;
            }
            {
                const err = new Error(`Integrity checksum failed when using ${algorithm}: Wanted ${sri}, but got ${newSri}. (${data.length} bytes)`);
                throw err.code = "EINTEGRITY", err.found = newSri, err.expected = sri, err.algorithm = algorithm, 
                err.sri = sri, err;
            }
        }, module.exports.checkStream = function(stream, sri, opts) {
            const P = (opts = opts || {}).Promise || Promise, checker = integrityStream(Object.assign({}, opts, {
                integrity: sri
            }));
            return new P((resolve, reject) => {
                let sri;
                stream.pipe(checker), stream.on("error", reject), checker.on("error", reject), checker.on("verified", s => {
                    sri = s;
                }), checker.on("end", () => resolve(sri)), checker.on("data", () => {});
            });
        }, module.exports.integrityStream = integrityStream, module.exports.create = function(opts) {
            const algorithms = (opts = opts || {}).algorithms || [ "sha512" ], optString = opts.options && opts.options.length ? "?" + opts.options.join("?") : "", hashes = algorithms.map(crypto.createHash);
            return {
                update: function(chunk, enc) {
                    return hashes.forEach(h => h.update(chunk, enc)), this;
                },
                digest: function(enc) {
                    return algorithms.reduce((acc, algo) => {
                        const digest = hashes.shift().digest("base64"), hash = new Hash(`${algo}-${digest}${optString}`, opts);
                        if (hash.algorithm && hash.digest) {
                            const algo = hash.algorithm;
                            acc[algo] || (acc[algo] = []), acc[algo].push(hash);
                        }
                        return acc;
                    }, new Integrity);
                }
            };
        };
        const NODE_HASHES = new Set(crypto.getHashes()), DEFAULT_PRIORITY = [ "md5", "whirlpool", "sha1", "sha224", "sha256", "sha384", "sha512", "sha3", "sha3-256", "sha3-384", "sha3-512", "sha3_256", "sha3_384", "sha3_512" ].filter(algo => NODE_HASHES.has(algo));
        function getPrioritizedHash(algo1, algo2) {
            return DEFAULT_PRIORITY.indexOf(algo1.toLowerCase()) >= DEFAULT_PRIORITY.indexOf(algo2.toLowerCase()) ? algo1 : algo2;
        }
    }, , , , , function(module, exports, __webpack_require__) {
        module.exports = minimatch, minimatch.Minimatch = Minimatch;
        var path = {
            sep: "/"
        };
        try {
            path = __webpack_require__(0);
        } catch (er) {}
        var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}, expand = __webpack_require__(175), plTypes = {
            "!": {
                open: "(?:(?!(?:",
                close: "))[^/]*?)"
            },
            "?": {
                open: "(?:",
                close: ")?"
            },
            "+": {
                open: "(?:",
                close: ")+"
            },
            "*": {
                open: "(?:",
                close: ")*"
            },
            "@": {
                open: "(?:",
                close: ")"
            }
        }, reSpecials = "().*{}+?[]^$\\!".split("").reduce((function(set, c) {
            return set[c] = !0, set;
        }), {});
        var slashSplit = /\/+/;
        function ext(a, b) {
            a = a || {}, b = b || {};
            var t = {};
            return Object.keys(b).forEach((function(k) {
                t[k] = b[k];
            })), Object.keys(a).forEach((function(k) {
                t[k] = a[k];
            })), t;
        }
        function minimatch(p, pattern, options) {
            if ("string" != typeof pattern) throw new TypeError("glob pattern string required");
            return options || (options = {}), !(!options.nocomment && "#" === pattern.charAt(0)) && ("" === pattern.trim() ? "" === p : new Minimatch(pattern, options).match(p));
        }
        function Minimatch(pattern, options) {
            if (!(this instanceof Minimatch)) return new Minimatch(pattern, options);
            if ("string" != typeof pattern) throw new TypeError("glob pattern string required");
            options || (options = {}), pattern = pattern.trim(), "/" !== path.sep && (pattern = pattern.split(path.sep).join("/")), 
            this.options = options, this.set = [], this.pattern = pattern, this.regexp = null, 
            this.negate = !1, this.comment = !1, this.empty = !1, this.make();
        }
        function braceExpand(pattern, options) {
            if (options || (options = this instanceof Minimatch ? this.options : {}), void 0 === (pattern = void 0 === pattern ? this.pattern : pattern)) throw new TypeError("undefined pattern");
            return options.nobrace || !pattern.match(/\{.*\}/) ? [ pattern ] : expand(pattern);
        }
        minimatch.filter = function(pattern, options) {
            return options = options || {}, function(p, i, list) {
                return minimatch(p, pattern, options);
            };
        }, minimatch.defaults = function(def) {
            if (!def || !Object.keys(def).length) return minimatch;
            var orig = minimatch, m = function(p, pattern, options) {
                return orig.minimatch(p, pattern, ext(def, options));
            };
            return m.Minimatch = function(pattern, options) {
                return new orig.Minimatch(pattern, ext(def, options));
            }, m;
        }, Minimatch.defaults = function(def) {
            return def && Object.keys(def).length ? minimatch.defaults(def).Minimatch : Minimatch;
        }, Minimatch.prototype.debug = function() {}, Minimatch.prototype.make = function() {
            if (this._made) return;
            var pattern = this.pattern, options = this.options;
            if (!options.nocomment && "#" === pattern.charAt(0)) return void (this.comment = !0);
            if (!pattern) return void (this.empty = !0);
            this.parseNegate();
            var set = this.globSet = this.braceExpand();
            options.debug && (this.debug = console.error);
            this.debug(this.pattern, set), set = this.globParts = set.map((function(s) {
                return s.split(slashSplit);
            })), this.debug(this.pattern, set), set = set.map((function(s, si, set) {
                return s.map(this.parse, this);
            }), this), this.debug(this.pattern, set), set = set.filter((function(s) {
                return -1 === s.indexOf(!1);
            })), this.debug(this.pattern, set), this.set = set;
        }, Minimatch.prototype.parseNegate = function() {
            var pattern = this.pattern, negate = !1, options = this.options, negateOffset = 0;
            if (options.nonegate) return;
            for (var i = 0, l = pattern.length; i < l && "!" === pattern.charAt(i); i++) negate = !negate, 
            negateOffset++;
            negateOffset && (this.pattern = pattern.substr(negateOffset));
            this.negate = negate;
        }, minimatch.braceExpand = function(pattern, options) {
            return braceExpand(pattern, options);
        }, Minimatch.prototype.braceExpand = braceExpand, Minimatch.prototype.parse = function(pattern, isSub) {
            if (pattern.length > 65536) throw new TypeError("pattern is too long");
            var options = this.options;
            if (!options.noglobstar && "**" === pattern) return GLOBSTAR;
            if ("" === pattern) return "";
            var stateChar, re = "", hasMagic = !!options.nocase, escaping = !1, patternListStack = [], negativeLists = [], inClass = !1, reClassStart = -1, classStart = -1, patternStart = "." === pattern.charAt(0) ? "" : options.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)", self = this;
            function clearStateChar() {
                if (stateChar) {
                    switch (stateChar) {
                      case "*":
                        re += "[^/]*?", hasMagic = !0;
                        break;

                      case "?":
                        re += "[^/]", hasMagic = !0;
                        break;

                      default:
                        re += "\\" + stateChar;
                    }
                    self.debug("clearStateChar %j %j", stateChar, re), stateChar = !1;
                }
            }
            for (var c, i = 0, len = pattern.length; i < len && (c = pattern.charAt(i)); i++) if (this.debug("%s\t%s %s %j", pattern, i, re, c), 
            escaping && reSpecials[c]) re += "\\" + c, escaping = !1; else switch (c) {
              case "/":
                return !1;

              case "\\":
                clearStateChar(), escaping = !0;
                continue;

              case "?":
              case "*":
              case "+":
              case "@":
              case "!":
                if (this.debug("%s\t%s %s %j <-- stateChar", pattern, i, re, c), inClass) {
                    this.debug("  in class"), "!" === c && i === classStart + 1 && (c = "^"), re += c;
                    continue;
                }
                self.debug("call clearStateChar %j", stateChar), clearStateChar(), stateChar = c, 
                options.noext && clearStateChar();
                continue;

              case "(":
                if (inClass) {
                    re += "(";
                    continue;
                }
                if (!stateChar) {
                    re += "\\(";
                    continue;
                }
                patternListStack.push({
                    type: stateChar,
                    start: i - 1,
                    reStart: re.length,
                    open: plTypes[stateChar].open,
                    close: plTypes[stateChar].close
                }), re += "!" === stateChar ? "(?:(?!(?:" : "(?:", this.debug("plType %j %j", stateChar, re), 
                stateChar = !1;
                continue;

              case ")":
                if (inClass || !patternListStack.length) {
                    re += "\\)";
                    continue;
                }
                clearStateChar(), hasMagic = !0;
                var pl = patternListStack.pop();
                re += pl.close, "!" === pl.type && negativeLists.push(pl), pl.reEnd = re.length;
                continue;

              case "|":
                if (inClass || !patternListStack.length || escaping) {
                    re += "\\|", escaping = !1;
                    continue;
                }
                clearStateChar(), re += "|";
                continue;

              case "[":
                if (clearStateChar(), inClass) {
                    re += "\\" + c;
                    continue;
                }
                inClass = !0, classStart = i, reClassStart = re.length, re += c;
                continue;

              case "]":
                if (i === classStart + 1 || !inClass) {
                    re += "\\" + c, escaping = !1;
                    continue;
                }
                if (inClass) {
                    var cs = pattern.substring(classStart + 1, i);
                    try {
                        RegExp("[" + cs + "]");
                    } catch (er) {
                        var sp = this.parse(cs, SUBPARSE);
                        re = re.substr(0, reClassStart) + "\\[" + sp[0] + "\\]", hasMagic = hasMagic || sp[1], 
                        inClass = !1;
                        continue;
                    }
                }
                hasMagic = !0, inClass = !1, re += c;
                continue;

              default:
                clearStateChar(), escaping ? escaping = !1 : !reSpecials[c] || "^" === c && inClass || (re += "\\"), 
                re += c;
            }
            inClass && (cs = pattern.substr(classStart + 1), sp = this.parse(cs, SUBPARSE), 
            re = re.substr(0, reClassStart) + "\\[" + sp[0], hasMagic = hasMagic || sp[1]);
            for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
                var tail = re.slice(pl.reStart + pl.open.length);
                this.debug("setting tail", re, pl), tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, (function(_, $1, $2) {
                    return $2 || ($2 = "\\"), $1 + $1 + $2 + "|";
                })), this.debug("tail=%j\n   %s", tail, tail, pl, re);
                var t = "*" === pl.type ? "[^/]*?" : "?" === pl.type ? "[^/]" : "\\" + pl.type;
                hasMagic = !0, re = re.slice(0, pl.reStart) + t + "\\(" + tail;
            }
            clearStateChar(), escaping && (re += "\\\\");
            var addPatternStart = !1;
            switch (re.charAt(0)) {
              case ".":
              case "[":
              case "(":
                addPatternStart = !0;
            }
            for (var n = negativeLists.length - 1; n > -1; n--) {
                var nl = negativeLists[n], nlBefore = re.slice(0, nl.reStart), nlFirst = re.slice(nl.reStart, nl.reEnd - 8), nlLast = re.slice(nl.reEnd - 8, nl.reEnd), nlAfter = re.slice(nl.reEnd);
                nlLast += nlAfter;
                var openParensBefore = nlBefore.split("(").length - 1, cleanAfter = nlAfter;
                for (i = 0; i < openParensBefore; i++) cleanAfter = cleanAfter.replace(/\)[+*?]?/, "");
                var dollar = "";
                "" === (nlAfter = cleanAfter) && isSub !== SUBPARSE && (dollar = "$"), re = nlBefore + nlFirst + nlAfter + dollar + nlLast;
            }
            "" !== re && hasMagic && (re = "(?=.)" + re);
            addPatternStart && (re = patternStart + re);
            if (isSub === SUBPARSE) return [ re, hasMagic ];
            if (!hasMagic) return function(s) {
                return s.replace(/\\(.)/g, "$1");
            }(pattern);
            var flags = options.nocase ? "i" : "";
            try {
                var regExp = new RegExp("^" + re + "$", flags);
            } catch (er) {
                return new RegExp("$.");
            }
            return regExp._glob = pattern, regExp._src = re, regExp;
        };
        var SUBPARSE = {};
        minimatch.makeRe = function(pattern, options) {
            return new Minimatch(pattern, options || {}).makeRe();
        }, Minimatch.prototype.makeRe = function() {
            if (this.regexp || !1 === this.regexp) return this.regexp;
            var set = this.set;
            if (!set.length) return this.regexp = !1, this.regexp;
            var options = this.options, twoStar = options.noglobstar ? "[^/]*?" : options.dot ? "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?" : "(?:(?!(?:\\/|^)\\.).)*?", flags = options.nocase ? "i" : "", re = set.map((function(pattern) {
                return pattern.map((function(p) {
                    return p === GLOBSTAR ? twoStar : "string" == typeof p ? function(s) {
                        return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                    }(p) : p._src;
                })).join("\\/");
            })).join("|");
            re = "^(?:" + re + ")$", this.negate && (re = "^(?!" + re + ").*$");
            try {
                this.regexp = new RegExp(re, flags);
            } catch (ex) {
                this.regexp = !1;
            }
            return this.regexp;
        }, minimatch.match = function(list, pattern, options) {
            var mm = new Minimatch(pattern, options = options || {});
            return list = list.filter((function(f) {
                return mm.match(f);
            })), mm.options.nonull && !list.length && list.push(pattern), list;
        }, Minimatch.prototype.match = function(f, partial) {
            if (this.debug("match", f, this.pattern), this.comment) return !1;
            if (this.empty) return "" === f;
            if ("/" === f && partial) return !0;
            var options = this.options;
            "/" !== path.sep && (f = f.split(path.sep).join("/"));
            f = f.split(slashSplit), this.debug(this.pattern, "split", f);
            var filename, i, set = this.set;
            for (this.debug(this.pattern, "set", set), i = f.length - 1; i >= 0 && !(filename = f[i]); i--) ;
            for (i = 0; i < set.length; i++) {
                var pattern = set[i], file = f;
                if (options.matchBase && 1 === pattern.length && (file = [ filename ]), this.matchOne(file, pattern, partial)) return !!options.flipNegate || !this.negate;
            }
            return !options.flipNegate && this.negate;
        }, Minimatch.prototype.matchOne = function(file, pattern, partial) {
            var options = this.options;
            this.debug("matchOne", {
                this: this,
                file: file,
                pattern: pattern
            }), this.debug("matchOne", file.length, pattern.length);
            for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, 
            pi++) {
                this.debug("matchOne loop");
                var hit, p = pattern[pi], f = file[fi];
                if (this.debug(pattern, p, f), !1 === p) return !1;
                if (p === GLOBSTAR) {
                    this.debug("GLOBSTAR", [ pattern, p, f ]);
                    var fr = fi, pr = pi + 1;
                    if (pr === pl) {
                        for (this.debug("** at the end"); fi < fl; fi++) if ("." === file[fi] || ".." === file[fi] || !options.dot && "." === file[fi].charAt(0)) return !1;
                        return !0;
                    }
                    for (;fr < fl; ) {
                        var swallowee = file[fr];
                        if (this.debug("\nglobstar while", file, fr, pattern, pr, swallowee), this.matchOne(file.slice(fr), pattern.slice(pr), partial)) return this.debug("globstar found match!", fr, fl, swallowee), 
                        !0;
                        if ("." === swallowee || ".." === swallowee || !options.dot && "." === swallowee.charAt(0)) {
                            this.debug("dot detected!", file, fr, pattern, pr);
                            break;
                        }
                        this.debug("globstar swallow a segment, and continue"), fr++;
                    }
                    return !(!partial || (this.debug("\n>>> no match, partial?", file, fr, pattern, pr), 
                    fr !== fl));
                }
                if ("string" == typeof p ? (hit = options.nocase ? f.toLowerCase() === p.toLowerCase() : f === p, 
                this.debug("string match", p, f, hit)) : (hit = f.match(p), this.debug("pattern match", p, f, hit)), 
                !hit) return !1;
            }
            if (fi === fl && pi === pl) return !0;
            if (fi === fl) return partial;
            if (pi === pl) return fi === fl - 1 && "" === file[fi];
            throw new Error("wtf?");
        };
    }, function(module, exports, __webpack_require__) {
        var wrappy = __webpack_require__(123);
        function once(fn) {
            var f = function f() {
                return f.called ? f.value : (f.called = !0, f.value = fn.apply(this, arguments));
            };
            return f.called = !1, f;
        }
        function onceStrict(fn) {
            var f = function f() {
                if (f.called) throw new Error(f.onceError);
                return f.called = !0, f.value = fn.apply(this, arguments);
            }, name = fn.name || "Function wrapped with `once`";
            return f.onceError = name + " shouldn't be called more than once", f.called = !1, 
            f;
        }
        module.exports = wrappy(once), module.exports.strict = wrappy(onceStrict), once.proto = once((function() {
            Object.defineProperty(Function.prototype, "once", {
                value: function() {
                    return once(this);
                },
                configurable: !0
            }), Object.defineProperty(Function.prototype, "onceStrict", {
                value: function() {
                    return onceStrict(this);
                },
                configurable: !0
            });
        }));
    }, , function(module, exports) {
        module.exports = __webpack_require__(32);
    }, , , , function(module, exports) {
        module.exports = function(it) {
            if (null == it) throw TypeError("Can't call method on  " + it);
            return it;
        };
    }, function(module, exports, __webpack_require__) {
        var isObject = __webpack_require__(34), document = __webpack_require__(11).document, is = isObject(document) && isObject(document.createElement);
        module.exports = function(it) {
            return is ? document.createElement(it) : {};
        };
    }, function(module, exports) {
        module.exports = !0;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var aFunction = __webpack_require__(46);
        function PromiseCapability(C) {
            var resolve, reject;
            this.promise = new C((function($$resolve, $$reject) {
                if (void 0 !== resolve || void 0 !== reject) throw TypeError("Bad Promise constructor");
                resolve = $$resolve, reject = $$reject;
            })), this.resolve = aFunction(resolve), this.reject = aFunction(reject);
        }
        module.exports.f = function(C) {
            return new PromiseCapability(C);
        };
    }, function(module, exports, __webpack_require__) {
        var def = __webpack_require__(50).f, has = __webpack_require__(49), TAG = __webpack_require__(13)("toStringTag");
        module.exports = function(it, tag, stat) {
            it && !has(it = stat ? it : it.prototype, TAG) && def(it, TAG, {
                configurable: !0,
                value: tag
            });
        };
    }, function(module, exports, __webpack_require__) {
        var shared = __webpack_require__(107)("keys"), uid = __webpack_require__(111);
        module.exports = function(key) {
            return shared[key] || (shared[key] = uid(key));
        };
    }, function(module, exports) {
        var ceil = Math.ceil, floor = Math.floor;
        module.exports = function(it) {
            return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
        };
    }, function(module, exports, __webpack_require__) {
        var IObject = __webpack_require__(131), defined = __webpack_require__(67);
        module.exports = function(it) {
            return IObject(defined(it));
        };
    }, function(module, exports, __webpack_require__) {
        module.exports = glob;
        var fs = __webpack_require__(3), rp = __webpack_require__(114), minimatch = __webpack_require__(60), inherits = (minimatch.Minimatch, 
        __webpack_require__(42)), EE = __webpack_require__(54).EventEmitter, path = __webpack_require__(0), assert = __webpack_require__(22), isAbsolute = __webpack_require__(76), globSync = __webpack_require__(218), common = __webpack_require__(115), setopts = (common.alphasort, 
        common.alphasorti, common.setopts), ownProp = common.ownProp, inflight = __webpack_require__(223), childrenIgnored = (__webpack_require__(2), 
        common.childrenIgnored), isIgnored = common.isIgnored, once = __webpack_require__(61);
        function glob(pattern, options, cb) {
            if ("function" == typeof options && (cb = options, options = {}), options || (options = {}), 
            options.sync) {
                if (cb) throw new TypeError("callback provided to sync glob");
                return globSync(pattern, options);
            }
            return new Glob(pattern, options, cb);
        }
        glob.sync = globSync;
        var GlobSync = glob.GlobSync = globSync.GlobSync;
        function Glob(pattern, options, cb) {
            if ("function" == typeof options && (cb = options, options = null), options && options.sync) {
                if (cb) throw new TypeError("callback provided to sync glob");
                return new GlobSync(pattern, options);
            }
            if (!(this instanceof Glob)) return new Glob(pattern, options, cb);
            setopts(this, pattern, options), this._didRealPath = !1;
            var n = this.minimatch.set.length;
            this.matches = new Array(n), "function" == typeof cb && (cb = once(cb), this.on("error", cb), 
            this.on("end", (function(matches) {
                cb(null, matches);
            })));
            var self = this;
            if (this._processing = 0, this._emitQueue = [], this._processQueue = [], this.paused = !1, 
            this.noprocess) return this;
            if (0 === n) return done();
            for (var i = 0; i < n; i++) this._process(this.minimatch.set[i], i, !1, done);
            function done() {
                --self._processing, self._processing <= 0 && self._finish();
            }
        }
        glob.glob = glob, glob.hasMagic = function(pattern, options_) {
            var options = function(origin, add) {
                if (null === add || "object" != typeof add) return origin;
                for (var keys = Object.keys(add), i = keys.length; i--; ) origin[keys[i]] = add[keys[i]];
                return origin;
            }({}, options_);
            options.noprocess = !0;
            var set = new Glob(pattern, options).minimatch.set;
            if (!pattern) return !1;
            if (set.length > 1) return !0;
            for (var j = 0; j < set[0].length; j++) if ("string" != typeof set[0][j]) return !0;
            return !1;
        }, glob.Glob = Glob, inherits(Glob, EE), Glob.prototype._finish = function() {
            if (assert(this instanceof Glob), !this.aborted) {
                if (this.realpath && !this._didRealpath) return this._realpath();
                common.finish(this), this.emit("end", this.found);
            }
        }, Glob.prototype._realpath = function() {
            if (!this._didRealpath) {
                this._didRealpath = !0;
                var n = this.matches.length;
                if (0 === n) return this._finish();
                for (var self = this, i = 0; i < this.matches.length; i++) this._realpathSet(i, next);
            }
            function next() {
                0 == --n && self._finish();
            }
        }, Glob.prototype._realpathSet = function(index, cb) {
            var matchset = this.matches[index];
            if (!matchset) return cb();
            var found = Object.keys(matchset), self = this, n = found.length;
            if (0 === n) return cb();
            var set = this.matches[index] = Object.create(null);
            found.forEach((function(p, i) {
                p = self._makeAbs(p), rp.realpath(p, self.realpathCache, (function(er, real) {
                    er ? "stat" === er.syscall ? set[p] = !0 : self.emit("error", er) : set[real] = !0, 
                    0 == --n && (self.matches[index] = set, cb());
                }));
            }));
        }, Glob.prototype._mark = function(p) {
            return common.mark(this, p);
        }, Glob.prototype._makeAbs = function(f) {
            return common.makeAbs(this, f);
        }, Glob.prototype.abort = function() {
            this.aborted = !0, this.emit("abort");
        }, Glob.prototype.pause = function() {
            this.paused || (this.paused = !0, this.emit("pause"));
        }, Glob.prototype.resume = function() {
            if (this.paused) {
                if (this.emit("resume"), this.paused = !1, this._emitQueue.length) {
                    var eq = this._emitQueue.slice(0);
                    this._emitQueue.length = 0;
                    for (var i = 0; i < eq.length; i++) {
                        var e = eq[i];
                        this._emitMatch(e[0], e[1]);
                    }
                }
                if (this._processQueue.length) {
                    var pq = this._processQueue.slice(0);
                    this._processQueue.length = 0;
                    for (i = 0; i < pq.length; i++) {
                        var p = pq[i];
                        this._processing--, this._process(p[0], p[1], p[2], p[3]);
                    }
                }
            }
        }, Glob.prototype._process = function(pattern, index, inGlobStar, cb) {
            if (assert(this instanceof Glob), assert("function" == typeof cb), !this.aborted) if (this._processing++, 
            this.paused) this._processQueue.push([ pattern, index, inGlobStar, cb ]); else {
                for (var prefix, n = 0; "string" == typeof pattern[n]; ) n++;
                switch (n) {
                  case pattern.length:
                    return void this._processSimple(pattern.join("/"), index, cb);

                  case 0:
                    prefix = null;
                    break;

                  default:
                    prefix = pattern.slice(0, n).join("/");
                }
                var read, remain = pattern.slice(n);
                null === prefix ? read = "." : isAbsolute(prefix) || isAbsolute(pattern.join("/")) ? (prefix && isAbsolute(prefix) || (prefix = "/" + prefix), 
                read = prefix) : read = prefix;
                var abs = this._makeAbs(read);
                if (childrenIgnored(this, read)) return cb();
                remain[0] === minimatch.GLOBSTAR ? this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb) : this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
            }
        }, Glob.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar, cb) {
            var self = this;
            this._readdir(abs, inGlobStar, (function(er, entries) {
                return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
            }));
        }, Glob.prototype._processReaddir2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
            if (!entries) return cb();
            for (var pn = remain[0], negate = !!this.minimatch.negate, rawGlob = pn._glob, dotOk = this.dot || "." === rawGlob.charAt(0), matchedEntries = [], i = 0; i < entries.length; i++) {
                if ("." !== (e = entries[i]).charAt(0) || dotOk) (negate && !prefix ? !e.match(pn) : e.match(pn)) && matchedEntries.push(e);
            }
            var len = matchedEntries.length;
            if (0 === len) return cb();
            if (1 === remain.length && !this.mark && !this.stat) {
                this.matches[index] || (this.matches[index] = Object.create(null));
                for (i = 0; i < len; i++) {
                    var e = matchedEntries[i];
                    prefix && (e = "/" !== prefix ? prefix + "/" + e : prefix + e), "/" !== e.charAt(0) || this.nomount || (e = path.join(this.root, e)), 
                    this._emitMatch(index, e);
                }
                return cb();
            }
            remain.shift();
            for (i = 0; i < len; i++) {
                e = matchedEntries[i];
                prefix && (e = "/" !== prefix ? prefix + "/" + e : prefix + e), this._process([ e ].concat(remain), index, inGlobStar, cb);
            }
            cb();
        }, Glob.prototype._emitMatch = function(index, e) {
            if (!this.aborted && !isIgnored(this, e)) if (this.paused) this._emitQueue.push([ index, e ]); else {
                var abs = isAbsolute(e) ? e : this._makeAbs(e);
                if (this.mark && (e = this._mark(e)), this.absolute && (e = abs), !this.matches[index][e]) {
                    if (this.nodir) {
                        var c = this.cache[abs];
                        if ("DIR" === c || Array.isArray(c)) return;
                    }
                    this.matches[index][e] = !0;
                    var st = this.statCache[abs];
                    st && this.emit("stat", e, st), this.emit("match", e);
                }
            }
        }, Glob.prototype._readdirInGlobStar = function(abs, cb) {
            if (!this.aborted) {
                if (this.follow) return this._readdir(abs, !1, cb);
                var self = this, lstatcb = inflight("lstat\0" + abs, (function(er, lstat) {
                    if (er && "ENOENT" === er.code) return cb();
                    var isSym = lstat && lstat.isSymbolicLink();
                    self.symlinks[abs] = isSym, isSym || !lstat || lstat.isDirectory() ? self._readdir(abs, !1, cb) : (self.cache[abs] = "FILE", 
                    cb());
                }));
                lstatcb && fs.lstat(abs, lstatcb);
            }
        }, Glob.prototype._readdir = function(abs, inGlobStar, cb) {
            if (!this.aborted && (cb = inflight("readdir\0" + abs + "\0" + inGlobStar, cb))) {
                if (inGlobStar && !ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs, cb);
                if (ownProp(this.cache, abs)) {
                    var c = this.cache[abs];
                    if (!c || "FILE" === c) return cb();
                    if (Array.isArray(c)) return cb(null, c);
                }
                fs.readdir(abs, function(self, abs, cb) {
                    return function(er, entries) {
                        er ? self._readdirError(abs, er, cb) : self._readdirEntries(abs, entries, cb);
                    };
                }(this, abs, cb));
            }
        }, Glob.prototype._readdirEntries = function(abs, entries, cb) {
            if (!this.aborted) {
                if (!this.mark && !this.stat) for (var i = 0; i < entries.length; i++) {
                    var e = entries[i];
                    e = "/" === abs ? abs + e : abs + "/" + e, this.cache[e] = !0;
                }
                return this.cache[abs] = entries, cb(null, entries);
            }
        }, Glob.prototype._readdirError = function(f, er, cb) {
            if (!this.aborted) {
                switch (er.code) {
                  case "ENOTSUP":
                  case "ENOTDIR":
                    var abs = this._makeAbs(f);
                    if (this.cache[abs] = "FILE", abs === this.cwdAbs) {
                        var error = new Error(er.code + " invalid cwd " + this.cwd);
                        error.path = this.cwd, error.code = er.code, this.emit("error", error), this.abort();
                    }
                    break;

                  case "ENOENT":
                  case "ELOOP":
                  case "ENAMETOOLONG":
                  case "UNKNOWN":
                    this.cache[this._makeAbs(f)] = !1;
                    break;

                  default:
                    this.cache[this._makeAbs(f)] = !1, this.strict && (this.emit("error", er), this.abort()), 
                    this.silent || console.error("glob error", er);
                }
                return cb();
            }
        }, Glob.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar, cb) {
            var self = this;
            this._readdir(abs, inGlobStar, (function(er, entries) {
                self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
            }));
        }, Glob.prototype._processGlobStar2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
            if (!entries) return cb();
            var remainWithoutGlobStar = remain.slice(1), gspref = prefix ? [ prefix ] : [], noGlobStar = gspref.concat(remainWithoutGlobStar);
            this._process(noGlobStar, index, !1, cb);
            var isSym = this.symlinks[abs], len = entries.length;
            if (isSym && inGlobStar) return cb();
            for (var i = 0; i < len; i++) {
                if ("." !== entries[i].charAt(0) || this.dot) {
                    var instead = gspref.concat(entries[i], remainWithoutGlobStar);
                    this._process(instead, index, !0, cb);
                    var below = gspref.concat(entries[i], remain);
                    this._process(below, index, !0, cb);
                }
            }
            cb();
        }, Glob.prototype._processSimple = function(prefix, index, cb) {
            var self = this;
            this._stat(prefix, (function(er, exists) {
                self._processSimple2(prefix, index, er, exists, cb);
            }));
        }, Glob.prototype._processSimple2 = function(prefix, index, er, exists, cb) {
            if (this.matches[index] || (this.matches[index] = Object.create(null)), !exists) return cb();
            if (prefix && isAbsolute(prefix) && !this.nomount) {
                var trail = /[\/\\]$/.test(prefix);
                "/" === prefix.charAt(0) ? prefix = path.join(this.root, prefix) : (prefix = path.resolve(this.root, prefix), 
                trail && (prefix += "/"));
            }
            "win32" === process.platform && (prefix = prefix.replace(/\\/g, "/")), this._emitMatch(index, prefix), 
            cb();
        }, Glob.prototype._stat = function(f, cb) {
            var abs = this._makeAbs(f), needDir = "/" === f.slice(-1);
            if (f.length > this.maxLength) return cb();
            if (!this.stat && ownProp(this.cache, abs)) {
                var c = this.cache[abs];
                if (Array.isArray(c) && (c = "DIR"), !needDir || "DIR" === c) return cb(null, c);
                if (needDir && "FILE" === c) return cb();
            }
            var stat = this.statCache[abs];
            if (void 0 !== stat) {
                if (!1 === stat) return cb(null, stat);
                var type = stat.isDirectory() ? "DIR" : "FILE";
                return needDir && "FILE" === type ? cb() : cb(null, type, stat);
            }
            var self = this, statcb = inflight("stat\0" + abs, (function(er, lstat) {
                if (lstat && lstat.isSymbolicLink()) return fs.stat(abs, (function(er, stat) {
                    er ? self._stat2(f, abs, null, lstat, cb) : self._stat2(f, abs, er, stat, cb);
                }));
                self._stat2(f, abs, er, lstat, cb);
            }));
            statcb && fs.lstat(abs, statcb);
        }, Glob.prototype._stat2 = function(f, abs, er, stat, cb) {
            if (er && ("ENOENT" === er.code || "ENOTDIR" === er.code)) return this.statCache[abs] = !1, 
            cb();
            var needDir = "/" === f.slice(-1);
            if (this.statCache[abs] = stat, "/" === abs.slice(-1) && stat && !stat.isDirectory()) return cb(null, !1, stat);
            var c = !0;
            return stat && (c = stat.isDirectory() ? "DIR" : "FILE"), this.cache[abs] = this.cache[abs] || c, 
            needDir && "FILE" === c ? cb() : cb(null, c, stat);
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function posix(path) {
            return "/" === path.charAt(0);
        }
        function win32(path) {
            var result = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/.exec(path), device = result[1] || "", isUnc = Boolean(device && ":" !== device.charAt(1));
            return Boolean(result[2] || isUnc);
        }
        module.exports = "win32" === process.platform ? win32 : posix, module.exports.posix = posix, 
        module.exports.win32 = win32;
    }, , , function(module, exports) {
        module.exports = __webpack_require__(33);
    }, , function(module, exports, __webpack_require__) {
        "use strict";
        var _util, _invariant, _stripBom, _constants, _errors, _map;
        function _load_invariant() {
            return _invariant = _interopRequireDefault(__webpack_require__(7));
        }
        function _load_constants() {
            return _constants = __webpack_require__(6);
        }
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.default = function(str, fileLoc = "lockfile") {
            return function(str) {
                return str.includes("<<<<<<<") && str.includes("=======") && str.includes(">>>>>>>");
            }(str = (0, (_stripBom || (_stripBom = _interopRequireDefault(__webpack_require__(122)))).default)(str)) ? function(str, fileLoc) {
                const variants = function(str) {
                    const variants = [ [], [] ], lines = str.split(/\r?\n/g);
                    let skip = !1;
                    for (;lines.length; ) {
                        const line = lines.shift();
                        if (line.startsWith("<<<<<<<")) {
                            for (;lines.length; ) {
                                const conflictLine = lines.shift();
                                if ("=======" === conflictLine) {
                                    skip = !1;
                                    break;
                                }
                                skip || conflictLine.startsWith("|||||||") ? skip = !0 : variants[0].push(conflictLine);
                            }
                            for (;lines.length; ) {
                                const conflictLine = lines.shift();
                                if (conflictLine.startsWith(">>>>>>>")) break;
                                variants[1].push(conflictLine);
                            }
                        } else variants[0].push(line), variants[1].push(line);
                    }
                    return [ variants[0].join("\n"), variants[1].join("\n") ];
                }(str);
                try {
                    return {
                        type: "merge",
                        object: Object.assign({}, parse(variants[0], fileLoc), parse(variants[1], fileLoc))
                    };
                } catch (err) {
                    if (err instanceof SyntaxError) return {
                        type: "conflict",
                        object: {}
                    };
                    throw err;
                }
            }(str, fileLoc) : {
                type: "success",
                object: parse(str, fileLoc)
            };
        };
        const VERSION_REGEX = /^yarn lockfile v(\d+)$/, TOKEN_TYPES_boolean = "BOOLEAN", TOKEN_TYPES_string = "STRING", TOKEN_TYPES_eof = "EOF", TOKEN_TYPES_colon = "COLON", TOKEN_TYPES_newline = "NEWLINE", TOKEN_TYPES_comment = "COMMENT", TOKEN_TYPES_indent = "INDENT", TOKEN_TYPES_invalid = "INVALID", TOKEN_TYPES_number = "NUMBER", TOKEN_TYPES_comma = "COMMA", VALID_PROP_VALUE_TOKENS = [ TOKEN_TYPES_boolean, TOKEN_TYPES_string, TOKEN_TYPES_number ];
        class Parser {
            constructor(input, fileLoc = "lockfile") {
                this.comments = [], this.tokens = function*(input) {
                    let lastNewline = !1, line = 1, col = 0;
                    function buildToken(type, value) {
                        return {
                            line: line,
                            col: col,
                            type: type,
                            value: value
                        };
                    }
                    for (;input.length; ) {
                        let chop = 0;
                        if ("\n" === input[0] || "\r" === input[0]) chop++, "\n" === input[1] && chop++, 
                        line++, col = 0, yield buildToken(TOKEN_TYPES_newline); else if ("#" === input[0]) {
                            chop++;
                            let val = "";
                            for (;"\n" !== input[chop]; ) val += input[chop], chop++;
                            yield buildToken(TOKEN_TYPES_comment, val);
                        } else if (" " === input[0]) if (lastNewline) {
                            let indent = "";
                            for (let i = 0; " " === input[i]; i++) indent += input[i];
                            if (indent.length % 2) throw new TypeError("Invalid number of spaces");
                            chop = indent.length, yield buildToken(TOKEN_TYPES_indent, indent.length / 2);
                        } else chop++; else if ('"' === input[0]) {
                            let val = "";
                            for (let i = 0; ;i++) {
                                const currentChar = input[i];
                                if (val += currentChar, i > 0 && '"' === currentChar) {
                                    if (!("\\" === input[i - 1] && "\\" !== input[i - 2])) break;
                                }
                            }
                            chop = val.length;
                            try {
                                yield buildToken(TOKEN_TYPES_string, JSON.parse(val));
                            } catch (err) {
                                if (!(err instanceof SyntaxError)) throw err;
                                yield buildToken(TOKEN_TYPES_invalid);
                            }
                        } else if (/^[0-9]/.test(input)) {
                            let val = "";
                            for (let i = 0; /^[0-9]$/.test(input[i]); i++) val += input[i];
                            chop = val.length, yield buildToken(TOKEN_TYPES_number, +val);
                        } else if (/^true/.test(input)) yield buildToken(TOKEN_TYPES_boolean, !0), chop = 4; else if (/^false/.test(input)) yield buildToken(TOKEN_TYPES_boolean, !1), 
                        chop = 5; else if (":" === input[0]) yield buildToken(TOKEN_TYPES_colon), chop++; else if ("," === input[0]) yield buildToken(TOKEN_TYPES_comma), 
                        chop++; else if (/^[a-zA-Z\/-]/g.test(input)) {
                            let name = "";
                            for (let i = 0; i < input.length; i++) {
                                const char = input[i];
                                if (":" === char || " " === char || "\n" === char || "\r" === char || "," === char) break;
                                name += char;
                            }
                            chop = name.length, yield buildToken(TOKEN_TYPES_string, name);
                        } else yield buildToken(TOKEN_TYPES_invalid);
                        chop || (yield buildToken(TOKEN_TYPES_invalid)), col += chop, lastNewline = "\n" === input[0] || "\r" === input[0] && "\n" === input[1], 
                        input = input.slice(chop);
                    }
                    yield buildToken(TOKEN_TYPES_eof);
                }(input), this.fileLoc = fileLoc;
            }
            onComment(token) {
                const value = token.value;
                (0, (_invariant || _load_invariant()).default)("string" == typeof value, "expected token value to be a string");
                const comment = value.trim(), versionMatch = comment.match(VERSION_REGEX);
                if (versionMatch) {
                    const version = +versionMatch[1];
                    if (version > (_constants || _load_constants()).LOCKFILE_VERSION) throw new ((_errors || (_errors = __webpack_require__(4))).MessageError)(`Can't install from a lockfile of version ${version} as you're on an old yarn version that only supports versions up to ${(_constants || _load_constants()).LOCKFILE_VERSION}. Run \`$ yarn self-update\` to upgrade to the latest version.`);
                }
                this.comments.push(comment);
            }
            next() {
                const item = this.tokens.next();
                (0, (_invariant || _load_invariant()).default)(item, "expected a token");
                const done = item.done, value = item.value;
                if (done || !value) throw new Error("No more tokens");
                return value.type === TOKEN_TYPES_comment ? (this.onComment(value), this.next()) : this.token = value;
            }
            unexpected(msg = "Unexpected token") {
                throw new SyntaxError(`${msg} ${this.token.line}:${this.token.col} in ${this.fileLoc}`);
            }
            expect(tokType) {
                this.token.type === tokType ? this.next() : this.unexpected();
            }
            eat(tokType) {
                return this.token.type === tokType && (this.next(), !0);
            }
            parse(indent = 0) {
                const obj = (0, (_map || (_map = _interopRequireDefault(__webpack_require__(20)))).default)();
                for (;;) {
                    const propToken = this.token;
                    if (propToken.type === TOKEN_TYPES_newline) {
                        const nextToken = this.next();
                        if (!indent) continue;
                        if (nextToken.type !== TOKEN_TYPES_indent) break;
                        if (nextToken.value !== indent) break;
                        this.next();
                    } else if (propToken.type === TOKEN_TYPES_indent) {
                        if (propToken.value !== indent) break;
                        this.next();
                    } else {
                        if (propToken.type === TOKEN_TYPES_eof) break;
                        if (propToken.type === TOKEN_TYPES_string) {
                            const key = propToken.value;
                            (0, (_invariant || _load_invariant()).default)(key, "Expected a key");
                            const keys = [ key ];
                            for (this.next(); this.token.type === TOKEN_TYPES_comma; ) {
                                this.next();
                                const keyToken = this.token;
                                keyToken.type !== TOKEN_TYPES_string && this.unexpected("Expected string");
                                const key = keyToken.value;
                                (0, (_invariant || _load_invariant()).default)(key, "Expected a key"), keys.push(key), 
                                this.next();
                            }
                            const valToken = this.token;
                            if (valToken.type === TOKEN_TYPES_colon) {
                                this.next();
                                const val = this.parse(indent + 1);
                                var _iterator = keys, _isArray = Array.isArray(_iterator), _i = 0;
                                for (_iterator = _isArray ? _iterator : _iterator[Symbol.iterator](); ;) {
                                    var _ref;
                                    if (_isArray) {
                                        if (_i >= _iterator.length) break;
                                        _ref = _iterator[_i++];
                                    } else {
                                        if ((_i = _iterator.next()).done) break;
                                        _ref = _i.value;
                                    }
                                    obj[_ref] = val;
                                }
                                if (indent && this.token.type !== TOKEN_TYPES_indent) break;
                            } else if (token = valToken, VALID_PROP_VALUE_TOKENS.indexOf(token.type) >= 0) {
                                var _iterator2 = keys, _isArray2 = Array.isArray(_iterator2), _i2 = 0;
                                for (_iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator](); ;) {
                                    var _ref2;
                                    if (_isArray2) {
                                        if (_i2 >= _iterator2.length) break;
                                        _ref2 = _iterator2[_i2++];
                                    } else {
                                        if ((_i2 = _iterator2.next()).done) break;
                                        _ref2 = _i2.value;
                                    }
                                    obj[_ref2] = valToken.value;
                                }
                                this.next();
                            } else this.unexpected("Invalid value type");
                        } else this.unexpected("Unknown token: " + (_util || (_util = _interopRequireDefault(__webpack_require__(2)))).default.inspect(propToken));
                    }
                }
                var token;
                return obj;
            }
        }
        function parse(str, fileLoc) {
            const parser = new Parser(str, fileLoc);
            return parser.next(), parser.parse();
        }
    }, , , function(module, exports, __webpack_require__) {
        "use strict";
        var _map;
        function _load_map() {
            return obj = __webpack_require__(20), _map = obj && obj.__esModule ? obj : {
                default: obj
            };
            var obj;
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const debug = __webpack_require__(212)("yarn");
        exports.default = class {
            constructor(alias, maxConcurrency = 1 / 0) {
                this.concurrencyQueue = [], this.maxConcurrency = maxConcurrency, this.runningCount = 0, 
                this.warnedStuck = !1, this.alias = alias, this.first = !0, this.running = (0, (_map || _load_map()).default)(), 
                this.queue = (0, (_map || _load_map()).default)(), this.stuckTick = this.stuckTick.bind(this);
            }
            stillActive() {
                this.stuckTimer && clearTimeout(this.stuckTimer), this.stuckTimer = setTimeout(this.stuckTick, 5e3), 
                this.stuckTimer.unref && this.stuckTimer.unref();
            }
            stuckTick() {
                1 === this.runningCount && (this.warnedStuck = !0, debug(`The ${JSON.stringify(this.alias)} blocking queue may be stuck. 5 seconds without any activity with 1 worker: ` + Object.keys(this.running)[0]));
            }
            push(key, factory) {
                return this.first ? this.first = !1 : this.stillActive(), new Promise((resolve, reject) => {
                    (this.queue[key] = this.queue[key] || []).push({
                        factory: factory,
                        resolve: resolve,
                        reject: reject
                    }), this.running[key] || this.shift(key);
                });
            }
            shift(key) {
                this.running[key] && (delete this.running[key], this.runningCount--, this.stuckTimer && (clearTimeout(this.stuckTimer), 
                this.stuckTimer = null), this.warnedStuck && (this.warnedStuck = !1, debug(JSON.stringify(this.alias) + " blocking queue finally resolved. Nothing to worry about.")));
                const queue = this.queue[key];
                if (!queue) return;
                var _queue$shift = queue.shift();
                const resolve = _queue$shift.resolve, reject = _queue$shift.reject, factory = _queue$shift.factory;
                queue.length || delete this.queue[key];
                const next = () => {
                    this.shift(key), this.shiftConcurrencyQueue();
                };
                this.maybePushConcurrencyQueue(() => {
                    this.running[key] = !0, this.runningCount++, factory().then((function(val) {
                        return resolve(val), next(), null;
                    })).catch((function(err) {
                        reject(err), next();
                    }));
                });
            }
            maybePushConcurrencyQueue(run) {
                this.runningCount < this.maxConcurrency ? run() : this.concurrencyQueue.push(run);
            }
            shiftConcurrencyQueue() {
                if (this.runningCount < this.maxConcurrency) {
                    const fn = this.concurrencyQueue.shift();
                    fn && fn();
                }
            }
        };
    }, function(module, exports) {
        module.exports = function(exec) {
            try {
                return !!exec();
            } catch (e) {
                return !0;
            }
        };
    }, , , , , , , , , , , , , , , function(module, exports, __webpack_require__) {
        var cof = __webpack_require__(47), TAG = __webpack_require__(13)("toStringTag"), ARG = "Arguments" == cof(function() {
            return arguments;
        }());
        module.exports = function(it) {
            var O, T, B;
            return void 0 === it ? "Undefined" : null === it ? "Null" : "string" == typeof (T = function(it, key) {
                try {
                    return it[key];
                } catch (e) {}
            }(O = Object(it), TAG)) ? T : ARG ? cof(O) : "Object" == (B = cof(O)) && "function" == typeof O.callee ? "Arguments" : B;
        };
    }, function(module, exports) {
        module.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
    }, function(module, exports, __webpack_require__) {
        var document = __webpack_require__(11).document;
        module.exports = document && document.documentElement;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var LIBRARY = __webpack_require__(69), $export = __webpack_require__(41), redefine = __webpack_require__(197), hide = __webpack_require__(31), Iterators = __webpack_require__(35), $iterCreate = __webpack_require__(188), setToStringTag = __webpack_require__(71), getPrototypeOf = __webpack_require__(194), ITERATOR = __webpack_require__(13)("iterator"), BUGGY = !([].keys && "next" in [].keys()), returnThis = function() {
            return this;
        };
        module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
            $iterCreate(Constructor, NAME, next);
            var methods, key, IteratorPrototype, getMethod = function(kind) {
                if (!BUGGY && kind in proto) return proto[kind];
                switch (kind) {
                  case "keys":
                  case "values":
                    return function() {
                        return new Constructor(this, kind);
                    };
                }
                return function() {
                    return new Constructor(this, kind);
                };
            }, TAG = NAME + " Iterator", DEF_VALUES = "values" == DEFAULT, VALUES_BUG = !1, proto = Base.prototype, $native = proto[ITERATOR] || proto["@@iterator"] || DEFAULT && proto[DEFAULT], $default = $native || getMethod(DEFAULT), $entries = DEFAULT ? DEF_VALUES ? getMethod("entries") : $default : void 0, $anyNative = "Array" == NAME && proto.entries || $native;
            if ($anyNative && (IteratorPrototype = getPrototypeOf($anyNative.call(new Base))) !== Object.prototype && IteratorPrototype.next && (setToStringTag(IteratorPrototype, TAG, !0), 
            LIBRARY || "function" == typeof IteratorPrototype[ITERATOR] || hide(IteratorPrototype, ITERATOR, returnThis)), 
            DEF_VALUES && $native && "values" !== $native.name && (VALUES_BUG = !0, $default = function() {
                return $native.call(this);
            }), LIBRARY && !FORCED || !BUGGY && !VALUES_BUG && proto[ITERATOR] || hide(proto, ITERATOR, $default), 
            Iterators[NAME] = $default, Iterators[TAG] = returnThis, DEFAULT) if (methods = {
                values: DEF_VALUES ? $default : getMethod("values"),
                keys: IS_SET ? $default : getMethod("keys"),
                entries: $entries
            }, FORCED) for (key in methods) key in proto || redefine(proto, key, methods[key]); else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
            return methods;
        };
    }, function(module, exports) {
        module.exports = function(exec) {
            try {
                return {
                    e: !1,
                    v: exec()
                };
            } catch (e) {
                return {
                    e: !0,
                    v: e
                };
            }
        };
    }, function(module, exports, __webpack_require__) {
        var anObject = __webpack_require__(27), isObject = __webpack_require__(34), newPromiseCapability = __webpack_require__(70);
        module.exports = function(C, x) {
            if (anObject(C), isObject(x) && x.constructor === C) return x;
            var promiseCapability = newPromiseCapability.f(C);
            return (0, promiseCapability.resolve)(x), promiseCapability.promise;
        };
    }, function(module, exports) {
        module.exports = function(bitmap, value) {
            return {
                enumerable: !(1 & bitmap),
                configurable: !(2 & bitmap),
                writable: !(4 & bitmap),
                value: value
            };
        };
    }, function(module, exports, __webpack_require__) {
        var core = __webpack_require__(23), global = __webpack_require__(11), store = global["__core-js_shared__"] || (global["__core-js_shared__"] = {});
        (module.exports = function(key, value) {
            return store[key] || (store[key] = void 0 !== value ? value : {});
        })("versions", []).push({
            version: core.version,
            mode: __webpack_require__(69) ? "pure" : "global",
            copyright: "© 2018 Denis Pushkarev (zloirock.ru)"
        });
    }, function(module, exports, __webpack_require__) {
        var anObject = __webpack_require__(27), aFunction = __webpack_require__(46), SPECIES = __webpack_require__(13)("species");
        module.exports = function(O, D) {
            var S, C = anObject(O).constructor;
            return void 0 === C || null == (S = anObject(C)[SPECIES]) ? D : aFunction(S);
        };
    }, function(module, exports, __webpack_require__) {
        var defer, channel, port, ctx = __webpack_require__(48), invoke = __webpack_require__(185), html = __webpack_require__(102), cel = __webpack_require__(68), global = __webpack_require__(11), process = global.process, setTask = global.setImmediate, clearTask = global.clearImmediate, MessageChannel = global.MessageChannel, Dispatch = global.Dispatch, counter = 0, queue = {}, run = function() {
            var id = +this;
            if (queue.hasOwnProperty(id)) {
                var fn = queue[id];
                delete queue[id], fn();
            }
        }, listener = function(event) {
            run.call(event.data);
        };
        setTask && clearTask || (setTask = function(fn) {
            for (var args = [], i = 1; arguments.length > i; ) args.push(arguments[i++]);
            return queue[++counter] = function() {
                invoke("function" == typeof fn ? fn : Function(fn), args);
            }, defer(counter), counter;
        }, clearTask = function(id) {
            delete queue[id];
        }, "process" == __webpack_require__(47)(process) ? defer = function(id) {
            process.nextTick(ctx(run, id, 1));
        } : Dispatch && Dispatch.now ? defer = function(id) {
            Dispatch.now(ctx(run, id, 1));
        } : MessageChannel ? (port = (channel = new MessageChannel).port2, channel.port1.onmessage = listener, 
        defer = ctx(port.postMessage, port, 1)) : global.addEventListener && "function" == typeof postMessage && !global.importScripts ? (defer = function(id) {
            global.postMessage(id + "", "*");
        }, global.addEventListener("message", listener, !1)) : defer = "onreadystatechange" in cel("script") ? function(id) {
            html.appendChild(cel("script")).onreadystatechange = function() {
                html.removeChild(this), run.call(id);
            };
        } : function(id) {
            setTimeout(ctx(run, id, 1), 0);
        }), module.exports = {
            set: setTask,
            clear: clearTask
        };
    }, function(module, exports, __webpack_require__) {
        var toInteger = __webpack_require__(73), min = Math.min;
        module.exports = function(it) {
            return it > 0 ? min(toInteger(it), 9007199254740991) : 0;
        };
    }, function(module, exports) {
        var id = 0, px = Math.random();
        module.exports = function(key) {
            return "Symbol(".concat(void 0 === key ? "" : key, ")_", (++id + px).toString(36));
        };
    }, function(module, exports, __webpack_require__) {
        function createDebug(namespace) {
            var prevTime;
            function debug() {
                if (debug.enabled) {
                    var self = debug, curr = +new Date, ms = curr - (prevTime || curr);
                    self.diff = ms, self.prev = prevTime, self.curr = curr, prevTime = curr;
                    for (var args = new Array(arguments.length), i = 0; i < args.length; i++) args[i] = arguments[i];
                    args[0] = exports.coerce(args[0]), "string" != typeof args[0] && args.unshift("%O");
                    var index = 0;
                    args[0] = args[0].replace(/%([a-zA-Z%])/g, (function(match, format) {
                        if ("%%" === match) return match;
                        index++;
                        var formatter = exports.formatters[format];
                        if ("function" == typeof formatter) {
                            var val = args[index];
                            match = formatter.call(self, val), args.splice(index, 1), index--;
                        }
                        return match;
                    })), exports.formatArgs.call(self, args);
                    var logFn = debug.log || exports.log || console.log.bind(console);
                    logFn.apply(self, args);
                }
            }
            return debug.namespace = namespace, debug.enabled = exports.enabled(namespace), 
            debug.useColors = exports.useColors(), debug.color = function(namespace) {
                var i, hash = 0;
                for (i in namespace) hash = (hash << 5) - hash + namespace.charCodeAt(i), hash |= 0;
                return exports.colors[Math.abs(hash) % exports.colors.length];
            }(namespace), debug.destroy = destroy, "function" == typeof exports.init && exports.init(debug), 
            exports.instances.push(debug), debug;
        }
        function destroy() {
            var index = exports.instances.indexOf(this);
            return -1 !== index && (exports.instances.splice(index, 1), !0);
        }
        (exports = module.exports = createDebug.debug = createDebug.default = createDebug).coerce = function(val) {
            return val instanceof Error ? val.stack || val.message : val;
        }, exports.disable = function() {
            exports.enable("");
        }, exports.enable = function(namespaces) {
            var i;
            exports.save(namespaces), exports.names = [], exports.skips = [];
            var split = ("string" == typeof namespaces ? namespaces : "").split(/[\s,]+/), len = split.length;
            for (i = 0; i < len; i++) split[i] && ("-" === (namespaces = split[i].replace(/\*/g, ".*?"))[0] ? exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$")) : exports.names.push(new RegExp("^" + namespaces + "$")));
            for (i = 0; i < exports.instances.length; i++) {
                var instance = exports.instances[i];
                instance.enabled = exports.enabled(instance.namespace);
            }
        }, exports.enabled = function(name) {
            if ("*" === name[name.length - 1]) return !0;
            var i, len;
            for (i = 0, len = exports.skips.length; i < len; i++) if (exports.skips[i].test(name)) return !1;
            for (i = 0, len = exports.names.length; i < len; i++) if (exports.names[i].test(name)) return !0;
            return !1;
        }, exports.humanize = __webpack_require__(229), exports.instances = [], exports.names = [], 
        exports.skips = [], exports.formatters = {};
    }, , function(module, exports, __webpack_require__) {
        module.exports = realpath, realpath.realpath = realpath, realpath.sync = realpathSync, 
        realpath.realpathSync = realpathSync, realpath.monkeypatch = function() {
            fs.realpath = realpath, fs.realpathSync = realpathSync;
        }, realpath.unmonkeypatch = function() {
            fs.realpath = origRealpath, fs.realpathSync = origRealpathSync;
        };
        var fs = __webpack_require__(3), origRealpath = fs.realpath, origRealpathSync = fs.realpathSync, version = process.version, ok = /^v[0-5]\./.test(version), old = __webpack_require__(217);
        function newError(er) {
            return er && "realpath" === er.syscall && ("ELOOP" === er.code || "ENOMEM" === er.code || "ENAMETOOLONG" === er.code);
        }
        function realpath(p, cache, cb) {
            if (ok) return origRealpath(p, cache, cb);
            "function" == typeof cache && (cb = cache, cache = null), origRealpath(p, cache, (function(er, result) {
                newError(er) ? old.realpath(p, cache, cb) : cb(er, result);
            }));
        }
        function realpathSync(p, cache) {
            if (ok) return origRealpathSync(p, cache);
            try {
                return origRealpathSync(p, cache);
            } catch (er) {
                if (newError(er)) return old.realpathSync(p, cache);
                throw er;
            }
        }
    }, function(module, exports, __webpack_require__) {
        function ownProp(obj, field) {
            return Object.prototype.hasOwnProperty.call(obj, field);
        }
        exports.alphasort = alphasort, exports.alphasorti = alphasorti, exports.setopts = function(self, pattern, options) {
            options || (options = {});
            if (options.matchBase && -1 === pattern.indexOf("/")) {
                if (options.noglobstar) throw new Error("base matching requires globstar");
                pattern = "**/" + pattern;
            }
            self.silent = !!options.silent, self.pattern = pattern, self.strict = !1 !== options.strict, 
            self.realpath = !!options.realpath, self.realpathCache = options.realpathCache || Object.create(null), 
            self.follow = !!options.follow, self.dot = !!options.dot, self.mark = !!options.mark, 
            self.nodir = !!options.nodir, self.nodir && (self.mark = !0);
            self.sync = !!options.sync, self.nounique = !!options.nounique, self.nonull = !!options.nonull, 
            self.nosort = !!options.nosort, self.nocase = !!options.nocase, self.stat = !!options.stat, 
            self.noprocess = !!options.noprocess, self.absolute = !!options.absolute, self.maxLength = options.maxLength || 1 / 0, 
            self.cache = options.cache || Object.create(null), self.statCache = options.statCache || Object.create(null), 
            self.symlinks = options.symlinks || Object.create(null), function(self, options) {
                self.ignore = options.ignore || [], Array.isArray(self.ignore) || (self.ignore = [ self.ignore ]);
                self.ignore.length && (self.ignore = self.ignore.map(ignoreMap));
            }(self, options), self.changedCwd = !1;
            var cwd = process.cwd();
            ownProp(options, "cwd") ? (self.cwd = path.resolve(options.cwd), self.changedCwd = self.cwd !== cwd) : self.cwd = cwd;
            self.root = options.root || path.resolve(self.cwd, "/"), self.root = path.resolve(self.root), 
            "win32" === process.platform && (self.root = self.root.replace(/\\/g, "/"));
            self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd), "win32" === process.platform && (self.cwdAbs = self.cwdAbs.replace(/\\/g, "/"));
            self.nomount = !!options.nomount, options.nonegate = !0, options.nocomment = !0, 
            self.minimatch = new Minimatch(pattern, options), self.options = self.minimatch.options;
        }, exports.ownProp = ownProp, exports.makeAbs = makeAbs, exports.finish = function(self) {
            for (var nou = self.nounique, all = nou ? [] : Object.create(null), i = 0, l = self.matches.length; i < l; i++) {
                var matches = self.matches[i];
                if (matches && 0 !== Object.keys(matches).length) {
                    var m = Object.keys(matches);
                    nou ? all.push.apply(all, m) : m.forEach((function(m) {
                        all[m] = !0;
                    }));
                } else if (self.nonull) {
                    var literal = self.minimatch.globSet[i];
                    nou ? all.push(literal) : all[literal] = !0;
                }
            }
            nou || (all = Object.keys(all));
            self.nosort || (all = all.sort(self.nocase ? alphasorti : alphasort));
            if (self.mark) {
                for (i = 0; i < all.length; i++) all[i] = self._mark(all[i]);
                self.nodir && (all = all.filter((function(e) {
                    var notDir = !/\/$/.test(e), c = self.cache[e] || self.cache[makeAbs(self, e)];
                    return notDir && c && (notDir = "DIR" !== c && !Array.isArray(c)), notDir;
                })));
            }
            self.ignore.length && (all = all.filter((function(m) {
                return !isIgnored(self, m);
            })));
            self.found = all;
        }, exports.mark = function(self, p) {
            var abs = makeAbs(self, p), c = self.cache[abs], m = p;
            if (c) {
                var isDir = "DIR" === c || Array.isArray(c), slash = "/" === p.slice(-1);
                if (isDir && !slash ? m += "/" : !isDir && slash && (m = m.slice(0, -1)), m !== p) {
                    var mabs = makeAbs(self, m);
                    self.statCache[mabs] = self.statCache[abs], self.cache[mabs] = self.cache[abs];
                }
            }
            return m;
        }, exports.isIgnored = isIgnored, exports.childrenIgnored = function(self, path) {
            return !!self.ignore.length && self.ignore.some((function(item) {
                return !(!item.gmatcher || !item.gmatcher.match(path));
            }));
        };
        var path = __webpack_require__(0), minimatch = __webpack_require__(60), isAbsolute = __webpack_require__(76), Minimatch = minimatch.Minimatch;
        function alphasorti(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        }
        function alphasort(a, b) {
            return a.localeCompare(b);
        }
        function ignoreMap(pattern) {
            var gmatcher = null;
            if ("/**" === pattern.slice(-3)) {
                var gpattern = pattern.replace(/(\/\*\*)+$/, "");
                gmatcher = new Minimatch(gpattern, {
                    dot: !0
                });
            }
            return {
                matcher: new Minimatch(pattern, {
                    dot: !0
                }),
                gmatcher: gmatcher
            };
        }
        function makeAbs(self, f) {
            var abs = f;
            return abs = "/" === f.charAt(0) ? path.join(self.root, f) : isAbsolute(f) || "" === f ? f : self.changedCwd ? path.resolve(self.cwd, f) : path.resolve(f), 
            "win32" === process.platform && (abs = abs.replace(/\\/g, "/")), abs;
        }
        function isIgnored(self, path) {
            return !!self.ignore.length && self.ignore.some((function(item) {
                return item.matcher.match(path) || !(!item.gmatcher || !item.gmatcher.match(path));
            }));
        }
    }, function(module, exports, __webpack_require__) {
        var path = __webpack_require__(0), fs = __webpack_require__(3), _0777 = parseInt("0777", 8);
        function mkdirP(p, opts, f, made) {
            "function" == typeof opts ? (f = opts, opts = {}) : opts && "object" == typeof opts || (opts = {
                mode: opts
            });
            var mode = opts.mode, xfs = opts.fs || fs;
            void 0 === mode && (mode = _0777 & ~process.umask()), made || (made = null);
            var cb = f || function() {};
            p = path.resolve(p), xfs.mkdir(p, mode, (function(er) {
                if (!er) return cb(null, made = made || p);
                switch (er.code) {
                  case "ENOENT":
                    mkdirP(path.dirname(p), opts, (function(er, made) {
                        er ? cb(er, made) : mkdirP(p, opts, cb, made);
                    }));
                    break;

                  default:
                    xfs.stat(p, (function(er2, stat) {
                        er2 || !stat.isDirectory() ? cb(er, made) : cb(null, made);
                    }));
                }
            }));
        }
        module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP, mkdirP.sync = function sync(p, opts, made) {
            opts && "object" == typeof opts || (opts = {
                mode: opts
            });
            var mode = opts.mode, xfs = opts.fs || fs;
            void 0 === mode && (mode = _0777 & ~process.umask()), made || (made = null), p = path.resolve(p);
            try {
                xfs.mkdirSync(p, mode), made = made || p;
            } catch (err0) {
                switch (err0.code) {
                  case "ENOENT":
                    made = sync(path.dirname(p), opts, made), sync(p, opts, made);
                    break;

                  default:
                    var stat;
                    try {
                        stat = xfs.statSync(p);
                    } catch (err1) {
                        throw err0;
                    }
                    if (!stat.isDirectory()) throw err0;
                }
            }
            return made;
        };
    }, , , , , , function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = x => {
            if ("string" != typeof x) throw new TypeError("Expected a string, got " + typeof x);
            return 65279 === x.charCodeAt(0) ? x.slice(1) : x;
        };
    }, function(module, exports) {
        module.exports = function wrappy(fn, cb) {
            if (fn && cb) return wrappy(fn)(cb);
            if ("function" != typeof fn) throw new TypeError("need wrapper function");
            return Object.keys(fn).forEach((function(k) {
                wrapper[k] = fn[k];
            })), wrapper;
            function wrapper() {
                for (var args = new Array(arguments.length), i = 0; i < args.length; i++) args[i] = arguments[i];
                var ret = fn.apply(this, args), cb = args[args.length - 1];
                return "function" == typeof ret && ret !== cb && Object.keys(cb).forEach((function(k) {
                    ret[k] = cb[k];
                })), ret;
            }
        };
    }, , , , , , , , function(module, exports, __webpack_require__) {
        var cof = __webpack_require__(47);
        module.exports = Object("z").propertyIsEnumerable(0) ? Object : function(it) {
            return "String" == cof(it) ? it.split("") : Object(it);
        };
    }, function(module, exports, __webpack_require__) {
        var $keys = __webpack_require__(195), enumBugKeys = __webpack_require__(101);
        module.exports = Object.keys || function(O) {
            return $keys(O, enumBugKeys);
        };
    }, function(module, exports, __webpack_require__) {
        var defined = __webpack_require__(67);
        module.exports = function(it) {
            return Object(defined(it));
        };
    }, , , , , , , , , , , , function(module, exports) {
        module.exports = {
            name: "yarn",
            installationMethod: "unknown",
            version: "1.10.0-0",
            license: "BSD-2-Clause",
            preferGlobal: !0,
            description: "📦🐈 Fast, reliable, and secure dependency management.",
            dependencies: {
                "@zkochan/cmd-shim": "^2.2.4",
                "babel-runtime": "^6.26.0",
                bytes: "^3.0.0",
                camelcase: "^4.0.0",
                chalk: "^2.1.0",
                commander: "^2.9.0",
                death: "^1.0.0",
                debug: "^3.0.0",
                "deep-equal": "^1.0.1",
                "detect-indent": "^5.0.0",
                dnscache: "^1.0.1",
                glob: "^7.1.1",
                "gunzip-maybe": "^1.4.0",
                "hash-for-dep": "^1.2.3",
                "imports-loader": "^0.8.0",
                ini: "^1.3.4",
                inquirer: "^3.0.1",
                invariant: "^2.2.0",
                "is-builtin-module": "^2.0.0",
                "is-ci": "^1.0.10",
                "is-webpack-bundle": "^1.0.0",
                leven: "^2.0.0",
                "loud-rejection": "^1.2.0",
                micromatch: "^2.3.11",
                mkdirp: "^0.5.1",
                "node-emoji": "^1.6.1",
                "normalize-url": "^2.0.0",
                "npm-logical-tree": "^1.2.1",
                "object-path": "^0.11.2",
                "proper-lockfile": "^2.0.0",
                puka: "^1.0.0",
                read: "^1.0.7",
                request: "^2.87.0",
                "request-capture-har": "^1.2.2",
                rimraf: "^2.5.0",
                semver: "^5.1.0",
                ssri: "^5.3.0",
                "strip-ansi": "^4.0.0",
                "strip-bom": "^3.0.0",
                "tar-fs": "^1.16.0",
                "tar-stream": "^1.6.1",
                uuid: "^3.0.1",
                "v8-compile-cache": "^2.0.0",
                "validate-npm-package-license": "^3.0.3",
                yn: "^2.0.0"
            },
            devDependencies: {
                "babel-core": "^6.26.0",
                "babel-eslint": "^7.2.3",
                "babel-loader": "^6.2.5",
                "babel-plugin-array-includes": "^2.0.3",
                "babel-plugin-transform-builtin-extend": "^1.1.2",
                "babel-plugin-transform-inline-imports-commonjs": "^1.0.0",
                "babel-plugin-transform-runtime": "^6.4.3",
                "babel-preset-env": "^1.6.0",
                "babel-preset-flow": "^6.23.0",
                "babel-preset-stage-0": "^6.0.0",
                babylon: "^6.5.0",
                commitizen: "^2.9.6",
                "cz-conventional-changelog": "^2.0.0",
                eslint: "^4.3.0",
                "eslint-config-fb-strict": "^22.0.0",
                "eslint-plugin-babel": "^5.0.0",
                "eslint-plugin-flowtype": "^2.35.0",
                "eslint-plugin-jasmine": "^2.6.2",
                "eslint-plugin-jest": "^21.0.0",
                "eslint-plugin-jsx-a11y": "^6.0.2",
                "eslint-plugin-prefer-object-spread": "^1.2.1",
                "eslint-plugin-prettier": "^2.1.2",
                "eslint-plugin-react": "^7.1.0",
                "eslint-plugin-relay": "^0.0.24",
                "eslint-plugin-yarn-internal": "file:scripts/eslint-rules",
                execa: "^0.10.0",
                "flow-bin": "^0.66.0",
                "git-release-notes": "^3.0.0",
                gulp: "^3.9.0",
                "gulp-babel": "^7.0.0",
                "gulp-if": "^2.0.1",
                "gulp-newer": "^1.0.0",
                "gulp-plumber": "^1.0.1",
                "gulp-sourcemaps": "^2.2.0",
                "gulp-util": "^3.0.7",
                "gulp-watch": "^5.0.0",
                jest: "^22.4.4",
                jsinspect: "^0.12.6",
                minimatch: "^3.0.4",
                "mock-stdin": "^0.3.0",
                prettier: "^1.5.2",
                temp: "^0.8.3",
                webpack: "^2.1.0-beta.25",
                yargs: "^6.3.0"
            },
            resolutions: {
                sshpk: "^1.14.2"
            },
            engines: {
                node: ">=4.0.0"
            },
            repository: "yarnpkg/yarn",
            bin: {
                yarn: "./bin/yarn.js",
                yarnpkg: "./bin/yarn.js"
            },
            scripts: {
                build: "gulp build",
                "build-bundle": "node ./scripts/build-webpack.js",
                "build-chocolatey": "powershell ./scripts/build-chocolatey.ps1",
                "build-deb": "./scripts/build-deb.sh",
                "build-dist": "bash ./scripts/build-dist.sh",
                "build-win-installer": "scripts\\build-windows-installer.bat",
                changelog: "git-release-notes $(git describe --tags --abbrev=0 $(git describe --tags --abbrev=0)^)..$(git describe --tags --abbrev=0) scripts/changelog.md",
                "dupe-check": "yarn jsinspect ./src",
                lint: "eslint . && flow check",
                "pkg-tests": "yarn --cwd packages/pkg-tests jest yarn.test.js",
                prettier: "eslint src __tests__ --fix",
                "release-branch": "./scripts/release-branch.sh",
                test: "yarn lint && yarn test-only",
                "test-only": "node --max_old_space_size=4096 node_modules/jest/bin/jest.js --verbose",
                "test-only-debug": "node --inspect-brk --max_old_space_size=4096 node_modules/jest/bin/jest.js --runInBand --verbose",
                "test-coverage": "node --max_old_space_size=4096 node_modules/jest/bin/jest.js --coverage --verbose",
                watch: "gulp watch",
                commit: "git-cz"
            },
            jest: {
                collectCoverageFrom: [ "src/**/*.js" ],
                testEnvironment: "node",
                modulePathIgnorePatterns: [ "__tests__/fixtures/", "packages/pkg-tests/pkg-tests-fixtures", "dist/" ],
                testPathIgnorePatterns: [ "__tests__/(fixtures|__mocks__)/", "updates/", "_(temp|mock|install|init|helpers).js$", "packages/pkg-tests" ]
            },
            config: {
                commitizen: {
                    path: "./node_modules/cz-conventional-changelog"
                }
            }
        };
    }, , , , , function(module, exports, __webpack_require__) {
        "use strict";
        var _misc, _constants, _package;
        function _load_misc() {
            return _misc = __webpack_require__(12);
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.default = function(obj, noHeader, enableVersions) {
            const val = function _stringify(obj, options) {
                if ("object" != typeof obj) throw new TypeError;
                const indent = options.indent, lines = [], keys = Object.keys(obj).sort(priorityThenAlphaSort);
                let addedKeys = [];
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i], val = obj[key];
                    if (null == val || addedKeys.indexOf(key) >= 0) continue;
                    const valKeys = [ key ];
                    if ("object" == typeof val) for (let j = i + 1; j < keys.length; j++) {
                        const key = keys[j];
                        val === obj[key] && valKeys.push(key);
                    }
                    const keyLine = valKeys.sort((_misc || _load_misc()).sortAlpha).map(maybeWrap).join(", ");
                    if ("string" == typeof val || "boolean" == typeof val || "number" == typeof val) lines.push(`${keyLine} ${maybeWrap(val)}`); else {
                        if ("object" != typeof val) throw new TypeError;
                        lines.push(`${keyLine}:\n${_stringify(val, {
                            indent: indent + "  "
                        })}` + (options.topLevel ? "\n" : ""));
                    }
                    addedKeys = addedKeys.concat(valKeys);
                }
                return indent + lines.join("\n" + indent);
            }(obj, {
                indent: "",
                topLevel: !0
            });
            if (noHeader) return val;
            const lines = [];
            lines.push("# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY."), 
            lines.push("# yarn lockfile v" + (_constants || function() {
                return _constants = __webpack_require__(6);
            }()).LOCKFILE_VERSION), enableVersions && (lines.push("# yarn v" + (_package || (_package = __webpack_require__(145))).version), 
            lines.push("# node " + NODE_VERSION));
            return lines.push("\n"), lines.push(val), lines.join("\n");
        };
        const NODE_VERSION = process.version;
        function maybeWrap(str) {
            return "boolean" == typeof str || "number" == typeof str || function(str) {
                return 0 === str.indexOf("true") || 0 === str.indexOf("false") || /[:\s\n\\",\[\]]/g.test(str) || /^[0-9]/g.test(str) || !/^[a-zA-Z]/g.test(str);
            }(str) ? JSON.stringify(str) : str;
        }
        const priorities = {
            name: 1,
            version: 2,
            uid: 3,
            resolved: 4,
            integrity: 5,
            registry: 6,
            dependencies: 7
        };
        function priorityThenAlphaSort(a, b) {
            return priorities[a] || priorities[b] ? (priorities[a] || 100) > (priorities[b] || 100) ? 1 : -1 : (0, 
            (_misc || _load_misc()).sortAlpha)(a, b);
        }
    }, , , , , , , , , , , , , , function(module, exports, __webpack_require__) {
        "use strict";
        var _asyncToGenerator2;
        function _load_asyncToGenerator() {
            return _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(1));
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.fileDatesEqual = exports.copyFile = exports.unlink = void 0;
        let fixTimes = (_ref3 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(fd, dest, data) {
            const doOpen = void 0 === fd;
            let openfd = fd || -1;
            if (void 0 === disableTimestampCorrection) {
                const destStat = yield lstat(dest);
                disableTimestampCorrection = fileDatesEqual(destStat.mtime, data.mtime);
            }
            if (!disableTimestampCorrection) {
                if (doOpen) try {
                    openfd = yield open(dest, "a", data.mode);
                } catch (er) {
                    try {
                        openfd = yield open(dest, "r", data.mode);
                    } catch (err) {
                        return;
                    }
                }
                try {
                    openfd && (yield futimes(openfd, data.atime, data.mtime));
                } catch (er) {} finally {
                    doOpen && openfd && (yield close(openfd));
                }
            }
        })), function(_x7, _x8, _x9) {
            return _ref3.apply(this, arguments);
        });
        var _ref3, _fs, _promise;
        function _load_fs() {
            return _fs = _interopRequireDefault(__webpack_require__(3));
        }
        function _load_promise() {
            return _promise = __webpack_require__(40);
        }
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        let disableTimestampCorrection = void 0;
        const readFileBuffer = (0, (_promise || _load_promise()).promisify)((_fs || _load_fs()).default.readFile), close = (0, 
        (_promise || _load_promise()).promisify)((_fs || _load_fs()).default.close), lstat = (0, 
        (_promise || _load_promise()).promisify)((_fs || _load_fs()).default.lstat), open = (0, 
        (_promise || _load_promise()).promisify)((_fs || _load_fs()).default.open), futimes = (0, 
        (_promise || _load_promise()).promisify)((_fs || _load_fs()).default.futimes), write = (0, 
        (_promise || _load_promise()).promisify)((_fs || _load_fs()).default.write), unlink = exports.unlink = (0, 
        (_promise || _load_promise()).promisify)(__webpack_require__(233));
        exports.copyFile = (_ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(data, cleanup) {
            try {
                yield unlink(data.dest), yield copyFilePoly(data.src, data.dest, 0, data);
            } finally {
                cleanup && cleanup();
            }
        })), function(_x, _x2) {
            return _ref.apply(this, arguments);
        });
        var _ref;
        const copyFilePoly = (src, dest, flags, data) => (_fs || _load_fs()).default.copyFile ? new Promise((resolve, reject) => (_fs || _load_fs()).default.copyFile(src, dest, flags, err => {
            err ? reject(err) : fixTimes(void 0, dest, data).then(() => resolve()).catch(ex => reject(ex));
        })) : copyWithBuffer(src, dest, flags, data), copyWithBuffer = (_ref2 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((function*(src, dest, flags, data) {
            const fd = yield open(dest, "w", data.mode);
            try {
                const buffer = yield readFileBuffer(src);
                yield write(fd, buffer, 0, buffer.length), yield fixTimes(fd, dest, data);
            } finally {
                yield close(fd);
            }
        })), function(_x3, _x4, _x5, _x6) {
            return _ref2.apply(this, arguments);
        });
        var _ref2;
        const fileDatesEqual = exports.fileDatesEqual = (a, b) => {
            const aTime = a.getTime(), bTime = b.getTime();
            if ("win32" !== process.platform) return aTime === bTime;
            if (Math.abs(aTime - bTime) <= 1) return !0;
            const aTimeSec = Math.floor(aTime / 1e3), bTimeSec = Math.floor(bTime / 1e3);
            return aTime - 1e3 * aTimeSec == 0 || bTime - 1e3 * bTimeSec == 0 ? aTimeSec === bTimeSec : aTime === bTime;
        };
    }, , , , , function(module, exports, __webpack_require__) {
        "use strict";
        function isFakeRoot() {
            return Boolean(process.env.FAKEROOTKEY);
        }
        function isRootUser(uid) {
            return 0 === uid;
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.isFakeRoot = isFakeRoot, exports.isRootUser = isRootUser, exports.default = isRootUser("win32" !== process.platform && process.getuid ? process.getuid() : null) && !isFakeRoot();
    }, , function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.getDataDir = function() {
            if ("win32" === process.platform) {
                const WIN32_APPDATA_DIR = getLocalAppDataDir();
                return null == WIN32_APPDATA_DIR ? FALLBACK_CONFIG_DIR : path.join(WIN32_APPDATA_DIR, "Data");
            }
            return process.env.XDG_DATA_HOME ? path.join(process.env.XDG_DATA_HOME, "yarn") : FALLBACK_CONFIG_DIR;
        }, exports.getCacheDir = function() {
            return "win32" === process.platform ? path.join(getLocalAppDataDir() || path.join(userHome, "AppData", "Local", "Yarn"), "Cache") : process.env.XDG_CACHE_HOME ? path.join(process.env.XDG_CACHE_HOME, "yarn") : "darwin" === process.platform ? path.join(userHome, "Library", "Caches", "Yarn") : FALLBACK_CACHE_DIR;
        }, exports.getConfigDir = function() {
            if ("win32" === process.platform) {
                const WIN32_APPDATA_DIR = getLocalAppDataDir();
                return null == WIN32_APPDATA_DIR ? FALLBACK_CONFIG_DIR : path.join(WIN32_APPDATA_DIR, "Config");
            }
            return process.env.XDG_CONFIG_HOME ? path.join(process.env.XDG_CONFIG_HOME, "yarn") : FALLBACK_CONFIG_DIR;
        };
        const path = __webpack_require__(0), userHome = __webpack_require__(45).default, FALLBACK_CONFIG_DIR = path.join(userHome, ".config", "yarn"), FALLBACK_CACHE_DIR = path.join(userHome, ".cache", "yarn");
        function getLocalAppDataDir() {
            return process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Yarn") : null;
        }
    }, , function(module, exports, __webpack_require__) {
        module.exports = {
            default: __webpack_require__(179),
            __esModule: !0
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function balanced(a, b, str) {
            a instanceof RegExp && (a = maybeMatch(a, str)), b instanceof RegExp && (b = maybeMatch(b, str));
            var r = range(a, b, str);
            return r && {
                start: r[0],
                end: r[1],
                pre: str.slice(0, r[0]),
                body: str.slice(r[0] + a.length, r[1]),
                post: str.slice(r[1] + b.length)
            };
        }
        function maybeMatch(reg, str) {
            var m = str.match(reg);
            return m ? m[0] : null;
        }
        function range(a, b, str) {
            var begs, beg, left, right, result, ai = str.indexOf(a), bi = str.indexOf(b, ai + 1), i = ai;
            if (ai >= 0 && bi > 0) {
                for (begs = [], left = str.length; i >= 0 && !result; ) i == ai ? (begs.push(i), 
                ai = str.indexOf(a, i + 1)) : 1 == begs.length ? result = [ begs.pop(), bi ] : ((beg = begs.pop()) < left && (left = beg, 
                right = bi), bi = str.indexOf(b, i + 1)), i = ai < bi && ai >= 0 ? ai : bi;
                begs.length && (result = [ left, right ]);
            }
            return result;
        }
        module.exports = balanced, balanced.range = range;
    }, function(module, exports, __webpack_require__) {
        var concatMap = __webpack_require__(178), balanced = __webpack_require__(174);
        module.exports = function(str) {
            if (!str) return [];
            "{}" === str.substr(0, 2) && (str = "\\{\\}" + str.substr(2));
            return function expand(str, isTop) {
                var expansions = [], m = balanced("{", "}", str);
                if (!m || /\$$/.test(m.pre)) return [ str ];
                var n, isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body), isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body), isSequence = isNumericSequence || isAlphaSequence, isOptions = m.body.indexOf(",") >= 0;
                if (!isSequence && !isOptions) return m.post.match(/,.*\}/) ? (str = m.pre + "{" + m.body + escClose + m.post, 
                expand(str)) : [ str ];
                if (isSequence) n = m.body.split(/\.\./); else {
                    if (1 === (n = function parseCommaParts(str) {
                        if (!str) return [ "" ];
                        var parts = [], m = balanced("{", "}", str);
                        if (!m) return str.split(",");
                        var pre = m.pre, body = m.body, post = m.post, p = pre.split(",");
                        p[p.length - 1] += "{" + body + "}";
                        var postParts = parseCommaParts(post);
                        post.length && (p[p.length - 1] += postParts.shift(), p.push.apply(p, postParts));
                        return parts.push.apply(parts, p), parts;
                    }(m.body)).length) if (1 === (n = expand(n[0], !1).map(embrace)).length) return (post = m.post.length ? expand(m.post, !1) : [ "" ]).map((function(p) {
                        return m.pre + n[0] + p;
                    }));
                }
                var N, pre = m.pre, post = m.post.length ? expand(m.post, !1) : [ "" ];
                if (isSequence) {
                    var x = numeric(n[0]), y = numeric(n[1]), width = Math.max(n[0].length, n[1].length), incr = 3 == n.length ? Math.abs(numeric(n[2])) : 1, test = lte;
                    y < x && (incr *= -1, test = gte);
                    var pad = n.some(isPadded);
                    N = [];
                    for (var i = x; test(i, y); i += incr) {
                        var c;
                        if (isAlphaSequence) "\\" === (c = String.fromCharCode(i)) && (c = ""); else if (c = String(i), 
                        pad) {
                            var need = width - c.length;
                            if (need > 0) {
                                var z = new Array(need + 1).join("0");
                                c = i < 0 ? "-" + z + c.slice(1) : z + c;
                            }
                        }
                        N.push(c);
                    }
                } else N = concatMap(n, (function(el) {
                    return expand(el, !1);
                }));
                for (var j = 0; j < N.length; j++) for (var k = 0; k < post.length; k++) {
                    var expansion = pre + N[j] + post[k];
                    (!isTop || isSequence || expansion) && expansions.push(expansion);
                }
                return expansions;
            }(function(str) {
                return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
            }(str), !0).map(unescapeBraces);
        };
        var escSlash = "\0SLASH" + Math.random() + "\0", escOpen = "\0OPEN" + Math.random() + "\0", escClose = "\0CLOSE" + Math.random() + "\0", escComma = "\0COMMA" + Math.random() + "\0", escPeriod = "\0PERIOD" + Math.random() + "\0";
        function numeric(str) {
            return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
        }
        function unescapeBraces(str) {
            return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
        }
        function embrace(str) {
            return "{" + str + "}";
        }
        function isPadded(el) {
            return /^-?0\d/.test(el);
        }
        function lte(i, y) {
            return i <= y;
        }
        function gte(i, y) {
            return i >= y;
        }
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function preserveCamelCase(str) {
            let isLastCharLower = !1, isLastCharUpper = !1, isLastLastCharUpper = !1;
            for (let i = 0; i < str.length; i++) {
                const c = str[i];
                isLastCharLower && /[a-zA-Z]/.test(c) && c.toUpperCase() === c ? (str = str.substr(0, i) + "-" + str.substr(i), 
                isLastCharLower = !1, isLastLastCharUpper = isLastCharUpper, isLastCharUpper = !0, 
                i++) : isLastCharUpper && isLastLastCharUpper && /[a-zA-Z]/.test(c) && c.toLowerCase() === c ? (str = str.substr(0, i - 1) + "-" + str.substr(i - 1), 
                isLastLastCharUpper = isLastCharUpper, isLastCharUpper = !1, isLastCharLower = !0) : (isLastCharLower = c.toLowerCase() === c, 
                isLastLastCharUpper = isLastCharUpper, isLastCharUpper = c.toUpperCase() === c);
            }
            return str;
        }
        module.exports = function(str) {
            if (0 === (str = arguments.length > 1 ? Array.from(arguments).map(x => x.trim()).filter(x => x.length).join("-") : str.trim()).length) return "";
            if (1 === str.length) return str.toLowerCase();
            if (/^[a-z0-9]+$/.test(str)) return str;
            const hasUpperCase = str !== str.toLowerCase();
            return hasUpperCase && (str = preserveCamelCase(str)), str.replace(/^[_.\- ]+/, "").toLowerCase().replace(/[_.\- ]+(\w|$)/g, (m, p1) => p1.toUpperCase());
        };
    }, , function(module, exports) {
        module.exports = function(xs, fn) {
            for (var res = [], i = 0; i < xs.length; i++) {
                var x = fn(xs[i], i);
                isArray(x) ? res.push.apply(res, x) : res.push(x);
            }
            return res;
        };
        var isArray = Array.isArray || function(xs) {
            return "[object Array]" === Object.prototype.toString.call(xs);
        };
    }, function(module, exports, __webpack_require__) {
        __webpack_require__(205), __webpack_require__(207), __webpack_require__(210), __webpack_require__(206), 
        __webpack_require__(208), __webpack_require__(209), module.exports = __webpack_require__(23).Promise;
    }, function(module, exports) {
        module.exports = function() {};
    }, function(module, exports) {
        module.exports = function(it, Constructor, name, forbiddenField) {
            if (!(it instanceof Constructor) || void 0 !== forbiddenField && forbiddenField in it) throw TypeError(name + ": incorrect invocation!");
            return it;
        };
    }, function(module, exports, __webpack_require__) {
        var toIObject = __webpack_require__(74), toLength = __webpack_require__(110), toAbsoluteIndex = __webpack_require__(200);
        module.exports = function(IS_INCLUDES) {
            return function($this, el, fromIndex) {
                var value, O = toIObject($this), length = toLength(O.length), index = toAbsoluteIndex(fromIndex, length);
                if (IS_INCLUDES && el != el) {
                    for (;length > index; ) if ((value = O[index++]) != value) return !0;
                } else for (;length > index; index++) if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
                return !IS_INCLUDES && -1;
            };
        };
    }, function(module, exports, __webpack_require__) {
        var ctx = __webpack_require__(48), call = __webpack_require__(187), isArrayIter = __webpack_require__(186), anObject = __webpack_require__(27), toLength = __webpack_require__(110), getIterFn = __webpack_require__(203), BREAK = {}, RETURN = {};
        (exports = module.exports = function(iterable, entries, fn, that, ITERATOR) {
            var length, step, iterator, result, iterFn = ITERATOR ? function() {
                return iterable;
            } : getIterFn(iterable), f = ctx(fn, that, entries ? 2 : 1), index = 0;
            if ("function" != typeof iterFn) throw TypeError(iterable + " is not iterable!");
            if (isArrayIter(iterFn)) {
                for (length = toLength(iterable.length); length > index; index++) if ((result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index])) === BREAK || result === RETURN) return result;
            } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done; ) if ((result = call(iterator, f, step.value, entries)) === BREAK || result === RETURN) return result;
        }).BREAK = BREAK, exports.RETURN = RETURN;
    }, function(module, exports, __webpack_require__) {
        module.exports = !__webpack_require__(33) && !__webpack_require__(85)((function() {
            return 7 != Object.defineProperty(__webpack_require__(68)("div"), "a", {
                get: function() {
                    return 7;
                }
            }).a;
        }));
    }, function(module, exports) {
        module.exports = function(fn, args, that) {
            var un = void 0 === that;
            switch (args.length) {
              case 0:
                return un ? fn() : fn.call(that);

              case 1:
                return un ? fn(args[0]) : fn.call(that, args[0]);

              case 2:
                return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);

              case 3:
                return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);

              case 4:
                return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
            }
            return fn.apply(that, args);
        };
    }, function(module, exports, __webpack_require__) {
        var Iterators = __webpack_require__(35), ITERATOR = __webpack_require__(13)("iterator"), ArrayProto = Array.prototype;
        module.exports = function(it) {
            return void 0 !== it && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
        };
    }, function(module, exports, __webpack_require__) {
        var anObject = __webpack_require__(27);
        module.exports = function(iterator, fn, value, entries) {
            try {
                return entries ? fn(anObject(value)[0], value[1]) : fn(value);
            } catch (e) {
                var ret = iterator.return;
                throw void 0 !== ret && anObject(ret.call(iterator)), e;
            }
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var create = __webpack_require__(192), descriptor = __webpack_require__(106), setToStringTag = __webpack_require__(71), IteratorPrototype = {};
        __webpack_require__(31)(IteratorPrototype, __webpack_require__(13)("iterator"), (function() {
            return this;
        })), module.exports = function(Constructor, NAME, next) {
            Constructor.prototype = create(IteratorPrototype, {
                next: descriptor(1, next)
            }), setToStringTag(Constructor, NAME + " Iterator");
        };
    }, function(module, exports, __webpack_require__) {
        var ITERATOR = __webpack_require__(13)("iterator"), SAFE_CLOSING = !1;
        try {
            var riter = [ 7 ][ITERATOR]();
            riter.return = function() {
                SAFE_CLOSING = !0;
            }, Array.from(riter, (function() {
                throw 2;
            }));
        } catch (e) {}
        module.exports = function(exec, skipClosing) {
            if (!skipClosing && !SAFE_CLOSING) return !1;
            var safe = !1;
            try {
                var arr = [ 7 ], iter = arr[ITERATOR]();
                iter.next = function() {
                    return {
                        done: safe = !0
                    };
                }, arr[ITERATOR] = function() {
                    return iter;
                }, exec(arr);
            } catch (e) {}
            return safe;
        };
    }, function(module, exports) {
        module.exports = function(done, value) {
            return {
                value: value,
                done: !!done
            };
        };
    }, function(module, exports, __webpack_require__) {
        var global = __webpack_require__(11), macrotask = __webpack_require__(109).set, Observer = global.MutationObserver || global.WebKitMutationObserver, process = global.process, Promise = global.Promise, isNode = "process" == __webpack_require__(47)(process);
        module.exports = function() {
            var head, last, notify, flush = function() {
                var parent, fn;
                for (isNode && (parent = process.domain) && parent.exit(); head; ) {
                    fn = head.fn, head = head.next;
                    try {
                        fn();
                    } catch (e) {
                        throw head ? notify() : last = void 0, e;
                    }
                }
                last = void 0, parent && parent.enter();
            };
            if (isNode) notify = function() {
                process.nextTick(flush);
            }; else if (!Observer || global.navigator && global.navigator.standalone) if (Promise && Promise.resolve) {
                var promise = Promise.resolve(void 0);
                notify = function() {
                    promise.then(flush);
                };
            } else notify = function() {
                macrotask.call(global, flush);
            }; else {
                var toggle = !0, node = document.createTextNode("");
                new Observer(flush).observe(node, {
                    characterData: !0
                }), notify = function() {
                    node.data = toggle = !toggle;
                };
            }
            return function(fn) {
                var task = {
                    fn: fn,
                    next: void 0
                };
                last && (last.next = task), head || (head = task, notify()), last = task;
            };
        };
    }, function(module, exports, __webpack_require__) {
        var anObject = __webpack_require__(27), dPs = __webpack_require__(193), enumBugKeys = __webpack_require__(101), IE_PROTO = __webpack_require__(72)("IE_PROTO"), Empty = function() {}, _createDict = function() {
            var iframeDocument, iframe = __webpack_require__(68)("iframe"), i = enumBugKeys.length;
            for (iframe.style.display = "none", __webpack_require__(102).appendChild(iframe), 
            iframe.src = "javascript:", (iframeDocument = iframe.contentWindow.document).open(), 
            iframeDocument.write("<script>document.F=Object<\/script>"), iframeDocument.close(), 
            _createDict = iframeDocument.F; i--; ) delete _createDict.prototype[enumBugKeys[i]];
            return _createDict();
        };
        module.exports = Object.create || function(O, Properties) {
            var result;
            return null !== O ? (Empty.prototype = anObject(O), result = new Empty, Empty.prototype = null, 
            result[IE_PROTO] = O) : result = _createDict(), void 0 === Properties ? result : dPs(result, Properties);
        };
    }, function(module, exports, __webpack_require__) {
        var dP = __webpack_require__(50), anObject = __webpack_require__(27), getKeys = __webpack_require__(132);
        module.exports = __webpack_require__(33) ? Object.defineProperties : function(O, Properties) {
            anObject(O);
            for (var P, keys = getKeys(Properties), length = keys.length, i = 0; length > i; ) dP.f(O, P = keys[i++], Properties[P]);
            return O;
        };
    }, function(module, exports, __webpack_require__) {
        var has = __webpack_require__(49), toObject = __webpack_require__(133), IE_PROTO = __webpack_require__(72)("IE_PROTO"), ObjectProto = Object.prototype;
        module.exports = Object.getPrototypeOf || function(O) {
            return O = toObject(O), has(O, IE_PROTO) ? O[IE_PROTO] : "function" == typeof O.constructor && O instanceof O.constructor ? O.constructor.prototype : O instanceof Object ? ObjectProto : null;
        };
    }, function(module, exports, __webpack_require__) {
        var has = __webpack_require__(49), toIObject = __webpack_require__(74), arrayIndexOf = __webpack_require__(182)(!1), IE_PROTO = __webpack_require__(72)("IE_PROTO");
        module.exports = function(object, names) {
            var key, O = toIObject(object), i = 0, result = [];
            for (key in O) key != IE_PROTO && has(O, key) && result.push(key);
            for (;names.length > i; ) has(O, key = names[i++]) && (~arrayIndexOf(result, key) || result.push(key));
            return result;
        };
    }, function(module, exports, __webpack_require__) {
        var hide = __webpack_require__(31);
        module.exports = function(target, src, safe) {
            for (var key in src) safe && target[key] ? target[key] = src[key] : hide(target, key, src[key]);
            return target;
        };
    }, function(module, exports, __webpack_require__) {
        module.exports = __webpack_require__(31);
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var global = __webpack_require__(11), core = __webpack_require__(23), dP = __webpack_require__(50), DESCRIPTORS = __webpack_require__(33), SPECIES = __webpack_require__(13)("species");
        module.exports = function(KEY) {
            var C = "function" == typeof core[KEY] ? core[KEY] : global[KEY];
            DESCRIPTORS && C && !C[SPECIES] && dP.f(C, SPECIES, {
                configurable: !0,
                get: function() {
                    return this;
                }
            });
        };
    }, function(module, exports, __webpack_require__) {
        var toInteger = __webpack_require__(73), defined = __webpack_require__(67);
        module.exports = function(TO_STRING) {
            return function(that, pos) {
                var a, b, s = String(defined(that)), i = toInteger(pos), l = s.length;
                return i < 0 || i >= l ? TO_STRING ? "" : void 0 : (a = s.charCodeAt(i)) < 55296 || a > 56319 || i + 1 === l || (b = s.charCodeAt(i + 1)) < 56320 || b > 57343 ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : b - 56320 + (a - 55296 << 10) + 65536;
            };
        };
    }, function(module, exports, __webpack_require__) {
        var toInteger = __webpack_require__(73), max = Math.max, min = Math.min;
        module.exports = function(index, length) {
            return (index = toInteger(index)) < 0 ? max(index + length, 0) : min(index, length);
        };
    }, function(module, exports, __webpack_require__) {
        var isObject = __webpack_require__(34);
        module.exports = function(it, S) {
            if (!isObject(it)) return it;
            var fn, val;
            if (S && "function" == typeof (fn = it.toString) && !isObject(val = fn.call(it))) return val;
            if ("function" == typeof (fn = it.valueOf) && !isObject(val = fn.call(it))) return val;
            if (!S && "function" == typeof (fn = it.toString) && !isObject(val = fn.call(it))) return val;
            throw TypeError("Can't convert object to primitive value");
        };
    }, function(module, exports, __webpack_require__) {
        var navigator = __webpack_require__(11).navigator;
        module.exports = navigator && navigator.userAgent || "";
    }, function(module, exports, __webpack_require__) {
        var classof = __webpack_require__(100), ITERATOR = __webpack_require__(13)("iterator"), Iterators = __webpack_require__(35);
        module.exports = __webpack_require__(23).getIteratorMethod = function(it) {
            if (null != it) return it[ITERATOR] || it["@@iterator"] || Iterators[classof(it)];
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var addToUnscopables = __webpack_require__(180), step = __webpack_require__(190), Iterators = __webpack_require__(35), toIObject = __webpack_require__(74);
        module.exports = __webpack_require__(103)(Array, "Array", (function(iterated, kind) {
            this._t = toIObject(iterated), this._i = 0, this._k = kind;
        }), (function() {
            var O = this._t, kind = this._k, index = this._i++;
            return !O || index >= O.length ? (this._t = void 0, step(1)) : step(0, "keys" == kind ? index : "values" == kind ? O[index] : [ index, O[index] ]);
        }), "values"), Iterators.Arguments = Iterators.Array, addToUnscopables("keys"), 
        addToUnscopables("values"), addToUnscopables("entries");
    }, function(module, exports) {}, function(module, exports, __webpack_require__) {
        "use strict";
        var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper, LIBRARY = __webpack_require__(69), global = __webpack_require__(11), ctx = __webpack_require__(48), classof = __webpack_require__(100), $export = __webpack_require__(41), isObject = __webpack_require__(34), aFunction = __webpack_require__(46), anInstance = __webpack_require__(181), forOf = __webpack_require__(183), speciesConstructor = __webpack_require__(108), task = __webpack_require__(109).set, microtask = __webpack_require__(191)(), newPromiseCapabilityModule = __webpack_require__(70), perform = __webpack_require__(104), userAgent = __webpack_require__(202), promiseResolve = __webpack_require__(105), TypeError = global.TypeError, process = global.process, versions = process && process.versions, v8 = versions && versions.v8 || "", $Promise = global.Promise, isNode = "process" == classof(process), empty = function() {}, newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f, USE_NATIVE = !!function() {
            try {
                var promise = $Promise.resolve(1), FakePromise = (promise.constructor = {})[__webpack_require__(13)("species")] = function(exec) {
                    exec(empty, empty);
                };
                return (isNode || "function" == typeof PromiseRejectionEvent) && promise.then(empty) instanceof FakePromise && 0 !== v8.indexOf("6.6") && -1 === userAgent.indexOf("Chrome/66");
            } catch (e) {}
        }(), isThenable = function(it) {
            var then;
            return !(!isObject(it) || "function" != typeof (then = it.then)) && then;
        }, notify = function(promise, isReject) {
            if (!promise._n) {
                promise._n = !0;
                var chain = promise._c;
                microtask((function() {
                    for (var value = promise._v, ok = 1 == promise._s, i = 0, run = function(reaction) {
                        var result, then, exited, handler = ok ? reaction.ok : reaction.fail, resolve = reaction.resolve, reject = reaction.reject, domain = reaction.domain;
                        try {
                            handler ? (ok || (2 == promise._h && onHandleUnhandled(promise), promise._h = 1), 
                            !0 === handler ? result = value : (domain && domain.enter(), result = handler(value), 
                            domain && (domain.exit(), exited = !0)), result === reaction.promise ? reject(TypeError("Promise-chain cycle")) : (then = isThenable(result)) ? then.call(result, resolve, reject) : resolve(result)) : reject(value);
                        } catch (e) {
                            domain && !exited && domain.exit(), reject(e);
                        }
                    }; chain.length > i; ) run(chain[i++]);
                    promise._c = [], promise._n = !1, isReject && !promise._h && onUnhandled(promise);
                }));
            }
        }, onUnhandled = function(promise) {
            task.call(global, (function() {
                var result, handler, console, value = promise._v, unhandled = isUnhandled(promise);
                if (unhandled && (result = perform((function() {
                    isNode ? process.emit("unhandledRejection", value, promise) : (handler = global.onunhandledrejection) ? handler({
                        promise: promise,
                        reason: value
                    }) : (console = global.console) && console.error && console.error("Unhandled promise rejection", value);
                })), promise._h = isNode || isUnhandled(promise) ? 2 : 1), promise._a = void 0, 
                unhandled && result.e) throw result.v;
            }));
        }, isUnhandled = function(promise) {
            return 1 !== promise._h && 0 === (promise._a || promise._c).length;
        }, onHandleUnhandled = function(promise) {
            task.call(global, (function() {
                var handler;
                isNode ? process.emit("rejectionHandled", promise) : (handler = global.onrejectionhandled) && handler({
                    promise: promise,
                    reason: promise._v
                });
            }));
        }, $reject = function(value) {
            var promise = this;
            promise._d || (promise._d = !0, (promise = promise._w || promise)._v = value, promise._s = 2, 
            promise._a || (promise._a = promise._c.slice()), notify(promise, !0));
        }, $resolve = function $resolve(value) {
            var then, promise = this;
            if (!promise._d) {
                promise._d = !0, promise = promise._w || promise;
                try {
                    if (promise === value) throw TypeError("Promise can't be resolved itself");
                    (then = isThenable(value)) ? microtask((function() {
                        var wrapper = {
                            _w: promise,
                            _d: !1
                        };
                        try {
                            then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
                        } catch (e) {
                            $reject.call(wrapper, e);
                        }
                    })) : (promise._v = value, promise._s = 1, notify(promise, !1));
                } catch (e) {
                    $reject.call({
                        _w: promise,
                        _d: !1
                    }, e);
                }
            }
        };
        USE_NATIVE || ($Promise = function(executor) {
            anInstance(this, $Promise, "Promise", "_h"), aFunction(executor), Internal.call(this);
            try {
                executor(ctx($resolve, this, 1), ctx($reject, this, 1));
            } catch (err) {
                $reject.call(this, err);
            }
        }, (Internal = function(executor) {
            this._c = [], this._a = void 0, this._s = 0, this._d = !1, this._v = void 0, this._h = 0, 
            this._n = !1;
        }).prototype = __webpack_require__(196)($Promise.prototype, {
            then: function(onFulfilled, onRejected) {
                var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
                return reaction.ok = "function" != typeof onFulfilled || onFulfilled, reaction.fail = "function" == typeof onRejected && onRejected, 
                reaction.domain = isNode ? process.domain : void 0, this._c.push(reaction), this._a && this._a.push(reaction), 
                this._s && notify(this, !1), reaction.promise;
            },
            catch: function(onRejected) {
                return this.then(void 0, onRejected);
            }
        }), OwnPromiseCapability = function() {
            var promise = new Internal;
            this.promise = promise, this.resolve = ctx($resolve, promise, 1), this.reject = ctx($reject, promise, 1);
        }, newPromiseCapabilityModule.f = newPromiseCapability = function(C) {
            return C === $Promise || C === Wrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
        }), $export($export.G + $export.W + $export.F * !USE_NATIVE, {
            Promise: $Promise
        }), __webpack_require__(71)($Promise, "Promise"), __webpack_require__(198)("Promise"), 
        Wrapper = __webpack_require__(23).Promise, $export($export.S + $export.F * !USE_NATIVE, "Promise", {
            reject: function(r) {
                var capability = newPromiseCapability(this);
                return (0, capability.reject)(r), capability.promise;
            }
        }), $export($export.S + $export.F * (LIBRARY || !USE_NATIVE), "Promise", {
            resolve: function(x) {
                return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
            }
        }), $export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(189)((function(iter) {
            $Promise.all(iter).catch(empty);
        }))), "Promise", {
            all: function(iterable) {
                var C = this, capability = newPromiseCapability(C), resolve = capability.resolve, reject = capability.reject, result = perform((function() {
                    var values = [], index = 0, remaining = 1;
                    forOf(iterable, !1, (function(promise) {
                        var $index = index++, alreadyCalled = !1;
                        values.push(void 0), remaining++, C.resolve(promise).then((function(value) {
                            alreadyCalled || (alreadyCalled = !0, values[$index] = value, --remaining || resolve(values));
                        }), reject);
                    })), --remaining || resolve(values);
                }));
                return result.e && reject(result.v), capability.promise;
            },
            race: function(iterable) {
                var C = this, capability = newPromiseCapability(C), reject = capability.reject, result = perform((function() {
                    forOf(iterable, !1, (function(promise) {
                        C.resolve(promise).then(capability.resolve, reject);
                    }));
                }));
                return result.e && reject(result.v), capability.promise;
            }
        });
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var $at = __webpack_require__(199)(!0);
        __webpack_require__(103)(String, "String", (function(iterated) {
            this._t = String(iterated), this._i = 0;
        }), (function() {
            var point, O = this._t, index = this._i;
            return index >= O.length ? {
                value: void 0,
                done: !0
            } : (point = $at(O, index), this._i += point.length, {
                value: point,
                done: !1
            });
        }));
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var $export = __webpack_require__(41), core = __webpack_require__(23), global = __webpack_require__(11), speciesConstructor = __webpack_require__(108), promiseResolve = __webpack_require__(105);
        $export($export.P + $export.R, "Promise", {
            finally: function(onFinally) {
                var C = speciesConstructor(this, core.Promise || global.Promise), isFunction = "function" == typeof onFinally;
                return this.then(isFunction ? function(x) {
                    return promiseResolve(C, onFinally()).then((function() {
                        return x;
                    }));
                } : onFinally, isFunction ? function(e) {
                    return promiseResolve(C, onFinally()).then((function() {
                        throw e;
                    }));
                } : onFinally);
            }
        });
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var $export = __webpack_require__(41), newPromiseCapability = __webpack_require__(70), perform = __webpack_require__(104);
        $export($export.S, "Promise", {
            try: function(callbackfn) {
                var promiseCapability = newPromiseCapability.f(this), result = perform(callbackfn);
                return (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v), 
                promiseCapability.promise;
            }
        });
    }, function(module, exports, __webpack_require__) {
        __webpack_require__(204);
        for (var global = __webpack_require__(11), hide = __webpack_require__(31), Iterators = __webpack_require__(35), TO_STRING_TAG = __webpack_require__(13)("toStringTag"), DOMIterables = "CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","), i = 0; i < DOMIterables.length; i++) {
            var NAME = DOMIterables[i], Collection = global[NAME], proto = Collection && Collection.prototype;
            proto && !proto[TO_STRING_TAG] && hide(proto, TO_STRING_TAG, NAME), Iterators[NAME] = Iterators.Array;
        }
    }, function(module, exports, __webpack_require__) {
        function load() {
            var r;
            try {
                r = exports.storage.debug;
            } catch (e) {}
            return !r && "undefined" != typeof process && "env" in process && (r = process.env.DEBUG), 
            r;
        }
        (exports = module.exports = __webpack_require__(112)).log = function() {
            return "object" == typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
        }, exports.formatArgs = function(args) {
            var useColors = this.useColors;
            if (args[0] = (useColors ? "%c" : "") + this.namespace + (useColors ? " %c" : " ") + args[0] + (useColors ? "%c " : " ") + "+" + exports.humanize(this.diff), 
            !useColors) return;
            var c = "color: " + this.color;
            args.splice(1, 0, c, "color: inherit");
            var index = 0, lastC = 0;
            args[0].replace(/%[a-zA-Z%]/g, (function(match) {
                "%%" !== match && (index++, "%c" === match && (lastC = index));
            })), args.splice(lastC, 0, c);
        }, exports.save = function(namespaces) {
            try {
                null == namespaces ? exports.storage.removeItem("debug") : exports.storage.debug = namespaces;
            } catch (e) {}
        }, exports.load = load, exports.useColors = function() {
            if ("undefined" != typeof window && window.process && "renderer" === window.process.type) return !0;
            if ("undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) return !1;
            return "undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
        }, exports.storage = "undefined" != typeof chrome && void 0 !== chrome.storage ? chrome.storage.local : function() {
            try {
                return window.localStorage;
            } catch (e) {}
        }(), exports.colors = [ "#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33" ], 
        exports.formatters.j = function(v) {
            try {
                return JSON.stringify(v);
            } catch (err) {
                return "[UnexpectedJSONParseError]: " + err.message;
            }
        }, exports.enable(load());
    }, function(module, exports, __webpack_require__) {
        "undefined" == typeof process || "renderer" === process.type ? module.exports = __webpack_require__(211) : module.exports = __webpack_require__(213);
    }, function(module, exports, __webpack_require__) {
        var tty = __webpack_require__(79), util = __webpack_require__(2);
        (exports = module.exports = __webpack_require__(112)).init = function(debug) {
            debug.inspectOpts = {};
            for (var keys = Object.keys(exports.inspectOpts), i = 0; i < keys.length; i++) debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
        }, exports.log = function() {
            return process.stderr.write(util.format.apply(util, arguments) + "\n");
        }, exports.formatArgs = function(args) {
            var name = this.namespace;
            if (this.useColors) {
                var c = this.color, colorCode = "[3" + (c < 8 ? c : "8;5;" + c), prefix = "  " + colorCode + ";1m" + name + " [0m";
                args[0] = prefix + args[0].split("\n").join("\n" + prefix), args.push(colorCode + "m+" + exports.humanize(this.diff) + "[0m");
            } else args[0] = (exports.inspectOpts.hideDate ? "" : (new Date).toISOString() + " ") + name + " " + args[0];
        }, exports.save = function(namespaces) {
            null == namespaces ? delete process.env.DEBUG : process.env.DEBUG = namespaces;
        }, exports.load = load, exports.useColors = function() {
            return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
        }, exports.colors = [ 6, 2, 3, 4, 5, 1 ];
        try {
            var supportsColor = __webpack_require__(239);
            supportsColor && supportsColor.level >= 2 && (exports.colors = [ 20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221 ]);
        } catch (err) {}
        function load() {
            return process.env.DEBUG;
        }
        exports.inspectOpts = Object.keys(process.env).filter((function(key) {
            return /^debug_/i.test(key);
        })).reduce((function(obj, key) {
            var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (function(_, k) {
                return k.toUpperCase();
            })), val = process.env[key];
            return val = !!/^(yes|on|true|enabled)$/i.test(val) || !/^(no|off|false|disabled)$/i.test(val) && ("null" === val ? null : Number(val)), 
            obj[prop] = val, obj;
        }), {}), exports.formatters.o = function(v) {
            return this.inspectOpts.colors = this.useColors, util.inspect(v, this.inspectOpts).split("\n").map((function(str) {
                return str.trim();
            })).join(" ");
        }, exports.formatters.O = function(v) {
            return this.inspectOpts.colors = this.useColors, util.inspect(v, this.inspectOpts);
        }, exports.enable(load());
    }, , , , function(module, exports, __webpack_require__) {
        var pathModule = __webpack_require__(0), isWindows = "win32" === process.platform, fs = __webpack_require__(3), DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
        function maybeCallback(cb) {
            return "function" == typeof cb ? cb : function() {
                var callback;
                if (DEBUG) {
                    var backtrace = new Error;
                    callback = function(err) {
                        err && (backtrace.message = err.message, missingCallback(err = backtrace));
                    };
                } else callback = missingCallback;
                return callback;
                function missingCallback(err) {
                    if (err) {
                        if (process.throwDeprecation) throw err;
                        if (!process.noDeprecation) {
                            var msg = "fs: missing callback " + (err.stack || err.message);
                            process.traceDeprecation ? console.trace(msg) : console.error(msg);
                        }
                    }
                }
            }();
        }
        pathModule.normalize;
        if (isWindows) var nextPartRe = /(.*?)(?:[\/\\]+|$)/g; else nextPartRe = /(.*?)(?:[\/]+|$)/g;
        if (isWindows) var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/; else splitRootRe = /^[\/]*/;
        exports.realpathSync = function(p, cache) {
            if (p = pathModule.resolve(p), cache && Object.prototype.hasOwnProperty.call(cache, p)) return cache[p];
            var pos, current, base, previous, original = p, seenLinks = {}, knownHard = {};
            function start() {
                var m = splitRootRe.exec(p);
                pos = m[0].length, current = m[0], base = m[0], previous = "", isWindows && !knownHard[base] && (fs.lstatSync(base), 
                knownHard[base] = !0);
            }
            for (start(); pos < p.length; ) {
                nextPartRe.lastIndex = pos;
                var result = nextPartRe.exec(p);
                if (previous = current, current += result[0], base = previous + result[1], pos = nextPartRe.lastIndex, 
                !(knownHard[base] || cache && cache[base] === base)) {
                    var resolvedLink;
                    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) resolvedLink = cache[base]; else {
                        var stat = fs.lstatSync(base);
                        if (!stat.isSymbolicLink()) {
                            knownHard[base] = !0, cache && (cache[base] = base);
                            continue;
                        }
                        var linkTarget = null;
                        if (!isWindows) {
                            var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
                            seenLinks.hasOwnProperty(id) && (linkTarget = seenLinks[id]);
                        }
                        null === linkTarget && (fs.statSync(base), linkTarget = fs.readlinkSync(base)), 
                        resolvedLink = pathModule.resolve(previous, linkTarget), cache && (cache[base] = resolvedLink), 
                        isWindows || (seenLinks[id] = linkTarget);
                    }
                    p = pathModule.resolve(resolvedLink, p.slice(pos)), start();
                }
            }
            return cache && (cache[original] = p), p;
        }, exports.realpath = function(p, cache, cb) {
            if ("function" != typeof cb && (cb = maybeCallback(cache), cache = null), p = pathModule.resolve(p), 
            cache && Object.prototype.hasOwnProperty.call(cache, p)) return process.nextTick(cb.bind(null, null, cache[p]));
            var pos, current, base, previous, original = p, seenLinks = {}, knownHard = {};
            function start() {
                var m = splitRootRe.exec(p);
                pos = m[0].length, current = m[0], base = m[0], previous = "", isWindows && !knownHard[base] ? fs.lstat(base, (function(err) {
                    if (err) return cb(err);
                    knownHard[base] = !0, LOOP();
                })) : process.nextTick(LOOP);
            }
            function LOOP() {
                if (pos >= p.length) return cache && (cache[original] = p), cb(null, p);
                nextPartRe.lastIndex = pos;
                var result = nextPartRe.exec(p);
                return previous = current, current += result[0], base = previous + result[1], pos = nextPartRe.lastIndex, 
                knownHard[base] || cache && cache[base] === base ? process.nextTick(LOOP) : cache && Object.prototype.hasOwnProperty.call(cache, base) ? gotResolvedLink(cache[base]) : fs.lstat(base, gotStat);
            }
            function gotStat(err, stat) {
                if (err) return cb(err);
                if (!stat.isSymbolicLink()) return knownHard[base] = !0, cache && (cache[base] = base), 
                process.nextTick(LOOP);
                if (!isWindows) {
                    var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
                    if (seenLinks.hasOwnProperty(id)) return gotTarget(null, seenLinks[id], base);
                }
                fs.stat(base, (function(err) {
                    if (err) return cb(err);
                    fs.readlink(base, (function(err, target) {
                        isWindows || (seenLinks[id] = target), gotTarget(err, target);
                    }));
                }));
            }
            function gotTarget(err, target, base) {
                if (err) return cb(err);
                var resolvedLink = pathModule.resolve(previous, target);
                cache && (cache[base] = resolvedLink), gotResolvedLink(resolvedLink);
            }
            function gotResolvedLink(resolvedLink) {
                p = pathModule.resolve(resolvedLink, p.slice(pos)), start();
            }
            start();
        };
    }, function(module, exports, __webpack_require__) {
        module.exports = globSync, globSync.GlobSync = GlobSync;
        var fs = __webpack_require__(3), rp = __webpack_require__(114), minimatch = __webpack_require__(60), path = (minimatch.Minimatch, 
        __webpack_require__(75).Glob, __webpack_require__(2), __webpack_require__(0)), assert = __webpack_require__(22), isAbsolute = __webpack_require__(76), common = __webpack_require__(115), setopts = (common.alphasort, 
        common.alphasorti, common.setopts), ownProp = common.ownProp, childrenIgnored = common.childrenIgnored, isIgnored = common.isIgnored;
        function globSync(pattern, options) {
            if ("function" == typeof options || 3 === arguments.length) throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
            return new GlobSync(pattern, options).found;
        }
        function GlobSync(pattern, options) {
            if (!pattern) throw new Error("must provide pattern");
            if ("function" == typeof options || 3 === arguments.length) throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
            if (!(this instanceof GlobSync)) return new GlobSync(pattern, options);
            if (setopts(this, pattern, options), this.noprocess) return this;
            var n = this.minimatch.set.length;
            this.matches = new Array(n);
            for (var i = 0; i < n; i++) this._process(this.minimatch.set[i], i, !1);
            this._finish();
        }
        GlobSync.prototype._finish = function() {
            if (assert(this instanceof GlobSync), this.realpath) {
                var self = this;
                this.matches.forEach((function(matchset, index) {
                    var set = self.matches[index] = Object.create(null);
                    for (var p in matchset) try {
                        p = self._makeAbs(p), set[rp.realpathSync(p, self.realpathCache)] = !0;
                    } catch (er) {
                        if ("stat" !== er.syscall) throw er;
                        set[self._makeAbs(p)] = !0;
                    }
                }));
            }
            common.finish(this);
        }, GlobSync.prototype._process = function(pattern, index, inGlobStar) {
            assert(this instanceof GlobSync);
            for (var prefix, n = 0; "string" == typeof pattern[n]; ) n++;
            switch (n) {
              case pattern.length:
                return void this._processSimple(pattern.join("/"), index);

              case 0:
                prefix = null;
                break;

              default:
                prefix = pattern.slice(0, n).join("/");
            }
            var read, remain = pattern.slice(n);
            null === prefix ? read = "." : isAbsolute(prefix) || isAbsolute(pattern.join("/")) ? (prefix && isAbsolute(prefix) || (prefix = "/" + prefix), 
            read = prefix) : read = prefix;
            var abs = this._makeAbs(read);
            childrenIgnored(this, read) || (remain[0] === minimatch.GLOBSTAR ? this._processGlobStar(prefix, read, abs, remain, index, inGlobStar) : this._processReaddir(prefix, read, abs, remain, index, inGlobStar));
        }, GlobSync.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar) {
            var entries = this._readdir(abs, inGlobStar);
            if (entries) {
                for (var pn = remain[0], negate = !!this.minimatch.negate, rawGlob = pn._glob, dotOk = this.dot || "." === rawGlob.charAt(0), matchedEntries = [], i = 0; i < entries.length; i++) {
                    if ("." !== (e = entries[i]).charAt(0) || dotOk) (negate && !prefix ? !e.match(pn) : e.match(pn)) && matchedEntries.push(e);
                }
                var len = matchedEntries.length;
                if (0 !== len) if (1 !== remain.length || this.mark || this.stat) {
                    remain.shift();
                    for (i = 0; i < len; i++) {
                        var newPattern;
                        e = matchedEntries[i];
                        newPattern = prefix ? [ prefix, e ] : [ e ], this._process(newPattern.concat(remain), index, inGlobStar);
                    }
                } else {
                    this.matches[index] || (this.matches[index] = Object.create(null));
                    for (var i = 0; i < len; i++) {
                        var e = matchedEntries[i];
                        prefix && (e = "/" !== prefix.slice(-1) ? prefix + "/" + e : prefix + e), "/" !== e.charAt(0) || this.nomount || (e = path.join(this.root, e)), 
                        this._emitMatch(index, e);
                    }
                }
            }
        }, GlobSync.prototype._emitMatch = function(index, e) {
            if (!isIgnored(this, e)) {
                var abs = this._makeAbs(e);
                if (this.mark && (e = this._mark(e)), this.absolute && (e = abs), !this.matches[index][e]) {
                    if (this.nodir) {
                        var c = this.cache[abs];
                        if ("DIR" === c || Array.isArray(c)) return;
                    }
                    this.matches[index][e] = !0, this.stat && this._stat(e);
                }
            }
        }, GlobSync.prototype._readdirInGlobStar = function(abs) {
            if (this.follow) return this._readdir(abs, !1);
            var entries, lstat;
            try {
                lstat = fs.lstatSync(abs);
            } catch (er) {
                if ("ENOENT" === er.code) return null;
            }
            var isSym = lstat && lstat.isSymbolicLink();
            return this.symlinks[abs] = isSym, isSym || !lstat || lstat.isDirectory() ? entries = this._readdir(abs, !1) : this.cache[abs] = "FILE", 
            entries;
        }, GlobSync.prototype._readdir = function(abs, inGlobStar) {
            if (inGlobStar && !ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs);
            if (ownProp(this.cache, abs)) {
                var c = this.cache[abs];
                if (!c || "FILE" === c) return null;
                if (Array.isArray(c)) return c;
            }
            try {
                return this._readdirEntries(abs, fs.readdirSync(abs));
            } catch (er) {
                return this._readdirError(abs, er), null;
            }
        }, GlobSync.prototype._readdirEntries = function(abs, entries) {
            if (!this.mark && !this.stat) for (var i = 0; i < entries.length; i++) {
                var e = entries[i];
                e = "/" === abs ? abs + e : abs + "/" + e, this.cache[e] = !0;
            }
            return this.cache[abs] = entries, entries;
        }, GlobSync.prototype._readdirError = function(f, er) {
            switch (er.code) {
              case "ENOTSUP":
              case "ENOTDIR":
                var abs = this._makeAbs(f);
                if (this.cache[abs] = "FILE", abs === this.cwdAbs) {
                    var error = new Error(er.code + " invalid cwd " + this.cwd);
                    throw error.path = this.cwd, error.code = er.code, error;
                }
                break;

              case "ENOENT":
              case "ELOOP":
              case "ENAMETOOLONG":
              case "UNKNOWN":
                this.cache[this._makeAbs(f)] = !1;
                break;

              default:
                if (this.cache[this._makeAbs(f)] = !1, this.strict) throw er;
                this.silent || console.error("glob error", er);
            }
        }, GlobSync.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar) {
            var entries = this._readdir(abs, inGlobStar);
            if (entries) {
                var remainWithoutGlobStar = remain.slice(1), gspref = prefix ? [ prefix ] : [], noGlobStar = gspref.concat(remainWithoutGlobStar);
                this._process(noGlobStar, index, !1);
                var len = entries.length;
                if (!this.symlinks[abs] || !inGlobStar) for (var i = 0; i < len; i++) {
                    if ("." !== entries[i].charAt(0) || this.dot) {
                        var instead = gspref.concat(entries[i], remainWithoutGlobStar);
                        this._process(instead, index, !0);
                        var below = gspref.concat(entries[i], remain);
                        this._process(below, index, !0);
                    }
                }
            }
        }, GlobSync.prototype._processSimple = function(prefix, index) {
            var exists = this._stat(prefix);
            if (this.matches[index] || (this.matches[index] = Object.create(null)), exists) {
                if (prefix && isAbsolute(prefix) && !this.nomount) {
                    var trail = /[\/\\]$/.test(prefix);
                    "/" === prefix.charAt(0) ? prefix = path.join(this.root, prefix) : (prefix = path.resolve(this.root, prefix), 
                    trail && (prefix += "/"));
                }
                "win32" === process.platform && (prefix = prefix.replace(/\\/g, "/")), this._emitMatch(index, prefix);
            }
        }, GlobSync.prototype._stat = function(f) {
            var abs = this._makeAbs(f), needDir = "/" === f.slice(-1);
            if (f.length > this.maxLength) return !1;
            if (!this.stat && ownProp(this.cache, abs)) {
                var c = this.cache[abs];
                if (Array.isArray(c) && (c = "DIR"), !needDir || "DIR" === c) return c;
                if (needDir && "FILE" === c) return !1;
            }
            var stat = this.statCache[abs];
            if (!stat) {
                var lstat;
                try {
                    lstat = fs.lstatSync(abs);
                } catch (er) {
                    if (er && ("ENOENT" === er.code || "ENOTDIR" === er.code)) return this.statCache[abs] = !1, 
                    !1;
                }
                if (lstat && lstat.isSymbolicLink()) try {
                    stat = fs.statSync(abs);
                } catch (er) {
                    stat = lstat;
                } else stat = lstat;
            }
            this.statCache[abs] = stat;
            c = !0;
            return stat && (c = stat.isDirectory() ? "DIR" : "FILE"), this.cache[abs] = this.cache[abs] || c, 
            (!needDir || "FILE" !== c) && c;
        }, GlobSync.prototype._mark = function(p) {
            return common.mark(this, p);
        }, GlobSync.prototype._makeAbs = function(f) {
            return common.makeAbs(this, f);
        };
    }, , , function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = function(flag, argv) {
            var terminatorPos = (argv = argv || process.argv).indexOf("--"), prefix = /^--/.test(flag) ? "" : "--", pos = argv.indexOf(prefix + flag);
            return -1 !== pos && (-1 === terminatorPos || pos < terminatorPos);
        };
    }, , function(module, exports, __webpack_require__) {
        var wrappy = __webpack_require__(123), reqs = Object.create(null), once = __webpack_require__(61);
        function slice(args) {
            for (var length = args.length, array = [], i = 0; i < length; i++) array[i] = args[i];
            return array;
        }
        module.exports = wrappy((function(key, cb) {
            return reqs[key] ? (reqs[key].push(cb), null) : (reqs[key] = [ cb ], function(key) {
                return once((function RES() {
                    var cbs = reqs[key], len = cbs.length, args = slice(arguments);
                    try {
                        for (var i = 0; i < len; i++) cbs[i].apply(null, args);
                    } finally {
                        cbs.length > len ? (cbs.splice(0, len), process.nextTick((function() {
                            RES.apply(null, args);
                        }))) : delete reqs[key];
                    }
                }));
            }(key));
        }));
    }, function(module, exports) {
        "function" == typeof Object.create ? module.exports = function(ctor, superCtor) {
            ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype, {
                constructor: {
                    value: ctor,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            });
        } : module.exports = function(ctor, superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function() {};
            TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor, ctor.prototype.constructor = ctor;
        };
    }, , , function(module, exports, __webpack_require__) {
        module.exports = void 0 !== __webpack_require__;
    }, , function(module, exports) {
        var s = 1e3, m = 6e4, h = 60 * m, d = 24 * h;
        function plural(ms, n, name) {
            if (!(ms < n)) return ms < 1.5 * n ? Math.floor(ms / n) + " " + name : Math.ceil(ms / n) + " " + name + "s";
        }
        module.exports = function(val, options) {
            options = options || {};
            var ms, type = typeof val;
            if ("string" === type && val.length > 0) return function(str) {
                if ((str = String(str)).length > 100) return;
                var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
                if (!match) return;
                var n = parseFloat(match[1]);
                switch ((match[2] || "ms").toLowerCase()) {
                  case "years":
                  case "year":
                  case "yrs":
                  case "yr":
                  case "y":
                    return 315576e5 * n;

                  case "days":
                  case "day":
                  case "d":
                    return n * d;

                  case "hours":
                  case "hour":
                  case "hrs":
                  case "hr":
                  case "h":
                    return n * h;

                  case "minutes":
                  case "minute":
                  case "mins":
                  case "min":
                  case "m":
                    return n * m;

                  case "seconds":
                  case "second":
                  case "secs":
                  case "sec":
                  case "s":
                    return n * s;

                  case "milliseconds":
                  case "millisecond":
                  case "msecs":
                  case "msec":
                  case "ms":
                    return n;

                  default:
                    return;
                }
            }(val);
            if ("number" === type && !1 === isNaN(val)) return options.long ? plural(ms = val, d, "day") || plural(ms, h, "hour") || plural(ms, m, "minute") || plural(ms, s, "second") || ms + " ms" : function(ms) {
                if (ms >= d) return Math.round(ms / d) + "d";
                if (ms >= h) return Math.round(ms / h) + "h";
                if (ms >= m) return Math.round(ms / m) + "m";
                if (ms >= s) return Math.round(ms / s) + "s";
                return ms + "ms";
            }(val);
            throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
        };
    }, , , , function(module, exports, __webpack_require__) {
        module.exports = rimraf, rimraf.sync = rimrafSync;
        var assert = __webpack_require__(22), path = __webpack_require__(0), fs = __webpack_require__(3), glob = __webpack_require__(75), _0666 = parseInt("666", 8), defaultGlobOpts = {
            nosort: !0,
            silent: !0
        }, timeout = 0, isWindows = "win32" === process.platform;
        function defaults(options) {
            [ "unlink", "chmod", "stat", "lstat", "rmdir", "readdir" ].forEach((function(m) {
                options[m] = options[m] || fs[m], options[m += "Sync"] = options[m] || fs[m];
            })), options.maxBusyTries = options.maxBusyTries || 3, options.emfileWait = options.emfileWait || 1e3, 
            !1 === options.glob && (options.disableGlob = !0), options.disableGlob = options.disableGlob || !1, 
            options.glob = options.glob || defaultGlobOpts;
        }
        function rimraf(p, options, cb) {
            "function" == typeof options && (cb = options, options = {}), assert(p, "rimraf: missing path"), 
            assert.equal(typeof p, "string", "rimraf: path should be a string"), assert.equal(typeof cb, "function", "rimraf: callback function required"), 
            assert(options, "rimraf: invalid options argument provided"), assert.equal(typeof options, "object", "rimraf: options should be object"), 
            defaults(options);
            var busyTries = 0, errState = null, n = 0;
            if (options.disableGlob || !glob.hasMagic(p)) return afterGlob(null, [ p ]);
            function afterGlob(er, results) {
                return er ? cb(er) : 0 === (n = results.length) ? cb() : void results.forEach((function(p) {
                    rimraf_(p, options, (function CB(er) {
                        if (er) {
                            if (("EBUSY" === er.code || "ENOTEMPTY" === er.code || "EPERM" === er.code) && busyTries < options.maxBusyTries) return busyTries++, 
                            setTimeout((function() {
                                rimraf_(p, options, CB);
                            }), 100 * busyTries);
                            if ("EMFILE" === er.code && timeout < options.emfileWait) return setTimeout((function() {
                                rimraf_(p, options, CB);
                            }), timeout++);
                            "ENOENT" === er.code && (er = null);
                        }
                        timeout = 0, function(er) {
                            errState = errState || er, 0 == --n && cb(errState);
                        }(er);
                    }));
                }));
            }
            options.lstat(p, (function(er, stat) {
                if (!er) return afterGlob(null, [ p ]);
                glob(p, options.glob, afterGlob);
            }));
        }
        function rimraf_(p, options, cb) {
            assert(p), assert(options), assert("function" == typeof cb), options.lstat(p, (function(er, st) {
                return er && "ENOENT" === er.code ? cb(null) : (er && "EPERM" === er.code && isWindows && fixWinEPERM(p, options, er, cb), 
                st && st.isDirectory() ? rmdir(p, options, er, cb) : void options.unlink(p, (function(er) {
                    if (er) {
                        if ("ENOENT" === er.code) return cb(null);
                        if ("EPERM" === er.code) return isWindows ? fixWinEPERM(p, options, er, cb) : rmdir(p, options, er, cb);
                        if ("EISDIR" === er.code) return rmdir(p, options, er, cb);
                    }
                    return cb(er);
                })));
            }));
        }
        function fixWinEPERM(p, options, er, cb) {
            assert(p), assert(options), assert("function" == typeof cb), er && assert(er instanceof Error), 
            options.chmod(p, _0666, (function(er2) {
                er2 ? cb("ENOENT" === er2.code ? null : er) : options.stat(p, (function(er3, stats) {
                    er3 ? cb("ENOENT" === er3.code ? null : er) : stats.isDirectory() ? rmdir(p, options, er, cb) : options.unlink(p, cb);
                }));
            }));
        }
        function fixWinEPERMSync(p, options, er) {
            assert(p), assert(options), er && assert(er instanceof Error);
            try {
                options.chmodSync(p, _0666);
            } catch (er2) {
                if ("ENOENT" === er2.code) return;
                throw er;
            }
            try {
                var stats = options.statSync(p);
            } catch (er3) {
                if ("ENOENT" === er3.code) return;
                throw er;
            }
            stats.isDirectory() ? rmdirSync(p, options, er) : options.unlinkSync(p);
        }
        function rmdir(p, options, originalEr, cb) {
            assert(p), assert(options), originalEr && assert(originalEr instanceof Error), assert("function" == typeof cb), 
            options.rmdir(p, (function(er) {
                !er || "ENOTEMPTY" !== er.code && "EEXIST" !== er.code && "EPERM" !== er.code ? er && "ENOTDIR" === er.code ? cb(originalEr) : cb(er) : function(p, options, cb) {
                    assert(p), assert(options), assert("function" == typeof cb), options.readdir(p, (function(er, files) {
                        if (er) return cb(er);
                        var errState, n = files.length;
                        if (0 === n) return options.rmdir(p, cb);
                        files.forEach((function(f) {
                            rimraf(path.join(p, f), options, (function(er) {
                                if (!errState) return er ? cb(errState = er) : void (0 == --n && options.rmdir(p, cb));
                            }));
                        }));
                    }));
                }(p, options, cb);
            }));
        }
        function rimrafSync(p, options) {
            var results;
            if (defaults(options = options || {}), assert(p, "rimraf: missing path"), assert.equal(typeof p, "string", "rimraf: path should be a string"), 
            assert(options, "rimraf: missing options"), assert.equal(typeof options, "object", "rimraf: options should be object"), 
            options.disableGlob || !glob.hasMagic(p)) results = [ p ]; else try {
                options.lstatSync(p), results = [ p ];
            } catch (er) {
                results = glob.sync(p, options.glob);
            }
            if (results.length) for (var i = 0; i < results.length; i++) {
                p = results[i];
                try {
                    var st = options.lstatSync(p);
                } catch (er) {
                    if ("ENOENT" === er.code) return;
                    "EPERM" === er.code && isWindows && fixWinEPERMSync(p, options, er);
                }
                try {
                    st && st.isDirectory() ? rmdirSync(p, options, null) : options.unlinkSync(p);
                } catch (er) {
                    if ("ENOENT" === er.code) return;
                    if ("EPERM" === er.code) return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er);
                    if ("EISDIR" !== er.code) throw er;
                    rmdirSync(p, options, er);
                }
            }
        }
        function rmdirSync(p, options, originalEr) {
            assert(p), assert(options), originalEr && assert(originalEr instanceof Error);
            try {
                options.rmdirSync(p);
            } catch (er) {
                if ("ENOENT" === er.code) return;
                if ("ENOTDIR" === er.code) throw originalEr;
                "ENOTEMPTY" !== er.code && "EEXIST" !== er.code && "EPERM" !== er.code || function(p, options) {
                    assert(p), assert(options), options.readdirSync(p).forEach((function(f) {
                        rimrafSync(path.join(p, f), options);
                    }));
                    var retries = isWindows ? 100 : 1, i = 0;
                    for (;;) {
                        var threw = !0;
                        try {
                            var ret = options.rmdirSync(p, options);
                            return threw = !1, ret;
                        } finally {
                            if (++i < retries && threw) continue;
                        }
                    }
                }(p, options);
            }
        }
    }, , , , , , function(module, exports, __webpack_require__) {
        "use strict";
        var level, hasFlag = __webpack_require__(221), supportLevel = hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") ? 0 : hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor") ? 3 : hasFlag("color=256") ? 2 : hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always") ? 1 : process.stdout && !process.stdout.isTTY ? 0 : "win32" === process.platform ? 1 : "CI" in process.env ? "TRAVIS" in process.env || "Travis" === process.env.CI ? 1 : 0 : "TEAMCITY_VERSION" in process.env ? null === process.env.TEAMCITY_VERSION.match(/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/) ? 0 : 1 : /^(screen|xterm)-256(?:color)?/.test(process.env.TERM) ? 2 : /^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM) || "COLORTERM" in process.env ? 1 : (process.env.TERM, 
        0);
        0 === supportLevel && "FORCE_COLOR" in process.env && (supportLevel = 1), module.exports = process && (0 !== (level = supportLevel) && {
            level: level,
            hasBasic: !0,
            has256: level >= 2,
            has16m: level >= 3
        });
    } ]);
}, function(module, exports) {
    module.exports = require("util");
}, function(module, exports) {
    module.exports = require("crypto");
}, function(module, exports) {
    module.exports = require("stream");
}, function(module, exports) {
    module.exports = require("assert");
}, function(module, exports) {
    module.exports = require("os");
}, function(module, exports) {
    module.exports = require("buffer");
}, function(module, exports) {
    module.exports = require("tty");
}, function(module, exports, __webpack_require__) {
    const internalRe = __webpack_require__(3);
    module.exports = {
        re: internalRe.re,
        src: internalRe.src,
        tokens: internalRe.t,
        SEMVER_SPEC_VERSION: __webpack_require__(5).SEMVER_SPEC_VERSION,
        SemVer: __webpack_require__(0),
        compareIdentifiers: __webpack_require__(11).compareIdentifiers,
        rcompareIdentifiers: __webpack_require__(11).rcompareIdentifiers,
        parse: __webpack_require__(4),
        valid: __webpack_require__(35),
        clean: __webpack_require__(36),
        inc: __webpack_require__(37),
        diff: __webpack_require__(38),
        major: __webpack_require__(39),
        minor: __webpack_require__(40),
        patch: __webpack_require__(41),
        prerelease: __webpack_require__(42),
        compare: __webpack_require__(1),
        rcompare: __webpack_require__(43),
        compareLoose: __webpack_require__(44),
        compareBuild: __webpack_require__(13),
        sort: __webpack_require__(45),
        rsort: __webpack_require__(46),
        gt: __webpack_require__(7),
        lt: __webpack_require__(14),
        eq: __webpack_require__(12),
        neq: __webpack_require__(20),
        gte: __webpack_require__(15),
        lte: __webpack_require__(16),
        cmp: __webpack_require__(21),
        coerce: __webpack_require__(47),
        Comparator: __webpack_require__(8),
        Range: __webpack_require__(2),
        satisfies: __webpack_require__(9),
        toComparators: __webpack_require__(48),
        maxSatisfying: __webpack_require__(49),
        minSatisfying: __webpack_require__(50),
        minVersion: __webpack_require__(51),
        validRange: __webpack_require__(52),
        outside: __webpack_require__(17),
        gtr: __webpack_require__(53),
        ltr: __webpack_require__(54),
        intersects: __webpack_require__(55),
        simplifyRange: __webpack_require__(56),
        subset: __webpack_require__(57)
    };
}, function(module, exports, __webpack_require__) {
    const parse = __webpack_require__(4);
    module.exports = (version, options) => {
        const v = parse(version, options);
        return v ? v.version : null;
    };
}, function(module, exports, __webpack_require__) {
    const parse = __webpack_require__(4);
    module.exports = (version, options) => {
        const s = parse(version.trim().replace(/^[=v]+/, ""), options);
        return s ? s.version : null;
    };
}, function(module, exports, __webpack_require__) {
    const SemVer = __webpack_require__(0);
    module.exports = (version, release, options, identifier) => {
        "string" == typeof options && (identifier = options, options = void 0);
        try {
            return new SemVer(version, options).inc(release, identifier).version;
        } catch (er) {
            return null;
        }
    };
}, function(module, exports, __webpack_require__) {
    const parse = __webpack_require__(4), eq = __webpack_require__(12);
    module.exports = (version1, version2) => {
        if (eq(version1, version2)) return null;
        {
            const v1 = parse(version1), v2 = parse(version2), hasPre = v1.prerelease.length || v2.prerelease.length, prefix = hasPre ? "pre" : "", defaultResult = hasPre ? "prerelease" : "";
            for (const key in v1) if (("major" === key || "minor" === key || "patch" === key) && v1[key] !== v2[key]) return prefix + key;
            return defaultResult;
        }
    };
}, function(module, exports, __webpack_require__) {
    const SemVer = __webpack_require__(0);
    module.exports = (a, loose) => new SemVer(a, loose).major;
}, function(module, exports, __webpack_require__) {
    const SemVer = __webpack_require__(0);
    module.exports = (a, loose) => new SemVer(a, loose).minor;
}, function(module, exports, __webpack_require__) {
    const SemVer = __webpack_require__(0);
    module.exports = (a, loose) => new SemVer(a, loose).patch;
}, function(module, exports, __webpack_require__) {
    const parse = __webpack_require__(4);
    module.exports = (version, options) => {
        const parsed = parse(version, options);
        return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
}, function(module, exports, __webpack_require__) {
    const compare = __webpack_require__(1);
    module.exports = (a, b, loose) => compare(b, a, loose);
}, function(module, exports, __webpack_require__) {
    const compare = __webpack_require__(1);
    module.exports = (a, b) => compare(a, b, !0);
}, function(module, exports, __webpack_require__) {
    const compareBuild = __webpack_require__(13);
    module.exports = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
}, function(module, exports, __webpack_require__) {
    const compareBuild = __webpack_require__(13);
    module.exports = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
}, function(module, exports, __webpack_require__) {
    const SemVer = __webpack_require__(0), parse = __webpack_require__(4), _require = __webpack_require__(3), re = _require.re, t = _require.t;
    module.exports = (version, options) => {
        if (version instanceof SemVer) return version;
        if ("number" == typeof version && (version = String(version)), "string" != typeof version) return null;
        let match = null;
        if ((options = options || {}).rtl) {
            let next;
            for (;(next = re[t.COERCERTL].exec(version)) && (!match || match.index + match[0].length !== version.length); ) match && next.index + next[0].length === match.index + match[0].length || (match = next), 
            re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
            re[t.COERCERTL].lastIndex = -1;
        } else match = version.match(re[t.COERCE]);
        return null === match ? null : parse(`${match[2]}.${match[3] || "0"}.${match[4] || "0"}`, options);
    };
}, function(module, exports, __webpack_require__) {
    const Range = __webpack_require__(2);
    module.exports = (range, options) => new Range(range, options).set.map(comp => comp.map(c => c.value).join(" ").trim().split(" "));
}, function(module, exports, __webpack_require__) {
    const SemVer = __webpack_require__(0), Range = __webpack_require__(2);
    module.exports = (versions, range, options) => {
        let max = null, maxSV = null, rangeObj = null;
        try {
            rangeObj = new Range(range, options);
        } catch (er) {
            return null;
        }
        return versions.forEach(v => {
            rangeObj.test(v) && (max && -1 !== maxSV.compare(v) || (max = v, maxSV = new SemVer(max, options)));
        }), max;
    };
}, function(module, exports, __webpack_require__) {
    const SemVer = __webpack_require__(0), Range = __webpack_require__(2);
    module.exports = (versions, range, options) => {
        let min = null, minSV = null, rangeObj = null;
        try {
            rangeObj = new Range(range, options);
        } catch (er) {
            return null;
        }
        return versions.forEach(v => {
            rangeObj.test(v) && (min && 1 !== minSV.compare(v) || (min = v, minSV = new SemVer(min, options)));
        }), min;
    };
}, function(module, exports, __webpack_require__) {
    const SemVer = __webpack_require__(0), Range = __webpack_require__(2), gt = __webpack_require__(7);
    module.exports = (range, loose) => {
        range = new Range(range, loose);
        let minver = new SemVer("0.0.0");
        if (range.test(minver)) return minver;
        if (minver = new SemVer("0.0.0-0"), range.test(minver)) return minver;
        minver = null;
        for (let i = 0; i < range.set.length; ++i) {
            range.set[i].forEach(comparator => {
                const compver = new SemVer(comparator.semver.version);
                switch (comparator.operator) {
                  case ">":
                    0 === compver.prerelease.length ? compver.patch++ : compver.prerelease.push(0), 
                    compver.raw = compver.format();

                  case "":
                  case ">=":
                    minver && !gt(minver, compver) || (minver = compver);
                    break;

                  case "<":
                  case "<=":
                    break;

                  default:
                    throw new Error("Unexpected operation: " + comparator.operator);
                }
            });
        }
        return minver && range.test(minver) ? minver : null;
    };
}, function(module, exports, __webpack_require__) {
    const Range = __webpack_require__(2);
    module.exports = (range, options) => {
        try {
            return new Range(range, options).range || "*";
        } catch (er) {
            return null;
        }
    };
}, function(module, exports, __webpack_require__) {
    const outside = __webpack_require__(17);
    module.exports = (version, range, options) => outside(version, range, ">", options);
}, function(module, exports, __webpack_require__) {
    const outside = __webpack_require__(17);
    module.exports = (version, range, options) => outside(version, range, "<", options);
}, function(module, exports, __webpack_require__) {
    const Range = __webpack_require__(2);
    module.exports = (r1, r2, options) => (r1 = new Range(r1, options), r2 = new Range(r2, options), 
    r1.intersects(r2));
}, function(module, exports, __webpack_require__) {
    function _slicedToArray(arr, i) {
        return function(arr) {
            if (Array.isArray(arr)) return arr;
        }(arr) || function(arr, i) {
            if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(arr))) return;
            var _arr = [], _n = !0, _d = !1, _e = void 0;
            try {
                for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done) && (_arr.push(_s.value), 
                !i || _arr.length !== i); _n = !0) ;
            } catch (err) {
                _d = !0, _e = err;
            } finally {
                try {
                    _n || null == _i.return || _i.return();
                } finally {
                    if (_d) throw _e;
                }
            }
            return _arr;
        }(arr, i) || _unsupportedIterableToArray(arr, i) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }();
    }
    function _unsupportedIterableToArray(o, minLen) {
        if (o) {
            if ("string" == typeof o) return _arrayLikeToArray(o, minLen);
            var n = Object.prototype.toString.call(o).slice(8, -1);
            return "Object" === n && o.constructor && (n = o.constructor.name), "Map" === n || "Set" === n ? Array.from(o) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _arrayLikeToArray(o, minLen) : void 0;
        }
    }
    function _arrayLikeToArray(arr, len) {
        (null == len || len > arr.length) && (len = arr.length);
        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
        return arr2;
    }
    const satisfies = __webpack_require__(9), compare = __webpack_require__(1);
    module.exports = (versions, range, options) => {
        const set = [];
        let min = null, prev = null;
        const v = versions.sort((a, b) => compare(a, b, options));
        var _step, _iterator = function(o, allowArrayLike) {
            var it;
            if ("undefined" == typeof Symbol || null == o[Symbol.iterator]) {
                if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && "number" == typeof o.length) {
                    it && (o = it);
                    var i = 0, F = function() {};
                    return {
                        s: F,
                        n: function() {
                            return i >= o.length ? {
                                done: !0
                            } : {
                                done: !1,
                                value: o[i++]
                            };
                        },
                        e: function(_e2) {
                            throw _e2;
                        },
                        f: F
                    };
                }
                throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            var err, normalCompletion = !0, didErr = !1;
            return {
                s: function() {
                    it = o[Symbol.iterator]();
                },
                n: function() {
                    var step = it.next();
                    return normalCompletion = step.done, step;
                },
                e: function(_e3) {
                    didErr = !0, err = _e3;
                },
                f: function() {
                    try {
                        normalCompletion || null == it.return || it.return();
                    } finally {
                        if (didErr) throw err;
                    }
                }
            };
        }(v);
        try {
            for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                const version = _step.value;
                satisfies(version, range, options) ? (prev = version, min || (min = version)) : (prev && set.push([ min, prev ]), 
                prev = null, min = null);
            }
        } catch (err) {
            _iterator.e(err);
        } finally {
            _iterator.f();
        }
        min && set.push([ min, null ]);
        const ranges = [];
        for (var _i = 0, _set = set; _i < _set.length; _i++) {
            const _set$_i = _slicedToArray(_set[_i], 2), min = _set$_i[0], max = _set$_i[1];
            min === max ? ranges.push(min) : max || min !== v[0] ? max ? min === v[0] ? ranges.push("<=" + max) : ranges.push(`${min} - ${max}`) : ranges.push(">=" + min) : ranges.push("*");
        }
        const simplified = ranges.join(" || "), original = "string" == typeof range.raw ? range.raw : String(range);
        return simplified.length < original.length ? simplified : range;
    };
}, function(module, exports, __webpack_require__) {
    function _createForOfIteratorHelper(o, allowArrayLike) {
        var it;
        if ("undefined" == typeof Symbol || null == o[Symbol.iterator]) {
            if (Array.isArray(o) || (it = function(o, minLen) {
                if (!o) return;
                if ("string" == typeof o) return _arrayLikeToArray(o, minLen);
                var n = Object.prototype.toString.call(o).slice(8, -1);
                "Object" === n && o.constructor && (n = o.constructor.name);
                if ("Map" === n || "Set" === n) return Array.from(o);
                if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
            }(o)) || allowArrayLike && o && "number" == typeof o.length) {
                it && (o = it);
                var i = 0, F = function() {};
                return {
                    s: F,
                    n: function() {
                        return i >= o.length ? {
                            done: !0
                        } : {
                            done: !1,
                            value: o[i++]
                        };
                    },
                    e: function(_e) {
                        throw _e;
                    },
                    f: F
                };
            }
            throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        var err, normalCompletion = !0, didErr = !1;
        return {
            s: function() {
                it = o[Symbol.iterator]();
            },
            n: function() {
                var step = it.next();
                return normalCompletion = step.done, step;
            },
            e: function(_e2) {
                didErr = !0, err = _e2;
            },
            f: function() {
                try {
                    normalCompletion || null == it.return || it.return();
                } finally {
                    if (didErr) throw err;
                }
            }
        };
    }
    function _arrayLikeToArray(arr, len) {
        (null == len || len > arr.length) && (len = arr.length);
        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
        return arr2;
    }
    const Range = __webpack_require__(2), ANY = __webpack_require__(8).ANY, satisfies = __webpack_require__(9), compare = __webpack_require__(1), simpleSubset = (sub, dom, options) => {
        if (1 === sub.length && sub[0].semver === ANY) return 1 === dom.length && dom[0].semver === ANY;
        const eqSet = new Set;
        let gt, lt;
        var _step3, _iterator3 = _createForOfIteratorHelper(sub);
        try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
                const c = _step3.value;
                ">" === c.operator || ">=" === c.operator ? gt = higherGT(gt, c, options) : "<" === c.operator || "<=" === c.operator ? lt = lowerLT(lt, c, options) : eqSet.add(c.semver);
            }
        } catch (err) {
            _iterator3.e(err);
        } finally {
            _iterator3.f();
        }
        if (eqSet.size > 1) return null;
        let gtltComp;
        if (gt && lt) {
            if (gtltComp = compare(gt.semver, lt.semver, options), gtltComp > 0) return null;
            if (0 === gtltComp && (">=" !== gt.operator || "<=" !== lt.operator)) return null;
        }
        var _step4, _iterator4 = _createForOfIteratorHelper(eqSet);
        try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done; ) {
                const eq = _step4.value;
                if (gt && !satisfies(eq, String(gt), options)) return null;
                if (lt && !satisfies(eq, String(lt), options)) return null;
                var _step6, _iterator6 = _createForOfIteratorHelper(dom);
                try {
                    for (_iterator6.s(); !(_step6 = _iterator6.n()).done; ) {
                        const c = _step6.value;
                        if (!satisfies(eq, String(c), options)) return !1;
                    }
                } catch (err) {
                    _iterator6.e(err);
                } finally {
                    _iterator6.f();
                }
                return !0;
            }
        } catch (err) {
            _iterator4.e(err);
        } finally {
            _iterator4.f();
        }
        let higher, lower, hasDomLT, hasDomGT;
        var _step5, _iterator5 = _createForOfIteratorHelper(dom);
        try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done; ) {
                const c = _step5.value;
                if (hasDomGT = hasDomGT || ">" === c.operator || ">=" === c.operator, hasDomLT = hasDomLT || "<" === c.operator || "<=" === c.operator, 
                gt) if (">" === c.operator || ">=" === c.operator) {
                    if (higher = higherGT(gt, c, options), higher === c) return !1;
                } else if (">=" === gt.operator && !satisfies(gt.semver, String(c), options)) return !1;
                if (lt) if ("<" === c.operator || "<=" === c.operator) {
                    if (lower = lowerLT(lt, c, options), lower === c) return !1;
                } else if ("<=" === lt.operator && !satisfies(lt.semver, String(c), options)) return !1;
                if (!c.operator && (lt || gt) && 0 !== gtltComp) return !1;
            }
        } catch (err) {
            _iterator5.e(err);
        } finally {
            _iterator5.f();
        }
        return !(gt && hasDomLT && !lt && 0 !== gtltComp) && !(lt && hasDomGT && !gt && 0 !== gtltComp);
    }, higherGT = (a, b, options) => {
        if (!a) return b;
        const comp = compare(a.semver, b.semver, options);
        return comp > 0 ? a : comp < 0 || ">" === b.operator && ">=" === a.operator ? b : a;
    }, lowerLT = (a, b, options) => {
        if (!a) return b;
        const comp = compare(a.semver, b.semver, options);
        return comp < 0 ? a : comp > 0 || "<" === b.operator && "<=" === a.operator ? b : a;
    };
    module.exports = (sub, dom, options) => {
        sub = new Range(sub, options), dom = new Range(dom, options);
        let sawNonNull = !1;
        var _step, _iterator = _createForOfIteratorHelper(sub.set);
        try {
            OUTER: for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                const simpleSub = _step.value;
                var _step2, _iterator2 = _createForOfIteratorHelper(dom.set);
                try {
                    for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
                        const simpleDom = _step2.value, isSub = simpleSubset(simpleSub, simpleDom, options);
                        if (sawNonNull = sawNonNull || null !== isSub, isSub) continue OUTER;
                    }
                } catch (err) {
                    _iterator2.e(err);
                } finally {
                    _iterator2.f();
                }
                if (sawNonNull) return !1;
            }
        } catch (err) {
            _iterator.e(err);
        } finally {
            _iterator.f();
        }
        return !0;
    };
} ]);