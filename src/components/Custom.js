import React from 'react'
import {
    Editor,
    DefaultDraftBlockRenderMap,
    ContentBlock,
    EditorBlock,
    genKey,
    EditorState
} from 'draft-js';

import { List, Map } from 'immutable';

class MyCustomBlock extends React.Component {

    render() {
        console.log(this.props)
        return (
            <div className="my-custom-block">
                <EditorBlock {...this.props} />
            </div>
        );
    }
}

function blockRendererFn(contentBlock) {
    const type = contentBlock.getType();

    if (type === 'MyCustomBlock') {
        return {
            component: MyCustomBlock,
            props: {
                data: 'kfmkddm',
                text: 'fmfkmjk'
            }
        };
    }
}

const RenderMap = new Map({
    MyCustomBlock: {
        element: 'div',
    }
}).merge(DefaultDraftBlockRenderMap);

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(RenderMap);

export default class Custom extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editorState: EditorState.createEmpty()
        };
    }

    _handleChange = (editorState) => {
        this.setState({ editorState });
    }

    _onAddCustomBlock = () => {
        const selection = this.state.editorState.getSelection();

        this._handleChange(addNewBlockAt(
            this.state.editorState,
            selection.getAnchorKey(),
            'MyCustomBlock'
        ))
    }

    render() {
        return (
            <div>
                <div className="container-root">
                    <Editor
                        placeholder="Type"
                        blockRenderMap={extendedBlockRenderMap}
                        blockRendererFn={blockRendererFn}
                        editorState={this.state.editorState}
                        onChange={this._handleChange}
                    />
                </div>
                <button onClick={this._onAddCustomBlock}>
                    ADD CUSTOM BLOCK
          </button>
            </div>
        );
    }
}

const addNewBlockAt = (
    editorState,
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
        text: '',
        characterList: new List(),
        depth: 0,
        data: initialData,
    });

    const newBlockMap = blocksBefore.concat(
        [[pivotBlockKey, block], [newBlockKey, newBlock]],
        blocksAfter
    ).toOrderedMap();

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
