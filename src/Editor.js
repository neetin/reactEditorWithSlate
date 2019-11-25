import React, { PureComponent } from 'react'
import { EditorState, RichUtils, convertToRaw, Modifier, convertFromRaw } from 'draft-js'
import Editor from 'draft-js-plugins-editor'

import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin'
import 'draft-js-inline-toolbar-plugin/lib/plugin.css';

import createSideToolbarPlugin from 'draft-js-side-toolbar-plugin';
import 'draft-js-side-toolbar-plugin/lib/plugin.css';
import createCodeEditorPlugin from 'draft-js-code-editor-plugin';
import Prism from 'prismjs';
import createPrismPlugin from 'draft-js-prism-plugin';
import "prismjs/themes/prism.css"; // add prism.css to add highlights 

import addLinkPlugin from './addLinkPlugin'
import { optionResults } from './options'
import Dropdown from './components/Dropdown';
import CustomizedSelects from './components/Select';

// inline toolbar plugin
const inlineToolbarPlugin = createInlineToolbarPlugin();
const { InlineToolbar } = inlineToolbarPlugin;

// side toolbar plugin
const sideToolbarPlugin = createSideToolbarPlugin();
const { SideToolbar } = sideToolbarPlugin;

const initialContent = localStorage.getItem('content')

class TestEditor extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            editorState: initialContent ? EditorState.createWithContent(convertFromRaw(JSON.parse(initialContent))) : EditorState.createEmpty(),
            disabled: true,
            optionValues: [],
            seletedOption: '',
            showDropdowns: false
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

        const block = contentBlock
        const key = contentBlock.getKey()
        if (block.getType() !== "code-block") return;

        // Replace the code block with a new one with the data.language changed to "javascript"
        const data = block.getData().merge({ language: 'javascript' });
        const newBlock = block.merge({ data });
        const newContentState = this.state.editorState.getCurrentContent().merge({
            blockMap: this.state.editorState.getCurrentContent().getBlockMap().set(key, newBlock),
            selectionAfter: this.state.editorState.getSelection()
        })

        let editorState = this.state.editorState
        // Now that code block will be highlighted as JavaScript!
        this.setState({
            editorState: EditorState.push(this.state.editorState, newContentState, "change-block-data")
        })




        switch (contentBlock.getType()) {
            case 'code-block': return 'language-javascript';
            case 'atomic': return 'atomic';
            default: return null;
        }
    };

    handleOptionSelect = (item) => {
        if (item) {
            const result = optionResults.filter(option => option.optionId === parseInt(item.id))
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
        }
    }

    handleSlectChange = (e) => {
        if (e.target.value === undefined || e.target.value === '') return
        if (e.target.name === 'resultOption') {
            const obj = this.state.optionValues.find(opt => opt.value === e.target.value)
            this.setState({ seletedOption: obj.value })
            this.handleVariable(obj.value)
        }
    }

    handleVariable = (value) => {
        const editorState = this.state.editorState
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()

        let entity = contentState.createEntity('LINK', 'IMMUTABLE', { url: 'http://google.com' })
        let entityKey = entity.getLastCreatedEntityKey()
        const textWithEntity = Modifier.insertText(contentState, selection, `{{ ${value} }}`, null, entityKey)

        this.onChange(EditorState.push(editorState, textWithEntity, 'insert-characters'))
    }

    toggleDropdowns = (e) => {
        this.setState({ showDropdowns: !this.state.showDropdowns })
    }
    render() {
        const raw = convertToRaw(this.state.editorState.getCurrentContent())
        const json = JSON.stringify(raw, null, 1)
        return (
            <div style={{ padding: "10px", border: "1px solid #ddd", position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                    <div className="editor-container">
                        <Editor
                            editorState={this.state.editorState}
                            plugins={[inlineToolbarPlugin, sideToolbarPlugin, addLinkPlugin, createPrismPlugin({
                                prism: Prism
                            }), createCodeEditorPlugin()]}
                            onChange={this.onChange}
                            handleKeyCommand={this.handleKeyCommand}
                            customStyleMap={this.styleMap}
                            blockStyleFn={this.myBlockStyleFn}
                        />
                    </div>
                    <span className="toggle-span" onClick={this.toggleDropdowns}>{"{}"}</span>
                </div>
                <InlineToolbar />
                <SideToolbar />
                {
                    this.state.showDropdowns &&
                    <div style={{ border: "1px solid #ddd", padding: "10px", display: 'flex' }}>
                        <Dropdown
                            options={this.props.options}
                            handleSelect={this.handleOptionSelect}
                        />
                        <CustomizedSelects
                            disabled={this.state.disabled}
                            options={this.state.optionValues}
                            onChange={this.handleSlectChange}
                            selectedOption={this.state.seletedOption}
                        />
                    </div>
                }
                {/* <div>
                    <pre>
                        <code>{json}</code>
                    </pre>
                </div> */}
            </div>
        )
    }
}

export default TestEditor