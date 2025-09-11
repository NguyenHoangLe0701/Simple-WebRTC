import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { connectSock } from "../services/socket";

export default function CodeEditor({roomId, language="javascript"}) {
  useEffect(()=> {
    connectSock(client => {
      client.subscribe(`/topic/code/${roomId}`, msg => {
        // apply incoming patch (for simple demo we overwrite)
        document.getElementById("editor")?.innerText = JSON.parse(msg.body).code;
      });
    });
  }, [roomId]);

  function onChange(value) {
    // publish code to room (debounce in real app)
    // client.publish({destination:`/app/code/${roomId}`, body: JSON.stringify({code:value})});
  }

  return <Editor height="60vh" defaultLanguage={language} defaultValue={"// start coding"} onChange={onChange} />;
}
