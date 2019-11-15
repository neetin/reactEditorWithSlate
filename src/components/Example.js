import React, { Component } from 'react'
import {
    CompositeDecorator,
    Editor,
    EditorState,
    AtomicBlockUtils,
    convertToRaw
} from 'draft-js';

const HANDLE_REGEX = /\@[\w]+/g;
const HASHTAG_REGEX = /\#[\w\u0590-\u05ff]+/g;

const handleStrategy = (contentBlock, callback, contentState) => {
    findWithRegex(HANDLE_REGEX, contentBlock, callback);
}

const hashtagStrategy = (contentBlock, callback, contentState) => {
    findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}

const findWithRegex = (regex, contentBlock, callback) => {
    const text = contentBlock.getText();
    let matchArr, start;
    while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
    }
}

const HandleSpan = (props) => {
    return (
        <span
            className="hastag"
            style={styles.handle}
            data-offset-key={props.offsetKey}
        >
            {props.children}
        </span>
    );
};

const HashtagSpan = (props) => {
    const text = props.children[0].props.text
    return (
        <span
            style={styles.hashtag}
            className="hastagspan"
            data-offset-key={props.offsetKey}
        >
            {props.children}
        </span>
    );
};

const compositeDecorator = new CompositeDecorator([
    {
        strategy: handleStrategy,
        component: HandleSpan,
    },
    {
        strategy: hashtagStrategy,
        component: HashtagSpan,
    },
]);

class Example extends Component {

    constructor() {
        super();
        this.state = {
            editorState: EditorState.createEmpty(compositeDecorator),
        };

    }

    handleFocus = () => this.refs.editor.focus();

    onChange = (editorState) => this.setState({ editorState })

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleSubmit = () => {
        const value = this.state.inputText
        const currentState = this.state.editorState
        const content = currentState.getCurrentContent()
        const contentWithEntity = content.createEntity('unstyled', 'IMMUTABLE', {})
        const entityKey = contentWithEntity.getLastCreatedEntityKey();
        const withAtomic = AtomicBlockUtils.insertAtomicBlock(currentState, entityKey, value)
        const nextContentState = withAtomic.getCurrentContent();
        const blockMap = nextContentState.getBlockMap();
        const newContentState = content.set('blockMap', blockMap);
        const newEditorState = EditorState.moveFocusToEnd(EditorState.createWithContent(newContentState));
        this.onChange(newEditorState)
    }

    render() {
        const rawJson = convertToRaw(this.state.editorState.getCurrentContent());
        const jsonStr = JSON.stringify(rawJson, null, 1);
        return (
            <div style={styles.root}>
                <div style={styles.editor} onClick={this.handleFocus}>
                    <Editor
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        placeholder="Write a tweet..."
                        ref="editor"
                    />
                </div>

                <input type="text" name="inputText" onChange={this.handleChange} />
                <button onClick={this.handleSubmit}>submit</button>
                <div>
                    <pre style={{ background: 'darkturquoise', padding: 5 }}>
                        <code>
                            {jsonStr}
                        </code>
                    </pre>
                </div>
            </div>
        )
    }
}

const styles = {
    root: {
        fontFamily: '\'Helvetica\', sans-serif',
        padding: 20,
        width: 600,
    },
    editor: {
        border: '1px solid #ddd',
        cursor: 'text',
        fontSize: 16,
        minHeight: 40,
        padding: 10,
    },
    button: {
        marginTop: 10,
        textAlign: 'center',
    },
    handle: {
        color: 'rgba(98, 177, 254, 1.0)',
        direction: 'ltr',
        unicodeBidi: 'bidi-override',
    },
    hashtag: {
        color: 'rgba(95, 184, 138, 1.0)',
    },
};

export default Example