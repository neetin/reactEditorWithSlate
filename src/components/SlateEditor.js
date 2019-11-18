import React, { Component } from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import { optionResults } from '../options'

// Create our initial value...
const existingValue = JSON.parse(localStorage.getItem('content'))
const initialValue = Value.fromJSON(
    existingValue || {
        document: {
            nodes: [
                {
                    object: 'block',
                    type: 'paragraph',
                    nodes: [
                        {
                            object: 'text',
                            text: '',
                        },
                    ],
                },
            ],
        },
    }
)

// Define a React component renderer for our code blocks.
function CodeNode(props) {
    return (
        <pre {...props.attributes}>
            <code>{props.children}</code>
        </pre>
    )
}

function Todo(props) {
    return (
        <div {...props.attributes} className="block block-todo">
            <span>{props.children} </span>
        </div>
    )
}

function MarkHotkey(options) {
    // Grab our options from the ones passed in.
    const { type, key } = options

    // Return our "plugin" object, containing the `onKeyDown` handler.
    return {
        onKeyDown(event, editor, next) {
            // If it doesn't match our `key`, let other plugins handle it.
            if (!event.ctrlKey || event.key != key) return next()

            // Prevent the default characters from being inserted.
            event.preventDefault()

            // Toggle the mark `type`.
            editor.toggleMark(type)
        },
    }
}

// Create an array of plugins.
const plugins = [
    MarkHotkey({ key: 'b', type: 'bold' }),
    MarkHotkey({ key: '`', type: 'code' }),
    MarkHotkey({ key: 'i', type: 'italic' }),
    MarkHotkey({ key: '~', type: 'strikethrough' }),
    MarkHotkey({ key: 'u', type: 'underline' }),
    MarkHotkey({ key: '/', type: 'todo' }),
]

export default class SlateEditor extends Component {

    state = {
        value: initialValue,
        disabled: true,
        optionValues: []
    }

    // On change, update the app's React state with the new editor value.
    onChange = ({ value }) => {
        // const content = JSON.stringify(value.toJSON())
        // localStorage.setItem('content', content)

        this.setState({ value })
    }

    // Add a `renderBlock` method to render a `CodeNode` for code blocks.
    renderBlock = (props, _editor, next) => {
        switch (props.node.type) {
            case 'code':
                return <CodeNode {...props} />
            case 'todo':
                return <Todo {...props} />
            default:
                return next()
        }
    }

    // Add a `renderMark` method to render marks.
    renderMark = (props, editor, next) => {
        switch (props.mark.type) {
            case 'bold':
                return <strong>{props.children}</strong>
            // Add our new mark renderers...
            case 'code':
                return <code>{props.children}</code>
            case 'italic':
                return <em>{props.children}</em>
            case 'strikethrough':
                return <del>{props.children}</del>
            case 'underline':
                return <u>{props.children}</u>
            case 'todo':
                return <Todo>{props.children}</Todo>
            default:

                return next()
        }
    }

    onKeyDown(event, _editor, next) {
        if (event.key == 'Enter') {
            // editor.splitBlock()
            return next()
        } else {
            return next()
        }
    }

    addNode = (text = '') => {
        const editor = this.refs.editor
        editor.insertBlock({
            object: 'block',
            type: 'todo',
            nodes: [
                {
                    object: 'text',
                    text: text + ' ',
                },
            ],

        })
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

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
            this.addNode(e.target.value)
        }
    }

    render() {
        return (
            <>
                <div className="editor-container">
                    <Editor
                        plugins={plugins}
                        value={this.state.value}
                        onChange={this.onChange}
                        renderMark={this.renderMark}
                        renderBlock={this.renderBlock}
                        onKeyDown={this.onKeyDown}
                        ref='editor'
                    />
                </div>
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
            </>
        )
    }
}
