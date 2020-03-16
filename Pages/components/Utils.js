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

Ext.define('Pages.components.Utils', {});