var indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Ext.define("KeisenUtil.Base", {
    config: {
        controller: null
    },
    constructor: function (config) {
        this.initConfig(config);
        return this;
    },
    textToDataImpl: function (text, cutLines, lastLine) {
        var lastIndes, lastIndex, me, rows;
        if (lastLine == null) {
            lastLine = false;
        }
        me = this;
        lastIndex = -1;
        if (lastLine) {
            lastIndes = -2;
        }
        rows = text.split(/\r?\n/).filter(function (line, lineNo) {
            return !(indexOf.call(cutLines, lineNo) >= 0);
        }).slice(0).map(function (line) {
            return line.split(/\|/).map(function (col) {
                return me.escapeMarkdownToData(col).trim();
            }).slice(1, -1);
        }).slice(0, +lastIndex + 1 || 9e9);
        return rows;
    },
    escapeDataToMarkdown: function (text) {
        return text.replace(/\r?\n/g, "<br>").replace(/\|/g, "｜").replace(/\\/g, "\\\\");
    },
    escapeMarkdownToData: function (text) {
        return text.replace(/<br>/gi, "\n").replace(/｜/g, "|").replace(/\\\\/g, "\\");
    }
});

Ext.define("KeisenUtil.Keisen", {
    extend: "KeisenUtil.Base",
    dataToText: function (data) {
        var e, ret;
        ret = {
            text: "",
            error: ""
        };
        try {
            data.rows = data.rows.map(function (row) {
                return row.map(function (col) {
                    return col.replace(/\r?\n/g, " ");
                });
            });
            ret.text = StrUtil.makeKeisenImpl(data.cols, data.rows);
        } catch (_error) {
            e = _error;
            console.log(e);
            ret.error = e.toString();
        }
        return ret;
    },
    textToData: function (text) {
        var ret;
        ret = {
            rows: []
        };
        return this.textToDataImpl(text, [0, 2], true);
    }
});

Ext.define("KeisenUtil.Redmine", {
    extend: "KeisenUtil.Base",
    dataToText: function (data) {
        var cols, e, me, result, ret, rows;
        me = this;
        ret = {
            text: "",
            error: ""
        };
        cols = data.cols;
        rows = data.rows;
        try {
            result = [];
            result.push("|" + cols.map(function (col) {
                return "_. " + col;
            }).join(" |") + " |");
            rows.map(function (row) {
                row = row.map(function (v) {
                    return me.escapeDataToMarkdown(v);
                });
                return result.push("| " + row.join(" | ") + " |");
            });
            ret.text = result.join("\n");
        } catch (_error) {
            e = _error;
            console.log(e);
            ret.error = e.toString();
        }
        return ret;
    },
    textToData: function (text) {
        var head, ret, rows;
        ret = {
            rows: []
        };
        rows = this.textToDataImpl(text, [], false);
        head = rows[0];
        head.forEach(function (col, idx) {
            return head[idx] = col.replace(/_\./, "").trim();
        });
        return rows;
    }
});

Ext.define("KeisenUtil.Html", {
    extend: "KeisenUtil.Base",
    dataToText: function (data) {
        var alignRight, cols, e, me, result, ret, rows;
        me = this;
        ret = {
            text: "",
            error: ""
        };
        cols = data.cols;
        rows = data.rows;
        try {
            alignRight = rows[0].map(function (col) {
                return Ext.isNumeric(("" + col).replace(/,/g, ""));
            }).map(function (isNum) {
                if (isNum) {
                    return ":";
                } else {
                    return "";
                }
            });
            result = ["<table border=1>"];
            result.push("  <tr><th>" + cols.join("</th><th>") + "</th></tr>");
            rows.map(function (row) {
                row = row.map(function (v) {
                    return me.escapeDataToMarkdown(v);
                });
                return result.push("  <tr><td>" + row.join("</td><td>") + "</td></tr>");
            });
            result.push("</table>");
            ret.text = result.join("\n");
        } catch (_error) {
            e = _error;
            console.log(e);
            ret.error = e.toString();
        }
        return ret;
    },
    textToData: function (text) {
        var ret;
        ret = {
            rows: []
        };
        return this.textToDataImpl(text, [1], false);
    }
});

