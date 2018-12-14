import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Fade, Paper, withStyles, Grid } from '@material-ui/core';
import logo from '../../../assets/img/brand/netvote_mark_512.png';
import Error from '@material-ui/icons/Error';

const styles = theme => ({
    main: {
        width: 'auto',
        display: 'block', // Fix IE 11 issue.
        marginTop: 'auto',
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
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
});

class ExpiredError extends React.Component {

    state = {
        title: 'Expired',
        message: `This ballot verification link has expired.`,
    }

    render() {

        const { classes } = this.props;

        return (
            <main className={classes.main}>
                <Paper className={classes.paper}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        style={{ margin: "20px" }}
                    >
                        <Grid justify="center" container spacing={8}>
                            <Grid item>
                                <img src={logo} justify="left" alt="logo" width="75" height="75" />
                            </Grid>
                        </Grid>
                        <Fade in={true}>
                            <Grid container>
                                <Grid style={{ margin: "2px" }} justify="center" container spacing={0}>
                                    <Typography variant="h5" component="h3">
                                        {this.state.title}
                                    </Typography>
                                </Grid>
                                <Grid style={{ margin: "20px" }} justify="center" container spacing={8}>
                                    <Error style={{ color: "red", height:"20px" }} className={classes.rightIcon} />
                                    <Typography component="p">
                                        {this.state.message}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Fade>
                    </Grid>
                </Paper>
            </main>
        );
    }
}

ExpiredError.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ExpiredError);
