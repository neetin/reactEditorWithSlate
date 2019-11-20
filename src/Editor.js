import React, { Component } from 'react'
import { EditorState, RichUtils, convertToRaw, Modifier, convertFromRaw } from 'draft-js'
import Editor from 'draft-js-plugins-editor'

import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin'
import 'draft-js-inline-toolbar-plugin/lib/plugin.css';

import createSideToolbarPlugin from 'draft-js-side-toolbar-plugin';
import 'draft-js-side-toolbar-plugin/lib/plugin.css';


import addLinkPlugin from './addLinkPlugin'
import { optionResults } from './options'

// inline toolbar plugin
const inlineToolbarPlugin = createInlineToolbarPlugin();
const { InlineToolbar } = inlineToolbarPlugin;

// side toolbar plugin
const sideToolbarPlugin = createSideToolbarPlugin();
const { SideToolbar } = sideToolbarPlugin;

const initialContent = localStorage.getItem('content')

class TestEditor extends Component {

    constructor(props) {
        super(props)
        this.state = {
            editorState: initialContent ? EditorState.createWithContent(convertFromRaw(JSON.parse(initialContent))) : EditorState.createEmpty(),
            disabled: true,
            optionValues: []
        }
    }

    handleKeyCommand = (command, editorState) => {
        let newState;
        newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return "handled"
        }
        return 'non-handled'
    };

    onChange = (editorState) => {
        this.setState(() => ({ editorState }),
            () => {
                const raw = convertToRaw(this.state.editorState.getCurrentContent())
                const json = JSON.stringify(raw, null, 1)
                localStorage.setItem('content', json)
            })
    }

    styleMap = {
        'STRIKETHROUGH': {
            color: "#999",
            textDecoration: 'line-through',
        }, 'CODE': {
            backgroundColor: '#345678',
            color: "#fff",
            fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
            fontSize: 16,
            padding: 2
        },

    };

    myBlockStyleFn = (contentBlock) => {
        switch (contentBlock.getType()) {
            case 'code-block': return 'language-javascript';
            case 'atomic': return 'atomic';
            default: return null;
        }
    };


    handleSlectChange = (e) => {
        if (e.target.name === 'selectOption') {
            const result = optionResults.filter(option => option.optionId === parseInt(e.target.value))
            if (result.length > 0) {
                this.setState({
                    disabled: false,
                    optionValues: result
                })
            } else {
                this.setState({
                    disabled: false,
                    optionValues: []
                })
            }
        } else if (e.target.name === 'resultOption') {
            const obj = this.state.optionValues.find(opt => opt.value === e.target.value)
            this.handleVariable(e.target.value, obj)
        }
    }

    handleVariable = (value) => {
        const editorState = this.state.editorState
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()

        let entity = contentState.createEntity('LINK', 'IMMUTABLE', { url: 'http://google.com' })
        let entityKey = entity.getLastCreatedEntityKey()
        const textWithEntity = Modifier.insertText(contentState, selection, `{{ ${value}.name }}`, null, entityKey)

        this.onChange(EditorState.push(editorState, textWithEntity, 'insert-characters'))
    }

    render() {
        const raw = convertToRaw(this.state.editorState.getCurrentContent())
        const json = JSON.stringify(raw, null, 1)
        return (
            <div className="editor">
                <div style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <Editor
                        editorState={this.state.editorState}
                        plugins={[inlineToolbarPlugin, sideToolbarPlugin, addLinkPlugin]}
                        onChange={this.onChange}
                        handleKeyCommand={this.handleKeyCommand}
                        customStyleMap={this.styleMap}
                        blockStyleFn={this.myBlockStyleFn}
                    />
                    <InlineToolbar />
                    <SideToolbar />
                    <div style={{ border: "1px solid #ddd", padding: "10px" }}>
                        <select onChange={this.handleSlectChange} name="selectOption">
                            <option disabled selected>select one</option>
                            <option value={1}>Authenticated</option>
                            <option value={2}>Not Authenticated</option>
                            <option value={3}>Multi Factor Authentication</option>
                            <option value={4}>Risk Engine</option>
                            <option value={5}>Location Policy</option>
                            <option value={6}>Single SignOn</option>
                        </select>

                        <select disabled={this.state.disabled} name="resultOption" onChange={this.handleSlectChange}>
                            <option selected disabled>--select one option---</option>
                            {
                                this.state.optionValues.map(option => (
                                    <option value={option.value} key={option.id}>{option.value}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div>
                        <pre>
                            <code>{json}</code>
                        </pre>
                    </div>
                </div>
            </div>
        )
    }
}

export default TestEditor