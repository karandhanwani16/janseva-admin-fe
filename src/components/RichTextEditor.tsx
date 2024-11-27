import { useState } from 'react';
import Editor, { ContentEditableEvent } from 'react-simple-wysiwyg';
import "./richtext.css"

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const [html, setHtml] = useState(value);

    function handleChange(e: ContentEditableEvent) {
        const newValue = e.target.value;
        setHtml(newValue);
        onChange(newValue);
    }

    return (
        <div className="prose prose-sm">
            <Editor
                id='EditorContainer'
                value={html}
                onChange={handleChange}
            />
        </div>
    );
}

export default RichTextEditor;