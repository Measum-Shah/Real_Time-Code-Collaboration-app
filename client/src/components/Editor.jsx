import CodeMirror from 'codemirror';
import { useEffect, useRef } from 'react';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

let codeMirrorInstance = null; // ⬅️ Store instance globally (outside component)

const Editor = () => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (codeMirrorInstance || !textareaRef.current) return;
    codeMirrorInstance = CodeMirror.fromTextArea(textareaRef.current, {
      mode: { name: 'javascript', json: true },
      theme: 'dracula',
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
    });

    codeMirrorInstance.setSize('100%', '100%');
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <textarea ref={textareaRef} />
    </div>
  );
};

export default Editor;
