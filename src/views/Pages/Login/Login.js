import React from 'react';
import PropTypes from 'prop-types';
import { InputAdornment, Paper, Typography, withStyles, Grid, Button, FormControl, InputLabel, Input, CssBaseline } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons'
import logo from '../../../assets/img/brand/netvote_mark_512.png';

const styles = theme => ({
    main: {
        width: 'auto',
        display: 'block', // Fix IE 11 issue.
        marginTop: theme.spacing.unit * 35,
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
        disableUnderline: true
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
        width: '30%'
    },
});

class Login extends React.Component {
    render() {
        const { classes } = this.props;

        return (
            <main className={classes.main}>
                {/* <CssBaseline /> */}
                <Paper className={classes.paper}>
                    <Grid item>
                        <img src={logo} justify="left" alt="logo" width="75" height="75" />
                    </Grid>
                    {/* <Typography component="h1" variant="h5">
                        Netvote Voter Portal
                    </Typography> */}
                    <form className={classes.form}>
                        <FormControl margin="normal" required fullWidth>
                            {/* <InputLabel htmlFor="email">Email</InputLabel> */}
                            <Input
                                id="email"
                                placeholder="Email"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                startAdornment={
                                    <InputAdornment position="start">
                                        <AccountCircle />
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Submit
                        </Button>
                    </form>
                </Paper>
            </main>
        );
    }
}

Login.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Login);
