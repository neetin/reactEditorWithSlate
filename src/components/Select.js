import React from 'react'
import '../select.css'

const Select = ({ disabled, onChange, options, selectedOption }) => {
    return (
        <select
            disabled={disabled}
            name="resultOption"
            onChange={onChange}
            className="select"
            value={selectedOption}
        >
            {
                disabled ?
                    <option value=''>select a connection to see parameters</option>
                    : <option value=''>select an option</option>
            }
            {
                options.map(option => (
                    <option value={option.value} key={option.id}>
                        {option.value}
                    </option>
                ))
            }
        </select>
    )
}

Select.defaultProps = {
    option: [],
    disabled: false,
    selectedOption: ''
}

export default Select