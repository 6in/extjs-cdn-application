import sys
import os
import re
from datetime import datetime
import yaml
import json
from pyscript import display, window
from pyodide.ffi.wrappers import add_event_listener

def run_convert(script,input_text) :
    g = dict(result="", input= input_text)
    try:
        exec( script + "\nresult = convert(input)\n", globals(), g)
    except Exception as e:
        g["result"] = "例外args:\n" + e.args
    return g["result"]

def messageHandler(event):
    try:
        event.data.script
    except Exception as e:
        return 

    try:
        mainWindow = event.source
        script = event.data.script
        text = event.data.text
        result = run_convert(script,text)
        mainWindow.postMessage(result, event.origin)
    except Exception as e :
        mainWindow.postMessage(str(e), event.origin)
    
    # if (event['data']['script'])
    # result = run_convert(event.data.script, event.data.text)
                

    # # 結果を送信
    # mainWindow.postMessage(result, event.origin);
    pass

add_event_listener(window, 'message', messageHandler) 

display("python ready")