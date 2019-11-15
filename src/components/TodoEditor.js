import React from 'react'
import { Map, List } from 'immutable';
import {
    Editor,
    EditorState,
    DefaultDraftBlockRenderMap,
    RichUtils,
    convertToRaw,
    genKey,
    ContentBlock,
} from 'draft-js';
import TodoBlock from './TodoBlock'

const TODO_TYPE = 'todo';

const BLOCK = {
    UNSTYLED: 'unstyled'
}
/*
Returns default block-level metadata for various block type. Empty object otherwise.
*/
// const getDefaultBlockData = (blockType, initialData = {}) => {
//     switch (blockType) {
//         case TODO_TYPE: return { checked: false };
//         default: return initialData;
//     }
// };

/*
Changes the block type of the current block.
*/
// const resetBlockType = (editorState, newType = BLOCK.UNSTYLED) => {
//     const contentState = editorState.getCurrentContent();
//     const selectionState = editorState.getSelection();
//     const key = selectionState.getStartKey();
//     const blockMap = contentState.getBlockMap();
//     const block = blockMap.get(key);
//     let newText = 'dsdsd';
//     const text = block.getText();
//     if (block.getLength() >= 2) {
//         newText = text.substr(1);
//     }
//     const newBlock = block.merge({
//         text: newText,
//         type: newType,
//         data: getDefaultBlockData(newType),
//     });
//     const newContentState = contentState.merge({
//         blockMap: blockMap.set(key, newBlock),
//         selectionAfter: selectionState.merge({
//             anchorOffset: 4,
//             focusOffset: 4,
//         }),
//     });
//     return EditorState.push(editorState, newContentState, 'change-block-type');
// };

/*
A higher-order function.
*/
const getBlockRendererFn = (getEditorState, onChange) => (block) => {
    const type = block.getType();
    switch (type) {
        case TODO_TYPE:
            return {
                component: TodoBlock,
                props: {
                    onChange,
                    getEditorState,
                },
            };
        default:
            return null;
    }
};

class TodoEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editorState: EditorState.createEmpty(),
            todo: ''
        };

        this.blockRenderMap = Map({
            [TODO_TYPE]: {
                element: 'div',
            }
        }).merge(DefaultDraftBlockRenderMap);


        this.getEditorState = () => this.state.editorState;

        this.blockRendererFn = getBlockRendererFn(this.getEditorState, this.onChange);
    }
    onChange = (editorState) => this.setState({ editorState });

    componentDidMount() {
        this.refs.editor.focus();
    }

    blockStyleFn(block) {
        switch (block.getType()) {
            case TODO_TYPE:
                return 'block block-todo';
            default:
                return '';
        }
    }

    handleBeforeInput = (str) => {
        // if (str !== ']') {
        //     return false;
        // }
        // const { editorState } = this.state;
        // /* Get the selection */
        // const selection = editorState.getSelection();

        // /* Get the current block */
        // const currentBlock = editorState.getCurrentContent().getBlockForKey(selection.getStartKey());
        // const blockType = currentBlock.getType();
        // const blockLength = currentBlock.getLength();
        // if (blockLength === 1 && currentBlock.getText() === '[') {
        //     this.onChange(resetBlockType(editorState, blockType !== TODO_TYPE ? TODO_TYPE : 'unstyled'));
        //     return true;
        // }
        // return false;
    }

    handleKeyCommand = (command) => {
        const { editorState } = this.state;
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleSubmit = () => {
        const str = this.state.todo
        const selection = this.state.editorState.getSelection();
        this.onChange(addNewBlockAt(
            this.state.editorState,
            str,
            selection.getAnchorKey(),
            'todo'
        ))
    }

    render() {
        const rawJson = convertToRaw(this.state.editorState.getCurrentContent());
        const jsonStr = JSON.stringify(rawJson, null, 1);
        return (
            <React.Fragment>
                <div onClick={(e) => this.refs.editor.focus()} className="editor-container">
                    <Editor
                        ref="editor"
                        // placeholder="Write here."
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        blockStyleFn={this.blockStyleFn}
                        blockRenderMap={this.blockRenderMap}
                        blockRendererFn={this.blockRendererFn}
                        handleBeforeInput={this.handleBeforeInput}
                        handleKeyCommand={this.handleKeyCommand}
                    />
                </div>
                <br />
                <div>
                    <input type="text" name="todo" onChange={this.handleChange} />
                    <button onClick={this.handleSubmit}>Submit</button>
                </div>
                <div>
                    <pre style={{ background: 'darkturquoise', padding: 5 }}>
                        <code>
                            {jsonStr}
                        </code>
                    </pre>
                </div>
            </React.Fragment>
        );
    }
}

const addNewBlockAt = (
    editorState,
    text = '',
    pivotBlockKey,
    newBlockType = 'unstyled',
    initialData = new Map({})
) => {
    const content = editorState.getCurrentContent();
    const blockMap = content.getBlockMap();
    const block = blockMap.get(pivotBlockKey);

    if (!block) {
        throw new Error(`The pivot key - ${pivotBlockKey} is not present in blockMap.`);
    }

    const blocksBefore = blockMap.toSeq().takeUntil((v) => (v === block));
    const blocksAfter = blockMap.toSeq().skipUntil((v) => (v === block)).rest();
    const newBlockKey = genKey();

    const newBlock = new ContentBlock({
        key: newBlockKey,
        type: newBlockType,
        text: text,
        characterList: new List(),
        depth: 0,
        data: initialData,
    });

    let newBlockMap
    if (block.getText().length === 0) {
        newBlockMap = blocksBefore.concat(
            [[newBlockKey, newBlock]],
            // blocksAfter
        ).toOrderedMap();
    } else {
        newBlockMap = blocksBefore.concat(
            [[pivotBlockKey, block], [newBlockKey, newBlock]],
            // blocksAfter
        ).toOrderedMap();
    }

    const selection = editorState.getSelection();

    const newContent = content.merge({
        blockMap: newBlockMap,
        selectionBefore: selection,
        selectionAfter: selection.merge({
            anchorKey: newBlockKey,
            anchorOffset: 0,
            focusKey: newBlockKey,
            focusOffset: 0,
            isBackward: false,
        }),
    });

    return EditorState.moveFocusToEnd(EditorState.push(editorState, newContent, 'split-block'));
};

export default TodoEditor