Ext.define("KeisenUtil.Gitlab", {
    extend: "KeisenUtil.Base",
    dataToText: function (data) {
        var alignRight, cols, e, me, result, ret, rows;
        me = this;
        ret = {
            text: "",
            error: ""
        };
        cols = data.cols;
        rows = data.rows;
        try {
            alignRight = rows[0].map(function (col) {
                return Ext.isNumeric(("" + col).replace(/,/g, ""));
            }).map(function (isNum) {
                if (isNum) {
                    return ":";
                } else {
                    return "";
                }
            });
            result = [];
            result.push("| " + cols.join(" | ") + " |");
            result.push("| " + cols.map(function (col, idx) {
                return "----" + alignRight[idx];
            }).join(" | ") + " |");
            rows.map(function (row) {
                row = row.map(function (v) {
                    return me.escapeDataToMarkdown(v);
                });
                return result.push("| " + row.join(" | ") + " |");
            });
            ret.text = result.join("\n");
        } catch (_error) {
            e = _error;
            console.log(e);
            ret.error = e.toString();
        }
        return ret;
    },
    textToData: function (text) {
        var ret;
        ret = {
            rows: []
        };
        return this.textToDataImpl(text, [1], false);
    }
});

Ext.define("StrUtil", {
    statics: {
        regNum: /^[+-]?\d[0-9,]*(\.\d+)?$/,
        multiCaseConvert: function (obj, attributeName) {
            var columnName, columnValue, me;
            me = this;
            columnName = me.caseConvert(attributeName);
            columnValue = me.caseConvert(obj[attributeName]);
            obj[columnName.SNAKE_CASE] = columnValue.SNAKE_CASE;
            obj[columnName.snake_case] = columnValue.snake_case;
            obj[columnName.CamelCase] = columnValue.CamelCase;
            return obj[columnName.camelCase] = columnValue.camelCase;
        },
        caseConvert: function (snakecase) {
            var CamelCase, me, ret;
            me = this;
            CamelCase = me.toCamelCase(snakecase);
            return ret = {
                SNAKE_CASE: snakecase.toUpperCase(),
                snake_case: snakecase.toLowerCase(),
                CamelCase: CamelCase,
                camelCase: CamelCase[0].toLowerCase() + CamelCase.slice(1),
                SHORT: me.toShortName(snakecase)
            };
        },
        toCamelCase: function (snakecase) {
            snakecase = snakecase.replace(/_+/g, "_");
            return snakecase.toLowerCase().split("_").map(function (token) {
                return token[0].toUpperCase() + token.slice(1);
            }).join("");
        },
        toShortName: function (snakecase) {
            snakecase = snakecase.replace(/_+/g, "_");
            return snakecase.toLowerCase().split("_").map(function (token) {
                return token[0].toUpperCase();
            }).join("");
        },
        expandTabSpace: function (text, tabWidth) {
            var amari, ch, cur, j, k, len1, ref, result, x;
            if (text.indexOf("\t") === -1) {
                return text;
            }
            if (!tabWidth) {
                tabWidth = 4;
            }
            result = [];
            cur = 0;
            for (j = 0, len1 = text.length; j < len1; j++) {
                ch = text[j];
                if (ch === "\t") {
                    amari = tabWidth - cur % tabWidth;
                    for (x = k = 0, ref = amari - 1; 0 <= ref ? k <= ref : k >= ref; x = 0 <= ref ? ++k : --k) {
                        result.push(" ");
                        cur += 1;
                    }
                } else {
                    result.push(ch);
                    cur += 1;
                }
            }
            return result.join("");
        },
        expandAllTextTabSpace: function (lines, tabWidth, indent) {
            var me;
            if (indent == null) {
                indent = "";
            }
            me = this;
            return lines.split(/\r?\n/).map(function (line) {
                return indent + me.expandTabSpace(line, tabWidth);
            }).join("\n");
        },
        tabFormatImpl: function (line, reTabSpace, tabWidth) {
            var amari, delta, i, ret, spaces, tabCnt, tabInfo, tabSpaceIndex;
            tabSpaceIndex = this.expandTabSpace(line, tabWidth).replace(/[\u0100-\uffff]/g, 11).indexOf("/*TAB=>");
            if (tabSpaceIndex >= 0) {
                ret = line.match(reTabSpace);
                tabInfo = {
                    rep: ret[1],
                    pos: Number(ret[2])
                };
                spaces = " ";
                delta = tabInfo.pos - (tabSpaceIndex + 1);
                if (delta > 0) {
                    tabCnt = Math.floor(delta / tabWidth);
                    amari = delta % tabWidth;
                    if (amari > 0) {
                        tabCnt += 1;
                    }
                    spaces = ((function () {
                        var j, ref, results1;
                        results1 = [];
                        for (i = j = 0, ref = tabCnt; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
                            results1.push("");
                        }
                        return results1;
                    })()).join("\t");
                }
                line = line.replace(tabInfo.rep, spaces);
            }
            return line;
        },
        tabFormat: function (lines, tabWidth) {
            var j, len1, line, reTabSpace, result;
            if (tabWidth == null) {
                tabWidth = 4;
            }
            reTabSpace = /(\/\*TAB=>(\d+)\*\/)/;
            result = [];
            for (j = 0, len1 = lines.length; j < len1; j++) {
                line = lines[j];
                line = line.replace(/\/\*TAB\*\//g, "\t");
                while (line.indexOf("/*TAB=>") >= 0) {
                    line = this.tabFormatImpl(line, reTabSpace, tabWidth);
                }
                result.push(line);
            }
            return result;
        },
        getLength: function (w) {
            return w.replace(/[ｱ-ﾟｰ ]/g, "-").replace(/[\u0100-\uffff]/g, "--").length;
        },
        repeat: function (c, l) {
            var i, j, ref, ret;
            ret = "";
            for (i = j = 0, ref = l; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
                ret += c;
            }
            return ret;
        },
        makeTsv: function (grid, startColPos) {
            var columns, rows, store;
            if (startColPos == null) {
                startColPos = 0;
            }
            columns = grid.columns.slice(startColPos).map(function (column) {
                return column.dataIndex;
            });
            store = grid.store;
            rows = [];
            store.each(function (rec) {
                var data, row;
                data = rec.data;
                row = columns.map(function (column) {
                    return data[column];
                }).join("\t");
                return rows.push(row);
            });
            return [columns.join("\t")].concat(rows).join("\n");
        },
        getRowsFromGrid: function (grid, startColPos) {
            var columns, rows, store;
            if (startColPos == null) {
                startColPos = 0;
            }
            columns = grid.columns.slice(startColPos).map(function (column) {
                return column.dataIndex;
            });
            store = grid.store;
            rows = [columns];
            store.each(function (rec) {
                var data, row;
                data = rec.data;
                row = columns.map(function (column) {
                    return data[column];
                });
                return rows.push(row);
            });
            return rows;
        },
        makeKeisen: function (grid, startColPos) {
            var colWidth, columns, me, rows, store;
            if (startColPos == null) {
                startColPos = 0;
            }
            me = this;
            columns = grid.columns.slice(startColPos).map(function (column) {
                return column.dataIndex;
            });
            store = grid.store;
            rows = [];
            colWidth = [];
            columns.forEach(function (col, idx) {
                return colWidth[idx] = me.getLength(col);
            });
            store.each(function (rec) {
                var data, row;
                data = rec.data;
                row = columns.map(function (column, idx) {
                    var len, str;
                    str = "" + data[column];
                    len = me.getLength(str);
                    if (colWidth[idx] < len) {
                        colWidth[idx] = len;
                    }
                    return str;
                });
                return rows.push(row);
            });
            return this.makeKeisenImpl(cols, rows, startColPos);
        },
        makeKeisenImpl: function (cols, rows, startColPos) {
            var colWidth, header, idx, keisenRows, len, me, results, sep, separator, wrd;
            if (startColPos == null) {
                startColPos = 0;
            }
            me = this;
            colWidth = [];
            cols.forEach(function (col, idx) {
                return colWidth[idx] = me.getLength(col);
            });
            rows.forEach(function (row) {
                return cols.forEach(function (column, idx) {
                    var len, str;
                    str = "" + row[idx];
                    len = me.getLength(str);
                    if (colWidth[idx] < len) {
                        return colWidth[idx] = len;
                    }
                });
            });
            separator = [""];
            for (idx in colWidth) {
                len = colWidth[idx];
                wrd = me.repeat("-", len);
                separator.push(wrd);
            }
            separator.push("");
            sep = separator.join('+');
            header = cols.map(function (column, idx) {
                var spc;
                len = me.getLength(column);
                spc = colWidth[idx] - len;
                return column + me.repeat(" ", spc);
            }).join("|");
            results = [sep, header = "|" + header + "|", sep];
            keisenRows = rows.map(function (row) {
                return "|" + cols.map(function (column, idx) {
                    var spc;
                    len = me.getLength(row[idx]);
                    spc = colWidth[idx] - len;
                    if (StrUtil.isNumeric("" + row[idx])) {
                        return me.repeat(" ", spc) + row[idx];
                    } else {
                        return row[idx] + me.repeat(" ", spc);
                    }
                }).join("|") + "|";
            });
            return results.concat(keisenRows).concat(sep).join("\n");
        },
        isNumeric: function (num) {
            return StrUtil.regNum.test(num);
        }
    }
});


Ext.define("TreeUtil", {
    statics: {
        tabSize: 2,
        keisenSet: {
            normal: {
                line: "+---",
                bar: "|",
                stop: "\\",
                cross: "+",
                space: " ",
                indent: 4
            },
            zenkaku: {
                line: "├─",
                bar: "│",
                cross: "├",
                stop: "└",
                space: "　",
                indent: 2
            },
            zenkakub: {
                line: "┣━",
                bar: "┃",
                cross: "┣",
                stop: "┗",
                space: "　",
                indent: 2
            }
        },
        currentSet: "normal",
        checkIndent: function (line) {
            var level, name, result;
            result = line.split(/(^\s*)/);
            level = 0;
            name = line;
            if (result.length === 3) {
                level = result[1].length;
                name = result[2];
            }
            return [level / TreeUtil.tabSize, name];
        },
        repeat: function (text, count) {
            var buff, i, j, ref;
            buff = [""];
            if (count > 0) {
                for (i = j = 0, ref = count - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
                    buff.push(text);
                }
            }
            return buff.join("");
        },
        lineFromToUp: function (buff, row, col) {
            var i, j, keisen, ref, results;
            row = row - 1;
            keisen = TreeUtil.keisenSet[TreeUtil.currentSet];
            results = [];
            for (i = j = ref = row; j >= 0; i = j += -1) {
                if (buff[i][1][col] === keisen.space) {
                    results.push(buff[i][1][col] = keisen.bar);
                } else {
                    break;
                }
            }
            return results;
        }
    }
});

Ext.define("AnyConvert", {
    statics: {
        reg_SNAKE_CASE: /^([A-Z][A-Za-z0-9_]+)$/,
        reg_snake_case: /^([a-z][A-Za-z0-9_]+)$/,
        reg_CamelCase: /^([A-Z][a-zA-Z0-9]+)$/,
        reg_camelCase: /^([a-z][a-zA-Z0-9]+)$/,
        reg_TRAIN_CASE: /^([A-Z][A-Z0-9\-]+)$/,
        reg_train_case: /^([a-z][a-z0-9\-]+)$/,
        reg_UPPERCASE: /^([A-Z0-9]+)$/,
        reg_lowercase: /^([a-z0-9]+)$/
    },
    constructor: function (args) {
        var me, word;
        me = this;
        me.tokens = [];
        me.srcType = "";
        me.srcWord = args.word;
        me.cmnt = args.cmnt;
        word = args.word;
        if (word.match(AnyConvert.reg_SNAKE_CASE)) {
            me.srcType = "SNAKE_CASE";
            me.tokens = word.split(/_+/);
        }
        if (word.match(AnyConvert.reg_snake_case)) {
            me.srcType = "snake_case";
            me.tokens = word.split(/_+/);
        }
        if (word.match(AnyConvert.reg_CamelCase)) {
            me.srcType = "CamelCase";
            me.tokens = me.parseCamelToken(word)
        }
        if (word.match(AnyConvert.reg_camelCase)) {
            me.srcType = "camelCase";
            me.tokens = me.parseCamelToken(word);
        }
        if (word.match(AnyConvert.reg_TRAIN_CASE)) {
            me.srcType = "TRAIN-CASE";
            me.tokens = word.split(/-+/);
        }
        if (word.match(AnyConvert.reg_train_case)) {
            me.srcType = "train-case";
            me.tokens = word.split(/-+/);
        }
        if (word.match(AnyConvert.reg_UPPERCASE)) {
            me.srcType = "UPPERCASE";
            me.tokens = [word];
        }
        if (word.match(AnyConvert.reg_lowercase)) {
            me.srcType = "lowercase";
            me.tokens = [word];
        }
        me.Tokens = me.tokens.map(function (token) {
            return token[0].toUpperCase() + token.slice(1).toLowerCase();
        });
        me.Uppers = me.tokens.map(function (token) {
            return token.toUpperCase();
        });
        me.Lowers = me.tokens.map(function (token) {
            return token.toLowerCase();
        });
    },
    parseCamelToken(word) {
        var words = []
        var tokens = []
        word.split(/([A-Z])/)
            .filter(w => w)
            .forEach(w => {
                if (w.match(/[A-Z]/)) {
                    const ww = words.join("")
                    if (ww) {
                        tokens.push(ww)
                    }
                    words = []
                }
                words.push(w)
            })
        const ww = words.join("")
        if (ww) {
            tokens.push(ww)
        }
        return tokens
    },
    getRow: function () {
        var me;
        me = this;
        return {
            org: me.srcWord,
            type: me.srcType,
            Comment: me.cmnt,
            SNAKE_CASE: me.Tokens.join("_").toUpperCase(),
            snake_case: [me.Lowers[0]].concat(me.Tokens.slice(1)).join("_").toLowerCase(),
            CamelCase: me.Tokens.join(""),
            camelCase: [me.Lowers[0]].concat(me.Tokens.slice(1)).join(""),
            "TRAIN-CASE": me.Uppers.join("-"),
            "train-case": [me.Lowers[0]].concat(me.Lowers.slice(1)).join("-"),
            UPPERCASE: me.srcWord.toUpperCase(),
            lowercase: me.srcWord.toLowerCase(),
            regexp: me.getRegExpPattern()
        };
    },
    getRegExpPattern: function () {
        var me;
        me = this;
        return me.Lowers.map(function (token) {
            return "[" + (token[0].toUpperCase()) + token[0] + "]" + token.slice(1);
        }).join("[-_]*");
    }
});


Ext.define("TranslateUtil", {
    statics: {
        zenkaku2Hankaku(str) {
            return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
                return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            });
        },
        hankaku2Zenkaku(str) {
            return str.replace(/[A-Za-z0-9]/g, function(s) {
                return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
            });
        },
        zenkana2Hankana(str) {
            var kanaMap = {
                 "ガ": "ｶﾞ", "ギ": "ｷﾞ", "グ": "ｸﾞ", "ゲ": "ｹﾞ", "ゴ": "ｺﾞ",
                 "ザ": "ｻﾞ", "ジ": "ｼﾞ", "ズ": "ｽﾞ", "ゼ": "ｾﾞ", "ゾ": "ｿﾞ",
                 "ダ": "ﾀﾞ", "ヂ": "ﾁﾞ", "ヅ": "ﾂﾞ", "デ": "ﾃﾞ", "ド": "ﾄﾞ",
                 "バ": "ﾊﾞ", "ビ": "ﾋﾞ", "ブ": "ﾌﾞ", "ベ": "ﾍﾞ", "ボ": "ﾎﾞ",
                 "パ": "ﾊﾟ", "ピ": "ﾋﾟ", "プ": "ﾌﾟ", "ペ": "ﾍﾟ", "ポ": "ﾎﾟ",
                 "ヴ": "ｳﾞ", "ヷ": "ﾜﾞ", "ヺ": "ｦﾞ",
                 "ア": "ｱ", "イ": "ｲ", "ウ": "ｳ", "エ": "ｴ", "オ": "ｵ",
                 "カ": "ｶ", "キ": "ｷ", "ク": "ｸ", "ケ": "ｹ", "コ": "ｺ",
                 "サ": "ｻ", "シ": "ｼ", "ス": "ｽ", "セ": "ｾ", "ソ": "ｿ",
                 "タ": "ﾀ", "チ": "ﾁ", "ツ": "ﾂ", "テ": "ﾃ", "ト": "ﾄ",
                 "ナ": "ﾅ", "ニ": "ﾆ", "ヌ": "ﾇ", "ネ": "ﾈ", "ノ": "ﾉ",
                 "ハ": "ﾊ", "ヒ": "ﾋ", "フ": "ﾌ", "ヘ": "ﾍ", "ホ": "ﾎ",
                 "マ": "ﾏ", "ミ": "ﾐ", "ム": "ﾑ", "メ": "ﾒ", "モ": "ﾓ",
                 "ヤ": "ﾔ", "ユ": "ﾕ", "ヨ": "ﾖ",
                 "ラ": "ﾗ", "リ": "ﾘ", "ル": "ﾙ", "レ": "ﾚ", "ロ": "ﾛ",
                 "ワ": "ﾜ", "ヲ": "ｦ", "ン": "ﾝ",
                 "ァ": "ｧ", "ィ": "ｨ", "ゥ": "ｩ", "ェ": "ｪ", "ォ": "ｫ",
                 "ッ": "ｯ", "ャ": "ｬ", "ュ": "ｭ", "ョ": "ｮ",
                 "。": "｡", "、": "､", "ー": "ｰ", "「": "｢", "」": "｣", "・": "･"
            }
            var reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
            return str
                    .replace(reg, function (match) {
                        return kanaMap[match];
                    })
                    .replace(/゛/g, 'ﾞ')
                    .replace(/゜/g, 'ﾟ');
        },
        hankana2Zenkana(str) {
            var kanaMap = {
                'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
                'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
                'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
                'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
                'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
                'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
                'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
                'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
                'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
                'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
                'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
                'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
                'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
                'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
                'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
                'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
                'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
                'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
                '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・'
            };
        
            var reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
            return str
                    .replace(reg, function (match) {
                        return kanaMap[match];
                    })
                    .replace(/ﾞ/g, '゛')
                    .replace(/ﾟ/g, '゜');
        },
        kanaToHira(str) {
            return str.replace(/[\u30a1-\u30f6]/g, function(match) {
                var chr = match.charCodeAt(0) - 0x60;
                return String.fromCharCode(chr);
            });
        },
        hiraToKana(str) {
            return str.replace(/[\u3041-\u3096]/g, function(match) {
                var chr = match.charCodeAt(0) + 0x60;
                return String.fromCharCode(chr);
            });
        },
        toHankaku(str) {
            return TranslateUtil.zenkana2Hankana(
                TranslateUtil.zenkaku2Hankaku(str)
            );
        },
        toZenkaku(str) {
            return TranslateUtil.hankaku2Zenkaku(
                TranslateUtil.hankana2Zenkana(str)
            );
        }
    }
});

Ext.define('Pages.components.Utils', {});