import React from 'react';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Grow, Paper, Popper, MenuItem, MenuList } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';

class Dropdown extends React.Component {

    state = {
        anchorEl: null,
        selectedOption: null
    }

    handleClose = event => {
        this.setState({ anchorEl: null });
    };

    handleListKeyDown = (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            this.setState({ anchorEl: null });
        }
    }

    handleToggle = (event) => {
        this.setState({ anchorEl: event.currentTarget });
    }

    onSelect = obj => () => {
        this.setState({ selectedOption: obj })
        this.props.handleSelect(obj)
        this.handleClose()
    }

    render() {
        const { anchorEl, selectedOption } = this.state
        const open = Boolean(anchorEl);
        const { options } = this.props
        return (
            <div>
                <Button
                    ref={anchorEl}
                    aria-controls={open ? 'menu-list-grow' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleToggle}
                    style={style.buttonStyle}
                >
                    {
                        selectedOption ?
                            <img src={selectedOption.image} width="23" alt="connection-icon" />
                            : <Icon>add_circle</Icon>
                    }
                </Button>
                <Popper
                    open={open}
                    anchorEl={anchorEl}
                    transition
                    placement={"bottom-start"}
                    disablePortal
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={this.handleClose}>
                                    <MenuList
                                        autoFocusItem={open}
                                        id="menu-list-grow"
                                        onKeyDown={this.handleListKeyDown}
                                        style={style.menuList}
                                    >
                                        <MenuItem>Choose Connection</MenuItem>
                                        {
                                            options.length > 1 && options.map(opt => (
                                                <MenuItem
                                                    onClick={this.onSelect(opt)}
                                                    key={opt.id}
                                                >
                                                    <img
                                                        src={opt.image}
                                                        style={style.meenuItemImage}
                                                        alt="connection-icon"
                                                    />
                                                    {opt.text}
                                                </MenuItem>
                                            ))
                                        }
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
        )
    }
}

Dropdown.defaultProps = {
    options: []
}

const style = {
    buttonStyle: {
        width: '46px',
        height: '36px',
        borderRadius: '16px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.08)',
        border: 'solid 1px #c6c6c6',
        backgroundColor: '#ffffff'
    },
    menuList: {
        maxHeight: 300,
        overflow: 'auto'
    },
    meenuItemImage: {
        width: '30px',
        marginRight: 10
    },
    active: {

    }
}
export default Dropdown